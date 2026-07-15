export type AnswerOutcome =
  | "first_correct"
  | "corrected"
  | "skipped"
  | "device_failure"
  | "incorrect";

export type BossPhase = "shield" | "armor" | "core";

export interface AppEvents {
  QuestionPresented: { battleId: string; questionId: string; contentId: string };
  QuestionAnswered: { battleId: string; questionId: string; outcome: AnswerOutcome };
  CorrectionCompleted: { battleId: string; questionId: string };
  MasteryUpdated: {
    childId: string;
    contentId: string;
    stabilityDays: number;
    difficulty: number;
    dueAt: number;
  };
  CommandResolved: { battleId: string; quality: number; momentum: number };
  AttackResolved: { battleId: string; damage: number; nodeBroken: boolean };
  BossPhaseChanged: { battleId: string; phase: BossPhase };
  PetSkillTriggered: { battleId: string; petId: string; skillId: string };
  BattleFinished: { battleId: string; result: "victory" | "evacuated" };
  SaveCommitted: { saveVersion: 5; committedAt: number };
}
