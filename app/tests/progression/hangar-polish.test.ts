import { describe, expect, it } from "vitest";
import { bondTierLabel, formatPetBond } from "../../assets/scripts/domain/progression/pet-bond";
import { weaponUpgradeCost } from "../../assets/scripts/domain/weapons/weapons";
import { SHIP_SKINS } from "../../assets/scripts/domain/progression/ship-skins";

describe("hangar polish helpers", () => {
  it("labels pet bond tiers", () => {
    expect(bondTierLabel(1)).toBe("幼伴");
    expect(bondTierLabel(5)).toBe("默契");
    expect(bondTierLabel(12)).toBe("同心");
    expect(bondTierLabel(20)).toBe("共鸣");
    expect(formatPetBond(7)).toBe("羁绊 7 · 默契");
  });

  it("uses alloy upgrade curve", () => {
    expect(weaponUpgradeCost(1)).toBe(80);
    expect(weaponUpgradeCost(3)).toBe(160);
  });

  it("exposes three ship skins", () => {
    expect(Object.keys(SHIP_SKINS)).toEqual(["classic", "nebula", "aurora"]);
    expect(SHIP_SKINS.classic.priceCrystal).toBe(0);
  });
});
