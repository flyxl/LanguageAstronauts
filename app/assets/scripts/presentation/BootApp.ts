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
} from "cc";
import { ProfileService } from "../domain/profile/profile-service";
import { LocalStorageSaveRepository } from "../infrastructure/system/local-storage-save-repository";
import { SystemClock } from "../infrastructure/system/system-clock";
import { MathRandomSource } from "../infrastructure/system/math-random-source";

const { ccclass } = _decorator;

/**
 * Cocos Native 启动层：代码搭建 UI，接入领域 ProfileService。
 * 正式交付禁止 WebView；本组件只在 Cocos 引擎内运行。
 */
@ccclass("BootApp")
export class BootApp extends Component {
  private title!: Label;
  private body!: Label;
  private profiles!: ProfileService;
  private started = false;

  async onLoad() {
    this.profiles = new ProfileService(
      new LocalStorageSaveRepository(),
      new SystemClock(),
      new MathRandomSource()
    );
    await this.profiles.start();
    this.buildUi();
    this.refreshSplash();
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
    titleNode.setPosition(0, size.height * 0.28, 0);
    this.title = titleNode.addComponent(Label);
    this.title.string = "时空语航员";
    this.title.fontSize = 44;
    this.title.color = new Color(230, 244, 255, 255);
    titleNode.addComponent(UITransform).setContentSize(640, 64);

    const bodyNode = new Node("Body");
    canvas.addChild(bodyNode);
    bodyNode.setPosition(0, 40, 0);
    this.body = bodyNode.addComponent(Label);
    this.body.fontSize = 22;
    this.body.lineHeight = 34;
    this.body.color = new Color(180, 210, 235, 255);
    this.body.overflow = Label.Overflow.RESIZE_HEIGHT;
    this.body.horizontalAlign = Label.HorizontalAlign.CENTER;
    bodyNode.addComponent(UITransform).setContentSize(620, 420);

    const btn = new Node("StartBtn");
    canvas.addChild(btn);
    btn.setPosition(0, -size.height * 0.28, 0);
    const btnBg = btn.addComponent(Graphics);
    btnBg.fillColor = new Color(37, 99, 235, 255);
    btnBg.roundRect(-150, -40, 300, 80, 14);
    btnBg.fill();
    const btnLabelNode = new Node("BtnLabel");
    btn.addChild(btnLabelNode);
    const btnLabel = btnLabelNode.addComponent(Label);
    btnLabel.string = "创建档案并出发";
    btnLabel.fontSize = 26;
    btnLabel.color = Color.WHITE;
    btnLabelNode.addComponent(UITransform).setContentSize(280, 40);
    btn.addComponent(UITransform).setContentSize(300, 80);
    btn.on(Node.EventType.TOUCH_END, this.onStart, this);
  }

  private refreshSplash() {
    const runtime = sys.isNative ? `Cocos Native · ${sys.platform}` : `预览 · ${sys.platform}`;
    const kids = this.profiles.listChildren();
    this.body.string =
      `运行时：${runtime}\n` +
      `渲染引擎：Cocos Creator（非 WebView / 非 Capacitor）\n` +
      `本地档案数：${kids.length}\n` +
      `点击下方按钮创建「小航员 · 3A」档案。`;
  }

  private async onStart(_e?: EventTouch) {
    if (this.started) return;
    this.started = true;
    const child = await this.profiles.createChild({
      name: "小航员",
      textbookId: "hujiao_oxford_2024",
      grade: "3A",
    });
    this.title.string = child.name;
    this.body.string =
      `档案已创建\n` +
      `教材：${child.textbookId}\n年级：${child.grade}\n` +
      `运行时：${sys.isNative ? "Cocos Native" : "非原生预览"}\n` +
      `StarMap / Battle 场景将继续接入同一领域层。`;
  }
}
