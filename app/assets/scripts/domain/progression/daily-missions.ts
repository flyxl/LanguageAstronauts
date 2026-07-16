import type { QuestionType } from "../content/content-types";
import { localDayKey } from "./day-key";

export type DailyMissionId =
  | "complete_any_battle"
  | "clear_due_reviews"
  | "complete_weak_type";

export type DailyProgressSignal =
  | { type: "battle_finished" }
  | { type: "due_reviews_cleared" }
  | { type: "weak_question_type_completed"; questionType: QuestionType };

export type DailyMissionProgress = {
  progress: number;
  completed: boolean;
  claimed: boolean;
};

export interface DailyMissionState {
  dayKey: string;
  missions: Record<DailyMissionId, DailyMissionProgress>;
  navigationLog: string[];
}

const empty = (): DailyMissionProgress => ({
  progress: 0,
  completed: false,
  claimed: false,
});

export function createEmptyDailyState(dayKey: string): DailyMissionState {
  return {
    dayKey,
    missions: {
      complete_any_battle: empty(),
      clear_due_reviews: empty(),
      complete_weak_type: empty(),
    },
    navigationLog: [],
  };
}

export function appendNavigationLog(log: readonly string[], dayKey: string): string[] {
  if (log.includes(dayKey)) return [...log].slice(-7);
  return [...log, dayKey].slice(-7);
}

export class DailyMissionTracker {
  private state: DailyMissionState;

  constructor(dayKey: string, initial?: DailyMissionState) {
    this.state =
      initial && initial.dayKey === dayKey
        ? structuredClone(initial)
        : createEmptyDailyState(dayKey);
    if (initial && initial.dayKey !== dayKey) {
      this.state.navigationLog = [...(initial.navigationLog ?? [])];
    }
  }

  snapshot(): DailyMissionState {
    return structuredClone(this.state);
  }

  apply(signal: DailyProgressSignal): DailyMissionState {
    const id: DailyMissionId =
      signal.type === "battle_finished"
        ? "complete_any_battle"
        : signal.type === "due_reviews_cleared"
          ? "clear_due_reviews"
          : "complete_weak_type";
    this.state.missions[id] = {
      ...this.state.missions[id],
      progress: 1,
      completed: true,
    };
    return this.snapshot();
  }

  completedCount(): number {
    return Object.values(this.state.missions).filter((m) => m.completed).length;
  }

  allCompleted(): boolean {
    return this.completedCount() === 3;
  }

  /** Grant once when all three done; returns alloy reward (0 if already claimed). */
  claimIfReady(alloyReward = 15): { state: DailyMissionState; alloy: number } {
    if (!this.allCompleted() || this.state.missions.complete_any_battle.claimed) {
      return { state: this.snapshot(), alloy: 0 };
    }
    for (const id of Object.keys(this.state.missions) as DailyMissionId[]) {
      this.state.missions[id] = { ...this.state.missions[id], claimed: true };
    }
    this.state.navigationLog = appendNavigationLog(this.state.navigationLog, this.state.dayKey);
    return { state: this.snapshot(), alloy: alloyReward };
  }
}

export function ensureDailyMissionState(
  stored: DailyMissionState | undefined,
  nowMs: number
): DailyMissionTracker {
  const dayKey = localDayKey(nowMs);
  return new DailyMissionTracker(dayKey, stored);
}

export const DAILY_MISSION_LABELS: Record<DailyMissionId, string> = {
  complete_any_battle: "完成一局出击",
  clear_due_reviews: "清空到期复习",
  complete_weak_type: "攻克弱项题型",
};
