import {
  EventTouch,
  Graphics,
  Label,
  Node,
  Size,
  UITransform,
} from "cc";
import {
  attachStarfield,
  colorOf,
  makeCtaButton,
  makeLabel,
} from "../ui/ui-factory";
import { assertPlayerSafeCopy, UiTheme, type Rgba } from "../ui/theme";
import { formatStars } from "../ui/format-stars";

export { formatStars };

type SizeLike = { width: number; height: number } | Size;

export type StarMapUnit = {
  id: string;
  title: string;
  items?: unknown[];
  stars?: number;
};

export type StarMapModel = {
  child: { name: string; level: number; alloy: number; starCrystals: number };
  units: StarMapUnit[];
  selectedUnitId: string | null;
  dueCount: number;
  onSelectUnit: (id: string) => void;
  onSortie: () => void;
  onBase: () => void;
  onReport: () => void;
  onDueReview: () => void;
};

const MAX_CARDS = 8;
const CARD_W = 360;
const CARD_H = 112;
const COL_GAP = 48;
const ROW_GAP = 16;

function truncateTitle(title: string, maxLen = 18): string {
  if (title.length <= maxLen) {
    return title;
  }
  return `${title.slice(0, maxLen - 1)}…`;
}

function itemCount(unit: StarMapUnit): number {
  return unit.items?.length ?? 13;
}

function makeChip(
  parent: Node,
  name: string,
  text: string,
  w: number,
  h: number,
  fill: Rgba,
  stroke: Rgba,
  onTap?: (event?: EventTouch) => void
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

  if (onTap) {
    chip.on(Node.EventType.TOUCH_END, onTap);
  }
  return chip;
}

function makeUnitCard(
  parent: Node,
  index: number,
  unit: StarMapUnit,
  selected: boolean,
  onSelect: () => void
): Node {
  const card = new Node(`UnitCard_${unit.id}`);
  parent.addChild(card);

  const stroke = selected ? UiTheme.colors.accentCta : UiTheme.colors.strokePanel;
  const lineWidth = selected ? 3 : 2;

  const bg = new Node("Bg");
  card.addChild(bg);
  const g = bg.addComponent(Graphics);
  const radius = 12;
  g.fillColor = colorOf(UiTheme.colors.bgPanel);
  g.roundRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, radius);
  g.fill();
  g.strokeColor = colorOf(stroke);
  g.lineWidth = lineWidth;
  g.roundRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, radius);
  g.stroke();
  bg.addComponent(UITransform).setContentSize(CARD_W, CARD_H);

  const unitNo = makeLabel(card, "UnitNo", {
    string: `Unit ${index + 1}`,
    fontSize: UiTheme.font.chip,
    color: UiTheme.colors.textSecondary,
    width: CARD_W - 32,
    height: 22,
  });
  unitNo.horizontalAlign = Label.HorizontalAlign.LEFT;
  unitNo.node.setPosition(-CARD_W / 2 + 16, CARD_H / 2 - 24, 0);

  const title = makeLabel(card, "Title", {
    string: truncateTitle(unit.title),
    fontSize: UiTheme.font.cardTitle,
    width: CARD_W - 32,
    height: 28,
  });
  title.horizontalAlign = Label.HorizontalAlign.LEFT;
  title.node.setPosition(-CARD_W / 2 + 16, 16, 0);

  const meta = makeLabel(card, "Meta", {
    string: `${itemCount(unit)} 语言点 · ${formatStars(unit.stars ?? 0)}`,
    fontSize: UiTheme.font.body,
    color: UiTheme.colors.textSecondary,
    width: CARD_W - 32,
    height: 24,
  });
  meta.horizontalAlign = Label.HorizontalAlign.LEFT;
  meta.node.setPosition(-CARD_W / 2 + 16, -20, 0);

  card.addComponent(UITransform).setContentSize(CARD_W, CARD_H);
  card.on(Node.EventType.TOUCH_END, onSelect);
  return card;
}

export class StarMapScreen {
  private readonly root: Node;
  private readonly width: number;
  private readonly height: number;
  private screenRoot: Node | null = null;

  constructor(root: Node, size: SizeLike) {
    this.root = root;
    this.width = size.width;
    this.height = size.height;
  }

