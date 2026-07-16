import {
  _decorator,
  Component,
  Node,
  Label,
  view,
  resources,
  JsonAsset,
  profiler,
  native,
} from "cc";
import bundledCatalog from "../../content/catalog.json";
import type { AppEvents } from "../core/app-events";
import { EventBus } from "../core/event-bus";
import { BattleSession } from "../domain/battle/battle-session";
import type { BattleQuestion } from "../domain/battle/question-builder";
import type { ContentItem } from "../domain/content/content-types";
import { ProfileService } from "../domain/profile/profile-service";
import { calculateLevel } from "../domain/progression/xp";
import { PETS, type PetId } from "../domain/progression/pets";
import { collectDueContentItems, countDueReviews } from "../domain/learning/collect-due-items";
import { listDueContentIds } from "../domain/learning/mastery";
import type { SaveV5 } from "../domain/save/save-v5";
import { ensureChildProgression, ensureDailyByChild } from "../domain/save/create-default-save";
import {
  parseSavePayload,
  SAVE_EXPORT_FILE_NAME,
  SAVE_EXPORT_STORAGE_KEY,
  serializeSave,
} from "../domain/save/save-transfer";
import type { WeaponId } from "../domain/weapons/weapons";
import { ensureDailyMissionState, type DailyProgressSignal } from "../domain/progression/daily-missions";
import { LocalStorageSaveRepository } from "../infrastructure/system/local-storage-save-repository";
import { SystemClock } from "../infrastructure/system/system-clock";
import { MathRandomSource } from "../infrastructure/system/math-random-source";
import {
  readRuntimeTtsEnv,
  speakLearningText,
  stopLearningSpeech,
} from "../platform/tts";
import { MainPathNav } from "./main-path/main-path-nav";
import { BaseScreen } from "./screens/base-screen";
import { BootProfileScreen } from "./screens/boot-profile-screen";
import { StarMapScreen } from "./screens/star-map-screen";
import { SortieScreen } from "./screens/sortie-screen";
import { BattleScreen } from "./screens/battle-screen";
import { SettlementScreen } from "./screens/settlement-screen";
import { ReportScreen } from "./screens/report-screen";
import { makeLabel } from "./ui/ui-factory";
import { UiTheme } from "./ui/theme";

const { ccclass } = _decorator;

interface CatalogUnit {
  id: string;
  title: string;
  items: ContentItem[];
}

const FALLBACK_3A_U1_ITEMS: ContentItem[] = [
  {
    contentId: "ox-3a-u1-happy",
    kind: "vocab",
    en: "happy",
    zh: "开心的",
    ttsFallback: true,
    questionTypes: ["choice", "listening", "reading", "spelling", "speaking"],
  },
  {
    contentId: "ox-3a-u1-sad",
    kind: "vocab",
    en: "sad",
    zh: "伤心的",
    ttsFallback: true,
    questionTypes: ["choice", "listening", "reading", "spelling", "speaking"],
  },
  {
    contentId: "ox-3a-u1-angry",
    kind: "vocab",
    en: "angry",
    zh: "生气的",
    ttsFallback: true,
    questionTypes: ["choice", "listening", "reading", "spelling", "speaking"],
  },
  {
    contentId: "ox-3a-u1-tired",
    kind: "vocab",
    en: "tired",
    zh: "疲倦的",
    ttsFallback: true,
    questionTypes: ["choice", "listening", "reading", "spelling", "speaking"],
  },
  {
    contentId: "ox-3a-u1-cold",
    kind: "vocab",
    en: "cold",
    zh: "冷的",
    ttsFallback: true,
    questionTypes: ["choice", "listening", "reading", "spelling", "speaking"],
  },
];

const PREP_MS = 1200;

const WEAPON_ALLOY_PRICES: Record<WeaponId, number> = {
  pulse: 0,
  plasma: 80,
  flame: 120,
  frost: 160,
  thunder: 220,
};

function textbookLabel(textbookId: string): string {
  if (textbookId.includes("kouyu")) return "沪教口语交际";
  return "沪教牛津 2024";
}

