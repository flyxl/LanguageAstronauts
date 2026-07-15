import { Graphics, Label, Node, Size, UITransform } from "cc";
import type { BattleHud } from "../../domain/battle/battle-session";
import {
  attachStarfield,
  colorOf,
  makeCtaButton,
  makeLabel,
  makePanel,
} from "../ui/ui-factory";
import { assertPlayerSafeCopy, UiTheme, type Rgba } from "../ui/theme";

type SizeLike = { width: number; height: number } | Size;

export type SettlementModel = {
  win: boolean;
  hud: BattleHud;
  onHome: () => void;
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

export class SettlementScreen {
  private readonly root: Node;
  private readonly width: number;
  private readonly height: number;
  private screenRoot: Node | null = null;

  constructor(root: Node, size: SizeLike) {
    this.root = root;
    this.width = size.width;
    this.height = size.height;
  }

  render(model: SettlementModel): void {
    this.destroy();

    const screen = new Node("SettlementScreen");
    this.root.addChild(screen);
    this.screenRoot = screen;

    attachStarfield(screen, this.width, this.height, 42);

    const title = makeLabel(screen, "Title", {
      string: model.win ? "星域解放！" : "紧急撤离",
      fontSize: UiTheme.font.brand,
      color: model.win ? UiTheme.colors.accentCta : UiTheme.colors.accentInfo,
      width: 640,
      height: 72,
    });
    title.horizontalAlign = Label.HorizontalAlign.CENTER;
    title.node.setPosition(0, this.height / 2 - 120, 0);

    const panel = new Node("Panel");
    screen.addChild(panel);
    panel.setPosition(0, 0, 0);
    makePanel(panel, "PanelBg", 560, 280);

    const hud = model.hud;
    const chips = new Node("Chips");
    panel.addChild(chips);
    chips.setPosition(0, 40, 0);

    const chipW = 160;
    const chipH = 40;
    const chipGap = 16;
    const chipData = [
      `XP +${hud.xpGained}`,
      `合金 +${hud.alloyGained}`,
      `水晶 ${hud.crystals}`,
    ];
    const totalW = chipData.length * chipW + (chipData.length - 1) * chipGap;
    let x = -totalW / 2 + chipW / 2;

    chipData.forEach((text, i) => {
      makeChip(
        chips,
        `Chip_${i}`,
        text,
        chipW,
        chipH,
        UiTheme.colors.bgDeep,
        UiTheme.colors.accentInfo
      ).setPosition(x, 0, 0);
      x += chipW + chipGap;
    });

    const body = makeLabel(panel, "Body", {
      string: model.win
        ? "知识装甲已被清空。继续巩固复习可争取更多星章。"
        : "保留学习进度，休整后再战。",
      fontSize: UiTheme.font.body,
      color: UiTheme.colors.textSecondary,
      width: 480,
      height: 48,
    });
    body.horizontalAlign = Label.HorizontalAlign.CENTER;
    body.node.setPosition(0, -20, 0);

    makeCtaButton(panel, "HomeBtn", "返回基地", 200, 52, () => model.onHome()).setPosition(
      0,
      -100,
      0
    );
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
