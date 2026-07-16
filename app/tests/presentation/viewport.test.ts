import { describe, expect, it } from "vitest";
import {
  DESIGN,
  fixedHeightVisibleWidth,
  fixedWidthVisibleHeight,
  isShortLandscapeViewport,
} from "../../assets/scripts/presentation/ui/viewport";

describe("viewport policy", () => {
  it("keeps 720 height on 16:9 under FIXED_WIDTH", () => {
    expect(fixedWidthVisibleHeight(16 / 9)).toBeCloseTo(720, 5);
    expect(isShortLandscapeViewport(720)).toBe(false);
  });

  it("compresses height on ~20:9 under FIXED_WIDTH (root cause on PHK110)", () => {
    const h = fixedWidthVisibleHeight(2772 / 1240);
    expect(h).toBeLessThan(580);
    expect(isShortLandscapeViewport(h)).toBe(true);
  });

  it("keeps 1280 width on 16:9 under FIXED_HEIGHT", () => {
    expect(fixedHeightVisibleWidth(16 / 9)).toBeCloseTo(1280, 5);
  });

  it("expands width on ~20:9 under FIXED_HEIGHT (fills screen, no letterbox)", () => {
    const w = fixedHeightVisibleWidth(2772 / 1240);
    expect(w).toBeGreaterThan(1500);
    expect(w).toBeCloseTo(720 * (2772 / 1240), 5);
  });

  it("documents design canvas", () => {
    expect(DESIGN).toEqual({ width: 1280, height: 720 });
  });

  it("documents why 960 canvas + 1280 layout clips brand", () => {
    // brandLeft = -1280/2 + 24 = -616; half of 960 canvas = 480 → 136px off-screen
    const brandLeft = -DESIGN.width / 2 + 24;
    const staleCanvasHalf = 960 / 2;
    expect(brandLeft).toBeLessThan(-staleCanvasHalf);
    expect(-staleCanvasHalf - brandLeft).toBeCloseTo(136, 5);
  });
});
