import { createChildProgression, type SaveV5 } from "./save-v5";

export function createDefaultSave(now: number): SaveV5 {
  return {
    version: 5,
    activeChildId: null,
    children: {},
    learning: {},
    progressionByChild: {},
    dailyByChild: {},
    settings: {
      soundEnabled: true,
      bgmEnabled: true,
      ttsEnabled: true,
      hapticsEnabled: true,
      reduceMotion: false
    },
    createdAt: now,
    updatedAt: now
  };
}

export function ensureChildProgression(save: SaveV5, childId: string) {
  if (!save.progressionByChild[childId]) {
    save.progressionByChild[childId] = createChildProgression();
  }
  const prog = save.progressionByChild[childId];
  if (!prog.weaponLevels) {
    prog.weaponLevels = {};
    for (const id of prog.ownedWeapons ?? ["pulse"]) {
      prog.weaponLevels[id] = 1;
    }
  }
  if (!prog.ownedShipSkins || prog.ownedShipSkins.length === 0) {
    prog.ownedShipSkins = [prog.shipSkinId || "classic"];
  }
  if (!prog.shipSkinId) prog.shipSkinId = "classic";
  return prog;
}

export function ensureDailyByChild(save: SaveV5): Record<string, import("../progression/daily-missions").DailyMissionState> {
  if (!save.dailyByChild) {
    save.dailyByChild = {};
  }
  return save.dailyByChild;
}
