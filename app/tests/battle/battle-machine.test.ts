import { describe, expect, it } from "vitest";
import type { AppEvents } from "../../assets/scripts/core/app-events";
import { EventBus } from "../../assets/scripts/core/event-bus";
import { BattleMachine } from "../../assets/scripts/domain/battle/battle-machine";
import { KnowledgeArmor } from "../../assets/scripts/domain/battle/knowledge-armor";
import { FakeClock } from "../../assets/scripts/infrastructure/memory/fake-clock";

describe("BattleMachine", () => {
  it("simulates one command without Cocos", () => {
    const clock = new FakeClock();
    const machine = new BattleMachine("b1", clock, new EventBus<AppEvents>());
    machine.presentQuestion("q1", "3A-U1:vocab:happy");
    machine.answer("first_correct");
    expect(machine.state).toBe("Presentation");
    clock.advanceBy(2_000);
    expect(machine.state).toBe("PhaseCheck");
    machine.presentQuestion("q2", "3A-U1:vocab:sad");
    expect(machine.state).toBe("QuestionFocus");
  });

  it("rejects an illegal transition", () => {
    const machine = new BattleMachine("b1", new FakeClock(), new EventBus<AppEvents>());
    expect(() => machine.answer("incorrect")).toThrow("Cannot answer from Entering");
  });
});

describe("KnowledgeArmor", () => {
  it("breaks at most one node even with huge damage", () => {
    const armor = new KnowledgeArmor(3);
    const r = armor.applyAnswer("first_correct", 1000);
    expect(r.nodeBroken).toBe(true);
    expect(armor.snapshot().nodesRemaining).toBe(2);
  });

  it("does not break nodes on incorrect", () => {
    const armor = new KnowledgeArmor(3);
    armor.applyAnswer("incorrect", 1000);
    expect(armor.snapshot().nodesRemaining).toBe(3);
  });
});
