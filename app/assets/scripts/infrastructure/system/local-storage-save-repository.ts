import type { SaveRepository } from "../../core/save-repository";
import type { SaveV5 } from "../../domain/save/save-v5";

const MAIN_KEY = "language_astronauts_save_v5";
const BACKUP_KEY = "language_astronauts_save_v5_backup";
const TEMP_KEY = "language_astronauts_save_v5_temp";

function parse(raw: string | null): SaveV5 | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as SaveV5;
    if (value.version !== 5) return null;
    if (!value.dailyByChild) value.dailyByChild = {};
    return value;
  } catch {
    return null;
  }
}

/** Storage adapter for browser / Vitest / Cocos Native（优先 sys.localStorage）。 */
function defaultStorage(): Storage {
  const sysLike = (globalThis as { sys?: { localStorage?: Storage } }).sys;
  if (sysLike?.localStorage) return sysLike.localStorage;
  if (typeof globalThis !== "undefined" && "localStorage" in globalThis) {
    return (globalThis as { localStorage: Storage }).localStorage;
  }
  throw new Error("No localStorage available");
}

export class LocalStorageSaveRepository implements SaveRepository {
  constructor(private readonly storage: Storage = defaultStorage()) {}

  async load(): Promise<SaveV5 | null> {
    return parse(this.storage.getItem(MAIN_KEY)) ?? parse(this.storage.getItem(BACKUP_KEY));
  }

  async commit(save: SaveV5): Promise<void> {
    if (save.version !== 5) throw new Error("Unsupported save version");
    const next = JSON.stringify(save);
    this.storage.setItem(TEMP_KEY, next);
    if (!parse(this.storage.getItem(TEMP_KEY))) throw new Error("Temporary save validation failed");
    const current = this.storage.getItem(MAIN_KEY);
    if (current) this.storage.setItem(BACKUP_KEY, current);
    this.storage.setItem(MAIN_KEY, next);
    this.storage.removeItem(TEMP_KEY);
  }
}