function learningSummary(save: SaveV5, childId: string, nowMs: number) {
  const prefix = `${childId}::`;
  let seenCount = 0;
  let masteredCount = 0;
  for (const [key, rec] of Object.entries(save.learning)) {
    if (!key.startsWith(prefix)) continue;
    const touched =
      rec.firstCorrect + rec.corrected + rec.incorrect + rec.skipped + rec.deviceFailures > 0;
    if (touched) seenCount++;
    if (rec.firstCorrect > 0) masteredCount++;
  }
  return {
    dueCount: listDueContentIds(save, childId, nowMs).length,
    seenCount,
    masteredCount,
  };
}

/**
 * Cocos Native 主链路组合根：Profile → StarMap → Sortie → Battle → Settlement。
 * 禁止 WebView / Capacitor。
 */
@ccclass("BootApp")
export class BootApp extends Component {
  private repo!: LocalStorageSaveRepository;
  private clock = new SystemClock();
  private random = new MathRandomSource();
  private bus = new EventBus<AppEvents>();
  private profiles!: ProfileService;
  private units: CatalogUnit[] = [];
  private nav!: MainPathNav;
  private screenHost!: Node;
  private viewport = { width: 1280, height: 720 };

  private profileScreen!: BootProfileScreen;
  private starMapScreen!: StarMapScreen;
  private baseScreen!: BaseScreen;
  private sortieScreen!: SortieScreen;
  private battleScreen!: BattleScreen;
  private settlementScreen!: SettlementScreen;
  private reportScreen!: ReportScreen;

  private session: BattleSession | null = null;
  private currentQ: BattleQuestion | null = null;
  private spellBuffer = "";

  private prepNode: Node | null = null;
  private profileErrorNode: Node | null = null;
  private reviewHintNode: Node | null = null;
  private reportToastNode: Node | null = null;
  private deployCapHint = false;
  private pendingBattleMode: "campaign" | "review" = "campaign";

  async onLoad() {
    profiler.hideStats();
    this.repo = new LocalStorageSaveRepository();
    this.profiles = new ProfileService(this.repo, this.clock, this.random);
    await this.profiles.start();
    await this.loadCatalog();

    const kids = this.profiles.listChildren();
    this.nav = new MainPathNav(kids.length > 0);
    if (kids.length > 0 && this.units.length > 0) {
      this.nav.selectUnit(this.units[0].id);
    }

    this.buildShell();
    this.renderCurrent();
  }

  private applyCatalogJson(json: { units?: CatalogUnit[] } | null | undefined): boolean {
    const source = json?.units;
    if (!source || source.length === 0) return false;
    this.units = source.slice(0, 8).map((u) => ({
      id: u.id,
      title: u.title,
      items: (u.items ?? []) as ContentItem[],
    }));
    return this.units.length > 0;
  }

  private async loadCatalog() {
    try {
      const asset = await new Promise<JsonAsset | null>((resolve) => {
        resources.load("content/catalog", JsonAsset, (err, data) => {
          if (err || !data) resolve(null);
          else resolve(data);
        });
      });
      if (asset?.json && this.applyCatalogJson(asset.json as { units?: CatalogUnit[] })) {
        return;
      }
    } catch {
      // fall through to bundled import
    }
    if (this.applyCatalogJson(bundledCatalog as { units?: CatalogUnit[] })) {
      return;
    }
    this.units = [
      { id: "3A-U1", title: "Unit 1 How do we feel?", items: FALLBACK_3A_U1_ITEMS },
      { id: "3A-U2", title: "Unit 2 What's interesting about families?", items: FALLBACK_3A_U1_ITEMS },
      { id: "3A-U3", title: "Unit 3 How do we celebrate?", items: FALLBACK_3A_U1_ITEMS },
      { id: "3A-U4", title: "Unit 4 How do we spend weekends?", items: FALLBACK_3A_U1_ITEMS },
      { id: "3A-U5", title: "Unit 5 What do we eat?", items: FALLBACK_3A_U1_ITEMS },
      { id: "3A-U6", title: "Unit 6 How do animals live?", items: FALLBACK_3A_U1_ITEMS },
      { id: "3A-U7", title: "Unit 7 What do we wear?", items: FALLBACK_3A_U1_ITEMS },
      { id: "3A-U8", title: "Unit 8 How do we go places?", items: FALLBACK_3A_U1_ITEMS },
    ];
  }