  render(model: StarMapModel): void {
    this.destroy();

    const screen = new Node("StarMapScreen");
    this.root.addChild(screen);
    this.screenRoot = screen;

    attachStarfield(screen, this.width, this.height, 42);

    const topBar = new Node("TopBar");
    screen.addChild(topBar);
    topBar.setPosition(0, this.height / 2 - 52, 0);

    const chips: Array<{ text: string; w: number }> = [
      { text: model.child.name, w: 120 },
      { text: `Lv.${model.child.level}`, w: 72 },
      { text: `合金 ${model.child.alloy}`, w: 100 },
      { text: `星晶 ${model.child.starCrystals}`, w: 100 },
    ];

    const chipGap = 12;
    const baseBtnW = 88;
    const reportBtnW = 72;
    const chipsWidth = chips.reduce((sum, c) => sum + c.w, 0) + chipGap * (chips.length - 1);
    const rowWidth = chipsWidth + chipGap + reportBtnW + chipGap + baseBtnW;
    let x = -rowWidth / 2;
    for (const chip of chips) {
      const node = makeChip(
        topBar,
        chip.text,
        chip.text,
        chip.w,
        36,
        UiTheme.colors.bgDeep,
        UiTheme.colors.accentInfo
      );
      node.setPosition(x + chip.w / 2, 0, 0);
      x += chip.w + chipGap;
    }

    makeChip(
      topBar,
      "ReportBtn",
      "学情",
      reportBtnW,
      36,
      UiTheme.colors.bgPanel,
      UiTheme.colors.accentCta,
      () => model.onReport()
    ).setPosition(x + reportBtnW / 2, 0, 0);
    x += reportBtnW + chipGap;

    // Keep 「整备」 in the same top row (not at screen edge — that clipped off-canvas).
    makeCtaButton(topBar, "BaseBtn", "整备", baseBtnW, 36, () => model.onBase()).setPosition(
      x + baseBtnW / 2,
      0,
      0
    );

    if (model.dueCount > 0) {
      makeChip(
        screen,
        "DueReviewChip",
        `到期复习 ${model.dueCount}`,
        148,
        40,
        UiTheme.colors.bgPanel,
        UiTheme.colors.accentCta,
        () => model.onDueReview()
      ).setPosition(0, this.height / 2 - 96, 0);
    }

    const grid = new Node("UnitGrid");
    screen.addChild(grid);

    const visible = model.units.slice(0, MAX_CARDS);
    const colW = CARD_W + COL_GAP;
    const rowH = CARD_H + ROW_GAP;
    const cols = 2;
    const rows = Math.ceil(visible.length / cols);
    const gridW = cols * colW - COL_GAP;
    const gridH = rows * rowH - ROW_GAP;
    const startX = -gridW / 2 + CARD_W / 2;
    const startY = gridH / 2 - CARD_H / 2 - 20;

    visible.forEach((unit, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const card = makeUnitCard(
        grid,
        i,
        unit,
        unit.id === model.selectedUnitId,
        () => model.onSelectUnit(unit.id)
      );
      card.setPosition(startX + col * colW, startY - row * rowH, 0);
    });

    if (model.selectedUnitId) {
      const idx = model.units.findIndex((u) => u.id === model.selectedUnitId);
      const unit = idx >= 0 ? model.units[idx] : null;
      const contextText = unit
        ? truncateTitle(unit.title, 22)
        : `Unit ${idx + 1}`;

      const bottomBar = new Node("BottomBar");
      screen.addChild(bottomBar);
      const bottomY = -this.height / 2 + 56;
      bottomBar.setPosition(this.width / 2 - 200, bottomY, 0);

      const ctx = makeLabel(bottomBar, "SelectedCtx", {
        string: contextText,
        fontSize: UiTheme.font.body,
        color: UiTheme.colors.textSecondary,
        width: 220,
        height: 32,
      });
      ctx.horizontalAlign = Label.HorizontalAlign.RIGHT;
      ctx.node.setPosition(-90, 0, 0);

      makeCtaButton(
        bottomBar,
        "SortieBtn",
        "出击",
        160,
        52,
        () => model.onSortie()
      ).setPosition(80, 0, 0);
    }
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
