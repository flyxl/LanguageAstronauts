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
import { ensureChildProgression } from "../domain/save/create-default-save";
import { LocalStorageSaveRepository } from "../infrastructure/system/local-storage-save-repository";
import { SystemClock } from "../infrastructure/system/system-clock";
import { MathRandomSource } from "../infrastructure/system/math-random-source";
import { MainPathNav } from "./main-path/main-path-nav";
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
  private sortieScreen!: SortieScreen;
  private battleScreen!: BattleScreen;
  private settlementScreen!: SettlementScreen;

  private session: BattleSession | null = null;
  private currentQ: BattleQuestion | null = null;
  private spellBuffer = "";

  private prepNode: Node | null = null;
  private profileErrorNode: Node | null = null;

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
    this.sortieScreen = new SortieScreen(this.screenHost, this.viewport);
    this.battleScreen = new BattleScreen(this.screenHost, this.viewport);
    this.settlementScreen = new SettlementScreen(this.screenHost, this.viewport);
  }

  private renderCurrent() {
    this.clearPrepLabel();
    this.clearProfileError();
    this.profileScreen.destroy();
    this.starMapScreen.destroy();
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
    this.starMapScreen.render({
      child: this.childSummary(),
      units: this.unitsWithStars(),
      selectedUnitId: this.nav.selectedUnitId,
      onSelectUnit: (id) => {
        this.nav.selectUnit(id);
        this.renderCurrent();
      },
      onSortie: () => {
        this.nav.goSortie();
        this.renderCurrent();
      },
    });
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
    if (this.prepNode) return;
    const host = this.sortieScreen.getScreenRoot() ?? this.screenHost;
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
    this.startBattle();
  };

  private startBattle() {
    const child = this.activeChild();
    const unit = this.units.find((u) => u.id === this.nav.selectedUnitId);
    if (!child || !unit || unit.items.length === 0) return;

    this.session = new BattleSession(
      unit.id,
      unit.items,
      this.profiles.currentSave(),
      child.id,
      this.clock,
      this.random,
      this.bus,
      "campaign"
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
}
