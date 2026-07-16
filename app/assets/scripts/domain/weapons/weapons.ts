export type WeaponId = "pulse" | "plasma" | "flame" | "frost" | "thunder";

export interface WeaponDef {
  id: WeaponId;
  name: string;
  color: string;
  baseDamage: number;
  damageMul: number;
  label: string;
}

export const WEAPONS: Record<WeaponId, WeaponDef> = {
  pulse: { id: "pulse", name: "脉冲光炮", color: "#38bdf8", baseDamage: 10, damageMul: 1.0, label: "稳定" },
  plasma: { id: "plasma", name: "等离子双管炮", color: "#a78bfa", baseDamage: 10, damageMul: 1.12, label: "连击" },
  flame: { id: "flame", name: "烈焰喷射器", color: "#f97316", baseDamage: 10, damageMul: 1.18, label: "灼烧" },
  frost: { id: "frost", name: "冰霜水晶炮", color: "#67e8f9", baseDamage: 10, damageMul: 1.22, label: "控场" },
  thunder: { id: "thunder", name: "雷神电弧炮", color: "#fbbf24", baseDamage: 10, damageMul: 1.3, label: "爆发" }
};

export function weaponUpgradeCost(currentLevel: number): number {
  return 80 + 40 * (currentLevel - 1);
}

export function calcWeaponDamage(
  weaponId: WeaponId,
  quality: number,
  momentum: number,
  level = 1,
  tacticalMultiplier = 1
): number {
  const w = WEAPONS[weaponId] ?? WEAPONS.pulse;
  const levelMul = 1 + Math.min(9, Math.max(0, level - 1)) * 0.035;
  const momentumMul = 1 + Math.min(5, Math.max(0, momentum)) * 0.08;
  return Math.round(
    w.baseDamage * w.damageMul * levelMul * quality * momentumMul * tacticalMultiplier
  );
}
