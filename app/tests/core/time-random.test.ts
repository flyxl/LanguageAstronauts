import { describe, expect, it, vi } from "vitest";
import { FakeClock } from "../../assets/scripts/infrastructure/memory/fake-clock";
import { SequenceRandomSource } from "../../assets/scripts/infrastructure/memory/sequence-random-source";

describe("foundation sources", () => {
  it("advances fake time and fires due callbacks in order", () => {
    const clock = new FakeClock(1_000);
    const calls = vi.fn();
    clock.setTimeout(() => calls("late"), 20);
    clock.setTimeout(() => calls("early"), 10);
    clock.advanceBy(20);
    expect(calls.mock.calls.flat()).toEqual(["early", "late"]);
    expect(clock.now()).toBe(1_020);
  });

  it("returns a fixed random sequence", () => {
    const random = new SequenceRandomSource([0.75, 0.25]);
    expect([random.next(), random.next()]).toEqual([0.75, 0.25]);
    expect(() => random.next()).toThrow("Random sequence exhausted");
  });
});
