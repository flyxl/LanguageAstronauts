/**
 * 核心战斗引擎
 * 玩法：4个Boss分别考察听说读写，确保每个单词都经历完整学习流程
 * 机制：Combo 连击暴击、飞船护盾 HP、水晶碎片收集、怪兽进化形态。
 */

const CRYSTAL_GOAL = 30;

// 4个Boss分别对应听说读写四项技能
const MONSTER_FORMS = [
  { id: "listen", name: "听觉吞噬怪", emoji: "👾", hp: 40, color: "#a78bfa", skill: "listen", skillLabel: "听力" },
  { id: "read", name: "阅读吞噬怪", emoji: "👹", hp: 45, color: "#38bdf8", skill: "mc", skillLabel: "阅读" },
  { id: "write", name: "拼写吞噬怪", emoji: "🐙", hp: 50, color: "#f472b6", skill: "spell", skillLabel: "拼写" },
  { id: "speak", name: "语音吞噬怪 BOSS", emoji: "🐲", hp: 55, color: "#f87171", skill: "speak", skillLabel: "口语" },
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

    this.maxHp = 120;
    this.hp = 120;
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
      this.questionQueue = this.reviewEntries.map((e) => this._makeQuestionFromEntry(e));
      return;
    }
    // 按当前 boss 的技能类型生成题目，确保每个词/句都练到该技能
    const form = MONSTER_FORMS[Math.min(this.formIndex, MONSTER_FORMS.length - 1)];
    const style = form.skill;
    const q = [];

    if (style === "speak") {
      // 口语boss：词汇和会话都用朗读模式
      this.unit.vocab.forEach((v) => q.push(this._makeVocabQuestion(v, "speak")));
      this.unit.dialogue.forEach((d) => q.push(this._makeDialogueQuestion(d, "speak")));
    } else if (style === "spell") {
      // 拼写boss：词汇用拼写，会话用选择（句子不适合拼写）
      this.unit.vocab.forEach((v) => {
        if (/\s/.test(v.en)) {
          q.push(this._makeVocabQuestion(v, "mc"));
        } else {
          q.push(this._makeVocabQuestion(v, "spell"));
        }
      });
      this.unit.dialogue.forEach((d) => q.push(this._makeDialogueQuestion(d, "mc")));
    } else if (style === "listen") {
      // 听力boss：全部用听音辨词/句
      this.unit.vocab.forEach((v) => q.push(this._makeVocabQuestion(v, "listen")));
      this.unit.dialogue.forEach((d) => q.push(this._makeDialogueQuestion(d, "listen")));
    } else {
      // 阅读boss：全部用选择题
      this.unit.vocab.forEach((v) => q.push(this._makeVocabQuestion(v, "mc")));
      this.unit.dialogue.forEach((d) => q.push(this._makeDialogueQuestion(d, "mc")));
    }
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
  // style: 'mc' 选择 | 'listen' 听音辨词 | 'spell' 拼写填空 | 'speak' 口语
  _makeVocabQuestion(v, style = "mc") {
    const distractors = pick(
      allVocab().filter((x) => x.en !== v.en),
      3
    ).map((x) => x.en);
    const options = shuffle([v.en, ...distractors]);
    const q = {
      type: "vocab",
      style,
      prompt: v.zh,
      promptLabel: "翻译密码",
      speak: v.en,
      options,
      correct: v.en,
      item: v,
    };
    if (style === "spell") {
      // 仅对单个英文单词（无空格）启用拼写；含空格的短语回退为选择
      if (/\s/.test(v.en)) q.style = "mc";
      else q.letters = shuffle(v.en.toLowerCase().split(""));
    }
    return q;
  }

  // style: 'mc' 选择 | 'listen' 听音辨句 | 'speak' 口语评测
  _makeDialogueQuestion(d, style = "mc") {
    const distractors = pick(
      allDialogueAnswers().filter((x) => x !== d.answer),
      3
    );
    const options = shuffle([d.answer, ...distractors]);
    return {
      type: "dialogue",
      style,
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
      const q = this._makeVocabQuestion(entry.item, "mc");
      q.reviewEntry = entry;
      return q;
    }
    const q = this._makeDialogueQuestion(entry.item, "mc");
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
  answer(choice, opts = {}) {
    const q = this.current;
    const correct = q.style === "spell"
      ? choice.toLowerCase() === q.correct.toLowerCase()
      : choice === q.correct;
    // 口语评测：quality 为发音标准度 0~1，决定激光炮伤害值（GDD 设定）
    const quality = typeof opts.quality === "number" ? Math.max(0, Math.min(1, opts.quality)) : 1;
    const result = {
      correct,
      question: q,
      crit: false,
      damage: 0,
      monsterDead: false,
      formEvolved: false,
      crystalGain: 0,
      combo: this.combo,
      quality: opts.quality,
    };

    if (correct) {
      Sound.laser();
      this.combo += 1;
      this.bestCombo = Math.max(this.bestCombo, this.combo);
      result.combo = this.combo;

      // 连击回血：每达到 3 的倍数连击时恢复 HP（鼓励连续答对）
      if (this.combo > 0 && this.combo % 3 === 0) {
        const heal = 8;
        this.hp = Math.min(this.maxHp, this.hp + heal);
        result.heal = heal;
      }

      // 连击暴击：Combo>=3 触发双倍伤害
      const crit = this.combo >= 3;
      result.crit = crit;
      const base = q.type === "dialogue" ? 26 : 20;
      // 拼写填空难度更高，额外加成；口语评测按发音标准度缩放
      const styleBonus = q.style === "spell" ? 1.4 : 1;
      let dmg = Math.round((crit ? base * 2 : base) * styleBonus * (q.style === "speak" ? 0.5 + 0.5 * quality : 1));
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
          this._buildQueue(); // 新boss新题型
          result.formEvolved = true;
        }
      }
    } else {
      Sound.wrong();
      this.combo = 0;
      result.combo = 0;
      // 怪兽反击：扣护盾（降低惩罚，鼓励孩子继续尝试）
      const back = q.type === "dialogue" ? 10 : 7;
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
      // 普通通关：击杀全部三形态 BOSS（给孩子即时成就感）
      const allBossKilled = this.formIndex >= MONSTER_FORMS.length - 1 && this.monster.hp <= 0;
      if (allBossKilled) {
        // 双轨制完美通关（额外成就）：水晶达上限 AND 本单元复习队列清空
        const unitPending = Storage.get().reviewQueue.filter((e) => e.unitId === this.unit.id).length;
        this.perfectClear = this.crystals >= CRYSTAL_GOAL && unitPending === 0;
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
      if (this.perfectClear) prog.perfectClear = true;
      Storage.save();
    }
  }

  // 进度信息（供 UI 顶部状态栏）
  status() {
    const form = MONSTER_FORMS[Math.min(this.formIndex, MONSTER_FORMS.length - 1)];
    return {
      hp: this.hp,
      maxHp: this.maxHp,
      crystals: this.crystals,
      crystalGoal: CRYSTAL_GOAL,
      combo: this.combo,
      monster: this.monster,
      formIndex: this.formIndex,
      formTotal: MONSTER_FORMS.length,
      skillLabel: form ? form.skillLabel : "",
    };
  }
}

if (typeof window !== "undefined") {
  window.Battle = Battle;
  window.CRYSTAL_GOAL = CRYSTAL_GOAL;
  window.MONSTER_FORMS = MONSTER_FORMS;
}
