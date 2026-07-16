import {
  Graphics,
  Label,
  Node,
  Size,
  UITransform,
} from "cc";
import {
  attachStarfield,
  colorOf,
  makeChromeBar,
  makeCtaButton,
  makeLabel,
  makePanel,
  makeSecondaryButton,
} from "../ui/ui-factory";
import { assertPlayerSafeCopy, UiTheme, type Rgba } from "../ui/theme";
import { createContentRoot, measureScreen } from "../ui/layout";

const BOSS_STAGES = ["听", "读", "拼", "说"] as const;

type SizeLike = { width: number; height: number } | Size;

export type SortieModel = {
  unitTitle: string;
  onBack: () => void;
  onStart: () => void;
};

function makeChip(
  parent: Node,
  name: string,
  text: string,
  w: number,
  h: number,
  fill: Rgba,
  stroke: Rgba
): Node {
  assertPlayerSafeCopy(text);
  const chip = new Node(name);
  parent.addChild(chip);
  const g = chip.addComponent(Graphics);
  const radius = 10;
  g.fillColor = colorOf(fill);
  g.roundRect(-w / 2, -h / 2, w, h, radius);
  g.fill();
  g.strokeColor = colorOf(stroke);
  g.lineWidth = 2;
  g.roundRect(-w / 2, -h / 2, w, h, radius);
  g.stroke();
  chip.addComponent(UITransform).setContentSize(w, h);

  const labelNode = new Node("Label");
  chip.addChild(labelNode);
  const lbl = labelNode.addComponent(Label);
  lbl.string = text;
  lbl.fontSize = UiTheme.font.chip;
  lbl.color = colorOf(UiTheme.colors.textPrimary);
  lbl.horizontalAlign = Label.HorizontalAlign.CENTER;
  lbl.verticalAlign = Label.VerticalAlign.CENTER;
  labelNode.addComponent(UITransform).setContentSize(w - 16, h - 8);
  return chip;
}

export class SortieScreen {
  private readonly root: Node;
  private readonly width: number;
  private readonly height: number;
  private screenRoot: Node | null = null;

  constructor(root: Node, size: SizeLike) {
    this.root = root;
    this.width = size.width;
    this.height = size.height;
  }

  render(model: SortieModel): void {
    this.destroy();

    const screen = new Node("SortieScreen");
    this.root.addChild(screen);
    this.screenRoot = screen;

    attachStarfield(screen, this.width, this.height, 42);

    const layout = measureScreen(this.width, this.height);
    const content = createContentRoot(screen, layout);
    const cw = layout.contentW;
    const ch = layout.contentH;
    const panelW = Math.min(cw - 80, 720);

    const taskBar = new Node("TaskBar");
    content.addChild(taskBar);
    taskBar.setPosition(0, ch / 2 - 88, 0);
    makePanel(taskBar, "TaskPanel", panelW, 56);
    const taskTitle = makeLabel(taskBar, "UnitTitle", {
      string: model.unitTitle,
      fontSize: UiTheme.font.screenTitle,
      width: panelW - 40,
      height: 40,
    });
    taskTitle.horizontalAlign = Label.HorizontalAlign.CENTER;

    const chain = new Node("BossChain");
    content.addChild(chain);
    chain.setPosition(0, 32, 0);

    const chipW = 56;
    const chipH = 40;
    const arrowW = 28;
    const totalW =
      BOSS_STAGES.length * chipW + (BOSS_STAGES.length - 1) * arrowW;
    let x = -totalW / 2 + chipW / 2;

    BOSS_STAGES.forEach((stage, i) => {
      const chip = makeChip(
        chain,
        `Boss_${stage}`,
        stage,
        chipW,
        chipH,
        UiTheme.colors.bgDeep,
        UiTheme.colors.accentInfo
      );
      chip.setPosition(x, 0, 0);
      x += chipW;
      if (i < BOSS_STAGES.length - 1) {
        const arrow = makeLabel(chain, `Arrow_${i}`, {
          string: "→",
          fontSize: UiTheme.font.body,
          color: UiTheme.colors.textSecondary,
          width: arrowW,
          height: 32,
        });
        arrow.horizontalAlign = Label.HorizontalAlign.CENTER;
        arrow.node.setPosition(x + arrowW / 2, 0, 0);
        x += arrowW;
      }
    });

    const body = makeLabel(content, "BodyCopy", {
      string: "知识装甲待命，答对即发射。",
      fontSize: UiTheme.font.body,
      color: UiTheme.colors.textSecondary,
      width: 560,
      height: 48,
    });
    body.horizontalAlign = Label.HorizontalAlign.CENTER;
    body.node.setPosition(0, -48, 0);

    const bottomY = -ch / 2 + 64;
    makeChromeBar(content, "BottomChrome", cw, 72, false).setPosition(0, bottomY, 0);

    const actions = new Node("Actions");
    content.addChild(actions);
    actions.setPosition(0, bottomY, 0);

    makeSecondaryButton(
      actions,
      "BackBtn",
      "返回星图",
      180,
      52,
      () => model.onBack()
    ).setPosition(-120, 0, 0);

    makeCtaButton(
      actions,
      "StartBtn",
      "开始远征",
      180,
      52,
      () => model.onStart()
    ).setPosition(120, 0, 0);
  }

  destroy(): void {
    if (this.screenRoot) {
      this.screenRoot.destroy();
      this.screenRoot = null;
    }
  }

  getScreenRoot(): Node | null {
    return this.screenRoot;
  }
}
