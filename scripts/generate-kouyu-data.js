#!/usr/bin/env node
/**
 * 从沪教牛津 2024 课程数据生成《沪教版英语口语交际》课程数据
 * 1-2 年级为 6 单元 Big Question 结构；3-6 年级与 2024 版单元标题一致（8 单元/册）
 */
const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../js/data.js");
const src = fs.readFileSync(dataPath, "utf8");
const fn = new Function(src + "; return COURSE_DATA;");
const OXFORD = fn();

const THEMES = [
  "星域", "探索域", "交流域", "发现域", "成长域", "挑战域",
  "远征域", "冒险域", "智慧域", "勇气域", "友谊域", "梦想域",
];

function cloneUnit(unit, gradeId, idx, titleOverride) {
  const u = JSON.parse(JSON.stringify(unit));
  u.id = `KY-${gradeId}-U${idx + 1}`;
  if (titleOverride) u.name = titleOverride;
  u.npc = u.npc || "Ms Wu";
  if (!u.theme || u.theme.endsWith("星域")) {
    u.theme = (THEMES[idx % THEMES.length]);
  }
  return u;
}

/** 口语交际 1-2 年级单元标题（Big Question） */
const KOUYU_TITLES = {
  "1A": [
    "Unit 1 What is your family like?",
    "Unit 2 How are you today?",
    "Unit 3 What do you take to school?",
    "Unit 4 What can you do?",
    "Unit 5 What is your favourite animal?",
    "Unit 6 What colours can you see?",
  ],
  "1B": [
    "Unit 1 You and me",
    "Unit 2 Our looks",
    "Unit 3 Toys I like",
    "Unit 4 Sounds",
    "Unit 5 Things around us",
    "Unit 6 Clever rabbits",
  ],
  "2A": [
    "Unit 1 What can you do with your five senses?",
    "Unit 2 What do you like about your family?",
    "Unit 3 What is your favourite toy?",
    "Unit 4 What is around your home?",
    "Unit 5 What do you like about farms?",
    "Unit 6 How do people celebrate the Mid-Autumn Festival?",
  ],
  "2B": [
    "Unit 1 What jobs do people do?",
    "Unit 2 What do you like to eat?",
    "Unit 3 What can you see in the park?",
    "Unit 4 What do you do in different seasons?",
    "Unit 5 What places do you visit?",
    "Unit 6 How do we keep safe?",
  ],
};

