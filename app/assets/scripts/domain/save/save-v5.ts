import type { DailyMissionState } from "../progression/daily-missions";

export interface ChildProfile {
  id: string;
  name: string;
  textbookId: string;
  grade: string;
  createdAt: number;
}

export interface LearningRecord {
  stabilityDays: number;
  difficulty: number;
  dueAt: number;
  firstCorrect: number;
  corrected: number;
  skipped: number;
  deviceFailures: number;
  incorrect: number;
}

export interface ChildProgression {
  totalXp: number;
  alloy: number;
  starCrystals: number;
  weaponId: string;
  ownedWeapons: string[];
  /** per-weapon level 1–10 */
  weaponLevels: Record<string, number>;
  shipSkinId: string;
  ownedShipSkins: string[];
  petIds: string[];
  deployedPets: string[];
  petBond: Record<string, number>;
  unitStars: Record<string, number>;
}

export interface SaveV5 {
  version: 5;
  activeChildId: string | null;
  children: Record<string, ChildProfile>;
  /** keyed by `${childId}::${contentId}` */
  learning: Record<string, LearningRecord>;
  /** per-child progression keyed by childId */
  progressionByChild: Record<string, ChildProgression>;
  /** per-child daily missions keyed by childId (optional for older saves) */
  dailyByChild?: Record<string, DailyMissionState>;
  settings: {
    soundEnabled: boolean;
    bgmEnabled: boolean;
    ttsEnabled: boolean;
    hapticsEnabled: boolean;
    reduceMotion: boolean;
  };
  createdAt: number;
  updatedAt: number;
}

export function createChildProgression(): ChildProgression {
  return {
    totalXp: 0,
    alloy: 0,
    starCrystals: 0,
    weaponId: "pulse",
    ownedWeapons: ["pulse"],
    weaponLevels: { pulse: 1 },
    shipSkinId: "classic",
    ownedShipSkins: ["classic"],
    petIds: [],
    deployedPets: [],
    petBond: {},
    unitStars: {}
  };
}