  private buildShell() {
    const size = view.getVisibleSize();
    this.viewport = { width: size.width, height: size.height };

    this.screenHost = new Node("ScreenHost");
    this.node.addChild(this.screenHost);

    this.profileScreen = new BootProfileScreen(this.screenHost, this.viewport);
    this.starMapScreen = new StarMapScreen(this.screenHost, this.viewport);
    this.baseScreen = new BaseScreen(this.screenHost, this.viewport);
    this.sortieScreen = new SortieScreen(this.screenHost, this.viewport);
    this.battleScreen = new BattleScreen(this.screenHost, this.viewport);
    this.settlementScreen = new SettlementScreen(this.screenHost, this.viewport);
    this.reportScreen = new ReportScreen(this.screenHost, this.viewport);
  }

  private renderCurrent() {
    this.clearPrepLabel();
    this.clearProfileError();
    this.clearReportToast();
    this.profileScreen.destroy();
    this.starMapScreen.destroy();
    this.baseScreen.destroy();
    this.sortieScreen.destroy();
    this.battleScreen.destroy();
    this.settlementScreen.destroy();
    this.reportScreen.destroy();

    switch (this.nav.screen) {
      case "profile":
        this.profileScreen.render({
          onCreate: (name) => void this.onCreateProfile(name),
        });
        break;
      case "starmap":
        this.renderStarMap();
        break;
      case "base":
        this.renderBase();
        break;
      case "report":
        this.renderReport();
        break;
      case "sortie":
        this.renderSortie();
        break;
      case "battle":
        this.renderBattle();
        break;
      case "settlement":
        this.renderSettlement();
        break;
    }
  }

  private activeChild() {
    return this.profiles.listChildren()[0] ?? null;
  }

  private childSummary() {
    const child = this.activeChild();
    if (!child) throw new Error("no active child");
    const prog = ensureChildProgression(this.profiles.currentSave(), child.id);
    return {
      name: child.name,
      level: calculateLevel(prog.totalXp),
      alloy: prog.alloy,
      starCrystals: prog.starCrystals,
    };
  }

  private unitsWithStars() {
    const child = this.activeChild();
    if (!child) return this.units;
    const prog = ensureChildProgression(this.profiles.currentSave(), child.id);
    return this.units.map((u) => ({
      ...u,
      stars: prog.unitStars[u.id] ?? 0,
    }));
  }

  private renderStarMap() {
    const child = this.activeChild();
    const save = this.profiles.currentSave();
    const dueCount =
      child != null ? countDueReviews(save.learning, child.id, this.clock.now(), this.units) : 0;
    const daily =
      child != null
        ? ensureDailyMissionState(ensureDailyByChild(save)[child.id], this.clock.now())
        : null;

    this.starMapScreen.render({
      child: this.childSummary(),
      units: this.unitsWithStars(),
      selectedUnitId: this.nav.selectedUnitId,
      dueCount,
      dailyDone: daily?.completedCount() ?? 0,
      dailyTotal: 3,
      onSelectUnit: (id) => {
        this.nav.selectUnit(id);
        this.renderCurrent();
      },
      onSortie: () => {
        this.nav.goSortie();
        this.renderCurrent();
      },
      onBase: () => {
        this.deployCapHint = false;
        this.nav.goBase();
        this.renderCurrent();
      },
      onReport: () => {
        this.nav.goReport();
        this.renderCurrent();
      },
      onDueReview: () => this.onDueReviewStart(),
    });
  }