/** 1A 口语交际专用内容（6 单元） */
const KOUYU_1A_CONTENT = [
  {
    theme: "家庭星域",
    npc: "Ms Wu",
    vocab: [
      { en: "family", zh: "家庭" }, { en: "father", zh: "父亲" }, { en: "mother", zh: "母亲" },
      { en: "brother", zh: "兄弟" }, { en: "sister", zh: "姐妹" }, { en: "love", zh: "爱" },
      { en: "kind", zh: "友善的" }, { en: "happy", zh: "快乐的" }, { en: "big", zh: "大的" },
      { en: "small", zh: "小的" },
    ],
    dialogue: [
      { speaker: "Ms Wu", prompt: "What is your family like?", zh: "你的家庭是什么样的？", answer: "My family is happy." },
      { speaker: "Ben", prompt: "I love my family.", zh: "我爱我的家人。", answer: "My family is kind." },
      { speaker: "Bob", prompt: "This is my father.", zh: "这是我的爸爸。", answer: "He is kind." },
    ],
  },
  {
    theme: "问候星域",
    npc: "Ms Wu",
    vocab: [
      { en: "how", zh: "怎样" }, { en: "today", zh: "今天" }, { en: "fine", zh: "好的" },
      { en: "well", zh: "好" }, { en: "morning", zh: "早晨" }, { en: "good", zh: "好的" },
      { en: "hello", zh: "你好" }, { en: "thank you", zh: "谢谢" }, { en: "I", zh: "我" },
      { en: "am", zh: "是" },
    ],
    dialogue: [
      { speaker: "Ms Wu", prompt: "How are you today?", zh: "你今天好吗？", answer: "I'm fine, thank you." },
      { speaker: "Ben", prompt: "Good morning, Ms Wu.", zh: "吴老师，早上好。", answer: "Good morning, Ben." },
      { speaker: "Bob", prompt: "I'm well today.", zh: "我今天很好。", answer: "That's great!" },
    ],
  },
  {
    theme: "校园星域",
    npc: "Ben",
    vocab: [
      { en: "school", zh: "学校" }, { en: "bag", zh: "书包" }, { en: "book", zh: "书" },
      { en: "pencil", zh: "铅笔" }, { en: "ruler", zh: "尺子" }, { en: "take", zh: "带" },
      { en: "my", zh: "我的" }, { en: "have", zh: "有" }, { en: "what", zh: "什么" },
      { en: "please", zh: "请" },
    ],
    dialogue: [
      { speaker: "Ben", prompt: "What do you take to school?", zh: "你带什么去学校？", answer: "I take my bag." },
      { speaker: "Bob", prompt: "I have a book and a pencil.", zh: "我有一本书和一支铅笔。", answer: "Me too." },
      { speaker: "Ms Wu", prompt: "Take your ruler, please.", zh: "请带上你的尺子。", answer: "OK, Ms Wu." },
    ],
  },
  {
    theme: "才能星域",
    npc: "Bob",
    vocab: [
      { en: "can", zh: "能；会" }, { en: "sing", zh: "唱歌" }, { en: "dance", zh: "跳舞" },
      { en: "draw", zh: "画画" }, { en: "run", zh: "跑" }, { en: "jump", zh: "跳" },
      { en: "read", zh: "阅读" }, { en: "write", zh: "写字" }, { en: "do", zh: "做" },
      { en: "yes", zh: "是" },
    ],
    dialogue: [
      { speaker: "Bob", prompt: "What can you do?", zh: "你会做什么？", answer: "I can sing." },
      { speaker: "Ben", prompt: "Can you dance?", zh: "你会跳舞吗？", answer: "Yes, I can." },
      { speaker: "Ms Wu", prompt: "I can draw.", zh: "我会画画。", answer: "You can draw well." },
    ],
  },
  {
    theme: "动物星域",
    npc: "Ms Wu",
    vocab: [
      { en: "animal", zh: "动物" }, { en: "dog", zh: "狗" }, { en: "cat", zh: "猫" },
      { en: "rabbit", zh: "兔子" }, { en: "bird", zh: "鸟" }, { en: "favourite", zh: "最喜欢的" },
      { en: "like", zh: "喜欢" }, { en: "cute", zh: "可爱的" }, { en: "big", zh: "大的" },
      { en: "small", zh: "小的" },
    ],
    dialogue: [
      { speaker: "Ms Wu", prompt: "What is your favourite animal?", zh: "你最喜欢的动物是什么？", answer: "My favourite animal is a dog." },
      { speaker: "Ben", prompt: "I like cats.", zh: "我喜欢猫。", answer: "Cats are cute." },
      { speaker: "Bob", prompt: "Do you like rabbits?", zh: "你喜欢兔子吗？", answer: "Yes, I do." },
    ],
  },
  {
    theme: "色彩星域",
    npc: "Ben",
    vocab: [
      { en: "colour", zh: "颜色" }, { en: "red", zh: "红色" }, { en: "blue", zh: "蓝色" },
      { en: "green", zh: "绿色" }, { en: "yellow", zh: "黄色" }, { en: "see", zh: "看见" },
      { en: "what", zh: "什么" }, { en: "look", zh: "看" }, { en: "nice", zh: "好看的" },
      { en: "beautiful", zh: "美丽的" },
    ],
    dialogue: [
      { speaker: "Ben", prompt: "What colours can you see?", zh: "你能看见什么颜色？", answer: "I can see red and blue." },
      { speaker: "Bob", prompt: "Look! Green and yellow.", zh: "看！绿色和黄色。", answer: "They are beautiful." },
      { speaker: "Ms Wu", prompt: "I see many colours.", zh: "我看见很多颜色。", answer: "They are nice." },
    ],
  },
];

