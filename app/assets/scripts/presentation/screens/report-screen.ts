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
  makePanel,
} from "../ui/ui-factory";
import { assertPlayerSafeCopy, UiTheme, type Rgba } from "../ui/theme";
import { formatStars } from "../ui/format-stars";

type SizeLike = { width: number; height: number } | Size;

export type ReportUnitRow = {
  id: string;
  title: string;
  stars: number;
};

export type ReportModel = {
  child: {
    name: string;
    grade: string;
    textbookLabel: string;
    level: number;
    totalXp: number;
    alloy: number;
    starCrystals: number;
  };
  units: ReportUnitRow[];
  learning: {
    dueCount: number;
    seenCount: number;
    masteredCount: number;
  };
  onBack: () => void;
  onExportSave: () => void;
  onImportSave: () => void;
};

const MAX_UNITS = 8;
const PANEL_W = 920;
const PANEL_H = 520;
const ROW_H = 36;

function truncateTitle(title: string, maxLen = 28): string {
  if (title.length <= maxLen) return title;
  return `${title.slice(0, maxLen - 1)}…`;
}

function makeSecondaryButton(
  parent: Node,
  name: string,
  label: string,
  w: number,
  h: number,
  onTap: (event?: EventTouch) => void
): Node {
  assertPlayerSafeCopy(label);
  const btn = new Node(name);
  parent.addChild(btn);
  const g = btn.addComponent(Graphics);
  const radius = 10;
  g.fillColor = colorOf(UiTheme.colors.bgPanel);
  g.roundRect(-w / 2, -h / 2, w, h, radius);
  g.fill();
  g.strokeColor = colorOf(UiTheme.colors.strokePanel);
  g.lineWidth = 2;
  g.roundRect(-w / 2, -h / 2, w, h, radius);
  g.stroke();
  btn.addComponent(UITransform).setContentSize(w, h);

  const labelNode = new Node("Label");
  btn.addChild(labelNode);
  const lbl = labelNode.addComponent(Label);
  lbl.string = label;
  lbl.fontSize = UiTheme.font.chip;
  lbl.color = colorOf(UiTheme.colors.textPrimary);
  lbl.horizontalAlign = Label.HorizontalAlign.CENTER;
  lbl.verticalAlign = Label.VerticalAlign.CENTER;
  labelNode.addComponent(UITransform).setContentSize(w - 12, h - 8);

  btn.on(Node.EventType.TOUCH_END, onTap);
  return btn;
}

function sectionCaption(parent: Node, text: string, y: number): void {
  const caption = makeLabel(parent, `Caption_${text}`, {
    string: text,
    fontSize: UiTheme.font.chip,
    color: UiTheme.colors.textSecondary,
    width: PANEL_W - 64,
    height: 22,
  });
  caption.horizontalAlign = Label.HorizontalAlign.LEFT;
  caption.node.setPosition(-PANEL_W / 2 + 32, y, 0);
}

function statLine(parent: Node, text: string, y: number): void {
  const line = makeLabel(parent, `Stat_${y}`, {
    string: text,
    fontSize: UiTheme.font.body,
    width: 400,
    height: ROW_H,
  });
  line.horizontalAlign = Label.HorizontalAlign.LEFT;
  line.node.setPosition(-PANEL_W / 2 + 32, y, 0);
}

function unitRow(parent: Node, index: number, unit: ReportUnitRow, y: number): void {
  const text = `${index + 1}. ${truncateTitle(unit.title)} · ${formatStars(unit.stars)}`;
  const line = makeLabel(parent, `Unit_${unit.id}`, {
    string: text,
    fontSize: UiTheme.font.body,
    color: UiTheme.colors.textSecondary,
    width: 420,
    height: ROW_H,
  });
  line.horizontalAlign = Label.HorizontalAlign.LEFT;
  line.node.setPosition(40, y, 0);
}

export class ReportScreen {
  private readonly root: Node;
  private readonly width: number;
  private readonly height: number;
  private screenRoot: Node | null = null;

  constructor(root: Node, size: SizeLike) {
    this.root = root;
    this.width = size.width;
    this.height = size.height;
  }

  render(model: ReportModel): void {
    this.destroy();

    const screen = new Node("ReportScreen");
    this.root.addChild(screen);
    this.screenRoot = screen;

    attachStarfield(screen, this.width, this.height, 42);

    const topBar = new Node("TopBar");
    screen.addChild(topBar);
    topBar.setPosition(0, this.height / 2 - 52, 0);

    const title = makeLabel(topBar, "ScreenTitle", {
      string: "学情简报",
      fontSize: UiTheme.font.screenTitle,
      width: 200,
      height: 40,
    });
    title.horizontalAlign = Label.HorizontalAlign.LEFT;
    title.node.setPosition(-this.width / 2 + 120, 0, 0);

    makeSecondaryButton(topBar, "BackBtn", "返回", 88, 36, () => model.onBack()).setPosition(
      this.width / 2 - 80,
      0,
      0
    );

    const panelRoot = new Node("ReportPanel");
    screen.addChild(panelRoot);
    panelRoot.setPosition(0, -16, 0);
    makePanel(panelRoot, "PanelBg", PANEL_W, PANEL_H);

    const { child, units, learning } = model;

    sectionCaption(panelRoot, "航员档案", PANEL_H / 2 - 48);
    statLine(panelRoot, `${child.name} · ${child.grade} · ${child.textbookLabel}`, PANEL_H / 2 - 80);
    statLine(
      panelRoot,
      `Lv.${child.level} · 经验 ${child.totalXp} · 合金 ${child.alloy} · 星晶 ${child.starCrystals}`,
      PANEL_H / 2 - 116
    );

    sectionCaption(panelRoot, "单元进度", 72);
    const visible = units.slice(0, MAX_UNITS);
    visible.forEach((unit, i) => {
      unitRow(panelRoot, i, unit, 40 - i * ROW_H);
    });
    if (visible.length === 0) {
      statLine(panelRoot, "暂无单元记录", 40);
    }

    sectionCaption(panelRoot, "学习摘要", -120);
    statLine(panelRoot, `到期复习 ${learning.dueCount} 项`, -154);
    statLine(panelRoot, `已接触 ${learning.seenCount} 项 · 首次答对 ${learning.masteredCount} 项`, -190);

    makeSecondaryButton(panelRoot, "ExportSaveBtn", "导出存档", 140, 40, () =>
      model.onExportSave()
    ).setPosition(-90, -PANEL_H / 2 + 96, 0);
    makeSecondaryButton(panelRoot, "ImportSaveBtn", "导入存档", 140, 40, () =>
      model.onImportSave()
    ).setPosition(90, -PANEL_H / 2 + 96, 0);

    makeCtaButton(panelRoot, "BackCta", "返回星图", 200, 48, () => model.onBack()).setPosition(
      0,
      -PANEL_H / 2 + 48,
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
