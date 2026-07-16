import type { SaveV5 } from "./save-v5";

export const SAVE_EXPORT_STORAGE_KEY = "language_astronauts_save_v5_export";
export const SAVE_EXPORT_FILE_NAME = "language_astronauts_save_export.json";

export function serializeSave(save: SaveV5): string {
  if (save.version !== 5) throw new Error("Unsupported save version");
  return JSON.stringify(save);
}

export function parseSavePayload(raw: string): SaveV5 {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Invalid save JSON");
  }
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Invalid save payload");
  }
  const save = parsed as SaveV5;
  if (save.version !== 5) {
    throw new Error(`Unsupported save version: ${String((parsed as { version?: unknown }).version)}`);
  }
  if (!save.dailyByChild) {
    save.dailyByChild = {};
  }
  return save;
}
