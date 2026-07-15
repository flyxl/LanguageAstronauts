export type PetId = "star_fox" | "nebula_cat" | "crystal_dragon";

export interface PetDef {
  id: PetId;
  name: string;
  color: string;
  priceCrystal: number;
  describe: (bond: number) => string;
}

export const PETS: Record<PetId, PetDef> = {
  star_fox: {
    id: "star_fox",
    name: "星尘狐",
    color: "#f97316",
    priceCrystal: 8,
    describe: (b) => `侦察护盾 · 羁绊 ${b}`
  },
  nebula_cat: {
    id: "nebula_cat",
    name: "星云猫",
    color: "#a78bfa",
    priceCrystal: 12,
    describe: (b) => `动量守护 · 羁绊 ${b}`
  },
  crystal_dragon: {
    id: "crystal_dragon",
    name: "水晶龙",
    color: "#67e8f9",
    priceCrystal: 15,
    describe: (b) => `阶段吐息 · 羁绊 ${b}`
  }
};

export function petDamageBonus(petIds: string[], bonds: Record<string, number>): number {
  let total = 0;
  for (const id of petIds) {
    const bond = Math.max(1, bonds[id] ?? 1);
    if (id === "star_fox") total += Math.floor(bond / 2) + 1;
    if (id === "nebula_cat") total += Math.round(bond * 0.6) + 1;
    if (id === "crystal_dragon") total += bond;
  }
  return total;
}
