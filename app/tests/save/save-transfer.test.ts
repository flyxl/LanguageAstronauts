import { describe, expect, it } from "vitest";
import { createDefaultSave } from "../../assets/scripts/domain/save/create-default-save";
import { parseSavePayload, serializeSave } from "../../assets/scripts/domain/save/save-transfer";

describe("save-transfer", () => {
  it("roundtrips a v5 save", () => {
    const save = createDefaultSave(1000);
    save.settings.soundEnabled = false;
    const raw = serializeSave(save);
    const parsed = parseSavePayload(raw);
    expect(parsed.version).toBe(5);
    expect(parsed.settings.soundEnabled).toBe(false);
    expect(parsed.createdAt).toBe(1000);
  });

  it("rejects v4 saves", () => {
    const v4 = JSON.stringify({ version: 4, children: {} });
    expect(() => parseSavePayload(v4)).toThrow(/Unsupported save version/);
  });

  it("rejects garbage JSON", () => {
    expect(() => parseSavePayload("not-json")).toThrow(/Invalid save JSON/);
    expect(() => parseSavePayload("null")).toThrow(/Invalid save payload/);
  });
});
