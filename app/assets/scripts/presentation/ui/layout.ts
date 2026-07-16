import { Node, UITransform } from "cc";
import { DESIGN } from "./viewport";

/** Max width for interactive UI; wider screens get full-bleed bg + centered content. */
export const CONTENT_MAX_WIDTH = DESIGN.width;

export type ScreenLayout = {
  screenW: number;
  screenH: number;
  contentW: number;
  contentH: number;
  halfW: number;
  halfH: number;
  isUltraWide: boolean;
};

export function measureScreen(screenW: number, screenH: number): ScreenLayout {
  const contentW = Math.min(screenW, CONTENT_MAX_WIDTH);
  return {
    screenW,
    screenH,
    contentW,
    contentH: screenH,
    halfW: contentW / 2,
    halfH: screenH / 2,
    isUltraWide: screenW > CONTENT_MAX_WIDTH + 8,
  };
}

export function createContentRoot(parent: Node, layout: ScreenLayout): Node {
  const root = new Node("ContentRoot");
  parent.addChild(root);
  root.addComponent(UITransform).setContentSize(layout.contentW, layout.contentH);
  return root;
}

export function contentRight(layout: ScreenLayout, inset = 24): number {
  return layout.halfW - inset;
}

export function contentLeft(layout: ScreenLayout, inset = 24): number {
  return -layout.halfW + inset;
}

export function gridColsForContent(contentW: number, cardW: number, gap: number, maxCols = 4): number {
  for (let cols = maxCols; cols >= 2; cols--) {
    const need = cols * cardW + (cols - 1) * gap;
    if (need <= contentW - 48) return cols;
  }
  return 2;
}
