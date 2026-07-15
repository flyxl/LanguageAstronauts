// app/assets/scripts/presentation/ui/ui-factory.ts
import {
  Color,
  EventTouch,
  Graphics,
  Label,
  Node,
  UITransform,
} from "cc";
import { assertPlayerSafeCopy, UiTheme, type Rgba } from "./theme";
import { attachStarfield } from "./starfield-bg";

export { attachStarfield };

export function colorOf(rgba: Rgba): Color {
  return new Color(rgba.r, rgba.g, rgba.b, rgba.a);
}

export type MakeLabelOpts = {
  string: string;
  fontSize?: number;
  color?: Rgba;
  width?: number;
  height?: number;
};

export function makeLabel(parent: Node, name: string, opts: MakeLabelOpts): Label {
  assertPlayerSafeCopy(opts.string);
  const node = new Node(name);
  parent.addChild(node);
  const label = node.addComponent(Label);
  label.string = opts.string;
  label.fontSize = opts.fontSize ?? UiTheme.font.body;
  label.color = colorOf(opts.color ?? UiTheme.colors.textPrimary);
  const w = opts.width ?? 320;
  const h = opts.height ?? 40;
  node.addComponent(UITransform).setContentSize(w, h);
  return label;
}

export function makePanel(parent: Node, name: string, w: number, h: number): Node {
  const panel = new Node(name);
  parent.addChild(panel);
  const g = panel.addComponent(Graphics);
  const fill = UiTheme.colors.bgPanel;
  const stroke = UiTheme.colors.strokePanel;
  const radius = 12;
  g.fillColor = colorOf(fill);
  g.roundRect(-w / 2, -h / 2, w, h, radius);
  g.fill();
  g.strokeColor = colorOf(stroke);
  g.lineWidth = 2;
  g.roundRect(-w / 2, -h / 2, w, h, radius);
  g.stroke();
  panel.addComponent(UITransform).setContentSize(w, h);
  return panel;
}

export function makeCtaButton(
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
  const radius = 14;
  g.fillColor = colorOf(UiTheme.colors.accentCta);
  g.roundRect(-w / 2, -h / 2, w, h, radius);
  g.fill();
  btn.addComponent(UITransform).setContentSize(w, h);

  const labelNode = new Node("Label");
  btn.addChild(labelNode);
  const lbl = labelNode.addComponent(Label);
  lbl.string = label;
  lbl.fontSize = UiTheme.font.cardTitle;
  lbl.color = colorOf(UiTheme.colors.bgDeep);
  lbl.horizontalAlign = Label.HorizontalAlign.CENTER;
  lbl.verticalAlign = Label.VerticalAlign.CENTER;
  labelNode.addComponent(UITransform).setContentSize(w - 16, h - 8);

  btn.on(Node.EventType.TOUCH_END, onTap);
  return btn;
}