function buildGrade(gradeId) {
  const oxfordGrade = OXFORD.find((g) => g.id === gradeId);
  const titles = KOUYU_TITLES[gradeId];
  const gradeName = oxfordGrade ? oxfordGrade.name.replace("沪教牛津", "口语交际") : `${gradeId}`;

  if (gradeId === "1A") {
    return {
      id: gradeId,
      name: "一年级上册 (1A) · 口语交际",
      units: KOUYU_1A_CONTENT.map((c, i) => ({
        id: `KY-${gradeId}-U${i + 1}`,
        name: titles[i],
        theme: c.theme,
        npc: c.npc,
        vocab: c.vocab,
        dialogue: c.dialogue,
      })),
    };
  }

  if (titles && (gradeId === "1B" || gradeId.startsWith("2"))) {
    const oxUnits = oxfordGrade ? oxfordGrade.units : [];
    const count = titles.length;
    return {
      id: gradeId,
      name: `${Catalog_gradeName(gradeId)} · 口语交际`,
      units: titles.map((title, i) => {
        const src = oxUnits[i] || oxUnits[i % oxUnits.length] || oxUnits[0];
        if (!src) {
          return {
            id: `KY-${gradeId}-U${i + 1}`,
            name: title,
            theme: THEMES[i],
            npc: "Ms Wu",
            vocab: [{ en: "hello", zh: "你好" }],
            dialogue: [{ speaker: "Ms Wu", prompt: "Hello!", zh: "你好！", answer: "Hello, Ms Wu." }],
          };
        }
        return cloneUnit(src, gradeId, i, title);
      }),
    };
  }

  // 3A-6B: 克隆牛津 2024 版，仅改 id 前缀；口语交际 3-6 年级为 8 单元/册
  if (!oxfordGrade) return null;
  let units = oxfordGrade.units.map((u, i) => cloneUnit(u, gradeId, i));
  const gradeNum = parseInt(gradeId[0], 10);
  if (gradeNum >= 3) units = units.slice(0, 8);
  return {
    id: gradeId,
    name: `${oxfordGrade.name.replace(/\)$/, "")} · 口语交际)`,
    units,
  };
}

function Catalog_gradeName(id) {
  const map = {
    "1A": "一年级上册 (1A)", "1B": "一年级下册 (1B)",
    "2A": "二年级上册 (2A)", "2B": "二年级下册 (2B)",
    "3A": "三年级上册 (3A)", "3B": "三年级下册 (3B)",
    "4A": "四年级上册 (4A)", "4B": "四年级下册 (4B)",
    "5A": "五年级上册 (5A)", "5B": "五年级下册 (5B)",
    "6A": "六年级上册 (6A)", "6B": "六年级下册 (6B)",
  };
  return map[id] || id;
}

const GRADES = ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B", "5A", "5B", "6A", "6B"];
const COURSE_DATA_KOUYU = GRADES.map(buildGrade).filter(Boolean);

const out = `/**
 * 《沪教版英语口语交际》课程素材库
 * 经广东省中小学教材审定委员会2025年复审通过
 * 1-2 年级各 6 单元（Big Question）；3-6 年级各 8 单元
 * 本文件由 scripts/generate-kouyu-data.js 自动生成，请勿手改
 */
const COURSE_DATA_KOUYU = ${JSON.stringify(COURSE_DATA_KOUYU, null, 2)};

if (typeof window !== "undefined") {
  window.COURSE_DATA_KOUYU = COURSE_DATA_KOUYU;
}
`;

fs.writeFileSync(path.join(__dirname, "../js/data-kouyu.js"), out);
console.log("Generated js/data-kouyu.js with", COURSE_DATA_KOUYU.length, "grades");
