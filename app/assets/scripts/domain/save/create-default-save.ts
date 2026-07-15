import { createChildProgression, type SaveV5 } from "./save-v5";

export function createDefaultSave(now: number): SaveV5 {
  return {
    version: 5,
    activeChildId: null,
    children: {},
    learning: {},
    progressionByChild: {},
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
