// app/assets/scripts/presentation/ui/starfield-bg.ts
import { Color, Graphics, Node, UITransform } from "cc";
import { UiTheme } from "./theme";
import { starPoints } from "./starfield";

const DESIGN_AREA = UiTheme.design.width * UiTheme.design.height;
const DESIGN_STAR_COUNT = 40;

function starCountForSize(width: number, height: number): number {
  return Math.max(12, Math.round((width * height) / (DESIGN_AREA / DESIGN_STAR_COUNT)));
}

/** Full-screen deep bg + low-density star dots (cc wrapper; star layout is pure in starfield.ts). */
export function attachStarfield(
  parent: Node,
  width: number,
  height: number,
  seed: number
): void {
  const bg = new Node("Starfield");
  parent.addChild(bg);
  bg.setSiblingIndex(0);

  const g = bg.addComponent(Graphics);
  const deep = UiTheme.colors.bgDeep;
  g.fillColor = new Color(deep.r, deep.g, deep.b, deep.a);
  g.rect(-width / 2, -height / 2, width, height);
  g.fill();

  const info = UiTheme.colors.accentInfo;
  const primary = UiTheme.colors.textPrimary;
  const points = starPoints(width, height, starCountForSize(width, height), seed);
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const tint = i % 3 === 0 ? info : primary;
    const alpha = 140 + (i % 4) * 25;
    g.fillColor = new Color(tint.r, tint.g, tint.b, alpha);
    g.circle(p.x, p.y, p.r);
    g.fill();
  }

  bg.addComponent(UITransform).setContentSize(width, height);
}
