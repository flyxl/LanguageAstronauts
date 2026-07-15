// app/assets/scripts/presentation/ui/theme.ts
export type Rgba = { r: number; g: number; b: number; a: number };

const FORBIDDEN = [
  "运行时",
  "引擎",
  "Cocos",
  "WebView",
  "领域层",
  "BattleSession",
  "下一包",
] as const;

export const UiTheme = {
  colors: {
    bgDeep: { r: 11, g: 18, b: 32, a: 255 } satisfies Rgba,
    bgPanel: { r: 20, g: 32, b: 51, a: 225 } satisfies Rgba,
    strokePanel: { r: 58, g: 85, b: 120, a: 255 } satisfies Rgba,
    textPrimary: { r: 232, g: 238, b: 248, a: 255 } satisfies Rgba,
    textSecondary: { r: 155, g: 176, b: 201, a: 255 } satisfies Rgba,
    accentCta: { r: 240, g: 180, b: 41, a: 255 } satisfies Rgba,
    accentInfo: { r: 76, g: 201, b: 240, a: 255 } satisfies Rgba,
  },
  font: {
    brand: 56,
    screenTitle: 32,
    cardTitle: 22,
    body: 18,
    chip: 16,
  },
  design: { width: 1280, height: 720 },
} as const;

export function assertPlayerSafeCopy(text: string): void {
  for (const word of FORBIDDEN) {
    if (text.includes(word)) {
      throw new Error(`forbidden player copy: ${word}`);
    }
  }
}