  private renderBase() {
    const child = this.activeChild();
    if (!child) {
      this.nav.backToStarMap();
      this.renderCurrent();
      return;
    }
    const save = this.profiles.currentSave();
    const prog = ensureChildProgression(save, child.id);
    this.baseScreen.render({
      child: this.childSummary(),
      progression: {
        weaponId: prog.weaponId,
        ownedWeapons: prog.ownedWeapons,
        petIds: prog.petIds,
        deployedPets: prog.deployedPets,
        petBond: prog.petBond,
      },
      settings: {
        soundEnabled: save.settings.soundEnabled,
        ttsEnabled: save.settings.ttsEnabled,
        reduceMotion: save.settings.reduceMotion,
      },
      deployCapHint: this.deployCapHint,
      onBack: () => {
        this.deployCapHint = false;
        this.nav.backToStarMap();
        this.renderCurrent();
      },
      onEquipWeapon: (id) => void this.onEquipWeapon(id),
      onBuyWeapon: (id) => void this.onBuyWeapon(id),
      onBuyPet: (id) => void this.onBuyPet(id),
      onTogglePetDeploy: (id) => void this.onTogglePetDeploy(id),
      onToggleSetting: (key) => void this.onToggleSetting(key),
    });
  }

  private renderReport() {
    const child = this.activeChild();
    if (!child) {
      this.nav.backToStarMap();
      this.renderCurrent();
      return;
    }
    const save = this.profiles.currentSave();
    const prog = ensureChildProgression(save, child.id);
    const summary = this.childSummary();
    this.reportScreen.render({
      child: {
        name: child.name,
        grade: child.grade,
        textbookLabel: textbookLabel(child.textbookId),
        level: summary.level,
        totalXp: prog.totalXp,
        alloy: summary.alloy,
        starCrystals: summary.starCrystals,
      },
      units: this.unitsWithStars().map((u) => ({
        id: u.id,
        title: u.title,
        stars: u.stars ?? 0,
      })),
      learning: learningSummary(save, child.id, this.clock.now()),
      onBack: () => {
        this.nav.backToStarMap();
        this.renderCurrent();
      },
      onExportSave: () => void this.onExportSave(),
      onImportSave: () => void this.onImportSave(),
    });
  }

  private exportSaveStorage(): Storage {
    const sysLike = (globalThis as { sys?: { localStorage?: Storage } }).sys;
    if (sysLike?.localStorage) return sysLike.localStorage;
    return (globalThis as { localStorage: Storage }).localStorage;
  }

  private tryCopyExportPayload(payload: string): void {
    if (typeof native !== "undefined" && typeof native.copyTextToClipboard === "function") {
      native.copyTextToClipboard(payload);
    }
  }

  private tryWriteExportFile(payload: string): void {
    if (typeof native === "undefined" || !native.fileUtils) return;
    const path = `${native.fileUtils.getWritablePath()}${SAVE_EXPORT_FILE_NAME}`;
    native.fileUtils.writeStringToFile(payload, path);
  }

  private tryReadExportPayload(): string | null {
    const nativeLike = native as {
      getTextFromClipboard?: () => string;
      fileUtils?: {
        getWritablePath: () => string;
        getStringFromFile: (path: string) => string;
        isFileExist: (path: string) => boolean;
      };
    };
    if (typeof nativeLike?.getTextFromClipboard === "function") {
      const clip = nativeLike.getTextFromClipboard().trim();
      if (clip.startsWith("{")) return clip;
    }
    const storage = this.exportSaveStorage();
    const cached = storage.getItem(SAVE_EXPORT_STORAGE_KEY);
    if (cached) return cached;
    if (nativeLike?.fileUtils) {
      const path = `${nativeLike.fileUtils.getWritablePath()}${SAVE_EXPORT_FILE_NAME}`;
      if (nativeLike.fileUtils.isFileExist(path)) {
        return nativeLike.fileUtils.getStringFromFile(path);
      }
    }
    return null;
  }

  private async onExportSave() {
    try {
      const payload = serializeSave(this.profiles.currentSave());
      this.exportSaveStorage().setItem(SAVE_EXPORT_STORAGE_KEY, payload);
      this.tryCopyExportPayload(payload);
      this.tryWriteExportFile(payload);
      this.showReportToast("存档已导出");
    } catch {
      this.showReportToast("导出失败");
    }
  }

  private async onImportSave() {
    const raw = this.tryReadExportPayload();
    if (!raw) {
      this.showReportToast("导入失败");
      return;
    }
    try {
      const save = parseSavePayload(raw);
      await this.repo.commit(save);
      await this.profiles.reload();
      this.exportSaveStorage().setItem(SAVE_EXPORT_STORAGE_KEY, raw);
      this.showReportToast("存档已导入");
      this.renderCurrent();
    } catch {
      this.showReportToast("导入失败");
    }
  }

