import type { SaveRepository } from "../../core/save-repository";
import type { SaveV5 } from "../../domain/save/save-v5";

export class MemorySaveRepository implements SaveRepository {
  private main: string | null = null;
  private backup: string | null = null;

  async load(): Promise<SaveV5 | null> {
    for (const raw of [this.main, this.backup]) {
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw) as SaveV5;
        if (parsed.version === 5) return structuredClone(parsed);
      } catch {
        continue;
      }
    }
    return null;
  }

  async commit(save: SaveV5): Promise<void> {
    if (save.version !== 5) throw new Error("Unsupported save version");
    this.backup = this.main;
    this.main = JSON.stringify(save);
  }

  corruptMainForTest(): void {
    this.main = "{corrupt";
  }
}
