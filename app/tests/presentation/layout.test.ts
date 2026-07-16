import { describe, expect, it } from "vitest";
import {
  CONTENT_MAX_WIDTH,
  contentLeft,
  contentRight,
  gridColsForContent,
  measureScreen,
} from "../../assets/scripts/presentation/ui/layout";

describe("layout", () => {
  it("caps content width at design width", () => {
    const l = measureScreen(1612, 720);
    expect(l.contentW).toBe(CONTENT_MAX_WIDTH);
    expect(l.isUltraWide).toBe(true);
  });

  it("uses full width on 16:9", () => {
    const l = measureScreen(1280, 720);
    expect(l.contentW).toBe(1280);
    expect(l.isUltraWide).toBe(false);
  });

  it("content edges respect inset", () => {
    const l = measureScreen(1280, 720);
    expect(contentRight(l, 24)).toBe(640 - 24);
    expect(contentLeft(l, 24)).toBe(-640 + 24);
  });

  it("picks grid cols from content width", () => {
    expect(gridColsForContent(1280, 360, 48, 4)).toBeGreaterThanOrEqual(2);
    expect(gridColsForContent(900, 360, 48, 4)).toBe(2);
  });
});
