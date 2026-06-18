/**
 * 艾宾浩斯遗忘曲线复习引擎（隐形算法）
 *
 * 设计铁律：严禁在前端出现"你该复习了"等说教字眼，
 * 将记忆曲线伪装成"怪兽突袭 / 红色警报"等游戏内突发事件。
 *
 * 记忆层级与触发冷却（符合真实遗忘曲线，不打扰孩子）：
 *   Level 1 -> 20 分钟  浅层警报
 *   Level 2 -> 2 小时   中层突袭
 *   Level 3 -> 1 天     领地保卫战
 *   Level 4 -> 3 天     星域大 BOSS 逆袭
 *   Level 5 -> 7 天     最终检验（通过后移出队列）
 * 答错 -> Level 重置回 1，20 分钟后再次出现。
 */

const EBBINGHAUS = {
  cooldowns: {
    1: 20 * 60 * 1000,
    2: 2 * 60 * 60 * 1000,
    3: 24 * 60 * 60 * 1000,
    4: 3 * 24 * 60 * 60 * 1000,
    5: 7 * 24 * 60 * 60 * 1000,
  },
  maxLevel: 5,

  threatByLevel: {
    1: { kind: "thief", label: "浅层警报", monster: "👾", desc: "小偷怪潜入，偷取你的水晶！", color: "#facc15", damage: 0, steal: 2 },
    2: { kind: "raid", label: "中层突袭", monster: "👹", desc: "进化怪兽来袭，护盾告急！", color: "#fb923c", damage: 8, steal: 0 },
    3: { kind: "defense", label: "领地保卫战", monster: "🛸", desc: "敌舰逼近，守住领地！", color: "#f87171", damage: 12, steal: 1 },
    4: { kind: "boss", label: "星域大 BOSS 逆袭", monster: "🐉", desc: "遗忘吞噬怪 BOSS 现身！全神贯注！", color: "#ef4444", damage: 20, steal: 3 },
    5: { kind: "boss", label: "终极遗忘之主", monster: "🐉", desc: "最终检验！彻底消灭遗忘！", color: "#dc2626", damage: 25, steal: 4 },
  },
};

const ReviewQueue = {
  _key(unitId, type, en) {
    return `${unitId}::${type}::${en}`;
  },

  /** 首次答对某项后，将其打上时间戳存入复习队列（Level 1 起） */
  register(unitId, type, item) {
    const en = item.en || item.prompt;
    const key = this._key(unitId, type, en);
    const save = Storage.get();

    save.mastery[key] = save.mastery[key] || { level: 0, correct: 0, wrong: 0 };
    const m = save.mastery[key];

    m.level = Math.min(EBBINGHAUS.maxLevel, (m.level || 0) + 1);
    m.correct += 1;

    this._upsertQueue(key, unitId, type, item, m.level);
    Storage.save();
  },

  /** 答错惩罚：层级重置回 1 */
  penalize(unitId, type, item) {
    const en = item.en || item.prompt;
    const key = this._key(unitId, type, en);
    const save = Storage.get();
    save.mastery[key] = save.mastery[key] || { level: 0, correct: 0, wrong: 0 };
    const m = save.mastery[key];
    m.level = 1;
    m.wrong += 1;
    this._upsertQueue(key, unitId, type, item, 1);
    Storage.save();
  },

  _upsertQueue(key, unitId, type, item, level) {
    const save = Storage.get();
    const cd = EBBINGHAUS.cooldowns[level] || EBBINGHAUS.cooldowns[1];
    const dueAt = Date.now() + cd;
    const entry = { key, unitId, type, level, dueAt, item };
    const idx = save.reviewQueue.findIndex((e) => e.key === key);
    if (idx >= 0) save.reviewQueue[idx] = entry;
    else save.reviewQueue.push(entry);
  },

  /** 复习成功：升级并重排队（满级后移出队列 = 真正掌握） */
  succeed(entry) {
    const save = Storage.get();
    const m = save.mastery[entry.key] || { level: entry.level, correct: 0, wrong: 0 };
    m.correct += 1;
    m.level = Math.min(EBBINGHAUS.maxLevel, entry.level + 1);

    if (m.level >= EBBINGHAUS.maxLevel && entry.level >= EBBINGHAUS.maxLevel) {
      this._remove(entry.key);
    } else {
      this._upsertQueue(entry.key, entry.unitId, entry.type, entry.item, m.level);
    }
    save.mastery[entry.key] = m;
    Storage.save();
  },

  _remove(key) {
    const save = Storage.get();
    save.reviewQueue = save.reviewQueue.filter((e) => e.key !== key);
  },

  /** 返回当前已到期、待复习的条目（按紧急程度排序，BOSS 优先） */
  getDue(now = Date.now()) {
    const save = Storage.get();
    return save.reviewQueue
      .filter((e) => e.dueAt <= now)
      .sort((a, b) => b.level - a.level || a.dueAt - b.dueAt);
  },

  /** 队列剩余总数（用于双轨制通关判定） */
  pendingCount() {
    return Storage.get().reviewQueue.length;
  },

  /** 距离下一次到期的毫秒数（无则返回 null） */
  nextDueIn(now = Date.now()) {
    const save = Storage.get();
    if (!save.reviewQueue.length) return null;
    const min = Math.min(...save.reviewQueue.map((e) => e.dueAt));
    return Math.max(0, min - now);
  },
};

if (typeof window !== "undefined") {
  window.EBBINGHAUS = EBBINGHAUS;
  window.ReviewQueue = ReviewQueue;
}
