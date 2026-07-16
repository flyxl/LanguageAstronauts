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
  return save.progressionByChild[childId];
}

export function ensureDailyByChild(save: SaveV5): Record<string, import("../progression/daily-missions").DailyMissionState> {
  if (!save.dailyByChild) {
    save.dailyByChild = {};
  }
  return save.dailyByChild;
}