  private showReportToast(message: string) {
    this.clearReportToast();
    const host = this.reportScreen.getScreenRoot() ?? this.screenHost;
    const toast = new Node("ReportToast");
    host.addChild(toast);
    this.reportToastNode = toast;

    const lbl = makeLabel(toast, "ToastLabel", {
      string: message,
      fontSize: UiTheme.font.body,
      color: UiTheme.colors.accentInfo,
      width: 320,
      height: 32,
    });
    lbl.horizontalAlign = Label.HorizontalAlign.CENTER;
    toast.setPosition(0, -this.viewport.height / 2 + 100, 0);

    this.scheduleOnce(this.clearReportToast, 2);
  }

  private clearReportToast = (): void => {
    this.unschedule(this.clearReportToast);
    if (this.reportToastNode) {
      this.reportToastNode.destroy();
      this.reportToastNode = null;
    }
  };

  private async persistAndRerender() {
    await this.repo.commit(this.profiles.currentSave());
    this.renderCurrent();
  }

  private async onEquipWeapon(id: WeaponId) {
    const child = this.activeChild();
    if (!child) return;
    const prog = ensureChildProgression(this.profiles.currentSave(), child.id);
    if (!prog.ownedWeapons.includes(id)) return;
    prog.weaponId = id;
    this.deployCapHint = false;
    await this.persistAndRerender();
  }

  private async onBuyWeapon(id: WeaponId) {
    const child = this.activeChild();
    if (!child) return;
    const prog = ensureChildProgression(this.profiles.currentSave(), child.id);
    const cost = WEAPON_ALLOY_PRICES[id];
    if (prog.alloy < cost) return;
    prog.alloy -= cost;
    if (!prog.ownedWeapons.includes(id)) prog.ownedWeapons.push(id);
    prog.weaponId = id;
    this.deployCapHint = false;
    await this.persistAndRerender();
  }

  private async onBuyPet(id: PetId) {
    const child = this.activeChild();
    if (!child) return;
    const prog = ensureChildProgression(this.profiles.currentSave(), child.id);
    const pet = PETS[id];
    if (prog.starCrystals < pet.priceCrystal) return;
    prog.starCrystals -= pet.priceCrystal;
    prog.petIds.push(id);
    prog.petBond[id] = 1;
    if (prog.deployedPets.length < 2) prog.deployedPets.push(id);
    this.deployCapHint = false;
    await this.persistAndRerender();
  }

  private async onTogglePetDeploy(id: PetId) {
    const child = this.activeChild();
    if (!child) return;
    const prog = ensureChildProgression(this.profiles.currentSave(), child.id);
    if (!prog.petIds.includes(id)) return;
    if (prog.deployedPets.includes(id)) {
      prog.deployedPets = prog.deployedPets.filter((x) => x !== id);
      this.deployCapHint = false;
    } else if (prog.deployedPets.length < 2) {
      prog.deployedPets.push(id);
      this.deployCapHint = false;
    } else {
      this.deployCapHint = true;
      this.renderCurrent();
      return;
    }
    await this.persistAndRerender();
  }

  private async onToggleSetting(key: "soundEnabled" | "ttsEnabled" | "reduceMotion") {
    const save = this.profiles.currentSave();
    save.settings[key] = !save.settings[key];
    await this.persistAndRerender();
  }

  private renderSortie() {
    const unit = this.units.find((u) => u.id === this.nav.selectedUnitId);
    this.sortieScreen.render({
      unitTitle: unit?.title ?? "Unit",
      onBack: () => {
        this.nav.backToStarMap();
        this.renderCurrent();
      },
      onStart: () => this.onSortieStart(),
    });
  }

  private renderBattle() {
    if (!this.session || !this.currentQ) {
      this.nav.backToStarMap();
      this.renderCurrent();
      return;
    }
    this.battleScreen.render({
      hud: this.session.hud(),
      question: this.currentQ,
      spellBuffer: this.spellBuffer,
      onQuit: () => void this.onBattleQuit(),
      onAnswer: (choice, opts) => void this.onBattleAnswer(choice, opts),
      onSpellClear: () => {
        this.spellBuffer = "";
        this.renderCurrent();
      },
      onSpellAppend: (ch) => {
        this.spellBuffer += ch;
        this.renderCurrent();
      },
      onSpellSubmit: () => void this.onBattleAnswer(this.spellBuffer),
      onReplayAudio: () => this.speakListeningPrompt(),
    });
    this.speakListeningPrompt();
  }

