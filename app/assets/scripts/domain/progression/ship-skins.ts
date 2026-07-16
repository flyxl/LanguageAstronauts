export type ShipSkinId = "classic" | "nebula" | "aurora";

export type ShipSkinDef = {
  id: ShipSkinId;
  name: string;
  priceCrystal: number;
  blurb: string;
};

export const SHIP_SKINS: Record<ShipSkinId, ShipSkinDef> = {
  classic: {
    id: "classic",
    name: "经典白舰",
    priceCrystal: 0,
    blurb: "默认涂装",
  },
  nebula: {
    id: "nebula",
    name: "星云涂装",
    priceCrystal: 10,
    blurb: "紫雾尾迹",
  },
  aurora: {
    id: "aurora",
    name: "极光涂装",
    priceCrystal: 18,
    blurb: "绿光护盾",
  },
};

export function isShipSkinId(id: string): id is ShipSkinId {
  return id in SHIP_SKINS;
}
