import type { AnswerOutcome, AppEvents, BossPhase } from "../../core/app-events";
import type { Clock } from "../../core/clock";
import type { EventBus } from "../../core/event-bus";
import type { RandomSource } from "../../core/random-source";
import type { ContentItem, QuestionType } from "../content/content-types";
import { applyLearningOutcome, learningKey } from "../learning/mastery";
import { commandQuality, xpForOutcome } from "../progression/xp";
import { petDamageBonus } from "../progression/pets";
import type { SaveV5 } from "../save/save-v5";
import { ensureChildProgression } from "../save/create-default-save";
import { calcWeaponDamage, type WeaponId } from "../weapons/weapons";
import { KnowledgeArmor } from "./knowledge-armor";
import { buildQuestions, type BattleQuestion } from "./question-builder";

const SKILLS: QuestionType[] = ["listening", "reading", "spelling", "speaking"];
const BOSS_NAMES = ["听觉吞噬怪", "阅读吞噬怪", "拼写吞噬怪", "语音吞噬怪"];

export interface BattleHud {
  shipHp: number;
  shipMaxHp: number;
  momentum: number;
  combo: number;
  bossName: string;
  bossSkill: QuestionType;
  phase: BossPhase;
  nodesRemaining: number;
  nodesTotal: number;
  formIndex: number;
  formTotal: number;
  crystals: number;
  xpGained: number;
  alloyGained: number;
}

export interface AnswerResult {
  outcome: AnswerOutcome;
  correct: boolean;
  damage: number;
  petDamage: number;
  nodeBroken: boolean;
  phaseCleared: boolean;
  finished: boolean;
  win: boolean;
  formEvolved: boolean;
  selfDamage: number;
  heal: number;
  quality: number;
}

export class BattleSession {
  readonly battleId: string;
  private formIndex = 0;
  private armor = new KnowledgeArmor(3);
  private queue: BattleQuestion[] = [];
  private current: BattleQuestion | null = null;
  private momentum = 0;
  private combo = 0;
  shipHp = 160;
  readonly shipMaxHp = 160;
  crystals = 0;
  xpGained = 0;
  alloyGained = 0;
  finished = false;
  win = false;
  private seenCorrect = new Set<string>();

  constructor(
    private readonly unitId: string,
    private readonly items: ContentItem[],
    private readonly save: SaveV5,
    private readonly childId: string,
    private readonly clock: Clock,
    private readonly random: RandomSource,
    private readonly events: EventBus<AppEvents>,
    readonly mode: "campaign" | "review" = "campaign"
  ) {
    this.battleId = `battle_${clock.now()}`;
    if (this.mode === "review") {
      this.armor = new KnowledgeArmor(Math.max(1, this.items.length), 1);
    }
    this.rebuildQueue();
  }

  private rebuildQueue(resetArmor = true) {
    const skill = SKILLS[Math.min(this.formIndex, SKILLS.length - 1)]!;
    this.queue = buildQuestions(this.items, skill, this.random);
    if (resetArmor) {
      this.armor =
        this.mode === "review"
          ? new KnowledgeArmor(Math.max(1, this.items.length), 1)
          : new KnowledgeArmor(3);
    }
  }

  hud(): BattleHud {
    const snap = this.armor.snapshot();
    return {
      shipHp: this.shipHp,
      shipMaxHp: this.shipMaxHp,
      momentum: this.momentum,
      combo: this.combo,
      bossName: BOSS_NAMES[Math.min(this.formIndex, BOSS_NAMES.length - 1)]!,
      bossSkill: SKILLS[Math.min(this.formIndex, SKILLS.length - 1)]!,
      phase: snap.phase,
      nodesRemaining: snap.nodesRemaining,
      nodesTotal: snap.nodesTotal,
      formIndex: this.formIndex,
      formTotal: SKILLS.length,
      crystals: this.crystals,
      xpGained: this.xpGained,
      alloyGained: this.alloyGained
    };
  }

  nextQuestion(): BattleQuestion | null {
    if (this.finished) return null;
    if (this.queue.length === 0) this.rebuildQueue(false);
    this.current = this.queue.shift() ?? null;
    if (this.current) {
      this.events.emit("QuestionPresented", {
        battleId: this.battleId,
        questionId: this.current.questionId,
        contentId: this.current.contentId
      });
    }
    return this.current;
  }

  getCurrent(): BattleQuestion | null {
    return this.current;
  }

