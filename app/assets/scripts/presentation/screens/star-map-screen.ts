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
  makeChromeBar,
  makeCtaButton,
  makeLabel,
  makeSecondaryButton,
} from "../ui/ui-factory";
import { assertPlayerSafeCopy, UiTheme, type Rgba } from "../ui/theme";
import { formatStars } from "../ui/format-stars";
import { unitCardTitle } from "../ui/unit-card-title";
import {
  contentRight,
  createContentRoot,
  gridColsForContent,
  measureScreen,
} from "../ui/layout";

export { formatStars };

type SizeLike = { width: number; height: number } | Size;

export type StarMapUnit = {
  id: string;
  title: string;
  items?: unknown[];
  stars?: number;
  locked?: boolean;
};

export type StarMapModel = {
  child: { name: string; level: number; alloy: number; starCrystals: number };
  units: StarMapUnit[];
  selectedUnitId: string | null;
  dueCount: number;
  dailyDone: number;
  dailyTotal: number;
  onSelectUnit: (id: string) => void;
  onSortie: () => void;
  onBase: () => void;
  onReport: () => void;
  onDueReview: () => void;
};

const MAX_CARDS = 8;
const CARD_W = 300;
const CARD_H = 108;
const COL_GAP = 24;
const ROW_GAP = 16;
const TOP_BAR_H = 72;
const BOTTOM_BAR_H = 80;

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

  if (onTap) chip.on(Node.EventType.TOUCH_END, onTap);
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

  const locked = Boolean(unit.locked);
  const stroke = locked
    ? UiTheme.colors.textSecondary
    : selected
      ? UiTheme.colors.accentCta
      : UiTheme.colors.strokePanel;
  const lineWidth = selected && !locked ? 3 : 2;

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

  const badge = makeLabel(card, "UnitNo", {
    string: locked ? "锁" : `U${index + 1}`,
    fontSize: UiTheme.font.chip,
    color: locked ? UiTheme.colors.textSecondary : UiTheme.colors.accentInfo,
    width: 40,
    height: 22,
  });
  badge.horizontalAlign = Label.HorizontalAlign.RIGHT;
  badge.node.getComponent(UITransform)!.setAnchorPoint(1, 0.5);
  badge.node.setPosition(CARD_W / 2 - 12, CARD_H / 2 - 16, 0);

  const title = makeLabel(card, "Title", {
    string: unitCardTitle(unit.title, 32),
    fontSize: UiTheme.font.cardTitle,
    color: locked ? UiTheme.colors.textSecondary : UiTheme.colors.textPrimary,
    width: CARD_W - 28,
    height: 26,
  });
  title.horizontalAlign = Label.HorizontalAlign.LEFT;
  title.overflow = Label.Overflow.CLAMP;
  title.node.getComponent(UITransform)!.setAnchorPoint(0, 0.5);
  title.node.setPosition(-CARD_W / 2 + 14, 6, 0);

  const meta = makeLabel(card, "Meta", {
    string: locked
      ? "完成前序单元后解锁"
      : `${itemCount(unit)} 语言点 · ${formatStars(unit.stars ?? 0)}`,
    fontSize: UiTheme.font.chip,
    color: UiTheme.colors.textSecondary,
    width: CARD_W - 28,
    height: 22,
  });
  meta.horizontalAlign = Label.HorizontalAlign.LEFT;
  meta.node.getComponent(UITransform)!.setAnchorPoint(0, 0.5);
  meta.node.setPosition(-CARD_W / 2 + 14, -26, 0);

  card.addComponent(UITransform).setContentSize(CARD_W, CARD_H);
  if (!locked) card.on(Node.EventType.TOUCH_END, onSelect);
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

    const layout = measureScreen(this.width, this.height);
    const content = createContentRoot(screen, layout);
    const cw = layout.contentW;
    const ch = layout.contentH;

    const topY = ch / 2 - TOP_BAR_H / 2;
    makeChromeBar(content, "TopChrome", cw, TOP_BAR_H).setPosition(0, topY, 0);

    const topBar = new Node("TopBar");
    content.addChild(topBar);
    topBar.setPosition(0, topY, 0);

    const title = makeLabel(topBar, "ScreenTitle", {
      string: "星图",
      fontSize: UiTheme.font.screenTitle,
      width: 80,
      height: 40,
    });
    title.horizontalAlign = Label.HorizontalAlign.LEFT;
    title.node.getComponent(UITransform)!.setAnchorPoint(0, 0.5);
    title.node.setPosition(-cw / 2 + 20, 0, 0);

    const chips: Array<{ text: string; w: number }> = [
      { text: model.child.name, w: 108 },
      { text: `Lv.${model.child.level}`, w: 64 },
      { text: `合金 ${model.child.alloy}`, w: 92 },
      { text: `星晶 ${model.child.starCrystals}`, w: 92 },
    ];
    const chipGap = 10;
    const chipsWidth = chips.reduce((sum, c) => sum + c.w, 0) + chipGap * (chips.length - 1);
    let x = -chipsWidth / 2;
    for (const chip of chips) {
      const node = makeChip(
        topBar,
        chip.text,
        chip.text,
        chip.w,
        34,
        UiTheme.colors.bgDeep,
        UiTheme.colors.accentInfo
      );
      node.setPosition(x + chip.w / 2, 0, 0);
      x += chip.w + chipGap;
    }

    makeSecondaryButton(topBar, "ReportBtn", "学情", 68, 34, () => model.onReport()).setPosition(
      contentRight(layout, 108),
      0,
      0
    );
    makeCtaButton(topBar, "BaseBtn", "整备", 72, 34, () => model.onBase()).setPosition(
      contentRight(layout, 24),
      0,
      0
    );

    const subBar = new Node("SubBar");
    content.addChild(subBar);
    subBar.setPosition(0, topY - TOP_BAR_H / 2 - 28, 0);

    if (model.dueCount > 0) {
      makeChip(
        subBar,
        "DueReviewChip",
        `到期复习 ${model.dueCount}`,
        140,
        36,
        UiTheme.colors.bgPanel,
        UiTheme.colors.accentCta,
        () => model.onDueReview()
      ).setPosition(-78, 0, 0);
    }

    makeChip(
      subBar,
      "DailyChip",
      `今日护航 ${model.dailyDone}/${model.dailyTotal}`,
      140,
      36,
      UiTheme.colors.bgDeep,
      UiTheme.colors.accentInfo
    ).setPosition(model.dueCount > 0 ? 78 : 0, 0, 0);

    const grid = new Node("UnitGrid");
    content.addChild(grid);

    const visible = model.units.slice(0, MAX_CARDS);
    const colW = CARD_W + COL_GAP;
    const rowH = CARD_H + ROW_GAP;
    const cols = gridColsForContent(cw, CARD_W, COL_GAP, 3);
    const rows = Math.ceil(visible.length / cols);
    const gridW = cols * colW - COL_GAP;
    const gridH = rows * rowH - ROW_GAP;
    const startX = -gridW / 2 + CARD_W / 2;
    const startY = gridH / 2 - CARD_H / 2;
    grid.setPosition(0, -12, 0);

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
      const locked = Boolean(unit?.locked);
      const contextText = unit
        ? locked
          ? "该单元尚未解锁"
          : unitCardTitle(unit.title, 24)
        : `Unit ${idx + 1}`;

      const bottomY = -ch / 2 + BOTTOM_BAR_H / 2;
      makeChromeBar(content, "BottomChrome", cw, BOTTOM_BAR_H, false).setPosition(0, bottomY, 0);

      const bottomBar = new Node("BottomBar");
      content.addChild(bottomBar);
      bottomBar.setPosition(0, bottomY, 0);

      const ctx = makeLabel(bottomBar, "SelectedCtx", {
        string: contextText,
        fontSize: UiTheme.font.body,
        color: UiTheme.colors.textSecondary,
        width: 360,
        height: 32,
      });
      ctx.horizontalAlign = Label.HorizontalAlign.LEFT;
      ctx.node.getComponent(UITransform)!.setAnchorPoint(0, 0.5);
      ctx.node.setPosition(-cw / 2 + 24, 0, 0);

      if (!locked) {
        makeCtaButton(bottomBar, "SortieBtn", "出击", 160, 48, () => model.onSortie()).setPosition(
          cw / 2 - 104,
          0,
          0
        );
      } else {
        makeChip(
          bottomBar,
          "LockedSortie",
          "未解锁",
          160,
          48,
          UiTheme.colors.bgDeep,
          UiTheme.colors.textSecondary
        ).setPosition(cw / 2 - 104, 0, 0);
      }
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
