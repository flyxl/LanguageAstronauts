import { describe, expect, it } from "vitest";
import { buildQuestions } from "../../assets/scripts/domain/battle/question-builder";
import type { ContentItem } from "../../assets/scripts/domain/content/content-types";
import { MathRandomSource } from "../../assets/scripts/infrastructure/system/math-random-source";

const unit1: ContentItem[] = [
  {
    contentId: "v-happy",
    kind: "vocab",
    en: "happy",
    zh: "开心的",
    questionTypes: ["listening", "choice"],
  },
  {
    contentId: "v-pencil",
    kind: "vocab",
    en: "pencil",
    zh: "铅笔",
    questionTypes: ["listening", "choice"],
  },
  {
    contentId: "v-find",
    kind: "vocab",
    en: "find",
    zh: "找到",
    questionTypes: ["listening", "choice"],
  },
  {
    contentId: "v-tired",
    kind: "vocab",
    en: "tired",
    zh: "累的",
    questionTypes: ["listening", "choice"],
  },
  {
    contentId: "d1",
    kind: "dialogue",
    en: "How are you?",
    zh: "你好吗？",
    answer: "I'm fine. Thank you.",
    prompt: "How are you?",
    questionTypes: ["listening", "choice"],
  },
  {
    contentId: "d2",
    kind: "dialogue",
    en: "Are you a student?",
    zh: "你是学生吗？",
    answer: "Yes, I am.",
    prompt: "Are you a student?",
    questionTypes: ["listening", "choice"],
  },
  {
    contentId: "d3",
    kind: "dialogue",
    en: "Where is my pencil?",
    zh: "我的铅笔在哪？",
    answer: "It's on the desk.",
    prompt: "Where is my pencil?",
    questionTypes: ["listening", "choice"],
  },
  {
    contentId: "d4",
    kind: "dialogue",
    en: "Nice to meet you.",
    zh: "很高兴认识你。",
    answer: "Nice to meet you, too.",
    prompt: "Nice to meet you.",
    questionTypes: ["listening", "choice"],
  },
];

describe("question-builder distractors", () => {
  const random = new MathRandomSource();

  it("keeps vocab listening options as short zh glosses", () => {
    const qs = buildQuestions(unit1, "listening", random).filter((q) => q.item.kind === "vocab");
    expect(qs.length).toBeGreaterThan(0);
    for (const q of qs) {
      for (const opt of q.options) {
        expect(opt.includes(".")).toBe(false);
        expect(opt.length).toBeLessThan(12);
      }
    }
  });

  it("keeps dialogue listening options as sentence answers", () => {
    const qs = buildQuestions(unit1, "listening", random).filter((q) => q.item.kind === "dialogue");
    expect(qs.length).toBeGreaterThan(0);
    for (const q of qs) {
      for (const opt of q.options) {
        expect(opt === "happy" || opt === "pencil").toBe(false);
        expect(/[A-Za-z]/.test(opt)).toBe(true);
      }
    }
  });
});
