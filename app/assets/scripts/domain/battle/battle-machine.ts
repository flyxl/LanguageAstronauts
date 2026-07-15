import type { AnswerOutcome, AppEvents } from "../../core/app-events";
import type { Clock, TimerHandle } from "../../core/clock";
import type { EventBus } from "../../core/event-bus";
import type { BattleState } from "./battle-state";

export class BattleMachine {
  state: BattleState = "Entering";
  private presentationTimer: TimerHandle | null = null;

  constructor(
    private readonly battleId: string,
    private readonly clock: Clock,
    private readonly events: EventBus<AppEvents>
  ) {}

  presentQuestion(questionId: string, contentId: string): void {
    if (this.state !== "Entering" && this.state !== "PhaseCheck") {
      throw new Error(`Cannot present question from ${this.state}`);
    }
    this.state = "QuestionFocus";
    this.events.emit("QuestionPresented", { battleId: this.battleId, questionId, contentId });
  }

  answer(outcome: AnswerOutcome): void {
    if (this.state !== "QuestionFocus") throw new Error(`Cannot answer from ${this.state}`);
    this.state = "CommandResolve";
    const quality =
      outcome === "first_correct" ? 1 : outcome === "corrected" ? 0.6 : outcome === "incorrect" ? 0 : 0.2;
    this.events.emit("QuestionAnswered", {
      battleId: this.battleId,
      questionId: "current",
      outcome
    });
    this.events.emit("CommandResolved", { battleId: this.battleId, quality, momentum: 0 });
    this.state = "Presentation";
    this.presentationTimer = this.clock.setTimeout(() => this.presentationCompleted(), 2_000);
  }

  presentationCompleted(): void {
    if (this.state !== "Presentation") return;
    if (this.presentationTimer) this.clock.clearTimeout(this.presentationTimer);
    this.presentationTimer = null;
    this.state = "PhaseCheck";
  }

  finish(): void {
    if (this.state !== "PhaseCheck" && this.state !== "BossFinish") {
      throw new Error(`Cannot finish from ${this.state}`);
    }
    this.state = "BossFinish";
    this.state = "Settlement";
    this.events.emit("BattleFinished", { battleId: this.battleId, result: "victory" });
  }
}
