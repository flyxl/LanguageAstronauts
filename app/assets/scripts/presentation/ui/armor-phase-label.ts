import type { BossPhase } from "../../core/app-events";

const PHASE_ZH: Record<BossPhase, string> = {
  shield: "护盾",
  armor: "装甲",
  core: "核心",
};

export function armorPhaseLabel(phase: BossPhase | string): string {
  return PHASE_ZH[phase as BossPhase] ?? "护盾";
}
