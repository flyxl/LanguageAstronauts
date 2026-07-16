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

const NAME_OPTIONS = ["小航员", "宇航员", "启航者"] as const;
const TEXTBOOK = "沪教牛津 2024";
const GRADE = "3A";
const FIELD_W = 300;

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

function fieldCaption(parent: Node, name: string, text: string, y: number): void {
  const caption = makeLabel(parent, name, {
    string: text,
    fontSize: UiTheme.font.chip,
    color: UiTheme.colors.textSecondary,
    width: FIELD_W,
    height: 24,
  });
  caption.horizontalAlign = Label.HorizontalAlign.LEFT;
  caption.node.getComponent(UITransform)!.setAnchorPoint(0, 0.5);
  caption.node.setPosition(-FIELD_W / 2, y, 0);
}

export class BootProfileScreen {
  private readonly root: Node;
  private readonly width: number;
  private readonly height: number;
  private screenRoot: Node | null = null;
  private nameIndex = 0;
  private nameChipLabel: Label | null = null;

  constructor(root: Node, size: { width: number; height: number } | Size) {
    this.root = root;
    this.width = size.width;
    this.height = size.height;
  }

  render(opts: { onCreate: (name: string) => void }): void {
    this.destroy();

    const screen = new Node("BootProfileScreen");
    this.root.addChild(screen);
    this.screenRoot = screen;

    attachStarfield(screen, this.width, this.height, 42);

    const brand = new Node("Brand");
    screen.addChild(brand);
    // Keep brand fully on-screen on ultra-wide phones (fitWidth → short height, full width).
    const brandLeft = -this.width / 2 + 48;
    brand.setPosition(0, 10, 0);

    const title = makeLabel(brand, "BrandTitle", {
      string: "时空语航员",
      fontSize: UiTheme.font.brand,
      width: Math.min(520, this.width * 0.42),
      height: 72,
    });
    title.horizontalAlign = Label.HorizontalAlign.LEFT;
    title.node.getComponent(UITransform)!.setAnchorPoint(0, 0.5);
    title.node.setPosition(brandLeft, 40, 0);

    const subtitle = makeLabel(brand, "BrandSubtitle", {
      string: "教材同步星际训练，答对即发射。",
      fontSize: UiTheme.font.body,
      color: UiTheme.colors.textSecondary,
      width: Math.min(480, this.width * 0.4),
      height: 56,
    });
    subtitle.horizontalAlign = Label.HorizontalAlign.LEFT;
    subtitle.node.getComponent(UITransform)!.setAnchorPoint(0, 0.5);
    subtitle.node.setPosition(brandLeft, -24, 0);

    const panelW = 420;
    const panelH = 460;
    const panelRoot = new Node("ProfilePanel");
    screen.addChild(panelRoot);
    // Sit in the right half but keep ≥48px from the right edge.
    const panelX = Math.min(this.width * 0.22, this.width / 2 - panelW / 2 - 48);
    panelRoot.setPosition(panelX, 0, 0);
    makePanel(panelRoot, "PanelBg", panelW, panelH);

    const panelTitle = makeLabel(panelRoot, "PanelTitle", {
      string: "建档出航",
      fontSize: UiTheme.font.screenTitle,
      width: panelW - 48,
      height: 40,
    });
    panelTitle.horizontalAlign = Label.HorizontalAlign.LEFT;
    panelTitle.node.getComponent(UITransform)!.setAnchorPoint(0, 0.5);
    // Keep title fully inside the panel frame.
    panelTitle.node.setPosition(-panelW / 2 + 24, panelH / 2 - 40, 0);

    const fields = new Node("Fields");
    panelRoot.addChild(fields);
    fields.setPosition(0, 16, 0);

    // Interactive name: gold stroke. Read-only fields: info stroke + same width.
    fieldCaption(fields, "NameCaption", "航员代号（点按切换）", 110);
    const nameChip = makeChip(
      fields,
      "NameChip",
      NAME_OPTIONS[this.nameIndex],
      FIELD_W,
      44,
      UiTheme.colors.bgDeep,
      UiTheme.colors.accentCta,
      () => this.cycleName()
    );
    nameChip.setPosition(0, 72, 0);
    this.nameChipLabel = nameChip.getChildByName("Label")!.getComponent(Label)!;

    fieldCaption(fields, "TextbookCaption", "教材", 20);
    makeChip(
      fields,
      "TextbookChip",
      TEXTBOOK,
      FIELD_W,
      40,
      UiTheme.colors.bgDeep,
      UiTheme.colors.strokePanel
    ).setPosition(0, -16, 0);

    fieldCaption(fields, "GradeCaption", "年级", -70);
    makeChip(
      fields,
      "GradeChip",
      GRADE,
      FIELD_W,
      40,
      UiTheme.colors.bgDeep,
      UiTheme.colors.strokePanel
    ).setPosition(0, -106, 0);

    const ctaH = 56;
    const ctaBottomMargin = 28;
    makeCtaButton(
      panelRoot,
      "CreateBtn",
      "创建并出航",
      FIELD_W,
      ctaH,
      () => opts.onCreate(NAME_OPTIONS[this.nameIndex])
    ).setPosition(0, -panelH / 2 + ctaBottomMargin + ctaH / 2, 0);
  }

  getScreenRoot(): Node | null {
    return this.screenRoot;
  }

  destroy(): void {
    if (this.screenRoot) {
      this.screenRoot.destroy();
      this.screenRoot = null;
    }
    this.nameChipLabel = null;
  }

  private cycleName(): void {
    this.nameIndex = (this.nameIndex + 1) % NAME_OPTIONS.length;
    if (this.nameChipLabel) {
      this.nameChipLabel.string = NAME_OPTIONS[this.nameIndex];
    }
  }
}
