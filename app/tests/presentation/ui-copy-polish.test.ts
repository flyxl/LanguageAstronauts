import { describe, expect, it } from "vitest";
import { armorPhaseLabel } from "../../assets/scripts/presentation/ui/armor-phase-label";
import { unitCardTitle } from "../../assets/scripts/presentation/ui/unit-card-title";

describe("ui copy polish", () => {
  it("maps armor phases to Chinese", () => {
    expect(armorPhaseLabel("shield")).toBe("护盾");
    expect(armorPhaseLabel("armor")).toBe("装甲");
    expect(armorPhaseLabel("core")).toBe("核心");
  });

  it("strips Unit prefix and truncates card titles", () => {
    expect(unitCardTitle("Unit 1 How do we feel?")).toBe("How do we feel?");
    expect(unitCardTitle("Unit 2 What's interesting about families?", 18)).toBe(
      "What's interestin…"
    );
    expect(unitCardTitle("Special Topic")).toBe("Special Topic");
  });
});