  private speakListeningPrompt() {
    if (!this.currentQ || this.currentQ.type !== "listening") return;
    const enabled = this.profiles.currentSave().settings.ttsEnabled;
    speakLearningText(
      { text: this.currentQ.speakText, enabled, lang: "en-US" },
      readRuntimeTtsEnv()
    );
  }

  private stopBattleSpeech() {
    stopLearningSpeech(readRuntimeTtsEnv());
  }

  private renderSettlement() {
    if (!this.session) {
      this.nav.backToStarMap();
      this.renderCurrent();
      return;
    }
    this.settlementScreen.render({
      win: this.session.win,
      hud: this.session.hud(),
      onHome: () => {
        this.clearBattleSession();
        this.nav.backToStarMap();
        this.renderCurrent();
      },
    });
  }

  private onSortieStart() {
    this.pendingBattleMode = "campaign";
    this.showBattlePrep(this.sortieScreen.getScreenRoot() ?? this.screenHost);
  }

  private onDueReviewStart() {
    this.pendingBattleMode = "review";
    this.showBattlePrep(this.starMapScreen.getScreenRoot() ?? this.screenHost);
  }

  private showBattlePrep(host: Node) {
    if (this.prepNode) return;
    const prep = new Node("PrepFeedback");
    host.addChild(prep);
    this.prepNode = prep;

    const lbl = makeLabel(prep, "PrepLabel", {
      string: "战斗舱整备中",
      fontSize: UiTheme.font.screenTitle,
      color: UiTheme.colors.accentInfo,
      width: 320,
      height: 48,
    });
    lbl.horizontalAlign = Label.HorizontalAlign.CENTER;
    prep.setPosition(0, -this.viewport.height / 2 + 140, 0);

    this.scheduleOnce(this.onPrepDone, PREP_MS / 1000);
  }

  private onPrepDone = (): void => {
    this.clearPrepLabel();
    this.startBattle({ mode: this.pendingBattleMode });
  };

  private startBattle(opts: { mode: "campaign" | "review" }) {
    const child = this.activeChild();
    if (!child) return;

    let unitId: string;
    let items: ContentItem[];

    if (opts.mode === "campaign") {
      const unit = this.units.find((u) => u.id === this.nav.selectedUnitId);
      if (!unit || unit.items.length === 0) return;
      unitId = unit.id;
      items = unit.items;
    } else {
      items = collectDueContentItems(
        this.profiles.currentSave().learning,
        child.id,
        this.clock.now(),
        this.units,
        this.random
      );
      if (items.length === 0) {
        this.showReviewEmptyHint();
        return;
      }
      unitId = "review";
    }

    this.session = new BattleSession(
      unitId,
      items,
      this.profiles.currentSave(),
      child.id,
      this.clock,
      this.random,
      this.bus,
      opts.mode
    );
    this.currentQ = this.session.nextQuestion();
    this.spellBuffer = "";
    this.nav.goBattle();
    this.renderCurrent();
  }

  private async onBattleAnswer(
    choice: string,
    opts: { quality?: number; assisted?: boolean } = {}
  ) {
    if (!this.session || !this.currentQ) return;
    this.stopBattleSpeech();
    const qType = this.currentQ.type;
    const mode = this.session.mode;
    const result = this.session.answer(choice, opts);
    const child = this.activeChild();
    if (child && result.correct && (qType === "spelling" || qType === "listening" || qType === "speaking")) {
      this.applyDailySignal(child.id, {
        type: "weak_question_type_completed",
        questionType: qType,
      });
    }
    if (this.session.finished) {
      if (child) {
        this.applyDailySignal(child.id, { type: "battle_finished" });
        if (mode === "review") {
          const dueLeft = countDueReviews(
            this.profiles.currentSave().learning,
            child.id,
            this.clock.now(),
            this.units
          );
          if (dueLeft === 0) {
            this.applyDailySignal(child.id, { type: "due_reviews_cleared" });
          }
        }
        this.claimDailyIfReady(child.id);
      }
      await this.repo.commit(this.profiles.currentSave());
      this.nav.goSettlement();
      this.renderCurrent();
      return;
    }
    this.currentQ = this.session.nextQuestion();
    this.spellBuffer = "";
    this.renderCurrent();
  }

