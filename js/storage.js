/**
 * 本地存档系统（LocalStorage）
 * 第一期方案：纯本地存储，0 服务器成本。
 */

const STORAGE_KEY = "language_astronauts_save_v2"; // v2: 2024 新版三年级教材迁移，旧存档自动失效

const DEFAULT_SAVE = {
  player: {
    name: "小航员",
    score: 0,
    crystals: 0,
    suit: "classic",
    ownedSuits: ["classic"],
    grade: null, // 用户当前年级（如 "4A"），null 表示未设置
  },
  // 每个关卡进度： unitId -> { crystals, completed, bestCombo }
  progress: {},
  // 艾宾浩斯复习队列： [ { key, unitId, type, level, dueAt, item } ]
  reviewQueue: [],
  // 单词掌握度记录： key -> { level, correct, wrong }
  mastery: {},
  // 星际花园（旧系统保留兼容）
  garden: [],
  // 宠物系统： [ { species, level, exp, fedAt } ]
  pets: [],
  settings: {
    sound: true,
  },
};

const Storage = {
  data: null,

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.data = Object.assign({}, structuredClone(DEFAULT_SAVE), JSON.parse(raw));
      } else {
        this.data = structuredClone(DEFAULT_SAVE);
      }
    } catch (e) {
      console.warn("存档读取失败，已重置：", e);
      this.data = structuredClone(DEFAULT_SAVE);
    }
    return this.data;
  },

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn("存档写入失败：", e);
    }
  },

  reset() {
    this.data = structuredClone(DEFAULT_SAVE);
    this.save();
  },

  get() {
    if (!this.data) this.load();
    return this.data;
  },

  addScore(n) {
    this.get().player.score += n;
    this.save();
  },

  addCrystals(n) {
    const p = this.get().player;
    p.crystals += n;
    this.save();
  },

  getUnitProgress(unitId) {
    const prog = this.get().progress;
    if (!prog[unitId]) {
      prog[unitId] = { crystals: 0, completed: false, bestCombo: 0 };
    }
    return prog[unitId];
  },
};

if (typeof window !== "undefined") {
  window.Storage = Storage;
}
