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
import { makeLabel } from "./ui/ui-factory";
import { UiTheme } from "./ui/theme";

const { ccclass } = _decorator;

interface CatalogUnit {
  id: string;
  title: string;
  items?: unknown[];
}

const PREP_MS = 1200;

/**
 * Cocos Native 主链路组合根：Profile → StarMap → Sortie。
 * 禁止 WebView / Capacitor。
 */
@ccclass("BootApp")
export class BootApp extends Component {
  private profiles!: ProfileService;
  private units: CatalogUnit[] = [];
  private nav!: MainPathNav;
  private screenHost!: Node;
  private viewport = { width: 1280, height: 720 };

  private profileScreen!: BootProfileScreen;
  private starMapScreen!: StarMapScreen;
  private sortieScreen!: SortieScreen;

  private prepNode: Node | null = null;
  private profileErrorNode: Node | null = null;

  async onLoad() {
    profiler.hideStats();
    this.profiles = new ProfileService(
      new LocalStorageSaveRepository(),
      new SystemClock(),
      new MathRandomSource()
    );
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
        this.units = (json.units ?? []).slice(0, 8);
        return;
      }
    } catch {
      // fall through
    }
    this.units = [
      { id: "u1", title: "Unit 1 How do we feel?", items: new Array(13) },
      { id: "u2", title: "Unit 2 What's interesting about families?", items: new Array(13) },
      { id: "u3", title: "Unit 3 How do we celebrate?", items: new Array(13) },
      { id: "u4", title: "Unit 4 How do we spend weekends?", items: new Array(13) },
      { id: "u5", title: "Unit 5 What do we eat?", items: new Array(13) },
      { id: "u6", title: "Unit 6 How do animals live?", items: new Array(13) },
      { id: "u7", title: "Unit 7 What do we wear?", items: new Array(13) },
      { id: "u8", title: "Unit 8 How do we go places?", items: new Array(13) },
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
  }

  private renderCurrent() {
    this.clearPrepLabel();
    this.clearProfileError();
    this.profileScreen.destroy();
    this.starMapScreen.destroy();
    this.sortieScreen.destroy();

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
  };

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