  private applyDailySignal(childId: string, signal: DailyProgressSignal) {
    const save = this.profiles.currentSave();
    const bag = ensureDailyByChild(save);
    const tracker = ensureDailyMissionState(bag[childId], this.clock.now());
    bag[childId] = tracker.apply(signal);
    save.updatedAt = this.clock.now();
  }

  private claimDailyIfReady(childId: string) {
    const save = this.profiles.currentSave();
    const bag = ensureDailyByChild(save);
    const tracker = ensureDailyMissionState(bag[childId], this.clock.now());
    const claimed = tracker.claimIfReady(15);
    bag[childId] = claimed.state;
    if (claimed.alloy > 0) {
      const prog = ensureChildProgression(save, childId);
      prog.alloy += claimed.alloy;
    }
    save.updatedAt = this.clock.now();
  }

  private async onBattleQuit() {
    this.stopBattleSpeech();
    await this.repo.commit(this.profiles.currentSave());
    // GDD: 紧急撤离仍进结算（保留学习进度，无胜利星章）
    if (this.session) {
      this.session.finished = true;
      this.session.win = false;
      this.nav.goSettlement();
      this.renderCurrent();
      return;
    }
    this.clearBattleSession();
    this.nav.backToStarMap();
    this.renderCurrent();
  }

  private clearBattleSession() {
    this.session = null;
    this.currentQ = null;
    this.spellBuffer = "";
  }

  private clearPrepLabel() {
    this.unschedule(this.onPrepDone);
    if (this.prepNode) {
      this.prepNode.destroy();
      this.prepNode = null;
    }
  }

  private async onCreateProfile(name: string) {
    try {
      await this.profiles.createChild({
        name,
        textbookId: "hujiao_oxford_2024",
        grade: "3A",
      });
      this.clearProfileError();
      this.nav.afterCreateChild();
      if (this.units.length > 0) {
        this.nav.selectUnit(this.units[0].id);
      }
      this.renderCurrent();
    } catch {
      this.showProfileError();
    }
  }

  private showProfileError() {
    this.clearProfileError();
    const host = this.profileScreen.getScreenRoot() ?? this.screenHost;
    const err = new Node("ProfileError");
    host.addChild(err);
    this.profileErrorNode = err;

    const lbl = makeLabel(err, "ErrorLabel", {
      string: "建档失败，请重试",
      fontSize: UiTheme.font.body,
      color: UiTheme.colors.accentCta,
      width: 320,
      height: 32,
    });
    lbl.horizontalAlign = Label.HorizontalAlign.CENTER;
    err.setPosition(280, -100, 0);
  }

  private clearProfileError() {
    if (this.profileErrorNode) {
      this.profileErrorNode.destroy();
      this.profileErrorNode = null;
    }
  }

  private showReviewEmptyHint() {
    this.clearReviewHint();
    const host = this.starMapScreen.getScreenRoot() ?? this.screenHost;
    const hint = new Node("ReviewEmptyHint");
    host.addChild(hint);
    this.reviewHintNode = hint;

    const lbl = makeLabel(hint, "HintLabel", {
      string: "暂无到期任务",
      fontSize: UiTheme.font.body,
      color: UiTheme.colors.accentInfo,
      width: 320,
      height: 32,
    });
    lbl.horizontalAlign = Label.HorizontalAlign.CENTER;
    hint.setPosition(0, -this.viewport.height / 2 + 140, 0);

    this.scheduleOnce(this.clearReviewHint, 2);
  }

  private clearReviewHint = (): void => {
    this.unschedule(this.clearReviewHint);
    if (this.reviewHintNode) {
      this.reviewHintNode.destroy();
      this.reviewHintNode = null;
    }
  };
}
