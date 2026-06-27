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
    "Unit 1 What food do you like?",
    "Unit 2 What do we do in the classroom?",
    "Unit 3 How do we play?",
    "Unit 4 Which season do you like?",
    "Unit 5 What do you know about fruit?",
    "Unit 6 How do animals grow?",
  ],
  "2A": [
    "Unit 1 What can you do with your five senses?",
    "Unit 2 What do you like about your family?",
    "Unit 3 What is your favourite toy?",
    "Unit 4 What is around your home?",
    "Unit 5 What do you like about farms?",
    "Unit 6 How do people celebrate the Mid-Autumn Festival?",
  ],
  "2B": null, // 2B 直接使用牛津 2B 前 6 单元（标题与内容一致）
};

/** 从自定义内容块构建年级 */
function buildCustomGrade(gradeId, titles, content) {
  return {
    id: gradeId,
    name: `${Catalog_gradeName(gradeId)} · 口语交际`,
    units: content.map((c, i) => ({
      id: `KY-${gradeId}-U${i + 1}`,
      name: titles[i],
      theme: c.theme,
      npc: c.npc || "Ms Wu",
      vocab: c.vocab,
      dialogue: c.dialogue,
    })),
  };
}

/** 2A 口语交际专用内容（6 单元 · Big Question） */
const KOUYU_2A_CONTENT = [
  {
    theme: "感官星域", npc: "Ms Wu",
    vocab: [
      { en: "see", zh: "看见" }, { en: "hear", zh: "听见" }, { en: "smell", zh: "闻" },
      { en: "taste", zh: "尝" }, { en: "touch", zh: "触摸" }, { en: "eye", zh: "眼睛" },
      { en: "ear", zh: "耳朵" }, { en: "nose", zh: "鼻子" }, { en: "hand", zh: "手" },
      { en: "sense", zh: "感官" },
    ],
    dialogue: [
      { speaker: "Ms Wu", prompt: "What can you do with your eyes?", zh: "你能用眼睛做什么？", answer: "I can see." },
      { speaker: "Ben", prompt: "I can hear with my ears.", zh: "我能用耳朵听。", answer: "Me too." },
      { speaker: "Bob", prompt: "I can smell flowers.", zh: "我能闻花香。", answer: "Flowers smell nice." },
    ],
  },
  {
    theme: "家庭星域", npc: "Ben",
    vocab: [
      { en: "family", zh: "家庭" }, { en: "mother", zh: "妈妈" }, { en: "father", zh: "爸爸" },
      { en: "sister", zh: "姐妹" }, { en: "brother", zh: "兄弟" }, { en: "love", zh: "爱" },
      { en: "kind", zh: "友善的" }, { en: "help", zh: "帮助" }, { en: "like", zh: "喜欢" },
      { en: "about", zh: "关于" },
    ],
    dialogue: [
      { speaker: "Ben", prompt: "I like my family.", zh: "我喜欢我的家人。", answer: "My family is kind." },
      { speaker: "Ms Wu", prompt: "What do you like about your mother?", zh: "你喜欢妈妈什么？", answer: "She is kind." },
      { speaker: "Bob", prompt: "My father helps me.", zh: "爸爸帮助我。", answer: "That is nice." },
    ],
  },
  {
    theme: "玩具星域", npc: "Bob",
    vocab: [
      { en: "toy", zh: "玩具" }, { en: "doll", zh: "玩具娃娃" }, { en: "ball", zh: "球" },
      { en: "kite", zh: "风筝" }, { en: "robot", zh: "机器人" }, { en: "favourite", zh: "最喜欢的" },
      { en: "like", zh: "喜欢" }, { en: "play", zh: "玩" }, { en: "fun", zh: "有趣的" },
      { en: "super", zh: "超级的" },
    ],
    dialogue: [
      { speaker: "Bob", prompt: "What is your favourite toy?", zh: "你最喜欢的玩具是什么？", answer: "My favourite toy is a doll." },
      { speaker: "Ben", prompt: "I like robots.", zh: "我喜欢机器人。", answer: "Robots are fun." },
      { speaker: "Ms Wu", prompt: "Do you like kites?", zh: "你喜欢风筝吗？", answer: "Yes, I do." },
    ],
  },
  {
    theme: "家园星域", npc: "Ms Wu",
    vocab: [
      { en: "home", zh: "家" }, { en: "around", zh: "在……周围" }, { en: "door", zh: "门" },
      { en: "window", zh: "窗户" }, { en: "garden", zh: "花园" }, { en: "tree", zh: "树" },
      { en: "flower", zh: "花" }, { en: "park", zh: "公园" }, { en: "near", zh: "在……附近" },
      { en: "see", zh: "看见" },
    ],
    dialogue: [
      { speaker: "Ms Wu", prompt: "What is around your home?", zh: "你家周围有什么？", answer: "There is a garden." },
      { speaker: "Ben", prompt: "I can see a tree.", zh: "我能看见一棵树。", answer: "It is big." },
      { speaker: "Bob", prompt: "There is a park near my home.", zh: "我家附近有一个公园。", answer: "That's nice." },
    ],
  },
  {
    theme: "农场星域", npc: "Ben",
    vocab: [
      { en: "farm", zh: "农场" }, { en: "cow", zh: "奶牛" }, { en: "pig", zh: "猪" },
      { en: "chicken", zh: "鸡" }, { en: "duck", zh: "鸭子" }, { en: "grass", zh: "草" },
      { en: "like", zh: "喜欢" }, { en: "cute", zh: "可爱的" }, { en: "big", zh: "大的" },
      { en: "about", zh: "关于" },
    ],
    dialogue: [
      { speaker: "Ben", prompt: "What do you like about farms?", zh: "你喜欢农场什么？", answer: "I like cows." },
      { speaker: "Bob", prompt: "Ducks are cute.", zh: "鸭子很可爱。", answer: "Yes, they are." },
      { speaker: "Ms Wu", prompt: "I like chickens on the farm.", zh: "我喜欢农场上的鸡。", answer: "Me too." },
    ],
  },
  {
    theme: "中秋星域", npc: "Ms Wu",
    vocab: [
      { en: "Mid-Autumn Festival", zh: "中秋节" }, { en: "moon", zh: "月亮" }, { en: "mooncake", zh: "月饼" },
      { en: "celebrate", zh: "庆祝" }, { en: "family", zh: "家人" }, { en: "together", zh: "一起" },
      { en: "happy", zh: "快乐的" }, { en: "eat", zh: "吃" }, { en: "look", zh: "看" },
      { en: "night", zh: "夜晚" },
    ],
    dialogue: [
      { speaker: "Ms Wu", prompt: "How do people celebrate the Mid-Autumn Festival?", zh: "人们怎么庆祝中秋节？", answer: "They eat mooncakes." },
      { speaker: "Ben", prompt: "We look at the moon.", zh: "我们看月亮。", answer: "The moon is bright." },
      { speaker: "Bob", prompt: "My family is together.", zh: "我们一家人在一起。", answer: "That is happy." },
    ],
  },
];

