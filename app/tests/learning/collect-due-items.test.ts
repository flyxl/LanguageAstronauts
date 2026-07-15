import { describe, expect, it } from "vitest";
import type { ContentItem } from "../../assets/scripts/domain/content/content-types";
import { collectDueContentItems } from "../../assets/scripts/domain/learning/collect-due-items";
import { learningKey } from "../../assets/scripts/domain/learning/mastery";
import { createDefaultSave } from "../../assets/scripts/domain/save/create-default-save";
import { MathRandomSource } from "../../assets/scripts/infrastructure/system/math-random-source";

const item = (id: string): ContentItem => ({
  contentId: id,
  kind: "vocab",
  en: id,
  zh: id,
  questionTypes: ["choice"],
});

describe("collectDueContentItems", () => {
  it("returns empty when nothing is due", () => {
    const save = createDefaultSave(1000);
    save.activeChildId = "c1";
    const units = [{ items: [item("a"), item("b")] }];
    const out = collectDueContentItems(save.learning, "c1", 2000, units, new MathRandomSource());
    expect(out).toEqual([]);
  });

  it("resolves catalog items by contentId for due learning keys", () => {
    const save = createDefaultSave(1000);
    const key = learningKey("c1", "ox-3a-u1-happy");
    save.learning[key] = {
      stabilityDays: 1,
      difficulty: 5,
      dueAt: 500,
      firstCorrect: 1,
      corrected: 0,
      skipped: 0,
      deviceFailures: 0,
      incorrect: 0,
    };
    const units = [{ items: [item("ox-3a-u1-happy"), item("ox-3a-u1-sad")] }];
    const out = collectDueContentItems(save.learning, "c1", 1000, units, new MathRandomSource());
    expect(out.map((x) => x.contentId)).toEqual(["ox-3a-u1-happy"]);
  });

  it("caps selection at 8 when many items are due", () => {
    const save = createDefaultSave(1000);
    const ids = Array.from({ length: 12 }, (_, i) => `due-${i}`);
    for (const id of ids) {
      save.learning[learningKey("c1", id)] = {
        stabilityDays: 1,
        difficulty: 5,
        dueAt: 500,
        firstCorrect: 1,
        corrected: 0,
        skipped: 0,
        deviceFailures: 0,
        incorrect: 0,
      };
    }
    const units = [{ items: ids.map(item) }];
    const out = collectDueContentItems(save.learning, "c1", 1000, units, new MathRandomSource());
    expect(out.length).toBeLessThanOrEqual(8);
    expect(out.length).toBeGreaterThanOrEqual(4);
  });

  it("uses all due items when fewer than 8 are available", () => {
    const save = createDefaultSave(1000);
    for (const id of ["a", "b", "c"]) {
      save.learning[learningKey("c1", id)] = {
        stabilityDays: 1,
        difficulty: 5,
        dueAt: 500,
        firstCorrect: 1,
        corrected: 0,
        skipped: 0,
        deviceFailures: 0,
        incorrect: 0,
      };
    }
    const units = [{ items: [item("a"), item("b"), item("c")] }];
    const out = collectDueContentItems(save.learning, "c1", 1000, units, new MathRandomSource());
    expect(out).toHaveLength(3);
  });

  it("ignores due keys missing from catalog", () => {
    const save = createDefaultSave(1000);
    save.learning[learningKey("c1", "missing")] = {
      stabilityDays: 1,
      difficulty: 5,
      dueAt: 500,
      firstCorrect: 1,
      corrected: 0,
      skipped: 0,
      deviceFailures: 0,
      incorrect: 0,
    };
    const units = [{ items: [item("present")] }];
    save.learning[learningKey("c1", "present")] = {
      stabilityDays: 1,
      difficulty: 5,
      dueAt: 500,
      firstCorrect: 1,
      corrected: 0,
      skipped: 0,
      deviceFailures: 0,
      incorrect: 0,
    };
    const out = collectDueContentItems(save.learning, "c1", 1000, units, new MathRandomSource());
    expect(out.map((x) => x.contentId)).toEqual(["present"]);
  });
});
