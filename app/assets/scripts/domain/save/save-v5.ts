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
  shipSkinId: string;
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
    shipSkinId: "classic",
    petIds: [],
    deployedPets: [],
    petBond: {},
    unitStars: {}
  };
}