/** 1B 口语交际专用内容（6 单元 · Big Question） */
const KOUYU_1B_CONTENT = [
  {
    theme: "美食星域", npc: "Ms Wu",
    vocab: [
      { en: "food", zh: "食物" }, { en: "like", zh: "喜欢" }, { en: "rice", zh: "米饭" },
      { en: "noodles", zh: "面条" }, { en: "bread", zh: "面包" }, { en: "egg", zh: "鸡蛋" },
      { en: "apple", zh: "苹果" }, { en: "milk", zh: "牛奶" }, { en: "yummy", zh: "好吃的" },
      { en: "don't", zh: "不" },
    ],
    dialogue: [
      { speaker: "Ms Wu", prompt: "What food do you like?", zh: "你喜欢什么食物？", answer: "I like rice." },
      { speaker: "Ben", prompt: "Do you like noodles?", zh: "你喜欢面条吗？", answer: "Yes, I do." },
      { speaker: "Bob", prompt: "I don't like eggs.", zh: "我不喜欢鸡蛋。", answer: "I like eggs." },
    ],
  },
  {
    theme: "课堂星域", npc: "Ms Wu",
    vocab: [
      { en: "classroom", zh: "教室" }, { en: "read", zh: "阅读" }, { en: "write", zh: "写字" },
      { en: "draw", zh: "画画" }, { en: "listen", zh: "听" }, { en: "sing", zh: "唱歌" },
      { en: "sit", zh: "坐" }, { en: "stand", zh: "站" }, { en: "book", zh: "书" },
      { en: "pencil", zh: "铅笔" },
    ],
    dialogue: [
      { speaker: "Ms Wu", prompt: "What do we do in the classroom?", zh: "我们在教室里做什么？", answer: "We read books." },
      { speaker: "Ben", prompt: "We listen to Ms Wu.", zh: "我们听吴老师讲课。", answer: "Yes, we do." },
      { speaker: "Bob", prompt: "We draw in the classroom.", zh: "我们在教室里画画。", answer: "I like drawing." },
    ],
  },
  {
    theme: "游戏星域", npc: "Ben",
    vocab: [
      { en: "play", zh: "玩" }, { en: "game", zh: "游戏" }, { en: "run", zh: "跑" },
      { en: "jump", zh: "跳" }, { en: "ball", zh: "球" }, { en: "skip", zh: "跳绳" },
      { en: "fun", zh: "有趣的" }, { en: "together", zh: "一起" }, { en: "outside", zh: "在外面" },
      { en: "friend", zh: "朋友" },
    ],
    dialogue: [
      { speaker: "Ben", prompt: "How do we play?", zh: "我们怎么玩？", answer: "We play ball games." },
      { speaker: "Bob", prompt: "Let's play together.", zh: "我们一起玩吧。", answer: "OK." },
      { speaker: "Ms Wu", prompt: "We skip outside.", zh: "我们在外面跳绳。", answer: "It is fun." },
    ],
  },
  {
    theme: "四季星域", npc: "Ms Wu",
    vocab: [
      { en: "season", zh: "季节" }, { en: "spring", zh: "春天" }, { en: "summer", zh: "夏天" },
      { en: "autumn", zh: "秋天" }, { en: "winter", zh: "冬天" }, { en: "warm", zh: "温暖的" },
      { en: "hot", zh: "炎热的" }, { en: "cool", zh: "凉爽的" }, { en: "cold", zh: "寒冷的" },
      { en: "which", zh: "哪一个" },
    ],
    dialogue: [
      { speaker: "Ms Wu", prompt: "Which season do you like?", zh: "你喜欢哪个季节？", answer: "I like spring." },
      { speaker: "Ben", prompt: "Summer is hot.", zh: "夏天很热。", answer: "Yes, it is hot." },
      { speaker: "Bob", prompt: "I like winter.", zh: "我喜欢冬天。", answer: "Winter is cold." },
    ],
  },
  {
    theme: "水果星域", npc: "Bob",
    vocab: [
      { en: "fruit", zh: "水果" }, { en: "apple", zh: "苹果" }, { en: "banana", zh: "香蕉" },
      { en: "orange", zh: "橙子" }, { en: "grape", zh: "葡萄" }, { en: "pear", zh: "梨" },
      { en: "sweet", zh: "甜的" }, { en: "know", zh: "知道" }, { en: "about", zh: "关于" },
      { en: "like", zh: "喜欢" },
    ],
    dialogue: [
      { speaker: "Bob", prompt: "What do you know about fruit?", zh: "关于水果你知道什么？", answer: "Apples are sweet." },
      { speaker: "Ben", prompt: "I like bananas.", zh: "我喜欢香蕉。", answer: "Bananas are yummy." },
      { speaker: "Ms Wu", prompt: "Oranges are fruit.", zh: "橙子是水果。", answer: "Yes, they are." },
    ],
  },
  {
    theme: "成长星域", npc: "Ms Wu",
    vocab: [
      { en: "animal", zh: "动物" }, { en: "grow", zh: "生长" }, { en: "small", zh: "小的" },
      { en: "big", zh: "大的" }, { en: "baby", zh: "幼小的" }, { en: "cat", zh: "猫" },
      { en: "dog", zh: "狗" }, { en: "rabbit", zh: "兔子" }, { en: "duck", zh: "鸭子" },
      { en: "hen", zh: "母鸡" },
    ],
    dialogue: [
      { speaker: "Ms Wu", prompt: "How do animals grow?", zh: "动物怎么长大？", answer: "They grow big." },
      { speaker: "Ben", prompt: "The baby duck grows.", zh: "小鸭子在长大。", answer: "It is small now." },
      { speaker: "Bob", prompt: "Rabbits grow fast.", zh: "兔子长得很快。", answer: "Yes, they do." },
    ],
  },
];

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
    return buildCustomGrade(gradeId, titles, KOUYU_1A_CONTENT);
  }

  if (gradeId === "1B") {
    return buildCustomGrade(gradeId, titles, KOUYU_1B_CONTENT);
  }

  if (gradeId === "2A") {
    return buildCustomGrade(gradeId, titles, KOUYU_2A_CONTENT);
  }

  if (gradeId === "2B" && oxfordGrade) {
    return {
      id: gradeId,
      name: `${Catalog_gradeName(gradeId)} · 口语交际`,
      units: oxfordGrade.units.slice(0, 6).map((u, i) => cloneUnit(u, gradeId, i)),
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
