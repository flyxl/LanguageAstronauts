/**
 * 核心战斗引擎
 * 玩法：4个Boss分别考察听说读写，确保每个单词都经历完整学习流程
 * 机制：Combo 连击暴击、飞船护盾 HP、水晶碎片收集、怪兽进化形态。
 */

const CRYSTAL_GOAL = 30;

// 4个Boss分别对应听说读写四项技能
const MONSTER_FORMS = [
  { id: "listen", name: "听觉吞噬怪", emoji: "👾", color: "#a78bfa", skill: "listen", skillLabel: "听力" },
  { id: "read", name: "阅读吞噬怪", emoji: "👹", color: "#38bdf8", skill: "read", skillLabel: "阅读" },
  { id: "write", name: "拼写吞噬怪", emoji: "🐙", color: "#f472b6", skill: "spell", skillLabel: "拼写" },
  { id: "speak", name: "语音吞噬怪 BOSS", emoji: "🐲", color: "#f87171", skill: "speak", skillLabel: "口语" },
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

/** 选项去重（避免干扰项与正确答案或彼此重复） */
function uniqueStrings(values) {
  const seen = new Set();
  const out = [];
  for (const v of values) {
    const s = String(v ?? "").trim();
    if (!s || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

function pickUniqueValues(values, correct, n) {
  const key = String(correct ?? "").trim();
  const pool = uniqueStrings(values.filter((x) => String(x).trim() !== key));
  return shuffle(pool).slice(0, n);
}

function buildShuffledOptions(correct, distractors) {
  return shuffle(uniqueStrings([correct, ...distractors]));
}

/** 会话完整英文朗读文本（问句 + 回应） */
function dialogueSpeakText(d) {
  if (!d) return "";
  const prompt = (d.prompt || "").trim();
  const answer = (d.answer || "").trim();
  if (prompt && answer) return `${prompt} ${answer}`;
  return answer || prompt;
}

/** 当前孩子启用的 Boss 形态（关闭拼写时跳过 spell） */
function getActiveMonsterForms() {
  const prefs = typeof Storage !== "undefined" && Storage.getChildPrefs
    ? Storage.getChildPrefs()
    : { enableSpelling: true };
  if (prefs.enableSpelling === false) {
    return MONSTER_FORMS.filter((f) => f.skill !== "spell");
  }
  return MONSTER_FORMS.slice();
}

// 当前孩子教材词汇池（用于生成干扰项）
function _courseData() {
  return Catalog.getActiveCourseData();
}
function allVocab() {
  const pool = [];
  _courseData().forEach((g) => g.units.forEach((u) => u.vocab.forEach((v) => pool.push(v))));
  return pool;
}
function allDialogueAnswers() {
  const pool = [];
  _courseData().forEach((g) => g.units.forEach((u) => u.dialogue.forEach((d) => pool.push(d.answer))));
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
    this.sessionDueKeys = reviewEntries.map((e) => e.key);

    this.forms = getActiveMonsterForms();
    this.maxHp = 160;
    this.hp = 160;
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
      this.questionQueue = shuffle(this.reviewEntries.map((e) => this._makeQuestionFromEntry(e)));
      return;
    }
    // 按当前 boss 的技能类型生成题目，确保每个词/句都练到该技能
    const forms = this.forms || getActiveMonsterForms();
    const form = forms[Math.min(this.formIndex, forms.length - 1)];
    const style = form.skill;
    const q = [];

    if (style === "speak") {
      // 口语boss：看单词/句子 → 大声朗读
      this.unit.vocab.forEach((v) => q.push(this._makeVocabQuestion(v, "speak")));
      this.unit.dialogue.forEach((d) => q.push(this._makeDialogueQuestion(d, "speak")));
    } else if (style === "spell") {
      // 拼写boss：看中文 → 拼写英文
      this.unit.vocab.forEach((v) => {
        if (/\s/.test(v.en)) {
          q.push(this._makeVocabQuestion(v, "mc"));
        } else {
          q.push(this._makeVocabQuestion(v, "spell"));
        }
      });
      this.unit.dialogue.forEach((d) => q.push(this._makeDialogueQuestion(d, "mc")));
    } else if (style === "listen") {
      // 听力boss：听英文 → 选中文含义(vocab) / 听问句选回答(dialogue)
      this.unit.vocab.forEach((v) => q.push(this._makeListenQuestion(v)));
      this.unit.dialogue.forEach((d) => q.push(this._makeDialogueListenQuestion(d)));
    } else if (style === "read") {
      // 阅读boss：看英文 → 选出中文含义（反向选择）
      this.unit.vocab.forEach((v) => q.push(this._makeReadQuestion(v)));
      this.unit.dialogue.forEach((d) => q.push(this._makeDialogueReadQuestion(d)));
    } else {
      this.unit.vocab.forEach((v) => q.push(this._makeVocabQuestion(v, "mc")));
      this.unit.dialogue.forEach((d) => q.push(this._makeDialogueQuestion(d, "mc")));
    }
    this.questionQueue = shuffle(q);
  }

  _spawnMonster() {
    const forms = this.forms || getActiveMonsterForms();
    const form = forms[Math.min(this.formIndex, forms.length - 1)];
    const hp = this._calcMonsterHp(this.questionQueue);
    this.monster = {
      ...form,
      maxHp: hp,
      hp,
    };
  }

  /** 战斗加成上下文（武器 + 宠物） */
  _combatCtx() {
    const save = Storage.get();
    return {
      weaponId: Combat.normalizeWeaponId(save?.player?.suit),
      pets: Combat.getDeployedPets(),
    };
  }

  /** 估算单题伤害（与 Combat.calcDamage 对齐，用于计算 BOSS 血量） */
  _estimateDamage(q) {
    return Combat.estimateHit(q, this._combatCtx());
  }

  /** BOSS 血量 = 本题库预估伤害之和 × 余量（随武器/宠物缩放，避免提前击杀） */
  _calcMonsterHp(questions) {
    if (!questions?.length) return 30;
    const total = questions.reduce((s, q) => s + this._estimateDamage(q), 0);
    return Math.max(24, Math.round(total * 1.2));
  }

  // ---- 出题生成 ----
  // style: 'mc' 选择 | 'listen' 听音辨词 | 'spell' 拼写填空 | 'speak' 口语
  _makeVocabQuestion(v, style = "mc") {
    const distractors = pickUniqueValues(
      allVocab().filter((x) => x.en !== v.en).map((x) => x.en),
      v.en,
      3
    );
    const options = buildShuffledOptions(v.en, distractors);
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

  // 听力理解(词汇)：听英文单词 → 选出中文含义
  _makeListenQuestion(v) {
    const distractors = pickUniqueValues(
      allVocab().filter((x) => x.zh !== v.zh).map((x) => x.zh),
      v.zh,
      3
    );
    const options = buildShuffledOptions(v.zh, distractors);
    return {
      type: "vocab",
      style: "listen",
      prompt: "仔细听音频，选出对应的中文含义",
      speak: v.en,
      options,
      correct: v.zh,
      item: v,
    };
  }

  // 听力理解(会话)：听英文问句 → 选出正确的英文回应
  _makeDialogueListenQuestion(d) {
    const distractors = pickUniqueValues(
      allDialogueAnswers().filter((x) => x !== d.answer),
      d.answer,
      3
    );
    const options = buildShuffledOptions(d.answer, distractors);
    return {
      type: "dialogue",
      style: "listen",
      prompt: "听问句，选出正确的回应",
      promptZh: d.zh || "",
      speaker: d.speaker,
      speak: d.prompt,
      options,
      correct: d.answer,
      item: d,
    };
  }

  // 阅读理解题：看英文 → 选中文含义
  _makeReadQuestion(v) {
    const distractors = pickUniqueValues(
      allVocab().filter((x) => x.zh !== v.zh).map((x) => x.zh),
      v.zh,
      3
    );
    const options = buildShuffledOptions(v.zh, distractors);
    return {
      type: "vocab",
      style: "read",
      prompt: v.en,
      promptLabel: "阅读英文",
      speak: v.en,
      options,
      correct: v.zh,
      item: v,
    };
  }

  // 会话阅读理解：看英文问句 → 选中文翻译
  _makeDialogueReadQuestion(d) {
    const allZh = [];
    _courseData().forEach((g) => g.units.forEach((u) => u.dialogue.forEach((x) => { if (x.zh) allZh.push(x.zh); })));
    const distractors = pickUniqueValues(allZh.filter((x) => x !== d.zh), d.zh, 3);
    const options = buildShuffledOptions(d.zh, distractors);
    return {
      type: "dialogue",
      style: "read",
      prompt: d.prompt + (d.answer ? " — " + d.answer : ""),
      promptZh: "",
      speaker: d.speaker,
      promptLabel: "阅读会话",
      speak: dialogueSpeakText(d),
      options,
      correct: d.zh,
      item: d,
    };
  }

  // style: 'mc' 选择 | 'listen' 听音辨句 | 'speak' 口语评测
  _makeDialogueQuestion(d, style = "mc") {
    const distractors = pickUniqueValues(
      allDialogueAnswers().filter((x) => x !== d.answer),
      d.answer,
      3
    );
    const options = buildShuffledOptions(d.answer, distractors);
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

  /** 复习题型：按记忆层级轮换听说读写，避免只会选择题 */
  _reviewStyleForEntry(entry) {
    const prefs = Storage.getChildPrefs();
    const vocabStyles = prefs.enableSpelling
      ? ["mc", "listen", "read", "spell", "speak"]
      : ["mc", "listen", "read", "speak"];
    const dialogueStyles = ["mc", "listen", "read", "speak"];
    const pool = entry.type === "vocab" ? vocabStyles : dialogueStyles;
    let style = pool[(Math.max(1, entry.level) - 1) % pool.length];
    if (entry.type === "vocab" && style === "spell" && /\s/.test(entry.item?.en || "")) {
      style = "read";
    }
    if (style === "spell" && !prefs.enableSpelling) style = "read";
    return style;
  }

  _makeQuestionFromEntry(entry) {
    const style = this._reviewStyleForEntry(entry);
    let q;
    if (entry.type === "vocab") {
      if (style === "listen") q = this._makeListenQuestion(entry.item);
      else if (style === "read") q = this._makeReadQuestion(entry.item);
      else q = this._makeVocabQuestion(entry.item, style);
    } else if (style === "listen") {
      q = this._makeDialogueListenQuestion(entry.item);
    } else if (style === "read") {
      q = this._makeDialogueReadQuestion(entry.item);
    } else {
      q = this._makeDialogueQuestion(entry.item, style);
    }
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
      this._buildQueue();
      if (this.monster) {
        const hp = this._calcMonsterHp(this.questionQueue);
        this.monster.maxHp = hp;
        this.monster.hp = hp;
      }
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
      petDamage: 0,
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

      const ctx = this._combatCtx();
      const petB = Combat.getPetBonuses(ctx.pets);

      // 连击回血：每达到 3 的倍数连击时恢复 HP（鼓励连续答对）
      if (this.combo > 0 && this.combo % 3 === 0) {
        const heal = 8;
        this.hp = Math.min(this.maxHp, this.hp + heal);
        result.heal = heal;
      }

      // 宠物：星尘狐答对回血 / 水晶龙周期回血
      if (petB.healOnCorrect) {
        this.hp = Math.min(this.maxHp, this.hp + petB.healOnCorrect);
        result.petHeal = (result.petHeal || 0) + petB.healOnCorrect;
      }
      if (petB.healEveryN && this.combo > 0 && this.combo % petB.healEveryN === 0 && petB.healEveryAmount) {
        this.hp = Math.min(this.maxHp, this.hp + petB.healEveryAmount);
        result.petHeal = (result.petHeal || 0) + petB.healEveryAmount;
      }

      const critThreshold = Combat.getCritThreshold(ctx.weaponId, ctx.pets);
      const crit = this.combo >= critThreshold;
      result.crit = crit;

      const petDamage = petB.petDamage;
      result.petDamage = petDamage;
      let dmg = Combat.calcDamage(q, {
        weaponId: ctx.weaponId,
        combo: this.combo,
        quality,
        crit,
        petDamage,
      });
      const questionsRemaining = this.questionQueue.length;
      // 推图：本题库未答完前 Boss 不会倒下（高暴击/高伤时血量保底 1）
      if (this.mode !== "review" && questionsRemaining > 0) {
        this.monster.hp = Math.max(1, this.monster.hp - dmg);
      } else {
        this.monster.hp = Math.max(0, this.monster.hp - dmg);
      }
      result.damage = dmg;

      // 水晶碎片奖励（连击越高越多；冰霜武器加成）
      let gain = 1 + Math.floor(this.combo / 3);
      gain = Math.max(1, Math.round(gain * Combat.crystalGainMultiplier(ctx.weaponId)));
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

      // 怪兽死亡 -> 进化（仅推图且本题库已答完；复习模式不因 HP 归零提前结束）
      if (this.mode !== "review" && this.monster.hp <= 0 && questionsRemaining === 0) {
        result.monsterDead = true;
        const forms = this.forms || getActiveMonsterForms();
        if (this.formIndex < forms.length - 1) {
          this.formIndex += 1;
          this._buildQueue();
          this._spawnMonster();
          result.formEvolved = true;
        } else {
          // 最终 BOSS 击杀：清空剩余题目，防止结算前继续出题
          this.questionQueue = [];
        }
      }
    } else {
      Sound.wrong();
      this.combo = 0;
      result.combo = 0;
      // 怪兽反击：扣护盾（降低惩罚，鼓励孩子继续尝试）
      const back = q.type === "dialogue" ? 6 : 4;
      this.hp = Math.max(0, this.hp - back);
      result.selfDamage = back;
      // 答错惩罚：层级重置回 1，高频重刷
      if (q.reviewEntry) {
        ReviewQueue.penalizeEntry(q.reviewEntry);
      } else {
        ReviewQueue.penalize(this.unit.id, q.type, q.item);
      }
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
      // 普通通关：击杀全部形态 BOSS
      const forms = this.forms || getActiveMonsterForms();
      const allBossKilled = this.formIndex >= forms.length - 1 && this.monster.hp <= 0;
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

    if (this.mode === "review" && win) {
      ReviewQueue.completeSession(this.reviewEntries);
      ReviewQueue.consolidate();
    }
    if (this.mode === "campaign" && win) {
      ReviewQueue.deferUnitDue(this.unit.id);
      ReviewQueue.consolidate();
    }

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
    const forms = this.forms || getActiveMonsterForms();
    const form = forms[Math.min(this.formIndex, forms.length - 1)];
    return {
      hp: this.hp,
      maxHp: this.maxHp,
      crystals: this.crystals,
      crystalGoal: CRYSTAL_GOAL,
      combo: this.combo,
      monster: this.monster,
      formIndex: this.formIndex,
      formTotal: forms.length,
      skillLabel: form ? form.skillLabel : "",
    };
  }
}

if (typeof window !== "undefined") {
  window.Battle = Battle;
  window.CRYSTAL_GOAL = CRYSTAL_GOAL;
  window.MONSTER_FORMS = MONSTER_FORMS;
  window.getActiveMonsterForms = getActiveMonsterForms;
}
