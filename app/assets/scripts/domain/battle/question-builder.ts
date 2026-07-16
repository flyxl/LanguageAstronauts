import type { RandomSource } from "../../core/random-source";
import type { ContentItem, QuestionType } from "../content/content-types";

export interface BattleQuestion {
  questionId: string;
  contentId: string;
  type: QuestionType;
  prompt: string;
  promptLabel: string;
  options: string[];
  correct: string;
  speakText: string;
  letters?: string[];
  item: ContentItem;
}

function shuffle<T>(arr: T[], random: RandomSource): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random.next() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type DistractorSlot = "vocab_en" | "vocab_zh" | "dialogue_answer" | "dialogue_zh";

function sameKind(pool: ContentItem[], item: ContentItem): ContentItem[] {
  return pool.filter((x) => x.contentId !== item.contentId && x.kind === item.kind);
}

function dialogueSpeakText(item: ContentItem): string {
  const prompt = (item.prompt ?? item.en ?? "").trim();
  const answer = (item.answer ?? "").trim();
  if (prompt && answer) return `${prompt} ${answer}`;
  return answer || prompt;
}

function pickDistractors(
  pool: ContentItem[],
  item: ContentItem,
  slot: DistractorSlot,
  count: number,
  random: RandomSource
): string[] {
  const peers = sameKind(pool, item);
  const extract = (o: ContentItem): string => {
    switch (slot) {
      case "vocab_en":
        return o.en;
      case "vocab_zh":
        return o.zh;
      case "dialogue_answer":
        return o.answer ?? o.en;
      case "dialogue_zh":
        return o.zh;
    }
  };
  const correct =
    slot === "vocab_en"
      ? item.en
      : slot === "vocab_zh" || slot === "dialogue_zh"
        ? item.zh
        : item.answer ?? item.en;
  const values = shuffle(
    peers.map(extract).filter((v) => Boolean(v) && v !== correct),
    random
  );
  const unique: string[] = [];
  for (const v of values) {
    if (!unique.includes(v)) unique.push(v);
    if (unique.length >= count) break;
  }
  return unique;
}

export function buildQuestions(
  items: ContentItem[],
  skill: QuestionType,
  random: RandomSource
): BattleQuestion[] {
  const pool = items;
  const questions: BattleQuestion[] = [];
  for (const item of pool) {
    const type = item.questionTypes.includes(skill)
      ? skill
      : item.questionTypes[0] ?? "choice";
    questions.push(makeQuestion(item, type, pool, random));
  }
  return shuffle(questions, random);
}

function makeQuestion(
  item: ContentItem,
  type: QuestionType,
  pool: ContentItem[],
  random: RandomSource
): BattleQuestion {
  if (item.kind === "dialogue") {
    if (type === "reading") {
      const distractors = pickDistractors(pool, item, "dialogue_zh", 3, random);
      const options = shuffle([item.zh, ...distractors], random);
      return {
        questionId: `${item.contentId}:${type}`,
        contentId: item.contentId,
        type,
        prompt: `${item.prompt ?? item.en} — ${item.answer ?? ""}`,
        promptLabel: "阅读会话",
        options,
        correct: item.zh,
        speakText: dialogueSpeakText(item),
        item,
      };
    }
    const answer = item.answer ?? item.en;
    const distractors = pickDistractors(pool, item, "dialogue_answer", 3, random);
    const options = shuffle([answer, ...distractors], random);
    return {
      questionId: `${item.contentId}:${type}`,
      contentId: item.contentId,
      type,
      prompt: type === "listening" ? "听问句，选出正确回应" : (item.prompt ?? item.en),
      promptLabel: type === "listening" ? "听力" : "会话密码",
      options,
      correct: answer,
      speakText: item.prompt ?? item.en,
      item,
    };
  }

  if (type === "listening") {
    const distractors = pickDistractors(pool, item, "vocab_zh", 3, random);
    const options = shuffle([item.zh, ...distractors], random);
    return {
      questionId: `${item.contentId}:listening`,
      contentId: item.contentId,
      type,
      prompt: "仔细听，选出对应的中文",
      promptLabel: "听力",
      options,
      correct: item.zh,
      speakText: item.en,
      item,
    };
  }
  if (type === "reading") {
    const distractors = pickDistractors(pool, item, "vocab_zh", 3, random);
    const options = shuffle([item.zh, ...distractors], random);
    return {
      questionId: `${item.contentId}:reading`,
      contentId: item.contentId,
      type,
      prompt: item.en,
      promptLabel: "阅读英文",
      options,
      correct: item.zh,
      speakText: item.en,
      item,
    };
  }
  if (type === "spelling" && !/\s/.test(item.en)) {
    return {
      questionId: `${item.contentId}:spelling`,
      contentId: item.contentId,
      type,
      prompt: item.zh,
      promptLabel: "拼写",
      options: [],
      correct: item.en.toLowerCase(),
      speakText: item.en,
      letters: shuffle(item.en.toLowerCase().split(""), random),
      item,
    };
  }
  if (type === "speaking") {
    return {
      questionId: `${item.contentId}:speaking`,
      contentId: item.contentId,
      type,
      prompt: item.zh,
      promptLabel: "口语",
      options: [],
      correct: item.en,
      speakText: item.en,
      item,
    };
  }
  const distractors = pickDistractors(pool, item, "vocab_en", 3, random);
  const options = shuffle([item.en, ...distractors], random);
  return {
    questionId: `${item.contentId}:choice`,
    contentId: item.contentId,
    type: "choice",
    prompt: item.zh,
    promptLabel: "翻译密码",
    options,
    correct: item.en,
    speakText: item.en,
    item,
  };
}
