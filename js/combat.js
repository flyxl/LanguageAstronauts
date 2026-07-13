/**
 * 战斗数值：武器杀伤力、宠物协同与 BOSS 血量预估（与 game.js 伤害公式对齐）
 */

const WEAPON_COMBAT = {
  pulse: { tier: 0, damageMul: 1.0, label: "标准" },
  plasma: { tier: 1, damageMul: 1.15, comboDmgBonus: 0.25, label: "强化" },
  flame: { tier: 2, damageMul: 1.22, burnFlat: 5, label: "灼热" },
  frost: { tier: 3, damageMul: 1.28, crystalMul: 1.3, label: "极寒" },
  thunder: { tier: 4, damageMul: 1.4, critDmgMul: 2.25, label: "毁灭" },
};

const PET_SPECIES = {
  star_fox: {
    name: "星尘狐",
    petDamage: (lv) => lv,
    healOnCorrect: (lv) => lv * 2,
    describe: (lv) => `答对护盾 +${lv * 2}，协同攻击 +${lv}`,
  },
  nebula_cat: {
    name: "星云猫",
    petDamage: (lv) => Math.round(lv * 1.5),
    critThreshold: (lv) => Math.max(2, 4 - lv),
    describe: (lv) => `连击 ${Math.max(2, 4 - lv)} 起暴击，协同攻击 +${Math.round(lv * 1.5)}`,
  },
  crystal_dragon: {
    name: "水晶龙",
    petDamage: (lv) => lv * 2,
    healEveryN: 3,
    healEveryAmount: (lv) => lv * 5,
    describe: (lv) => `每 3 连击恢复 ${lv * 5} 护盾，协同攻击 +${lv * 2}`,
  },
};

const Combat = {
  MAX_BATTLE_PETS: 2,

  normalizeWeaponId(id) {
    if (!id || id === "classic" || !WEAPON_COMBAT[id]) return "pulse";
    return id;
  },

  getWeaponStats(weaponId) {
    return WEAPON_COMBAT[this.normalizeWeaponId(weaponId)] || WEAPON_COMBAT.pulse;
  },

  weaponDamageLabel(weaponId) {
    const s = this.getWeaponStats(weaponId);
    return `杀伤力 ×${s.damageMul.toFixed(2)}（${s.label}）`;
  },

  /** 当前出战宠物 ID 列表（最多 2 只） */
  getDeployedPetIds() {
    const child = Storage.getActiveChild();
    const pets = Storage.get()?.pets || [];
    if (!child || !pets.length) return [];
    if (!Array.isArray(child.deployedPets)) {
      child.deployedPets = pets.slice(0, this.MAX_BATTLE_PETS).map((p) => p.species);
      Storage.save();
    }
    const valid = child.deployedPets.filter((id) => pets.some((p) => p.species === id));
    if (valid.length !== child.deployedPets.length) {
      child.deployedPets = valid;
      Storage.save();
    }
    return valid.slice(0, this.MAX_BATTLE_PETS);
  },

  /** 当前出战宠物实例 */
  getDeployedPets() {
    const ids = new Set(this.getDeployedPetIds());
    return (Storage.get()?.pets || []).filter((p) => ids.has(p.species));
  },

  setDeployedPets(speciesIds) {
    const child = Storage.getActiveChild();
    if (!child) return false;
    const pets = Storage.get()?.pets || [];
    child.deployedPets = (speciesIds || [])
      .filter((id) => pets.some((p) => p.species === id))
      .slice(0, this.MAX_BATTLE_PETS);
    Storage.save();
    return true;
  },

  /** 开战前确保至少有一只出战宠物（若有宠物但未选） */
  ensureDeployedPets() {
    const pets = Storage.get()?.pets || [];
    if (!pets.length) return;
    if (this.getDeployedPets().length) return;
    this.setDeployedPets([pets[0].species]);
  },

  getPetBonuses(pets) {
    const out = {
      petDamage: 0,
      critThreshold: 3,
      healOnCorrect: 0,
      healEveryN: 0,
      healEveryAmount: 0,
    };
    if (!pets?.length) return out;

    for (const pp of pets) {
      const lv = Math.max(1, pp.level || 1);
      const spec = PET_SPECIES[pp.species];
      if (!spec) continue;
      if (spec.petDamage) out.petDamage += spec.petDamage(lv);
      if (spec.healOnCorrect) out.healOnCorrect += spec.healOnCorrect(lv);
      if (spec.critThreshold) {
        out.critThreshold = Math.min(out.critThreshold, spec.critThreshold(lv));
      }
      if (spec.healEveryN) {
        out.healEveryN = spec.healEveryN;
        out.healEveryAmount += spec.healEveryAmount(lv);
      }
    }
    return out;
  },

  describePet(pp) {
    const spec = PET_SPECIES[pp.species];
    if (!spec) return "";
    return spec.describe(pp.level || 1);
  },

  getCritThreshold(weaponId, pets) {
    const petB = this.getPetBonuses(pets);
    let t = petB.critThreshold;
    if (this.normalizeWeaponId(weaponId) === "thunder") t = Math.min(t, 2);
    return t;
  },

  calcDamage(q, opts) {
    const {
      weaponId = "pulse",
      combo = 1,
      quality = 1,
      crit = false,
      petDamage = 0,
    } = opts;
    const ws = this.getWeaponStats(weaponId);
    const base = q.type === "dialogue" ? 8 : 6;
    const styleBonus = q.style === "spell" ? 1.3 : 1;
    const speakFactor = q.style === "speak" ? 0.5 + 0.5 * quality : 1;
    const critMul = crit ? (ws.critDmgMul || 1.5) : 1;

    let dmg = base * styleBonus * speakFactor * ws.damageMul * critMul;
    if (weaponId === "plasma" && combo >= 2 && ws.comboDmgBonus) {
      dmg *= 1 + ws.comboDmgBonus;
    }
    if (ws.burnFlat) dmg += ws.burnFlat;
    dmg += petDamage;
    return Math.round(dmg);
  },

  /** 预估单题伤害（用于 BOSS 血量，含武器+宠物，略留暴击余量） */
  estimateHit(q, ctx) {
    const weaponId = this.normalizeWeaponId(ctx?.weaponId);
    const ws = this.getWeaponStats(weaponId);
    const petB = this.getPetBonuses(ctx?.pets);
    const base = q.type === "dialogue" ? 8 : 6;
    const styleBonus = q.style === "spell" ? 1.3 : 1;
    const speakFactor = q.style === "speak" ? 0.9 : 1;
    let dmg = base * styleBonus * speakFactor * ws.damageMul;
    if (weaponId === "plasma") dmg *= 1.1;
    if (ws.burnFlat) dmg += ws.burnFlat;
    dmg += petB.petDamage;
    return Math.round(dmg);
  },

  crystalGainMultiplier(weaponId) {
    const ws = this.getWeaponStats(weaponId);
    return ws.crystalMul || 1;
  },
};

if (typeof window !== "undefined") {
  window.Combat = Combat;
  window.WEAPON_COMBAT = WEAPON_COMBAT;
  window.PET_SPECIES = PET_SPECIES;
}
