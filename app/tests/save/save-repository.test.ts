import { describe, expect, it } from "vitest";
import { createDefaultSave } from "../../assets/scripts/domain/save/create-default-save";
import { MemorySaveRepository } from "../../assets/scripts/infrastructure/memory/memory-save-repository";

describe("SaveRepository", () => {
  it("returns a clone of the committed v5 save", async () => {
    const repo = new MemorySaveRepository();
    const save = createDefaultSave(100);
    save.settings.soundEnabled = false;
    await repo.commit(save);
    save.settings.soundEnabled = true;
    expect((await repo.load())?.settings.soundEnabled).toBe(false);
  });

  it("recovers the previous valid snapshot when the main snapshot is corrupt", async () => {
    const repo = new MemorySaveRepository();
    const first = createDefaultSave(100);
    const second = createDefaultSave(200);
    await repo.commit(first);
    await repo.commit(second);
    repo.corruptMainForTest();
    expect((await repo.load())?.updatedAt).toBe(100);
  });
});
