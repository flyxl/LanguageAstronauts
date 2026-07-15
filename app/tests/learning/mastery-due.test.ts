import { describe, expect, it } from "vitest";
import {
  dueContentIds,
  learningKey,
  listDueContentIds,
  resolveDueContentItems,
} from "../../assets/scripts/domain/learning/mastery";
import { createDefaultSave } from "../../assets/scripts/domain/save/create-default-save";
import type { ContentItem } from "../../assets/scripts/domain/content/content-types";

const SAMPLE: ContentItem = {
  contentId: "ox-3a-u1-happy",
  kind: "vocab",
  en: "happy",
  zh: "开心的",
  ttsFallback: true,
  questionTypes: ["choice"],
};

describe("due review helpers", () => {
  it("returns empty when nothing is due", () => {
    const save = createDefaultSave(1000);
    expect(listDueContentIds(save, "c1", 5000)).toEqual([]);
  });

  it("lists contentIds whose dueAt has passed", () => {
    const save = createDefaultSave(1000);
    save.learning[learningKey("c1", "a")] = {
      stabilityDays: 1,
      difficulty: 5,
      dueAt: 2000,
      firstCorrect: 1,
      corrected: 0,
      skipped: 0,
      deviceFailures: 0,
      incorrect: 0,
    };
    save.learning[learningKey("c1", "b")] = {
      stabilityDays: 1,
      difficulty: 5,
      dueAt: 9000,
      firstCorrect: 1,
      corrected: 0,
      skipped: 0,
      deviceFailures: 0,
      incorrect: 0,
    };
    expect(dueContentIds(save.learning, "c1", 3000)).toEqual(["a"]);
    expect(listDueContentIds(save, "c1", 3000)).toEqual(["a"]);
  });

  it("ignores other children and unset dueAt", () => {
    const save = createDefaultSave(1000);
    save.learning[learningKey("c2", "x")] = {
      stabilityDays: 1,
      difficulty: 5,
      dueAt: 500,
      firstCorrect: 1,
      corrected: 0,
      skipped: 0,
      deviceFailures: 0,
      incorrect: 0,
    };
    save.learning[learningKey("c1", "y")] = {
      stabilityDays: 0.014,
      difficulty: 5,
      dueAt: 0,
      firstCorrect: 0,
      corrected: 0,
      skipped: 0,
      deviceFailures: 0,
      incorrect: 0,
    };
    expect(listDueContentIds(save, "c1", 9999)).toEqual([]);
  });

  it("maps due contentIds to catalog items in order", () => {
    const items = resolveDueContentItems(
      [{ items: [SAMPLE] }, { items: [{ ...SAMPLE, contentId: "missing" }] }],
      ["ox-3a-u1-happy", "not-in-catalog"]
    );
    expect(items).toHaveLength(1);
    expect(items[0]!.contentId).toBe("ox-3a-u1-happy");
  });
});
