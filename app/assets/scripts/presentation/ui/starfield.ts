// app/assets/scripts/presentation/ui/starfield.ts
export type StarPoint = { x: number; y: number; r: number };

function nextRand(state: { seed: number }): number {
  state.seed = (state.seed * 1664525 + 1013904223) >>> 0;
  return state.seed / 0x100000000;
}

/** Seeded star layout in center-origin coordinates (matches Cocos canvas space). */
export function starPoints(
  width: number,
  height: number,
  count: number,
  seed: number
): StarPoint[] {
  const rng = { seed: seed >>> 0 };
  const halfW = width / 2;
  const halfH = height / 2;
  const points: StarPoint[] = [];
  for (let i = 0; i < count; i++) {
    points.push({
      x: nextRand(rng) * width - halfW,
      y: nextRand(rng) * height - halfH,
      r: 1 + nextRand(rng) * 1.5,
    });
  }
  return points;
}
