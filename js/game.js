/**
 * 核心战斗引擎
 * 玩法：关卡推图 + 多模态答题（武器填装 -> 弹药选择 -> 发射激光炮）
 * 机制：Combo 连击暴击、飞船护盾 HP、水晶碎片收集、怪兽进化形态。
 */

const CRYSTAL_GOAL = 30; // GDD 双轨制：水晶碎片上限

// 怪兽进化形态（Word -> Dialogue -> Reading）
const MONSTER_FORMS = [
  { id: "word", name: "词汇吞噬怪", emoji: "👾", hp: 60, color: "#a78bfa" },
  { id: "dialogue", name: "会话吞噬怪", emoji: "👹", hp: 90, color: "#f472b6" },
  { id: "reading", name: "语篇吞噬怪 BOSS", emoji: "🐲", hp: 140, color: "#f87171" },
];

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick(arr, n) {
  return shuffle(arr).slice(0, n);
}

// 全局词汇池（用于生成干扰项）
function allVocab() {
  const pool = [];
  COURSE_DATA.forEach((g) => g.units.forEach((u) => u.vocab.forEach((v) => pool.push(v))));
  return pool;
}
function allDialogueAnswers() {
  const pool = [];
  COURSE_DATA.forEach((g) => g.units.forEach((u) => u.dialogue.forEach((d) => pool.push(d.answer))));
  return pool;
}

class Battle {
  /**
   * @param {object} unit 关卡数据
   * @param {string} mode 'campaign' 推图 | 'review' 复习突袭
   * @param {array}  reviewEntries 复习模式下的待复习条目
   */
  constructor(unit, mode = "campaign", reviewEntries = []) {
    this.unit = unit;
    this.mode = mode;
    this.reviewEntries = reviewEntries;

    this.maxHp = 100;
    this.hp = 100;
    this.combo = 0;
    this.bestCombo = 0;
    this.crystals = mode === "campaign" ? Storage.getUnitProgress(unit.id).crystals : 0;
    this.scoreGained = 0;
    this.crystalsGained = 0;

    this.formIndex = 0;
    this.monster = null;
    this.questionQueue = [];
    this.current = null;
    this.finished = false;
    this.win = false;

    this._buildQueue();
    this._spawnMonster();
  }

  _buildQueue() {
    if (this.mode === "review") {
      // 复习突袭：仅使用到期条目
      this.questionQueue = this.reviewEntries.map((e) => this._makeQuestionFromEntry(e));
      return;
    }
    // 推图：词汇题 + 会话题混合，循环出题直到通关
    const q = [];
    this.unit.vocab.forEach((v) => q.push(this._makeVocabQuestion(v)));
    this.unit.dialogue.forEach((d) => q.push(this._makeDialogueQuestion(d)));
    this.questionQueue = shuffle(q);
  }

  _spawnMonster() {
    const form = MONSTER_FORMS[Math.min(this.formIndex, MONSTER_FORMS.length - 1)];
    this.monster = {
      ...form,
      maxHp: form.hp,
      hp: form.hp,
    };
  }

  // ---- 出题生成 ----
  _makeVocabQuestion(v) {
    // 怪物挂中文，玩家选英文导弹
    const distractors = pick(
      allVocab().filter((x) => x.en !== v.en),
      3
    ).map((x) => x.en);
    const options = shuffle([v.en, ...distractors]);
    return {
      type: "vocab",
      prompt: v.zh,
      promptLabel: "翻译密码",
      speak: v.en,
      options,
      correct: v.en,
      item: v,
    };
  }

  _makeDialogueQuestion(d) {
    const distractors = pick(
      allDialogueAnswers().filter((x) => x !== d.answer),
      3
    );
    const options = shuffle([d.answer, ...distractors]);
    return {
      type: "dialogue",
      prompt: d.prompt,
      promptZh: d.zh,
      speaker: d.speaker,
      promptLabel: "会话密码",
      speak: d.answer,
      options,
      correct: d.answer,
      item: d,
    };
  }

  _makeQuestionFromEntry(entry) {
    if (entry.type === "vocab") {
      const q = this._makeVocabQuestion(entry.item);
      q.reviewEntry = entry;
      return q;
    }
    const q = this._makeDialogueQuestion(entry.item);
    q.reviewEntry = entry;
    return q;
  }

