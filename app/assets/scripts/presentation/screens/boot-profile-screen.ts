import {
  Color,
  EditBox,
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
import { createContentRoot, measureScreen } from "../ui/layout";

const TEXTBOOK = "沪教牛津 2024";
const GRADE = "3A";
const FIELD_W = 300;
const NAME_MAX = 16;

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
  private nameEdit: EditBox | null = null;

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

    const layout = measureScreen(this.width, this.height);
    const content = createContentRoot(screen, layout);
    const cw = layout.contentW;

    const brandX = -cw * 0.24;
    const brandBoxW = Math.min(480, Math.round(cw * 0.38));
    const panelW = 400;
    const panelH = 440;
    const panelX = cw * 0.24;

    const brand = new Node("Brand");
    content.addChild(brand);

    const title = makeLabel(brand, "BrandTitle", {
      string: "时空语航员",
      fontSize: UiTheme.font.brand,
      width: brandBoxW,
      height: 72,
    });
    title.horizontalAlign = Label.HorizontalAlign.CENTER;
    title.node.setPosition(brandX, 48, 0);

    const subtitle = makeLabel(brand, "BrandSubtitle", {
      string: "教材同步星际训练，答对即发射。",
      fontSize: UiTheme.font.body,
      color: UiTheme.colors.textSecondary,
      width: brandBoxW,
      height: 56,
    });
    subtitle.horizontalAlign = Label.HorizontalAlign.CENTER;
    subtitle.node.setPosition(brandX, -16, 0);

    const panelRoot = new Node("ProfilePanel");
    content.addChild(panelRoot);
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
    panelTitle.node.setPosition(-panelW / 2 + 24, panelH / 2 - 48, 0);

    const fields = new Node("Fields");
    panelRoot.addChild(fields);
    fields.setPosition(0, 8, 0);

    fieldCaption(fields, "NameCaption", "航员代号（可输入，最多 16 字）", 128);

    const editHost = new Node("NameEditHost");
    fields.addChild(editHost);
    editHost.setPosition(0, 84, 0);
    const hostG = editHost.addComponent(Graphics);
    hostG.fillColor = colorOf(UiTheme.colors.bgDeep);
    hostG.roundRect(-FIELD_W / 2, -22, FIELD_W, 44, 10);
    hostG.fill();
    hostG.strokeColor = colorOf(UiTheme.colors.accentCta);
    hostG.lineWidth = 2;
    hostG.roundRect(-FIELD_W / 2, -22, FIELD_W, 44, 10);
    hostG.stroke();
    editHost.addComponent(UITransform).setContentSize(FIELD_W, 44);

    const textLabelNode = new Node("TextLabel");
    editHost.addChild(textLabelNode);
    const textUt = textLabelNode.addComponent(UITransform);
    textUt.setContentSize(FIELD_W - 24, 36);
    textUt.setAnchorPoint(0, 0.5);
    textLabelNode.setPosition(-FIELD_W / 2 + 12, 0, 0);
    const textLabel = textLabelNode.addComponent(Label);
    textLabel.string = "";
    textLabel.fontSize = UiTheme.font.body;
    textLabel.color = colorOf(UiTheme.colors.textPrimary);
    textLabel.horizontalAlign = Label.HorizontalAlign.LEFT;
    textLabel.verticalAlign = Label.VerticalAlign.CENTER;
    textLabel.overflow = Label.Overflow.SHRINK;

    const placeholderNode = new Node("Placeholder");
    editHost.addChild(placeholderNode);
    const phUt = placeholderNode.addComponent(UITransform);
    phUt.setContentSize(FIELD_W - 24, 36);
    phUt.setAnchorPoint(0, 0.5);
    placeholderNode.setPosition(-FIELD_W / 2 + 12, 0, 0);
    const placeholderLabel = placeholderNode.addComponent(Label);
    placeholderLabel.string = "输入代号";
    placeholderLabel.fontSize = UiTheme.font.body;
    placeholderLabel.color = colorOf(UiTheme.colors.textSecondary);
    placeholderLabel.horizontalAlign = Label.HorizontalAlign.LEFT;
    placeholderLabel.verticalAlign = Label.VerticalAlign.CENTER;

    const editNode = new Node("NameEdit");
    editHost.addChild(editNode);
    const editUt = editNode.addComponent(UITransform);
    editUt.setContentSize(FIELD_W - 24, 36);
    editUt.setAnchorPoint(0, 0.5);
    editNode.setPosition(-FIELD_W / 2 + 12, 0, 0);
    const edit = editNode.addComponent(EditBox);
    edit.string = "小航员";
    edit.placeholder = "输入代号";
    edit.maxLength = NAME_MAX;
    edit.inputMode = EditBox.InputMode.SINGLE_LINE;
    edit.inputFlag = EditBox.InputFlag.DEFAULT;
    edit.returnType = EditBox.KeyboardReturnType.DONE;
    edit.fontSize = UiTheme.font.body;
    edit.textLabel = textLabel;
    edit.placeholderLabel = placeholderLabel;
    edit.fontColor = new Color(
      UiTheme.colors.textPrimary.r,
      UiTheme.colors.textPrimary.g,
      UiTheme.colors.textPrimary.b,
      255
    );
    edit.placeholderFontColor = new Color(
      UiTheme.colors.textSecondary.r,
      UiTheme.colors.textSecondary.g,
      UiTheme.colors.textSecondary.b,
      255
    );
    this.nameEdit = edit;

    fieldCaption(fields, "TextbookCaption", "教材", 32);
    makeChip(
      fields,
      "TextbookChip",
      TEXTBOOK,
      FIELD_W,
      40,
      UiTheme.colors.bgDeep,
      UiTheme.colors.strokePanel
    ).setPosition(0, -4, 0);

    fieldCaption(fields, "GradeCaption", "年级", -58);
    makeChip(
      fields,
      "GradeChip",
      GRADE,
      FIELD_W,
      40,
      UiTheme.colors.bgDeep,
      UiTheme.colors.strokePanel
    ).setPosition(0, -94, 0);

    const ctaH = 56;
    makeCtaButton(panelRoot, "CreateBtn", "创建并出航", FIELD_W, ctaH, () => {
      const raw = (this.nameEdit?.string ?? "").trim() || "小航员";
      const name = raw.slice(0, NAME_MAX);
      assertPlayerSafeCopy(name);
      opts.onCreate(name);
    }).setPosition(0, -panelH / 2 + 28 + ctaH / 2, 0);
  }

  getScreenRoot(): Node | null {
    return this.screenRoot;
  }

  destroy(): void {
    if (this.screenRoot) {
      this.screenRoot.destroy();
      this.screenRoot = null;
    }
    this.nameEdit = null;
  }
}
