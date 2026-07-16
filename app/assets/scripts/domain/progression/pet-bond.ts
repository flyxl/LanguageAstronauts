export function bondTierLabel(bond: number): string {
  const b = Math.max(1, bond);
  if (b >= 20) return "共鸣";
  if (b >= 12) return "同心";
  if (b >= 5) return "默契";
  return "幼伴";
}

export function formatPetBond(bond: number): string {
  const b = Math.max(1, Math.min(20, Math.floor(bond)));
  return `羁绊 ${b} · ${bondTierLabel(b)}`;
}
