import { describe, expect, it } from "vitest";
import { FOUNDATION_VERSION } from "../assets/scripts/core/foundation-version";

describe("foundation", () => {
  it("exposes the P1 contract version", () => {
    expect(FOUNDATION_VERSION).toBe("p1");
  });
});
