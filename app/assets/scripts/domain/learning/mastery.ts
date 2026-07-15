import type { AnswerOutcome } from "../../core/app-events";
import type { Clock } from "../../core/clock";
import type { LearningRecord } from "../save/save-v5";

const STABILITY = [0.014, 0.083, 1, 3, 7];

export function learningKey(childId: string, contentId: string): string {
  return `${childId}::${contentId}`;
}

export function defaultLearning(): LearningRecord {
  return {
    stabilityDays: STABILITY[0]!,
    difficulty: 5,
    dueAt: 0,
    firstCorrect: 0,
    corrected: 0,
    skipped: 0,
    deviceFailures: 0,
    incorrect: 0
  };
}

export function applyLearningOutcome(
  record: LearningRecord,
  outcome: AnswerOutcome,
  clock: Clock
): LearningRecord {
  const next = { ...record };
  const now = clock.now();
  if (outcome === "first_correct") {
    next.firstCorrect += 1;
    const idx = Math.min(STABILITY.length - 1, Math.max(0, STABILITY.indexOf(next.stabilityDays) + 1));
    const bumped = STABILITY.indexOf(next.stabilityDays);
    next.stabilityDays = STABILITY[bumped < 0 ? 0 : Math.min(STABILITY.length - 1, bumped + 1)]!;
    next.dueAt = now + next.stabilityDays * 24 * 60 * 60 * 1000;
  } else if (outcome === "corrected") {
    next.corrected += 1;
    next.dueAt = now + STABILITY[1]! * 24 * 60 * 60 * 1000;
  } else if (outcome === "incorrect") {
    next.incorrect += 1;
    next.stabilityDays = STABILITY[0]!;
    next.dueAt = now + 20 * 60 * 1000;
  } else if (outcome === "skipped") {
    next.skipped += 1;
  } else if (outcome === "device_failure") {
    next.deviceFailures += 1;
  }
  return next;
}

export function dueContentIds(
  learning: Record<string, LearningRecord>,
  childId: string,
  now: number
): string[] {
  const prefix = `${childId}::`;
  return Object.entries(learning)
    .filter(([k, v]) => k.startsWith(prefix) && v.dueAt > 0 && v.dueAt <= now)
    .map(([k]) => k.slice(prefix.length));
}
