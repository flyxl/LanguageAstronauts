import {
  _decorator,
  Component,
  Node,
  Label,
  view,
  resources,
  JsonAsset,
  profiler,
} from "cc";
import type { AppEvents } from "../core/app-events";
import { EventBus } from "../core/event-bus";
import { BattleSession } from "../domain/battle/battle-session";
import type { BattleQuestion } from "../domain/battle/question-builder";
import type { ContentItem } from "../domain/content/content-types";
import { ProfileService } from "../domain/profile/profile-service";
import { calculateLevel } from "../domain/progression/xp";
import { PETS, type PetId } from "../domain/progression/pets";
import { collectDueContentItems, countDueReviews } from "../domain/learning/collect-due-items";
import { ensureChildProgression } from "../domain/save/create-default-save";
import type { WeaponId } from "../domain/weapons/weapons";
import { LocalStorageSaveRepository } from "../infrastructure/system/local-storage-save-repository";
import { SystemClock } from "../infrastructure/system/system-clock";
import { MathRandomSource } from "../infrastructure/system/math-random-source";
import { MainPathNav } from "./main-path/main-path-nav";
import { BaseScreen } from "./screens/base-screen";
import { BootProfileScreen } from "./screens/boot-profile-screen";
import { StarMapScreen } from "./screens/star-map-screen";
import { SortieScreen } from "./screens/sortie-screen";
import { BattleScreen } from "./screens/battle-screen";
import { SettlementScreen } from "./screens/settlement-screen";
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

  private session: BattleSession | null = null;
  private currentQ: BattleQuestion | null = null;
  private spellBuffer = "";

  private prepNode: Node | null = null;
  private profileErrorNode: Node | null = null;
  private reviewHintNode: Node | null = null;
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

  private async loadCatalog() {
    try {
      const asset = await new Promise<JsonAsset | null>((resolve) => {
        resources.load("content/catalog", JsonAsset, (err, data) => {
          if (err || !data) resolve(null);
          else resolve(data);
        });
      });
      if (asset?.json) {
        const json = asset.json as { units?: CatalogUnit[] };
        this.units = (json.units ?? []).slice(0, 8).map((u) => ({
          id: u.id,
          title: u.title,
          items: (u.items ?? []) as ContentItem[],
        }));
        return;
      }
    } catch {
      // fall through
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
  }

  private renderCurrent() {
    this.clearPrepLabel();
    this.clearProfileError();
    this.profileScreen.destroy();
    this.starMapScreen.destroy();
    this.baseScreen.destroy();
    this.sortieScreen.destroy();
    this.battleScreen.destroy();
    this.settlementScreen.destroy();

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

    this.starMapScreen.render({
      child: this.childSummary(),
      units: this.unitsWithStars(),
      selectedUnitId: this.nav.selectedUnitId,
      dueCount,
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
    });
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
    this.session.answer(choice, opts);
    if (this.session.finished) {
      await this.repo.commit(this.profiles.currentSave());
      this.nav.goSettlement();
      this.renderCurrent();
      return;
    }
    this.currentQ = this.session.nextQuestion();
    this.spellBuffer = "";
    this.renderCurrent();
  }

  private async onBattleQuit() {
    await this.repo.commit(this.profiles.currentSave());
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
