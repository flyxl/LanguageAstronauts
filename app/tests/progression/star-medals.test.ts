import { describe, expect, it } from "vitest";
import { isMissionUnlocked, isUnitUnlocked } from "../../assets/scripts/domain/progression/star-medals";

describe("star medals unlock", () => {
  it("unlocks next mission from completion, not full stars", () => {
    expect(isMissionUnlocked(true)).toBe(true);
    expect(isMissionUnlocked(false)).toBe(false);
  });

  it("opens only U1 for a fresh profile", () => {
    const ids = ["3A-U1", "3A-U2", "3A-U3"];
    const stars: Record<string, number> = {};
    expect(isUnitUnlocked(0, ids, stars)).toBe(true);
    expect(isUnitUnlocked(1, ids, stars)).toBe(false);
    expect(isUnitUnlocked(2, ids, stars)).toBe(false);
  });

  it("unlocks U2 after U1 earns a star", () => {
    const ids = ["3A-U1", "3A-U2", "3A-U3"];
    const stars = { "3A-U1": 1 };
    expect(isUnitUnlocked(1, ids, stars)).toBe(true);
    expect(isUnitUnlocked(2, ids, stars)).toBe(false);
  });
});
