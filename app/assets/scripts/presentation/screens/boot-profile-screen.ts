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
    width: 320,
    height: 24,
  });
  caption.horizontalAlign = Label.HorizontalAlign.LEFT;
  caption.node.setPosition(-150, y, 0);
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
    brand.setPosition(-320, 20, 0);

    const title = makeLabel(brand, "BrandTitle", {
      string: "时空语航员",
      fontSize: UiTheme.font.brand,
      width: 520,
      height: 72,
    });
    title.horizontalAlign = Label.HorizontalAlign.LEFT;
    title.node.setPosition(0, 40, 0);

    const subtitle = makeLabel(brand, "BrandSubtitle", {
      string: "教材同步星际训练，答对即发射。",
      fontSize: UiTheme.font.body,
      color: UiTheme.colors.textSecondary,
      width: 480,
      height: 56,
    });
    subtitle.horizontalAlign = Label.HorizontalAlign.LEFT;
    subtitle.node.setPosition(0, -24, 0);

    const panelW = 420;
    const panelH = 380;
    const panelRoot = new Node("ProfilePanel");
    screen.addChild(panelRoot);
    panelRoot.setPosition(280, 0, 0);
    makePanel(panelRoot, "PanelBg", panelW, panelH);

    const panelTitle = makeLabel(panelRoot, "PanelTitle", {
      string: "建档出航",
      fontSize: UiTheme.font.screenTitle,
      width: panelW - 48,
      height: 40,
    });
    panelTitle.horizontalAlign = Label.HorizontalAlign.LEFT;
    panelTitle.node.setPosition(-panelW / 2 + 32, panelH / 2 - 48, 0);

    const fields = new Node("Fields");
    panelRoot.addChild(fields);

    fieldCaption(fields, "NameCaption", "航员代号", 60);
    const nameChip = makeChip(
      fields,
      "NameChip",
      NAME_OPTIONS[this.nameIndex],
      300,
      44,
      UiTheme.colors.bgDeep,
      UiTheme.colors.accentCta,
      () => this.cycleName()
    );
    nameChip.setPosition(0, 24, 0);
    this.nameChipLabel = nameChip.getChildByName("Label")!.getComponent(Label)!;

    fieldCaption(fields, "TextbookCaption", "教材", -36);
    makeChip(
      fields,
      "TextbookChip",
      TEXTBOOK,
      300,
      40,
      UiTheme.colors.bgDeep,
      UiTheme.colors.accentInfo
    ).setPosition(0, -72, 0);

    fieldCaption(fields, "GradeCaption", "年级", -132);
    makeChip(
      fields,
      "GradeChip",
      GRADE,
      120,
      40,
      UiTheme.colors.bgDeep,
      UiTheme.colors.accentInfo
    ).setPosition(-90, -168, 0);

    makeCtaButton(
      panelRoot,
      "CreateBtn",
      "创建并出航",
      panelW - 48,
      56,
      () => opts.onCreate(NAME_OPTIONS[this.nameIndex])
    ).setPosition(0, -panelH / 2 + 48, 0);
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
