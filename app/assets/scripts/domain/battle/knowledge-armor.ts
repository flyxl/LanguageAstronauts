import type { AnswerOutcome } from "../../core/app-events";

export type ArmorPhase = "shield" | "armor" | "core";

export interface PhaseSnapshot {
  phase: ArmorPhase;
  nodesRemaining: number;
  nodesTotal: number;
  phaseIndex: number;
  phaseTotal: number;
}

/** 知识装甲：一次有效作答最多破 1 节点；伤害不能跳节点。 */
export class KnowledgeArmor {
  readonly nodesPerPhase: number;
  phaseIndex = 0;
  nodesRemaining: number;
  readonly phases: ArmorPhase[];

  constructor(nodesPerPhase = 3, phaseCount = 3) {
    this.nodesPerPhase = nodesPerPhase;
    this.nodesRemaining = nodesPerPhase;
    const all: ArmorPhase[] = ["shield", "armor", "core"];
    this.phases = all.slice(0, Math.max(1, Math.min(phaseCount, all.length)));
  }

  snapshot(): PhaseSnapshot {
    return {
      phase: this.phases[this.phaseIndex]!,
      nodesRemaining: this.nodesRemaining,
      nodesTotal: this.nodesPerPhase,
      phaseIndex: this.phaseIndex,
      phaseTotal: this.phases.length
    };
  }

  /** @returns whether a node was broken */
  applyAnswer(outcome: AnswerOutcome, _damage: number): { nodeBroken: boolean; phaseCleared: boolean; cleared: boolean } {
    const effective =
      outcome === "first_correct" || outcome === "corrected" || outcome === "skipped" || outcome === "device_failure";
    if (!effective || outcome === "incorrect") {
      return { nodeBroken: false, phaseCleared: false, cleared: false };
    }
    // skipped / device_failure still consume a soft node for forward progress but mark weak
    if (this.nodesRemaining <= 0) return { nodeBroken: false, phaseCleared: false, cleared: this.isCleared() };

    this.nodesRemaining -= 1;
    const phaseCleared = this.nodesRemaining === 0;
    if (phaseCleared && this.phaseIndex < this.phases.length - 1) {
      this.phaseIndex += 1;
      this.nodesRemaining = this.nodesPerPhase;
      return { nodeBroken: true, phaseCleared: true, cleared: false };
    }
    return { nodeBroken: true, phaseCleared, cleared: this.isCleared() };
  }

  isCleared(): boolean {
    return this.phaseIndex >= this.phases.length - 1 && this.nodesRemaining === 0;
  }
}
