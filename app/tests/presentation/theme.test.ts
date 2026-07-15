// app/tests/presentation/theme.test.ts
import { describe, expect, it } from "vitest";
import { UiTheme, assertPlayerSafeCopy } from "../../assets/scripts/presentation/ui/theme";

describe("UiTheme", () => {
  it("exposes approved palette", () => {
    expect(UiTheme.colors.bgDeep).toEqual({ r: 11, g: 18, b: 32, a: 255 });
    expect(UiTheme.colors.accentCta).toEqual({ r: 240, g: 180, b: 41, a: 255 });
    expect(UiTheme.colors.accentInfo).toEqual({ r: 76, g: 201, b: 240, a: 255 });
  });

  it("rejects engineering leaks in player copy", () => {
    expect(() => assertPlayerSafeCopy("运行时: Cocos Native")).toThrow(/forbidden/);
    expect(() => assertPlayerSafeCopy("领域层 BattleSession")).toThrow(/forbidden/);
    expect(() => assertPlayerSafeCopy("知识装甲待命，答对即发射。")).not.toThrow();
  });
});
