import type { SaveV5 } from "../domain/save/save-v5";

export interface SaveRepository {
  load(): Promise<SaveV5 | null>;
  commit(save: SaveV5): Promise<void>;
}
