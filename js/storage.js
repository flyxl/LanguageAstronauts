/**
 * 本地存档系统（LocalStorage）
 * v4: 多孩子账号 + 教材版本绑定，每个孩子数据独立存储
 */

const STORAGE_KEY = "language_astronauts_save_v4";
const LEGACY_KEY_V3 = "language_astronauts_save_v3";

function _newChildDefaults(name, textbookId, grade) {
  return {
    name: name || "小航员",
    textbookId: textbookId || "hujiao-oxford-2024",
    grade: grade || null,
    player: {
      name: name || "小航员",
      score: 0,
      crystals: 0,
      suit: "classic",
      ownedSuits: ["classic"],
      grade: grade || null,
    },
    progress: {},
    reviewQueue: [],
    mastery: {},
    garden: [],
    pets: [],
    createdAt: Date.now(),
  };
}

const DEFAULT_SAVE = {
  version: 4,
  activeChildId: null,
  children: {},
  settings: { sound: true },
};

function _genChildId() {
  return "child_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function _migrateFromV3(v3) {
  const id = _genChildId();
  const name = v3.player?.name || "小航员";
  const grade = v3.player?.grade || null;
  return {
    version: 4,
    activeChildId: id,
    children: {
      [id]: {
        id,
        ..._newChildDefaults(name, "hujiao-oxford-2024", grade),
        player: { ..._newChildDefaults(name, "hujiao-oxford-2024", grade).player, ...v3.player, grade },
        progress: v3.progress || {},
        reviewQueue: v3.reviewQueue || [],
        mastery: v3.mastery || {},
        garden: v3.garden || [],
        pets: v3.pets || [],
      },
    },
    settings: v3.settings || { sound: true },
  };
}

const Storage = {
  root: null,

  load() {
    try {
      let raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const legacy = localStorage.getItem(LEGACY_KEY_V3);
        if (legacy) {
          this.root = _migrateFromV3(JSON.parse(legacy));
          this.save();
          return this.root;
        }
      }
      if (raw) {
        this.root = Object.assign(structuredClone(DEFAULT_SAVE), JSON.parse(raw));
      } else {
        this.root = structuredClone(DEFAULT_SAVE);
      }
    } catch (e) {
      console.warn("存档读取失败，已重置：", e);
      this.root = structuredClone(DEFAULT_SAVE);
    }
    return this.root;
  },

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.root));
    } catch (e) {
      console.warn("存档写入失败：", e);
    }
  },

  reset() {
    this.root = structuredClone(DEFAULT_SAVE);
    this.save();
  },

  getRoot() {
    if (!this.root) this.load();
    return this.root;
  },

  listChildren() {
    const root = this.getRoot();
    return Object.values(root.children).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  },

  getActiveChild() {
    const root = this.getRoot();
    if (!root.activeChildId) return null;
    return root.children[root.activeChildId] || null;
  },

  /** 当前活跃孩子的游戏存档视图（兼容旧 API） */
  get() {
    const child = this.getActiveChild();
    if (!child) return null;
    return {
      player: child.player,
      progress: child.progress,
      reviewQueue: child.reviewQueue,
      mastery: child.mastery,
      garden: child.garden,
      pets: child.pets,
      settings: this.getRoot().settings,
    };
  },

  /** 当前孩子上下文（教材、年级、姓名） */
  getContext() {
    const child = this.getActiveChild();
    if (!child) {
      return { childId: null, name: "", textbookId: "hujiao-oxford-2024", grade: null };
    }
    return {
      childId: child.id,
      name: child.name,
      textbookId: child.textbookId,
      grade: child.grade || child.player?.grade || null,
    };
  },

  switchChild(childId) {
    const root = this.getRoot();
    if (!root.children[childId]) return false;
    root.activeChildId = childId;
    this.save();
    return true;
  },

  createChild({ name, textbookId, grade }) {
    const root = this.getRoot();
    const id = _genChildId();
    const trimmed = (name || "").trim() || "小航员";
    root.children[id] = { id, ..._newChildDefaults(trimmed, textbookId, grade) };
    root.activeChildId = id;
    this.save();
    return id;
  },

  updateChild(childId, patch) {
    const root = this.getRoot();
    const child = root.children[childId];
    if (!child) return false;
    if (patch.name !== undefined) {
      child.name = patch.name.trim() || child.name;
      child.player.name = child.name;
    }
    if (patch.textbookId !== undefined) child.textbookId = patch.textbookId;
    if (patch.grade !== undefined) {
      child.grade = patch.grade;
      child.player.grade = patch.grade;
    }
    this.save();
    return true;
  },

  deleteChild(childId) {
    const root = this.getRoot();
    if (!root.children[childId]) return false;
    delete root.children[childId];
    if (root.activeChildId === childId) {
      const remaining = Object.keys(root.children);
      root.activeChildId = remaining.length ? remaining[0] : null;
    }
    this.save();
    return true;
  },

  addScore(n) {
    const p = this.get()?.player;
    if (!p) return;
    p.score += n;
    this.save();
  },

  addCrystals(n) {
    const p = this.get()?.player;
    if (!p) return;
    p.crystals += n;
    this.save();
  },

  getUnitProgress(unitId) {
    const save = this.get();
    if (!save) return { crystals: 0, completed: false, bestCombo: 0 };
    const prog = save.progress;
    if (!prog[unitId]) {
      prog[unitId] = { crystals: 0, completed: false, bestCombo: 0 };
    }
    return prog[unitId];
  },

  /** 导出完整存档为 JSON 字符串 */
  exportJSON() {
    const root = this.getRoot();
    return JSON.stringify(
      {
        format: "language-astronauts-save",
        version: root.version || 4,
        exportedAt: new Date().toISOString(),
        data: root,
      },
      null,
      2
    );
  },

  /** 从 JSON 字符串导入存档（覆盖当前本地存档） */
  importJSON(raw) {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    const data = parsed.data || parsed;
    if (!data || typeof data !== "object") throw new Error("文件格式无效");
    if (!data.children || typeof data.children !== "object") throw new Error("缺少孩子存档数据");
    const version = data.version || parsed.version;
    if (version !== 4) throw new Error("不支持的存档版本");
    this.root = structuredClone(data);
    if (!this.root.settings) this.root.settings = { sound: true };
    this.save();
    return this.root;
  },
};

if (typeof window !== "undefined") {
  window.Storage = Storage;
}
