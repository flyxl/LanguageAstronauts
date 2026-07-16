import { describe, expect, it } from "vitest";
import catalog from "../../assets/content/catalog.json";

describe("bundled catalog", () => {
  it("ships the full 3A slice for native fallback", () => {
    expect(catalog.units.length).toBeGreaterThanOrEqual(8);
    expect(catalog.units[0]?.items?.length ?? 0).toBeGreaterThanOrEqual(10);
  });
});
