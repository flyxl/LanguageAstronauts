import { describe, expect, it } from "vitest";
import type { AppEvents } from "../../assets/scripts/core/app-events";
import { EventBus } from "../../assets/scripts/core/event-bus";
import { BattleSession } from "../../assets/scripts/domain/battle/battle-session";
import catalog from "../../assets/content/catalog.json";
import { createDefaultSave, ensureChildProgression } from "../../assets/scripts/domain/save/create-default-save";
import { FakeClock } from "../../assets/scripts/infrastructure/memory/fake-clock";
import { MathRandomSource } from "../../assets/scripts/infrastructure/system/math-random-source";
import type { ContentCatalog } from "../../assets/scripts/domain/content/content-types";

describe("BattleSession", () => {
  it("clears knowledge armor without skipping nodes on huge weapon power", () => {
    const clock = new FakeClock(1);
    const save = createDefaultSave(1);
    save.activeChildId = "c1";
    save.children.c1 = {
      id: "c1",
      name: "测",
      textbookId: "hujiao-oxford-2024",
      grade: "3A",
      createdAt: 1
    };
    const prog = ensureChildProgression(save, "c1");
    prog.weaponId = "thunder";
    const unit = (catalog as ContentCatalog).units[0]!;
    const random = new MathRandomSource();
    const session = new BattleSession(unit.id, unit.items, save, "c1", clock, random, new EventBus<AppEvents>());
    let answers = 0;
    while (!session.finished && answers < 80) {
      const q = session.nextQuestion();
      if (!q) break;
      session.answer(q.correct, { quality: 1 });
      answers += 1;
    }
    expect(session.finished).toBe(true);
    expect(session.win).toBe(true);
    expect(answers).toBeGreaterThanOrEqual(12); // 4 forms * 3 nodes minimum
  });
});
