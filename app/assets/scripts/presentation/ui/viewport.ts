/**
 * Design canvas is 1280×720 landscape.
 *
 * Policy: FIXED_HEIGHT — keep height at 720 and expand width on ultra-wide
 * phones (~20:9) so the game fills the screen (no SHOW_ALL letterboxing).
 * FIXED_WIDTH is avoided: it compresses height below 720 and breaks layouts.
 *
 * Also keep Boot.scene Canvas UITransform at least 1280×720. A 960×640 canvas
 * with 1280-based layout clips left-edge UI (brand 「时空语航员」).
 */
export const DESIGN = { width: 1280, height: 720 } as const;

/** Visible height under FIXED_WIDTH for a given screen aspect (width/height). */
export function fixedWidthVisibleHeight(screenAspect: number, designWidth = DESIGN.width): number {
  // screenAspect = screenW / screenH; visibleH = designW / screenAspect
  if (!(screenAspect > 0)) return DESIGN.height;
  return designWidth / screenAspect;
}

/** Visible width under FIXED_HEIGHT for a given screen aspect (width/height). */
export function fixedHeightVisibleWidth(screenAspect: number, designHeight = DESIGN.height): number {
  if (!(screenAspect > 0)) return DESIGN.width;
  return designHeight * screenAspect;
}

/**
 * FIXED_WIDTH on ~20:9 phones compresses height below design and breaks layouts
 * authored for 720. Prefer FIXED_HEIGHT so height stays 720 and width fills.
 */
export function isShortLandscapeViewport(visibleHeight: number, designHeight = DESIGN.height): boolean {
  return visibleHeight < designHeight * 0.92;
}
