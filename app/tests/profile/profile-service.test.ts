import { describe, expect, it } from "vitest";
import { ProfileService } from "../../assets/scripts/domain/profile/profile-service";
import { FakeClock } from "../../assets/scripts/infrastructure/memory/fake-clock";
import { MemorySaveRepository } from "../../assets/scripts/infrastructure/memory/memory-save-repository";
import { SequenceRandomSource } from "../../assets/scripts/infrastructure/memory/sequence-random-source";

describe("ProfileService", () => {
  it("creates and restores an active child", async () => {
    const repository = new MemorySaveRepository();
    const clock = new FakeClock(1_000);
    const first = new ProfileService(repository, clock, new SequenceRandomSource([0.25]));
    await first.start();
    const child = await first.createChild({
      name: " 小星 ",
      textbookId: "hujiao-oxford-2024",
      grade: "3A"
    });

    const restarted = new ProfileService(repository, clock, new SequenceRandomSource([]));
    await restarted.start();
    expect(restarted.currentSave().activeChildId).toBe(child.id);
    expect(restarted.currentSave().children[child.id]).toMatchObject({
      name: "小星",
      textbookId: "hujiao-oxford-2024",
      grade: "3A"
    });
  });
});