  /** 取下一题（推图模式下循环复用题库） */
  next() {
    if (this.finished) return null;
    if (this.questionQueue.length === 0) {
      if (this.mode === "review") {
        this._end(true);
        return null;
      }
      this._buildQueue(); // 推图循环
    }
    this.current = this.questionQueue.shift();
    return this.current;
  }

  /**
   * 玩家作答
   * @returns {object} 结果详情供 UI 渲染
   */
  answer(choice) {
    const q = this.current;
    const correct = choice === q.correct;
    const result = {
      correct,
      question: q,
      crit: false,
      damage: 0,
      monsterDead: false,
      formEvolved: false,
      crystalGain: 0,
      combo: this.combo,
    };

    if (correct) {
      Sound.laser();
      this.combo += 1;
      this.bestCombo = Math.max(this.bestCombo, this.combo);
      result.combo = this.combo;

      // 连击暴击：Combo>=3 触发双倍伤害
      const crit = this.combo >= 3;
      result.crit = crit;
      const base = q.type === "dialogue" ? 22 : 16;
      let dmg = crit ? base * 2 : base;
      this.monster.hp = Math.max(0, this.monster.hp - dmg);
      result.damage = dmg;

      // 水晶碎片奖励（连击越高越多）
      const gain = 1 + Math.floor(this.combo / 3);
      result.crystalGain = gain;
      this.crystalsGained += gain;
      if (this.mode === "campaign") {
        this.crystals = Math.min(CRYSTAL_GOAL, this.crystals + gain);
      }

      // 战功积分
      const sc = (crit ? 20 : 10) * (q.type === "dialogue" ? 2 : 1);
      this.scoreGained += sc;

      if (crit) Sound.combo();

      // 复习/记忆：注册或推进艾宾浩斯
      if (q.reviewEntry) {
        ReviewQueue.succeed(q.reviewEntry);
      } else {
        ReviewQueue.register(this.unit.id, q.type, q.item);
      }

      // 怪兽死亡 -> 进化
      if (this.monster.hp <= 0) {
        result.monsterDead = true;
        if (this.formIndex < MONSTER_FORMS.length - 1) {
          this.formIndex += 1;
          this._spawnMonster();
          result.formEvolved = true;
        }
      }
    } else {
      Sound.wrong();
      this.combo = 0;
      result.combo = 0;
      // 怪兽反击：扣护盾
      const back = q.type === "dialogue" ? 15 : 10;
      this.hp = Math.max(0, this.hp - back);
      result.selfDamage = back;
      // 答错惩罚：层级重置回 1，高频重刷
      ReviewQueue.penalize(this.unit.id, q.type, q.item);
    }

    this._checkEnd();
    return result;
  }

  _checkEnd() {
    if (this.hp <= 0) {
      this._end(false);
      return;
    }
    if (this.mode === "campaign") {
      // 双轨制通关：水晶达上限 AND 复习队列清空（本单元）
      const unitPending = Storage.get().reviewQueue.filter((e) => e.unitId === this.unit.id).length;
      if (this.crystals >= CRYSTAL_GOAL && unitPending === 0 && this.formIndex >= MONSTER_FORMS.length - 1 && this.monster.hp <= 0) {
        this._end(true);
      }
    }
  }

  _end(win) {
    if (this.finished) return;
    this.finished = true;
    this.win = win;

    // 结算战功与水晶到存档
    Storage.addScore(this.scoreGained);
    Storage.addCrystals(this.crystalsGained);

    if (this.mode === "campaign") {
      const prog = Storage.getUnitProgress(this.unit.id);
      prog.crystals = this.crystals;
      prog.bestCombo = Math.max(prog.bestCombo, this.bestCombo);
      if (win) prog.completed = true;
      Storage.save();
    }
  }

  // 进度信息（供 UI 顶部状态栏）
  status() {
    return {
      hp: this.hp,
      maxHp: this.maxHp,
      crystals: this.crystals,
      crystalGoal: CRYSTAL_GOAL,
      combo: this.combo,
      monster: this.monster,
      formIndex: this.formIndex,
      formTotal: MONSTER_FORMS.length,
    };
  }
}

if (typeof window !== "undefined") {
  window.Battle = Battle;
  window.CRYSTAL_GOAL = CRYSTAL_GOAL;
  window.MONSTER_FORMS = MONSTER_FORMS;
}
