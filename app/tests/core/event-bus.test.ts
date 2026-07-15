import { describe, expect, it, vi } from "vitest";
import type { AppEvents } from "../../assets/scripts/core/app-events";
import { EventBus } from "../../assets/scripts/core/event-bus";

describe("EventBus", () => {
  it("delivers a typed payload and supports unsubscribe", () => {
    const bus = new EventBus<AppEvents>();
    const handler = vi.fn();
    const off = bus.on("QuestionPresented", handler);

    bus.emit("QuestionPresented", {
      battleId: "b1",
      questionId: "q1",
      contentId: "3A-U1:vocab:happy"
    });
    off();
    bus.emit("QuestionPresented", {
      battleId: "b1",
      questionId: "q2",
      contentId: "3A-U1:vocab:sad"
    });

    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith({
      battleId: "b1",
      questionId: "q1",
      contentId: "3A-U1:vocab:happy"
    });
  });
});
