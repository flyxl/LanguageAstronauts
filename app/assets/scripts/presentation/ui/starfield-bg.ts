// app/assets/scripts/presentation/ui/starfield-bg.ts
import { Color, Graphics, Node, UITransform } from "cc";
import { UiTheme } from "./theme";
import { starPoints } from "./starfield";
import { CONTENT_MAX_WIDTH } from "./layout";

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

  // Subtle center glow
  const glow = UiTheme.colors.accentInfo;
  g.fillColor = new Color(glow.r, glow.g, glow.b, 18);
  g.circle(0, height * 0.08, Math.min(width, height) * 0.42);
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

  // Edge vignette on ultra-wide — guides eye to centered content
  if (width > CONTENT_MAX_WIDTH + 16) {
    const side = (width - CONTENT_MAX_WIDTH) / 2 + 8;
    g.fillColor = new Color(0, 0, 0, 100);
    g.rect(-width / 2, -height / 2, side, height);
    g.rect(width / 2 - side, -height / 2, side, height);
    g.fill();
  }

  bg.addComponent(UITransform).setContentSize(width, height);
}
