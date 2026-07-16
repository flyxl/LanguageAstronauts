import type { Clock } from "../../core/clock";
import type { RandomSource } from "../../core/random-source";
import type { SaveRepository } from "../../core/save-repository";
import { createDefaultSave, ensureChildProgression } from "../save/create-default-save";
import type { ChildProfile, SaveV5 } from "../save/save-v5";

export interface CreateChildInput {
  name: string;
  textbookId: string;
  grade: string;
}

export class ProfileService {
  private save: SaveV5 | null = null;

  constructor(
    private readonly repository: SaveRepository,
    private readonly clock: Clock,
    private readonly random: RandomSource
  ) {}

  async start(): Promise<void> {
    this.save = (await this.repository.load()) ?? createDefaultSave(this.clock.now());
    if (!this.save.dailyByChild) this.save.dailyByChild = {};
    if (!(await this.repository.load())) {
      await this.repository.commit(this.save);
    }
  }

  async reload(): Promise<void> {
    const loaded = await this.repository.load();
    if (!loaded) throw new Error("Save missing after reload");
    if (!loaded.dailyByChild) loaded.dailyByChild = {};
    this.save = loaded;
  }

  currentSave(): SaveV5 {
    if (!this.save) throw new Error("ProfileService has not started");
    return this.save;
  }

  async createChild(input: CreateChildInput): Promise<ChildProfile> {
    const save = this.currentSave();
    const name = input.name.trim();
    if (!name) throw new Error("Child name is required");
    if (!input.textbookId) throw new Error("Textbook is required");
    if (!/^[1-6][AB]$/.test(input.grade)) throw new Error("Grade must match 1A through 6B");
    const now = this.clock.now();
    const id = `child_${now.toString(36)}_${Math.floor(this.random.next() * 1_000_000).toString(36)}`;
    const child: ChildProfile = {
      id,
      name,
      textbookId: input.textbookId,
      grade: input.grade,
      createdAt: now
    };
    save.children[id] = child;
    save.activeChildId = id;
    ensureChildProgression(save, id);
    save.updatedAt = now;
    await this.repository.commit(save);
    return child;
  }

  async selectChild(childId: string): Promise<void> {
    const save = this.currentSave();
    if (!save.children[childId]) throw new Error(`Unknown child: ${childId}`);
    save.activeChildId = childId;
    ensureChildProgression(save, childId);
    save.updatedAt = this.clock.now();
    await this.repository.commit(save);
  }

  listChildren(): ChildProfile[] {
    return Object.values(this.currentSave().children).sort((a, b) => a.createdAt - b.createdAt);
  }
}