  answer(choice: string, opts: { quality?: number; assisted?: boolean } = {}): AnswerResult {
    if (!this.current || this.finished) {
      throw new Error("No active question");
    }
    const q = this.current;
    const prog = ensureChildProgression(this.save, this.childId);
    let outcome: AnswerOutcome;
    let correct = false;

    if (q.type === "speaking") {
      const quality = typeof opts.quality === "number" ? opts.quality : opts.assisted ? 0.55 : 0.9;
      if (opts.assisted) {
        outcome = "skipped";
        correct = true;
      } else if (quality >= 0.5) {
        outcome = this.seenCorrect.has(q.contentId) ? "corrected" : "first_correct";
        correct = true;
      } else {
        outcome = "incorrect";
      }
    } else if (q.type === "spelling") {
      correct = choice.toLowerCase() === q.correct.toLowerCase();
      outcome = correct
        ? this.seenCorrect.has(q.contentId)
          ? "corrected"
          : "first_correct"
        : "incorrect";
    } else {
      correct = choice === q.correct;
      outcome = correct
        ? this.seenCorrect.has(q.contentId)
          ? "corrected"
          : "first_correct"
        : "incorrect";
    }

    const result: AnswerResult = {
      outcome,
      correct,
      damage: 0,
      petDamage: 0,
      nodeBroken: false,
      phaseCleared: false,
      finished: false,
      win: false,
      formEvolved: false,
      selfDamage: 0,
      heal: 0,
      quality: commandQuality(outcome, opts.quality ?? 1)
    };

    const key = learningKey(this.childId, q.contentId);
    const prev = this.save.learning[key] ?? {
      stabilityDays: 0.014,
      difficulty: 5,
      dueAt: 0,
      firstCorrect: 0,
      corrected: 0,
      skipped: 0,
      deviceFailures: 0,
      incorrect: 0
    };
    this.save.learning[key] = applyLearningOutcome(prev, outcome, this.clock);

    if (correct) {
      if (outcome === "first_correct") this.seenCorrect.add(q.contentId);
      this.combo += 1;
      if (outcome === "first_correct") this.momentum = Math.min(5, this.momentum + 1);
      if (this.combo > 0 && this.combo % 3 === 0) {
        result.heal = 8;
        this.shipHp = Math.min(this.shipMaxHp, this.shipHp + 8);
      }
      const quality = result.quality;
      const dmg = calcWeaponDamage(prog.weaponId as WeaponId, quality, this.momentum);
      const petDmg = petDamageBonus(prog.deployedPets, prog.petBond);
      result.damage = dmg;
      result.petDamage = petDmg;
      const armorHit = this.armor.applyAnswer(outcome, dmg + petDmg);
      result.nodeBroken = armorHit.nodeBroken;
      result.phaseCleared = armorHit.phaseCleared;
      this.events.emit("AttackResolved", {
        battleId: this.battleId,
        damage: dmg + petDmg,
        nodeBroken: armorHit.nodeBroken
      });
      if (armorHit.phaseCleared) {
        this.events.emit("BossPhaseChanged", {
          battleId: this.battleId,
          phase: this.armor.snapshot().phase
        });
      }
      this.crystals += 1 + Math.floor(this.combo / 3);
      this.xpGained += xpForOutcome(outcome, q.item.kind, this.mode === "review");
      this.alloyGained += outcome === "first_correct" ? 6 : 3;

      for (const petId of prog.deployedPets) {
        prog.petBond[petId] = (prog.petBond[petId] ?? 1) + 1;
      }

      if (armorHit.cleared) {
        if (this.mode === "campaign" && this.formIndex < SKILLS.length - 1) {
          this.formIndex += 1;
          this.rebuildQueue();
          result.formEvolved = true;
        } else {
          this.finish(true);
          result.finished = true;
          result.win = true;
        }
      }
    } else {
      this.combo = 0;
      this.momentum = Math.max(0, this.momentum - 2);
      const back = q.item.kind === "dialogue" ? 6 : 4;
      this.shipHp = Math.max(0, this.shipHp - back);
      result.selfDamage = back;
      if (this.shipHp <= 0) {
        this.finish(false);
        result.finished = true;
        result.win = false;
      }
    }

    this.events.emit("CommandResolved", {
      battleId: this.battleId,
      quality: result.quality,
      momentum: this.momentum
    });

    return result;
  }

  private finish(win: boolean) {
    if (this.finished) return;
    this.finished = true;
    this.win = win;
    const prog = ensureChildProgression(this.save, this.childId);
    prog.totalXp += this.xpGained;
    prog.alloy += this.alloyGained;
    prog.starCrystals += Math.floor(this.crystals / 3);
    if (win && this.mode === "campaign") {
      const stars = prog.unitStars[this.unitId] ?? 0;
      prog.unitStars[this.unitId] = Math.max(stars, 1);
    }
    this.save.updatedAt = this.clock.now();
    this.events.emit("BattleFinished", {
      battleId: this.battleId,
      result: win ? "victory" : "evacuated"
    });
  }
}
