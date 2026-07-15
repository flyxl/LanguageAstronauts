import {
  _decorator,
  Component,
  Node,
  Label,
  Color,
  UITransform,
  view,
  Graphics,
  sys,
  EventTouch,
  resources,
  JsonAsset,
} from "cc";
import { ProfileService } from "../domain/profile/profile-service";
import { LocalStorageSaveRepository } from "../infrastructure/system/local-storage-save-repository";
import { SystemClock } from "../infrastructure/system/system-clock";
import { MathRandomSource } from "../infrastructure/system/math-random-source";

const { ccclass } = _decorator;

interface CatalogUnit {
  id: string;
  title: string;
  items?: unknown[];
}

/**
 * Cocos Native 启动层：档案 → 星图单元列表（最小可用闭环）。
 * 禁止 WebView / Capacitor。
 */
@ccclass("BootApp")
export class BootApp extends Component {
  private title!: Label;
  private body!: Label;
  private btnLabel!: Label;
  private profiles!: ProfileService;
  private units: CatalogUnit[] = [];
  private mode: "boot" | "map" = "boot";

  async onLoad() {
    this.profiles = new ProfileService(
      new LocalStorageSaveRepository(),
      new SystemClock(),
      new MathRandomSource()
    );
    await this.profiles.start();
    await this.loadCatalog();
    this.buildUi();
    const kids = this.profiles.listChildren();
    if (kids.length > 0) {
      this.showStarMap(kids[0].name);
    } else {
      this.refreshSplash();
    }
  }

  private async loadCatalog() {
    // build 时 content 会进 resources 或 main bundle；优先 resources
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
    // 兜底：硬编码 3A 单元标题（与 catalog 一致即可玩冒烟）
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

  private buildUi() {
    const canvas = this.node;
    const size = view.getVisibleSize();

    const bg = new Node("Bg");
    canvas.addChild(bg);
    bg.setSiblingIndex(0);
    const g = bg.addComponent(Graphics);
    g.fillColor = new Color(7, 20, 40, 255);
    g.rect(-size.width / 2, -size.height / 2, size.width, size.height);
    g.fill();
    bg.addComponent(UITransform).setContentSize(size.width, size.height);

    const titleNode = new Node("Title");
    canvas.addChild(titleNode);
    titleNode.setPosition(0, size.height * 0.36, 0);
    this.title = titleNode.addComponent(Label);
    this.title.string = "时空语航员";
    this.title.fontSize = 42;
    this.title.color = new Color(230, 244, 255, 255);
    titleNode.addComponent(UITransform).setContentSize(640, 64);

    const bodyNode = new Node("Body");
    canvas.addChild(bodyNode);
    bodyNode.setPosition(0, 20, 0);
    this.body = bodyNode.addComponent(Label);
    this.body.fontSize = 20;
    this.body.lineHeight = 30;
    this.body.color = new Color(180, 210, 235, 255);
    this.body.overflow = Label.Overflow.RESIZE_HEIGHT;
    this.body.horizontalAlign = Label.HorizontalAlign.CENTER;
    bodyNode.addComponent(UITransform).setContentSize(640, 520);

    const btn = new Node("StartBtn");
    canvas.addChild(btn);
    btn.setPosition(0, -size.height * 0.34, 0);
    const btnBg = btn.addComponent(Graphics);
    btnBg.fillColor = new Color(37, 99, 235, 255);
    btnBg.roundRect(-160, -40, 320, 80, 14);
    btnBg.fill();
    const btnLabelNode = new Node("BtnLabel");
    btn.addChild(btnLabelNode);
    this.btnLabel = btnLabelNode.addComponent(Label);
    this.btnLabel.string = "创建档案并出发";
    this.btnLabel.fontSize = 26;
    this.btnLabel.color = Color.WHITE;
    btnLabelNode.addComponent(UITransform).setContentSize(300, 40);
    btn.addComponent(UITransform).setContentSize(320, 80);
    btn.on(Node.EventType.TOUCH_END, this.onPrimary, this);
  }

  private refreshSplash() {
    this.mode = "boot";
    const runtime = sys.isNative ? `Cocos Native · ${sys.platform}` : `预览 · ${sys.platform}`;
    this.title.string = "时空语航员";
    this.btnLabel.string = "创建档案并出发";
    this.body.string =
      `运行时：${runtime}\n` +
      `引擎：Cocos Creator Native（非 WebView）\n` +
      `教材：沪教牛津 2024 · 3A\n` +
      `点击下方创建「小航员」档案并进入星图。`;
  }

  private showStarMap(childName: string) {
    this.mode = "map";
    this.title.string = childName;
    this.btnLabel.string = "出击 Unit 1";
    const lines = this.units.map((u, i) => {
      const n = u.items?.length ?? 13;
      return `${i + 1}. ${u.title}\n    ${n} 语言点 · 出击`;
    });
    this.body.string =
      `星图远征 · 3A\n四关 Boss（听/读/拼/说）· 知识装甲\n\n` +
      lines.join("\n\n") +
      `\n\n运行时：${sys.isNative ? "Cocos Native" : "预览"}`;
  }

  private async onPrimary(_e?: EventTouch) {
    if (this.mode === "boot") {
      const child = await this.profiles.createChild({
        name: "小航员",
        textbookId: "hujiao_oxford_2024",
        grade: "3A",
      });
      this.showStarMap(child.name);
      return;
    }
    // map mode：最小“开战”反馈
    const u = this.units[0];
    this.body.string =
      `出击准备：${u?.title ?? "Unit 1"}\n` +
      `Boss 形态：听 → 读 → 拼 → 说\n` +
      `领域层 BattleSession 已接入仓库；\n下一包完成完整战斗场景绑定。\n\n` +
      `运行时：${sys.isNative ? "Cocos Native ✓" : "预览"}`;
    this.btnLabel.string = "已锁定出击";
  }
}
