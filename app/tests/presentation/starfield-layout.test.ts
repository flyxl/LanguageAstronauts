// app/tests/presentation/starfield-layout.test.ts
import { describe, expect, it } from "vitest";
import { starPoints } from "../../assets/scripts/presentation/ui/starfield";

describe("starPoints", () => {
  it("is deterministic for a seed", () => {
    expect(starPoints(1280, 720, 40, 7)).toEqual(starPoints(1280, 720, 40, 7));
    expect(starPoints(1280, 720, 40, 7).length).toBe(40);
  });
});
