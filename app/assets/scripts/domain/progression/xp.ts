import type { AnswerOutcome } from "../../core/app-events";

export function xpToReachLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(60 * Math.pow(level - 1, 1.55));
}

export function calculateLevel(totalXp: number): number {
  let level = 1;
  while (level < 50 && xpToReachLevel(level + 1) <= totalXp) level += 1;
  return level;
}

export function xpForOutcome(outcome: AnswerOutcome, kind: "vocab" | "dialogue", dueReview: boolean): number {
  let base = kind === "dialogue" ? 12 : 10;
  if (dueReview) base = Math.round(base * 1.4);
  const mul =
    outcome === "first_correct" ? 1 : outcome === "corrected" ? 0.65 : outcome === "incorrect" ? 0 : 0.2;
  return Math.round(base * mul);
}

export function commandQuality(outcome: AnswerOutcome, speakQuality = 1): number {
  if (outcome === "first_correct") return speakQuality;
  if (outcome === "corrected") return 0.6;
  if (outcome === "incorrect") return 0;
  return 0.2;
}
