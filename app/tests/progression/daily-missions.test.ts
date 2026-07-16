import { describe, expect, it } from "vitest";
import {
  DailyMissionTracker,
  appendNavigationLog,
  ensureDailyMissionState,
} from "../../assets/scripts/domain/progression/daily-missions";
import { localDayKey } from "../../assets/scripts/domain/progression/day-key";

describe("daily missions", () => {
  it("tracks one battle, due cleanup, and one weak-type completion", () => {
    const tracker = new DailyMissionTracker("2026-07-15");
    tracker.apply({ type: "battle_finished" });
    tracker.apply({ type: "due_reviews_cleared" });
    const state = tracker.apply({
      type: "weak_question_type_completed",
      questionType: "spelling",
    });
    expect(Object.values(state.missions).every((mission) => mission.completed)).toBe(true);
  });

  it("keeps seven earned entries without resetting on missed days", () => {
    const old = ["2026-07-01", "2026-07-03", "2026-07-10"];
    expect(appendNavigationLog(old, "2026-07-15")).toEqual([...old, "2026-07-15"]);
    expect(appendNavigationLog([...old, "11", "12", "13", "14"], "2026-07-15")).toHaveLength(7);
  });

  it("rolls to a fresh day while preserving navigation log", () => {
    const tracker = ensureDailyMissionState(
      {
        dayKey: "2026-07-14",
        missions: {
          complete_any_battle: { progress: 1, completed: true, claimed: true },
          clear_due_reviews: { progress: 0, completed: false, claimed: false },
          complete_weak_type: { progress: 0, completed: false, claimed: false },
        },
        navigationLog: ["2026-07-14"],
      },
      Date.parse("2026-07-15T12:00:00")
    );
    expect(tracker.snapshot().dayKey).toBe(localDayKey(Date.parse("2026-07-15T12:00:00")));
    expect(tracker.snapshot().missions.complete_any_battle.completed).toBe(false);
    expect(tracker.snapshot().navigationLog).toEqual(["2026-07-14"]);
  });

  it("claims alloy once when all missions complete", () => {
    const tracker = new DailyMissionTracker("2026-07-15");
    tracker.apply({ type: "battle_finished" });
    tracker.apply({ type: "due_reviews_cleared" });
    tracker.apply({ type: "weak_question_type_completed", questionType: "listening" });
    const first = tracker.claimIfReady(15);
    expect(first.alloy).toBe(15);
    expect(first.state.navigationLog).toContain("2026-07-15");
    expect(tracker.claimIfReady(15).alloy).toBe(0);
  });
});
