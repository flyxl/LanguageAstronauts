/**
 * UI 控制器：负责所有界面渲染与交互
 * 屏幕：主菜单 / 关卡选择 / 战斗 / 结算 / 战功商店 / 星际花园
 */

// ======== 武器系统 ========
const WEAPONS = {
  pulse: {
    name: "脉冲光炮", price: 0,
    desc: "标准配备", ability: "",
    color: "#38bdf8", beam: "linear-gradient(to top, #fff, #38bdf8)",
    beamWidth: 8, critColor: "#67e8f9",
  },
  plasma: {
    name: "等离子双管炮", price: 200,
    desc: "双束齐发，连击加成", ability: "连击伤害+25%",
    color: "#a78bfa", beam: "linear-gradient(to top, #fff, #a78bfa, #7c3aed)",
    beamWidth: 6, critColor: "#c4b5fd",
  },
  flame: {
    name: "烈焰喷射器", price: 350,
    desc: "范围灼烧，恐惧效果", ability: "答对后额外灼烧 5 伤害",
    color: "#f97316", beam: "linear-gradient(to top, #fbbf24, #f97316, #ef4444)",
    beamWidth: 14, critColor: "#fbbf24",
  },
  frost: {
    name: "冰霜水晶炮", price: 500,
    desc: "冻结目标，水晶增幅", ability: "水晶获取+30%",
    color: "#67e8f9", beam: "linear-gradient(to top, #fff, #67e8f9, #06b6d4)",
    beamWidth: 10, critColor: "#a5f3fc",
  },
  thunder: {
    name: "雷神电弧炮", price: 800,
    desc: "闪电毁灭，暴击之王", ability: "暴击率+15%，暴击伤害+50%",
    color: "#fbbf24", beam: "linear-gradient(to top, #fff, #fbbf24, #f59e0b)",
    beamWidth: 12, critColor: "#fde68a",
  },
};


// 宠物系统
const PETS = [
  { id: "star_fox", name: "星尘狐", emoji: "🦊", price: 80, ability: "答对护盾+3", maxLevel: 5, color: "#f97316",
    stages: ["🥚", "🦊", "🦊✨", "🔥🦊", "⭐🦊"] },
  { id: "nebula_cat", name: "星云猫", emoji: "🐱", price: 120, ability: "连击门槛-1（2连开始算暴击）", maxLevel: 5, color: "#a78bfa",
    stages: ["🥚", "🐱", "🐱✨", "💜🐱", "👑🐱"] },
  { id: "crystal_dragon", name: "水晶龙", emoji: "🐉", price: 150, ability: "每3回合自动恢复15护盾", maxLevel: 5, color: "#67e8f9",
    stages: ["🥚", "🐉", "🐉✨", "💎🐉", "🌟🐉"] },
];

// 向后兼容旧存档（suit字段 → weapon字段）
const SUITS = Object.fromEntries(Object.entries(WEAPONS).map(([k,v])=>[k, {...v, emoji: "🔫"}]));

// 段位/军衔系统（累计战功自动晋升）
const RANKS = [
  { name: "见习语航员", icon: "🌑", min: 0, color: "#94a3b8" },
  { name: "三等兵", icon: "🌘", min: 50, color: "#67e8f9" },
  { name: "二等兵", icon: "🌗", min: 150, color: "#38bdf8" },
  { name: "一等兵", icon: "🌖", min: 300, color: "#818cf8" },
  { name: "上等兵", icon: "🌕", min: 600, color: "#a78bfa" },
  { name: "下士", icon: "⭐", min: 1000, color: "#fbbf24" },
  { name: "中士", icon: "⭐⭐", min: 1800, color: "#f59e0b" },
  { name: "上士", icon: "⭐⭐⭐", min: 3000, color: "#f97316" },
  { name: "准尉", icon: "🎖️", min: 5000, color: "#ef4444" },
  { name: "少尉", icon: "🏅", min: 8000, color: "#e879f9" },
  { name: "语航王牌", icon: "👑", min: 15000, color: "#fbbf24" },
];

function getPlayerRank(score) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (score >= r.min) rank = r;
  }
  return rank;
}

function getPetStageEmoji(def, level) {
  if (!def?.stages?.length) return def?.emoji || "🐾";
  return def.stages[Math.min(Math.max(1, level) - 1, def.stages.length - 1)];
}

function getPetVisualScale(level) {
  return 0.82 + Math.min(5, level || 1) * 0.06;
}

// 成就徽章系统
const ACHIEVEMENTS = [
  { id: "first_win", name: "初次解放", desc: "首次通关一个星域", icon: "🎯", check: (s) => Object.values(s.progress).some((p) => p.completed) },
  { id: "combo5", name: "连击达人", desc: "单场达成 5 连击", icon: "🔥", check: (s) => Object.values(s.progress).some((p) => p.bestCombo >= 5) },
  { id: "combo10", name: "连击大师", desc: "单场达成 10 连击", icon: "💥", check: (s) => Object.values(s.progress).some((p) => p.bestCombo >= 10) },
  { id: "perfect1", name: "完美主义", desc: "达成首个完美通关", icon: "⭐", check: (s) => Object.values(s.progress).some((p) => p.perfectClear) },
  { id: "vocab50", name: "词汇猎手", desc: "接触 50 个语言点", icon: "📚", check: (s) => Object.keys(s.mastery).length >= 50 },
  { id: "vocab100", name: "词汇大师", desc: "接触 100 个语言点", icon: "🏆", check: (s) => Object.keys(s.mastery).length >= 100 },
  { id: "units5", name: "星域探索家", desc: "通关 5 个星域", icon: "🌌", check: (s) => Object.values(s.progress).filter((p) => p.completed).length >= 5 },
  { id: "garden3", name: "园艺达人", desc: "培育 3 棵植物至满级", icon: "🌸", check: (s) => s.garden.filter((p) => p.growth >= 3).length >= 3 },
  { id: "rank_star", name: "闪耀星辰", desc: "晋升至一等兵", icon: "🌖", check: (s) => s.player.score >= 300 },
  { id: "score5k", name: "战功赫赫", desc: "累计战功突破 5000", icon: "🎖️", check: (s) => s.player.score >= 5000 },
];

// 保留旧数据结构兼容
const PLANT_SEEDS = {
  glowflower: { name: "辉光花", stages: ["🌱", "🌿", "🌷", "🌸"], price: 80 },
  startree: { name: "星辰树", stages: ["🌱", "🌿", "🪴", "🌳"], price: 120 },
  mooncactus: { name: "月影仙人掌", stages: ["🌱", "🌿", "🌵", "🎋"], price: 150 },
};

const UI = {
  el: null,
  _startingBattle: false,
  _battleStartToken: 0,

  init() {
    this.el = document.getElementById("app");
    this._buildStarfield();
    Storage.load();
    const children = Storage.listChildren();
    if (children.length === 0) {
      this.showCreateChild();
    } else if (children.length > 1) {
      this.showChildPicker();
    } else {
      if (!Storage.getActiveChild()) Storage.switchChild(children[0].id);
      this.showMenu();
    }
  },

  _buildStarfield() {
    const sf = document.getElementById("starfield");
    let html = '<div class="nebula a"></div><div class="nebula b"></div>';
    for (let i = 0; i < 90; i++) {
      const size = Math.random() * 2.5 + 1;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const dur = Math.random() * 3 + 2;
      html += `<span class="star" style="left:${x}%;top:${y}%;width:${size}px;height:${size}px;--dur:${dur}s"></span>`;
    }
    sf.innerHTML = html;
  },

  _render(html) {
    this.el.innerHTML = html;
  },

  // ============ 孩子账号 ============
  showChildPicker() {
    const children = Storage.listChildren();
    const cards = children.map((c) => {
      const tb = Catalog.getTextbook(c.textbookId);
      const grade = Catalog.gradeLabel(c.grade || c.player?.grade || "");
      return `
        <button class="panel p-4 text-left w-full" style="cursor:pointer" onclick="UI.pickChild('${c.id}')">
          <div class="font-bold text-lg">${this._esc(c.name)}</div>
          <div class="text-xs opacity-60 mt-1">${tb.shortName} · ${grade || "未设置年级"}</div>
          <div class="text-xs opacity-40 mt-1">🏅 ${c.player?.score || 0} · 💎 ${c.player?.crystals || 0}</div>
        </button>`;
    }).join("");
    this._render(`
      <div class="screen">
        <div class="text-center mt-8 mb-6">
          <h1 class="text-2xl font-black title-glow">👨‍👩‍👧‍👦 选择小航员</h1>
          <p class="text-sm opacity-70 mt-2">这台设备上有 ${children.length} 位孩子</p>
        </div>
        <div class="grid gap-3">${cards}</div>
        <button class="btn secondary mt-4 w-full" onclick="UI.showCreateChild()">➕ 添加新孩子</button>
      </div>`);
  },

  pickChild(childId) {
    Storage.switchChild(childId);
    this.showMenu();
  },

  showCreateChild() {
    this._createDraft = { name: "", textbookId: "hujiao-oxford-2024", grade: null };
    this._renderCreateChild();
  },

  _renderCreateChild() {
    const d = this._createDraft;
    const tbBtns = Catalog.listTextbooks().map((t) =>
      `<button class="panel p-3 text-left ${d.textbookId === t.id ? "ring-2 ring-sky-400" : ""}" style="cursor:pointer" onclick="UI._setCreateTextbook('${t.id}')">
        <div class="font-bold text-sm">${t.name}</div>
        <div class="text-xs opacity-50 mt-1">${t.subtitle}</div>
      </button>`
    ).join("");
    const grades = Catalog.gradesFor(d.textbookId);
    const gradeBtns = grades.map((g) =>
      `<button class="panel p-2 text-center ${d.grade === g ? "ring-2 ring-sky-400" : ""}" style="cursor:pointer" onclick="UI._setCreateGrade('${g}')">
        <div class="font-bold text-sm">${Catalog.gradeLabel(g)}</div>
        <div class="text-xs opacity-50">${g}</div>
      </button>`
    ).join("");
    const canSubmit = d.name.trim() && d.textbookId && d.grade;
    this._render(`
      <div class="screen">
        <div class="text-center mt-6 mb-4">
          <h1 class="text-2xl font-black title-glow">🚀 创建小航员</h1>
          <p class="text-sm opacity-70 mt-2">取个名字，选择教材和年级</p>
        </div>
        <div class="panel p-4 mb-3">
          <label class="text-xs opacity-60">我的名字</label>
          <input id="child-name-input" class="w-full mt-1 p-3 rounded-lg bg-black/30 border border-white/10 text-lg" placeholder="例如：小明" maxlength="12"
            value="${this._esc(d.name)}" oninput="UI._setCreateName(this.value)" />
        </div>
        <p class="text-xs opacity-60 mb-2">选择教材</p>
        <div class="grid gap-2 mb-4">${tbBtns}</div>
        <p class="text-xs opacity-60 mb-2">选择年级 / 学期</p>
        <div class="grid grid-cols-2 gap-2 mb-4">${gradeBtns}</div>
        <button class="btn w-full ${canSubmit ? "" : "opacity-40"}" ${canSubmit ? "" : "disabled"} onclick="UI.submitCreateChild()">开始探险 ✨</button>
        ${Storage.listChildren().length ? `<button class="btn secondary mt-3 w-full" onclick="UI.showChildPicker()">返回选择</button>` : ""}
      </div>`);
    setTimeout(() => {
      const inp = document.getElementById("child-name-input");
      if (inp) inp.focus();
    }, 50);
  },

  _setCreateName(v) { this._createDraft.name = v; },
  _setCreateTextbook(id) {
    this._createDraft.textbookId = id;
    this._createDraft.grade = null;
    this._renderCreateChild();
  },
  _setCreateGrade(g) {
    this._createDraft.grade = g;
    this._renderCreateChild();
  },

  submitCreateChild() {
    const d = this._createDraft;
    if (!d.name.trim() || !d.textbookId || !d.grade) return;
    Storage.createChild({ name: d.name.trim(), textbookId: d.textbookId, grade: d.grade });
    this.showMenu();
  },

  _esc(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  },

  // ============ 切换年级（当前孩子） ============
  showChangeGrade() {
    const ctx = Storage.getContext();
    const grades = Catalog.gradesFor(ctx.textbookId);
    const btns = grades.map((g) =>
      `<button class="panel p-3 text-center" style="cursor:pointer" onclick="UI.selectGrade('${g}')">
        <div class="font-bold">${Catalog.gradeLabel(g)}</div>
        <div class="text-xs opacity-60">${g}</div>
      </button>`
    ).join("");
    this._render(`
      <div class="screen">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-xl font-black title-glow">📍 切换年级</h1>
          <button class="btn secondary" onclick="UI.showMenu()">返回</button>
        </div>
        <p class="text-xs opacity-50 mb-3">${Catalog.getTextbook(ctx.textbookId).name}</p>
        <div class="grid grid-cols-2 gap-3">${btns}</div>
      </div>`);
  },

  selectGrade(gradeId) {
    const ctx = Storage.getContext();
    Storage.updateChild(ctx.childId, { grade: gradeId });
    this.showMenu();
  },

  // 兼容旧入口
  showOnboarding() {
    this.showChangeGrade();
  },

  // ============ 顶部资源条 ============
  _topBar() {
    const save = Storage.get();
    if (!save) return "";
    const p = save.player;
    const due = ReviewQueue.dueCount();
    const rank = getPlayerRank(p.score);
    return `
      <div class="flex items-center justify-between gap-2 mb-3">
        <div class="flex gap-2 flex-wrap">
          <span class="chip"><span style="display:inline-block;width:18px;height:18px;vertical-align:middle;overflow:hidden">${getWeaponImg(p.suit, 18)}</span> <span style="color:${rank.color}">${rank.icon} ${rank.name}</span></span>
          <span class="chip" style="color:var(--gold)">🏅 ${p.score}</span>
          <span class="chip" style="color:var(--crystal)">💎 ${p.crystals}</span>
        </div>
        ${due > 0 ? `<span class="chip" style="color:var(--danger)"><span class="review-dot"></span> 警报 ${due}</span>` : ""}
      </div>`;
  },

  // ============ 主菜单 ============
  showMenu() {
    Sound._ensure();
    const save = Storage.get();
    if (!save) { this.showCreateChild(); return; }
    const due = ReviewQueue.dueCount();
    const p = save.player;
    const ctx = Storage.getContext();
    const tb = Catalog.getTextbook(ctx.textbookId);
    const gradeLabel = Catalog.gradeLabel(ctx.grade || p.grade || "");
    const childCount = Storage.listChildren().length;
    this._render(`
      <div class="screen">
        ${this._topBar()}
        <div class="panel text-center p-6 mt-6">
          <div class="ship-hero" style="position:relative">${getShipSVG("classic", 100)}<div style="position:absolute;bottom:0;right:-10px;width:36px;height:36px;overflow:hidden">${getWeaponImg(p.suit, 36)}</div></div>
          <h1 class="text-3xl font-black title-glow mt-2">${this._esc(ctx.name || p.name)}</h1>
          <p class="text-sm opacity-70 mt-1">时空语航员 · ${tb.shortName}</p>
          ${gradeLabel ? `<p class="text-xs mt-2"><span class="chip" style="cursor:pointer" onclick="UI.showChangeGrade()">📍 ${gradeLabel} <span class="opacity-60">切换</span></span></p>` : ""}
          <div class="grid gap-3 mt-5">
            <button class="btn" onclick="UI.showLevelSelect()">🌌 星图远征</button>
            ${due > 0 ? `<button class="btn gold animate__animated animate__pulse animate__infinite" onclick="UI.startReview()">🚨 红色警报突袭 (${due})</button>` : ""}
            <div class="grid grid-cols-2 gap-3">
              <button class="btn secondary" onclick="UI.showStore()">⚔️ 武器库</button>
              <button class="btn secondary" onclick="UI.showPets()">🐾 宠物舱</button>
            </div>
            <button class="btn secondary" onclick="UI.showStats()">📊 学情数据</button>
            <button class="btn secondary" onclick="UI.showSettings()">⚙️ 设置</button>
            ${childCount > 1 ? `<button class="btn secondary" onclick="UI.showChildPicker()">👨‍👩‍👧‍👦 切换孩子</button>` : ""}
            <button class="btn secondary" onclick="UI.showCreateChild()">➕ 添加孩子</button>
          </div>
        </div>
        <p class="text-center text-xs opacity-30 mt-4">0 广告 · 0 内购 · 体力靠学习获取</p>
      </div>`);
  },

  // ============ 关卡选择（星图） ============
  showLevelSelect(showAllGrades) {
    if (showAllGrades === undefined) this._showAllGrades = false;
    else this._showAllGrades = !!showAllGrades;
    const ctx = Storage.getContext();
    const course = Catalog.getActiveCourseData();
    const currentGrade = ctx.grade || Storage.get().player.grade || "3A";
    let body = "";
    course.forEach((grade) => {
      const isCurrentGrade = grade.id === currentGrade;
      if (!this._showAllGrades && !isCurrentGrade) return;
      const expanded = isCurrentGrade || this._showAllGrades;
      body += `
        <div class="mt-3">
          <div class="panel p-2 flex items-center justify-between" style="cursor:pointer;${isCurrentGrade ? 'border-color:var(--accent)' : ''}" onclick="UI._toggleGrade('${grade.id}')">
            <h2 class="font-bold ${isCurrentGrade ? '' : 'opacity-70'}">${isCurrentGrade ? '📍 ' : ''}${grade.name}</h2>
            <span class="text-xs opacity-60" id="grade-arrow-${grade.id}">${expanded ? '▼' : '▶'}</span>
          </div>
          <div class="grid gap-2 mt-2" id="grade-body-${grade.id}" style="${expanded ? '' : 'display:none'}">`;
      grade.units.forEach((unit) => {
        const prog = Storage.getUnitProgress(unit.id);
        const pct = Math.round((prog.crystals / CRYSTAL_GOAL) * 100);
        body += `
            <div class="panel unit-card" onclick="UI.startCampaign('${unit.id}')" style="cursor:pointer">
              ${prog.perfectClear ? '<span class="badge-done">⭐ 完美通关</span>' : prog.completed ? '<span class="badge-done" style="background:#38bdf8;color:#0c1a33">已解放 ✓</span>' : ""}
              <div class="flex items-center gap-3">
                <div class="text-2xl">🪐</div>
                <div class="flex-1">
                  <div class="font-bold text-sm">${unit.name}</div>
                  <div class="text-xs opacity-60">${unit.theme} · 词汇 ${unit.vocab.length} · 会话 ${unit.dialogue.length}</div>
                  <div class="crystal-bar"><i style="width:${pct}%"></i></div>
                </div>
                <div class="text-xs opacity-70" style="color:var(--crystal)">💎${prog.crystals}/${CRYSTAL_GOAL}</div>
              </div>
            </div>`;
      });
      body += `</div></div>`;
    });
    const moreBtn = this._showAllGrades
      ? `<button class="btn secondary w-full mt-3" onclick="UI.showLevelSelect(false)">📍 只看当前学期 (${Catalog.gradeLabel(currentGrade)})</button>`
      : `<button class="btn secondary w-full mt-3" onclick="UI.showLevelSelect(true)">📚 更多学期</button>`;
    this._render(`
      <div class="screen">
        ${this._topBar()}
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-black title-glow">🌌 星图远征</h1>
          <button class="btn secondary" onclick="UI.showMenu()">返回</button>
        </div>
        <p class="text-xs opacity-50 mt-1">${Catalog.getTextbook(ctx.textbookId).name}</p>
        <div class="scrollable">${body}${moreBtn}</div>
        <div class="h-6"></div>
      </div>`);
  },

  _toggleGrade(gradeId) {
    const body = document.getElementById("grade-body-" + gradeId);
    const arrow = document.getElementById("grade-arrow-" + gradeId);
    if (!body) return;
    const visible = body.style.display !== "none";
    body.style.display = visible ? "none" : "";
    if (arrow) arrow.textContent = visible ? "▶" : "▼";
  },

  // ============ 启动战斗 ============
  startCampaign(unitId) {
    const unit = this._findUnit(unitId);
    if (!unit) return;
    if (this._startingBattle) return;
    if (this.battle && !this.battle.finished && this.battle.mode === "campaign" && this.battle.unit?.id === unitId) {
      return;
    }
    this._startingBattle = true;
    const token = ++this._battleStartToken;
    Combat.ensureDeployedPets();
    this.battle = new Battle(unit, "campaign");
    this._announceBattleReady().then(() => {
      if (this._battleStartToken !== token) return;
      if (!this.battle || this.battle.finished) return;
      this._renderBattle();
    }).finally(() => {
      if (this._battleStartToken === token) this._startingBattle = false;
    });
  },

  startReview() {
    if (this._startingBattle) return;
    ReviewQueue.consolidate();
    const due = ReviewQueue.getDueSession();
    if (!due.length) {
      this.showMenu();
      return;
    }
    this._startingBattle = true;
    const token = ++this._battleStartToken;
    Combat.ensureDeployedPets();
    // 复习突袭：合并所有到期条目，一次清剿完毕
    const course = Catalog.getActiveCourseData();
    const unit = this._findUnit(due[0].unitId) || course[0]?.units[0];
    this.battle = new Battle(unit, "review", due);
    this._showAlert(due[0], () => {
      if (this._battleStartToken !== token) {
        this._startingBattle = false;
        return;
      }
      this._announceBattleReady().then(() => {
        if (this._battleStartToken !== token) return;
        if (!this.battle || this.battle.finished) return;
        this._renderBattle();
      }).finally(() => {
        if (this._battleStartToken === token) this._startingBattle = false;
      });
    });
  },

  /** 战斗开始前语音：军衔 + 孩子名字 */
  _announceBattleReady() {
    if (!this.battle || this.battle._announcedReady) return Promise.resolve();
    this.battle._announcedReady = true;
    const ctx = Storage.getContext();
    const p = Storage.get()?.player;
    const rank = getPlayerRank(p?.score || 0);
    const name = (ctx.name || p?.name || "小航员").trim();
    return Sound.narrate(`${rank.name}${name}，准备好干掉 Boss 了吗？`, { rate: 1.05, pitch: 1.2 });
  },

  _findUnit(unitId) {
    return Catalog.findUnitActive(unitId);
  },

  // 红色警报突袭横幅
  _showAlert(entry, cb) {
    const threat = EBBINGHAUS.threatByLevel[entry.level] || EBBINGHAUS.threatByLevel[1];
    Sound.alarm();
    const banner = document.createElement("div");
    banner.className = "alert-banner";
    banner.innerHTML = `
      <div class="text-center animate__animated animate__zoomIn">
        <div style="font-size:72px">${threat.monster}</div>
        <div class="text-2xl font-black" style="color:${threat.color}">⚠️ ${threat.label}</div>
        <div class="opacity-90 mt-1">${threat.desc}</div>
      </div>`;
    document.body.appendChild(banner);
    Sound.narrate(`红色警报！${threat.label}！怪兽来袭！`, { rate: 1.15, pitch: 1.1 }).then(() => {
      banner.remove();
      cb();
    });
  },

  // ============ 战斗界面 ============
  _renderBattle() {
    const b = this.battle;
    const q = b.next();
    if (!q) {
      this._renderResult();
      return;
    }
    const st = b.status();
    const modeLabel = b.mode === "review" ? "🚨 复习突袭" : `🪐 ${b.unit.name}`;

    const STYLE_LABEL = {
      mc: q.type === "dialogue" ? "🗣️ 角色扮演" : "🎯 弹药选择",
      listen: "🎧 听音辨词",
      read: "📖 阅读理解",
      spell: "⌨️ 拼写填空",
      speak: "🎤 口语评测",
    };
    const styleBadge = `<div class="chip" style="font-size:12px;padding:3px 10px;position:absolute;right:10px;top:-12px">${STYLE_LABEL[q.style] || ""}</div>`;
    const speakBtn = `<button class="chip" style="position:absolute;left:10px;top:-12px" onclick="Sound.speak('${(q.speak || "").replace(/'/g, "")}')">🔊</button>`;

    let promptHtml, answersHtml;

    if (q.style === "listen") {
      // 听力理解：听音频选答案
      const listenHint = q.type === "dialogue"
        ? "听英文问句，选出正确的回应："
        : "听英文单词，选出中文含义：";
      promptHtml = `
        <div class="text-xs opacity-60 mb-2">${listenHint}</div>
        <button class="btn gold" style="margin:0 auto;font-size:18px;padding:12px 24px" onclick="Sound.speak('${(q.speak || "").replace(/'/g, "")}')">🔊 播放音频</button>
        <div class="text-xs opacity-40 mt-2">点击播放按钮听发音，然后选择答案</div>`;
      answersHtml = q.options.map((o, i) => `<button class="missile" data-i="${i}" onclick="UI.choose(${i}, this)">${o}</button>`).join("");
    } else if (q.style === "spell") {
      const prefs = Storage.getChildPrefs();
      const useKeyboard = prefs.spellInputMode === "keyboard";
      promptHtml = `
        <div class="text-xs opacity-60 mb-1">为这个怪兽密码拼出英文：</div>
        <div class="text-2xl font-black" style="color:var(--gold)">${q.prompt}</div>
        ${useKeyboard
          ? `<input id="spell-input" class="spell-input" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" inputmode="text" placeholder="在此输入英文单词" />`
          : `<div id="spell-slots" class="flex justify-center gap-1 mt-3 flex-wrap" style="min-height:40px"></div>`
        }`;
      answersHtml = useKeyboard
        ? `<div class="grid grid-cols-2 gap-3 mt-3">
             <button class="btn secondary" onclick="UI.spellKeyboardClear()">清空</button>
             <button class="btn" id="fire-btn" onclick="UI.spellKeyboardFire()">🚀 发射</button>
           </div>
           <p class="text-xs opacity-40 mt-2 text-center">可用键盘输入，回车发射</p>`
        : `<div class="flex flex-wrap justify-center gap-2" id="letter-tray">
          ${q.letters.map((c, i) => `<button class="missile" style="min-width:44px;min-height:44px;padding:8px;font-size:20px" data-li="${i}" onclick="UI.spellTap(${i}, this)">${c}</button>`).join("")}
        </div>
        <div class="grid grid-cols-2 gap-3 mt-3">
          <button class="btn secondary" onclick="UI.spellBackspace()">⌫ 退格</button>
          <button class="btn" id="fire-btn" onclick="UI.spellFire()">🚀 发射</button>
        </div>`;
    } else if (q.style === "speak") {
      // 口语评测：麦克风发音评分
      const isVocab = q.type === "vocab";
      promptHtml = isVocab
        ? `<div class="text-xs opacity-60 mb-1">看中文，大声读出英文：</div>
           <div class="text-xl font-bold">${q.prompt}</div>
           <div class="mt-2 p-2 rounded-lg" style="background:rgba(56,189,248,0.12)">
             <div class="text-xs opacity-60">请朗读这个单词：</div>
             <div class="text-2xl font-black" style="color:var(--accent)">${q.correct}</div>
           </div>
           <div id="speak-status" class="text-sm mt-2 opacity-70">点击麦克风录音，完成后回放并评分</div>`
        : `<div class="flex items-center justify-center gap-2 mb-1">${getNpcSVG(q.speaker || "Peter", 28)}<span class="text-xs opacity-60">${q.speaker || "NPC"} 说：</span></div>
           <div class="text-lg font-bold">${q.prompt}</div>
           <div class="text-sm opacity-60 mt-1">${q.promptZh || ""}</div>
           <div class="mt-2 p-2 rounded-lg" style="background:rgba(56,189,248,0.12)">
             <div class="text-xs opacity-60">请大声读出回应：</div>
             <div class="text-xl font-black" style="color:var(--accent)">${q.correct}</div>
           </div>
           <div id="speak-status" class="text-sm mt-2 opacity-70">点击麦克风录音，完成后回放并评分</div>`;
      answersHtml = `<div class="grid grid-cols-2 gap-3">
             <button class="btn gold" id="mic-btn" onclick="UI.openRecordOverlay()">🎤 开始朗读</button>
             <button class="btn secondary" onclick="UI.skipSpeak()">跳过朗读</button>
           </div>`;
    } else if (q.type === "dialogue") {
      // 角色扮演：选择最合适回应
      promptHtml = `
        <div class="flex items-center justify-center gap-2 mb-1">${getNpcSVG(q.speaker || "Peter", 28)}<span class="text-xs opacity-60">${q.speaker || "NPC"} 说：</span></div>
        <div class="text-xl font-bold">${q.prompt}</div>
        <div class="text-sm opacity-60 mt-1">${q.promptZh || ""}</div>
        <div class="text-xs opacity-50 mt-2">选择最合适的回应，发射激光炮 →</div>`;
      answersHtml = q.options.map((o, i) => `<button class="missile" data-i="${i}" onclick="UI.choose(${i}, this)">${o}</button>`).join("");
    } else if (q.style === "read") {
      // 阅读理解：看英文选中文
      promptHtml = q.type === "dialogue"
        ? `<div class="flex items-center justify-center gap-2 mb-1">${getNpcSVG(q.speaker || "Peter", 28)}<span class="text-xs opacity-60">阅读这段会话：</span></div>
           <div class="text-lg font-bold" style="color:var(--accent)">${q.prompt}</div>
           <div class="text-xs opacity-50 mt-2">选择正确的中文含义 →</div>`
        : `<div class="text-xs opacity-60 mb-1">阅读英文：</div>
           <div class="text-2xl font-black" style="color:var(--accent)">${q.prompt}</div>
           <div class="text-xs opacity-50 mt-2">选择正确的中文含义 →</div>`;
      answersHtml = q.options.map((o, i) => `<button class="missile" data-i="${i}" onclick="UI.choose(${i}, this)">${o}</button>`).join("");
    } else {
      // 词汇选择（看中文选英文）
      promptHtml = `
        <div class="text-xs opacity-60 mb-1">怪兽身上的密码：</div>
        <div class="text-2xl font-black" style="color:var(--gold)">${q.prompt}</div>
        <div class="text-xs opacity-50 mt-2">选择正确的英文导弹击中它 →</div>`;
      answersHtml = q.options.map((o, i) => `<button class="missile" data-i="${i}" onclick="UI.choose(${i}, this)">${o}</button>`).join("");
    }

    const useGrid = q.style === "mc" || q.style === "listen" || q.style === "read";

    this._render(`
      <div class="screen">
        <div class="flex items-center justify-between mb-2">
          <span class="chip">${modeLabel}</span>
          <button class="btn secondary" style="padding:8px 14px" onclick="UI.quitBattle()">撤退</button>
        </div>

        <!-- 战场 -->
        <div class="panel battle-stage" id="stage">
          <div class="combo-pop" id="combo" style="${st.combo >= 2 ? "" : "display:none"}">Combo x${st.combo}</div>
          <div class="monster" id="monster">${getMonsterSVG(st.monster.id, 96)}</div>
          ${this._battlePetsHtml()}
          <div class="player-ship" id="ship">
            ${getShipSVG("classic", 56)}
            <div style="position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);width:28px;height:28px;overflow:hidden">${getWeaponImg(Storage.get().player.suit, 28)}</div>
          </div>
        </div>

        <!-- 怪兽信息 + 血条 -->
        <div class="mt-2">
          <div class="flex justify-between text-xs mb-1">
            <span>${st.monster.name} (${st.formIndex + 1}/${st.formTotal}) <span style="color:${st.monster.color}">· ${st.skillLabel || ""}</span></span>
            <span id="mhp-text">${st.monster.hp}/${st.monster.maxHp}</span>
          </div>
          <div class="hpbar monster-hp"><i id="mhp" style="width:${(st.monster.hp / st.monster.maxHp) * 100}%"></i></div>
        </div>

        <!-- 飞船护盾 + 水晶 -->
        <div class="grid grid-cols-2 gap-3 mt-2">
          <div>
            <div class="flex justify-between text-xs mb-1"><span>🛡️ 护盾 HP</span><span id="hp-text">${st.hp}/${st.maxHp}</span></div>
            <div class="hpbar ship-hp"><i id="hp" style="width:${st.hp}%"></i></div>
          </div>
          <div>
            <div class="flex justify-between text-xs mb-1"><span style="color:var(--crystal)">💎 水晶碎片</span><span id="cr-text">${st.crystals}/${st.crystalGoal}</span></div>
            <div class="hpbar"><i id="cr" style="width:${(st.crystals / st.crystalGoal) * 100}%;background:linear-gradient(90deg,var(--crystal),var(--accent2))"></i></div>
          </div>
        </div>

        <!-- 武器舱 -->
        <div class="panel p-4 mt-4 text-center" id="weapon-bay" style="position:relative">
          ${q.style === "listen" ? "" : speakBtn}
          ${styleBadge}
          ${promptHtml}
        </div>

        <!-- 弹药区 -->
        <div class="${useGrid ? "answer-grid" : ""} mt-3" id="answers">
          ${answersHtml}
        </div>
      </div>`);

    this._currentOptions = q.options;
    this._spellBuffer = [];
    this._locked = false;

    // 听音辨词：进入即自动播放一次发音
    if (q.style === "listen") {
      setTimeout(() => Sound.speak(q.speak), 350);
    }
    if (q.style === "spell") {
      const prefs = Storage.getChildPrefs();
      if (prefs.spellInputMode === "keyboard") {
        this._bindSpellKeyboard();
      } else {
        this._renderSpellSlots();
      }
    }
  },

  choose(i, elBtn) {
    if (this._locked) return;
    this._locked = true;
    const b = this.battle;
    const choice = this._currentOptions[i];
    const res = b.answer(choice);

    // 视觉反馈（选项染色）
    const buttons = Array.from(document.querySelectorAll("#answers .missile"));
    buttons.forEach((btn) => {
      if (btn.dataset.i === undefined) return;
      const opt = this._currentOptions[+btn.dataset.i];
      if (opt === res.question.correct) btn.classList.add("right");
      else if (btn === elBtn && !res.correct) btn.classList.add("wrong");
      else btn.classList.add("dim");
    });

    this._afterAnswer(res);
  },

  // ---- 拼写填空 ----
  spellTap(li, btn) {
    if (this._locked) return;
    if (btn.classList.contains("dim")) return;
    btn.classList.add("dim");
    this._spellBuffer.push({ li, char: btn.textContent });
    this._renderSpellSlots();
  },

  spellBackspace() {
    if (this._locked) return;
    const last = this._spellBuffer.pop();
    if (last) {
      const btn = document.querySelector(`#letter-tray [data-li="${last.li}"]`);
      if (btn) btn.classList.remove("dim");
    }
    this._renderSpellSlots();
  },

  _renderSpellSlots() {
    const slots = document.getElementById("spell-slots");
    if (!slots) return;
    const word = this._spellBuffer.map((x) => x.char).join("");
    slots.innerHTML =
      word
        .split("")
        .map((c) => `<span class="chip" style="min-width:28px;justify-content:center;font-size:20px">${c}</span>`)
        .join("") || `<span class="opacity-40 text-sm">点击字母拼出单词…</span>`;
  },

  spellFire() {
    if (this._locked) return;
    const word = this._spellBuffer.map((x) => x.char).join("");
    if (!word) return;
    this._locked = true;
    const res = this.battle.answer(word);
    // 反馈：显示正确答案
    const slots = document.getElementById("spell-slots");
    if (slots) {
      slots.innerHTML = `<span class="chip" style="color:${res.correct ? "var(--ok)" : "var(--danger)"};font-size:18px">${res.correct ? "✓ " + word : "✗ 正确：" + res.question.correct}</span>`;
    }
    this._afterAnswer(res);
  },

  _bindSpellKeyboard() {
    const input = document.getElementById("spell-input");
    if (!input) return;
    input.value = "";
    input.onkeydown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.spellKeyboardFire();
      }
    };
    setTimeout(() => {
      try { input.focus(); } catch (err) {}
    }, 80);
  },

  spellKeyboardClear() {
    if (this._locked) return;
    const input = document.getElementById("spell-input");
    if (input) {
      input.value = "";
      input.focus();
    }
  },

  spellKeyboardFire() {
    if (this._locked) return;
    const input = document.getElementById("spell-input");
    const word = (input?.value || "").trim();
    if (!word) return;
    this._locked = true;
    if (input) input.disabled = true;
    const res = this.battle.answer(word);
    if (input) {
      input.value = res.correct ? word : res.question.correct;
      input.classList.toggle("spell-input-ok", !!res.correct);
      input.classList.toggle("spell-input-bad", !res.correct);
    }
    this._afterAnswer(res);
  },

  // ---- 口语评测（录音 → 回放 → 评分 → 确认发射） ----
  openRecordOverlay() {
    if (this._locked) return;
    this._resetRecState();
    this._recSrUnsupported = !(window.SpeechRecognition || window.webkitSpeechRecognition);
    this._recDone = false;
    this._recResult = null;
    this._recHasAudio = false;
    this._recStartTime = Date.now();
    this._recCountdown = 60;

    const overlay = document.createElement("div");
    overlay.id = "rec-overlay";
    overlay.innerHTML = `
      <div class="rec-overlay-bg">
        <div class="rec-overlay-card">
          <div class="rec-wave-box" id="rec-wave">
            <div class="rec-wave-bar"></div><div class="rec-wave-bar"></div><div class="rec-wave-bar"></div>
            <div class="rec-wave-bar"></div><div class="rec-wave-bar"></div><div class="rec-wave-bar"></div>
            <div class="rec-wave-bar"></div><div class="rec-wave-bar"></div><div class="rec-wave-bar"></div>
          </div>
          <div class="rec-timer" id="rec-timer">${this._recCountdown}s</div>
          <div class="rec-hint" id="rec-hint">正在录音，请大声朗读…</div>
        </div>
        <button class="rec-stop-btn" id="rec-stop-btn" onclick="UI._stopRecording(false)">✓ 完成录音</button>
        <button class="rec-retry-btn" onclick="UI._stopRecording(true)">取消</button>
      </div>`;
    document.body.appendChild(overlay);

    this._recTimer = setInterval(() => {
      this._recCountdown--;
      const timerEl = document.getElementById("rec-timer");
      if (timerEl) timerEl.textContent = this._recCountdown + "s";
      if (this._recCountdown <= 0) this._stopRecording(false);
    }, 1000);

    this._startAudioCapture();
  },

  _startSpeechRecognition() {
    if (this._recSrUnsupported || this._recStopping || this._recReviewing) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      this._recSrUnsupported = true;
      this._recSrEnded = true;
      return;
    }
    try {
      const rec = new SR();
      rec.lang = "en-US";
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 3;
      this._speakRec = rec;

      rec.onresult = (e) => {
        const alts = new Set(this._recResult || []);
        for (let i = 0; i < e.results.length; i++) {
          for (let j = 0; j < e.results[i].length; j++) {
            const t = e.results[i][j].transcript.trim();
            if (t) alts.add(t);
          }
        }
        this._recResult = Array.from(alts);
        this._recDone = this._recResult.length > 0;
        if (this._recReviewing) this._trySpeakScoring();
      };

      rec.onerror = (err) => {
        const code = err?.error || "error";
        this._recSrError = code;
        if (code === "not-allowed" || code === "service-not-allowed") {
          this._recSrUnsupported = true;
        }
      };

      rec.onend = () => {
        this._recSrEnded = true;
        if (this._recReviewing) {
          this._trySpeakScoring();
          return;
        }
        if (!this._recStopping && this._speakRec === rec) {
          try { rec.start(); } catch (e) {}
        }
      };

      rec.start();
    } catch (err) {
      this._recSrUnsupported = true;
      this._recSrEnded = true;
      this._speakRec = null;
    }
  },

  _startAudioCapture() {
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) return;
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      if (this._recStopping || this._recReviewing) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      this._recStream = stream;
      this._recChunks = [];
      const mimeCandidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", ""];
      let mimeType = "";
      for (const m of mimeCandidates) {
        if (!m || (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m))) {
          mimeType = m;
          break;
        }
      }
      this._recMimeType = mimeType || "audio/webm";
      if (typeof MediaRecorder !== "undefined") {
        try {
          this._mediaRecorder = mimeType
            ? new MediaRecorder(stream, { mimeType })
            : new MediaRecorder(stream);
          this._mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) this._recChunks.push(e.data);
          };
          this._mediaRecorder.start(200);
        } catch (e) {
          this._mediaRecorder = null;
        }
      }
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const src = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        src.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);
        this._recAudioCtx = audioCtx;
        const check = () => {
          if (this._recStopping || this._recReviewing) return;
          analyser.getByteFrequencyData(data);
          const avg = data.reduce((a, b) => a + b, 0) / data.length;
          if (avg > 10) this._recHasAudio = true;
          requestAnimationFrame(check);
        };
        check();
      } catch (e) {}
      this._startSpeechRecognition();
    }).catch(() => {
      const hint = document.getElementById("rec-hint");
      if (hint) hint.textContent = "无法访问麦克风，请检查浏览器权限";
    });
  },

  _stopRecording(cancelled) {
    if (this._recStopping) return;
    this._recStopping = true;
    clearInterval(this._recTimer);

    if (this._speakRec) {
      try { this._speakRec.stop(); } catch (e) {}
    }

    if (cancelled) {
      this._abortRecording(true);
      return;
    }

    const duration = Date.now() - this._recStartTime;
    const minDuration = 800;

    const enterReview = (blob) => {
      if (duration < minDuration || (!this._recHasAudio && (!blob || blob.size < 100))) {
        this._abortRecording(false);
        const status = document.getElementById("speak-status");
        if (status) {
          status.innerHTML = '<span style="color:var(--danger)">录音太短或未检测到声音，请重新朗读</span>';
        }
        return;
      }
      this._recReviewing = true;
      this._showRecordingReview(blob, duration);
    };

    if (this._mediaRecorder && this._mediaRecorder.state !== "inactive") {
      this._mediaRecorder.onstop = () => {
        const blob = this._recChunks.length
          ? new Blob(this._recChunks, { type: this._recMimeType || "audio/webm" })
          : null;
        enterReview(blob);
      };
      try {
        this._mediaRecorder.stop();
      } catch (e) {
        enterReview(null);
      }
    } else {
      enterReview(null);
    }
  },

  _showRecordingReview(blob, duration) {
    const overlay = document.getElementById("rec-overlay");
    if (!overlay) {
      this._resetRecState();
      return;
    }

    let playbackHtml = "";
    if (blob && blob.size > 0) {
      if (this._recBlobUrl) URL.revokeObjectURL(this._recBlobUrl);
      this._recBlobUrl = URL.createObjectURL(blob);
      this._recBlob = blob;
      playbackHtml = `<audio id="rec-playback" class="rec-playback" controls playsinline src="${this._recBlobUrl}"></audio>`;
    } else {
      playbackHtml = `<p class="rec-playback-fallback">浏览器不支持录音回放，将根据语音识别结果评分</p>`;
    }

    overlay.innerHTML = `
      <div class="rec-overlay-bg">
        <div class="rec-overlay-card rec-review-card">
          <div class="rec-hint rec-review-title">🔊 回放你的朗读</div>
          ${playbackHtml}
          <div id="rec-score-area" class="rec-score-area"><span class="opacity-60">正在评分…</span></div>
        </div>
        <div class="rec-review-actions" id="rec-review-actions" style="display:none">
          <button class="rec-stop-btn rec-confirm-btn" id="rec-confirm-btn" onclick="UI._confirmSpeakFire()">🚀 确认发射</button>
          <button class="rec-retry-btn" onclick="UI._retrySpeakRecording()">🔄 重新录音</button>
        </div>
      </div>`;

    const audio = document.getElementById("rec-playback");
    if (audio) {
      audio.play().catch(() => {});
      audio.onended = () => {
        if (!this._recScoreReady) this._trySpeakScoring(true);
      };
    }

    this._beginSpeakScoring();
  },

  _beginSpeakScoring() {
    this._recReviewStart = Date.now();
    if (this._recSrUnsupported) {
      setTimeout(() => this._trySpeakScoring(true), 400);
      return;
    }
    const poll = () => {
      this._trySpeakScoring(false);
      if (!this._recScoreReady) this._recScorePollTimer = setTimeout(poll, 250);
    };
    this._recScorePollTimer = setTimeout(poll, 400);
  },

  _trySpeakScoring(force) {
    if (!this._recReviewing || this._recScoreReady) return;
    const elapsed = Date.now() - (this._recReviewStart || Date.now());
    const hasResult = !!(this._recResult && this._recResult.length);
    const srSettled = this._recSrEnded || this._recSrUnsupported;
    if (hasResult || force || (srSettled && elapsed >= 1000) || elapsed >= 6000) {
      this._runSpeakScoring();
    }
  },

  _runSpeakScoring() {
    if (this._recScoreReady) return;
    this._recScoreReady = true;
    if (this._recScorePollTimer) {
      clearTimeout(this._recScorePollTimer);
      this._recScorePollTimer = null;
    }

    const target = this.battle.current.correct;
    let quality = 0;
    let heard = "";

    if (this._recResult?.length) {
      quality = this._scorePronunciation(target, this._recResult);
      heard = this._recResult[0];
      this._recQuality = quality;
      this._recHeard = heard;
      this._renderAutoSpeakScore(quality, heard);
      return;
    }

    if (this._recBlob && this._recHasAudio) {
      this._showManualSpeakReview(target);
      return;
    }

    this._recQuality = 0;
    this._recHeard = "";
    const scoreArea = document.getElementById("rec-score-area");
    if (scoreArea) {
      scoreArea.innerHTML = '<span style="color:var(--danger)">录音太短或未检测到声音，请重新朗读</span>';
    }
    const actions = document.getElementById("rec-review-actions");
    const confirmBtn = document.getElementById("rec-confirm-btn");
    if (actions) actions.style.display = "flex";
    if (confirmBtn) {
      confirmBtn.textContent = "重新录音";
      confirmBtn.onclick = () => UI._retrySpeakRecording();
    }
  },

  _renderAutoSpeakScore(quality, heard) {
    const correct = quality >= 0.5;
    let rating = "Excellent!";
    if (quality < 0.5) rating = "再试试~";
    else if (quality < 0.7) rating = "Good";
    else if (quality < 0.9) rating = "Great!";

    const scoreArea = document.getElementById("rec-score-area");
    if (scoreArea) {
      scoreArea.innerHTML = `<span style="color:${correct ? "var(--ok)" : "var(--danger)"}">发音评分：${Math.round(quality * 100)} 分 · ${rating}</span>${heard ? `<div class="rec-heard-text">识别：${this._esc(heard)}</div>` : ""}`;
    }

    const actions = document.getElementById("rec-review-actions");
    const confirmBtn = document.getElementById("rec-confirm-btn");
    if (actions) actions.style.display = "flex";
    if (confirmBtn) {
      if (correct) {
        confirmBtn.textContent = "🚀 确认发射";
        confirmBtn.onclick = () => UI._confirmSpeakFire();
      } else {
        confirmBtn.textContent = "仍要发射（低伤害）";
        confirmBtn.onclick = () => UI._confirmSpeakFire();
      }
    }
  },

  _showManualSpeakReview(target) {
    const reason = this._recSrUnsupported
      ? "当前浏览器不支持英语语音识别（常见于 iPhone Safari），请听回放自评"
      : "未能自动识别发音，请听回放核对";

    const scoreArea = document.getElementById("rec-score-area");
    if (scoreArea) {
      scoreArea.innerHTML = `<span style="color:var(--gold)">${reason}</span><div class="rec-heard-text">目标：${this._esc(target)}</div>`;
    }

    const actions = document.getElementById("rec-review-actions");
    const confirmBtn = document.getElementById("rec-confirm-btn");
    if (actions) actions.style.display = "flex";
    if (confirmBtn) {
      confirmBtn.textContent = "✓ 我读对了";
      confirmBtn.onclick = () => UI._confirmSpeakManual();
    }
  },

  _confirmSpeakManual() {
    const target = this.battle.current.correct;
    this._recQuality = 0.82;
    this._recHeard = target;
    this._confirmSpeakFire();
  },

  _confirmSpeakFire() {
    const quality = this._recQuality ?? 0;
    const heard = this._recHeard ?? "";
    const overlay = document.getElementById("rec-overlay");
    if (overlay) overlay.remove();
    this._resetRecState();
    this._finishSpeak(quality, heard);
  },

  _retrySpeakRecording() {
    const overlay = document.getElementById("rec-overlay");
    if (overlay) overlay.remove();
    this._resetRecState();
    this.openRecordOverlay();
  },

  _abortRecording(showCancelMsg) {
    const overlay = document.getElementById("rec-overlay");
    if (overlay) overlay.remove();
    this._resetRecState();
    if (showCancelMsg) {
      const status = document.getElementById("speak-status");
      if (status) status.innerHTML = '<span class="opacity-60">已取消，可重新录音</span>';
    }
  },

  _resetRecState() {
    if (this._recScorePollTimer) {
      clearTimeout(this._recScorePollTimer);
      this._recScorePollTimer = null;
    }
    this._cleanupRecording();
    this._recStopping = false;
    this._recReviewing = false;
    this._recScoreReady = false;
    this._recQuality = null;
    this._recHeard = null;
    this._recDone = false;
    this._recResult = null;
    this._recHasAudio = false;
    this._recChunks = [];
    this._recSrEnded = false;
    this._recSrUnsupported = false;
    this._recSrError = null;
    this._recReviewStart = 0;
  },

  _cleanupRecording() {
    this._speakRec = null;
    if (this._recBlobUrl) {
      URL.revokeObjectURL(this._recBlobUrl);
      this._recBlobUrl = null;
    }
    this._recBlob = null;
    this._mediaRecorder = null;
    if (this._recStream) {
      this._recStream.getTracks().forEach((t) => t.stop());
      this._recStream = null;
    }
    if (this._recAudioCtx) {
      try { this._recAudioCtx.close(); } catch (e) {}
      this._recAudioCtx = null;
    }
  },

  // 跳过朗读：以普通伤害发射（不享受发音加成）
  skipSpeak() {
    if (this._locked) return;
    this._finishSpeak(1, null, true);
  },

  _scorePronunciation(target, alternatives) {
    const norm = (s) => s.toLowerCase().replace(/[^a-z' ]/g, "").trim();
    const t = norm(target);
    let best = 0;
    alternatives.forEach((a) => {
      const sim = this._similarity(t, norm(a));
      if (sim > best) best = sim;
    });
    return best;
  },

  // 基于编辑距离的相似度（0~1）
  _similarity(a, b) {
    if (!a.length || !b.length) return 0;
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++)
      for (let j = 1; j <= n; j++)
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return 1 - dp[m][n] / Math.max(m, n);
  },

  _finishSpeak(quality, heard, skipped = false) {
    if (this._locked) return;
    this._locked = true;
    const target = this.battle.current.correct;
    // 发音相似度 >= 0.5 视为答对；评级供反馈
    const correct = quality >= 0.5;
    const res = this.battle.answer(correct ? target : (heard || "__"), { quality });

    let rating = "Excellent!";
    if (quality < 0.5) rating = "再试试~";
    else if (quality < 0.7) rating = "Good";
    else if (quality < 0.9) rating = "Great!";
    const status = document.getElementById("speak-status");
    if (status) {
      status.innerHTML = skipped
        ? '<span class="opacity-70">已跳过朗读，普通发射。</span>'
        : `<span style="color:${correct ? "var(--ok)" : "var(--danger)"}">发音评分：${Math.round(quality * 100)} 分 · ${rating}${heard ? ` （听到：${heard}）` : ""}</span>`;
    }
    this._afterAnswer(res);
  },

  // ---- 统一的答题结算后处理 ----
  _afterAnswer(res) {
    const b = this.battle;
    if (res.correct) {
      this._fireLaser(res.crit);
      this._hitMonster(res);
      if (res.petDamage) this._petAttackFx();
      // 连击分级视觉
      const comboEl = document.getElementById("combo");
      if (comboEl) {
        comboEl.classList.remove("fire", "inferno");
        if (res.combo >= 10) comboEl.classList.add("inferno");
        else if (res.combo >= 5) comboEl.classList.add("fire");
      }
      // 连击回血视觉反馈
      if (res.heal) {
        const ship = document.getElementById("player-ship");
        if (ship) {
          const sr = ship.getBoundingClientRect();
          const hpPop = document.createElement("div");
          hpPop.textContent = `+${res.heal} HP`;
          hpPop.style.cssText = `position:fixed;left:${sr.left+sr.width/2-20}px;top:${sr.top-10}px;color:#4ade80;font-weight:bold;font-size:16px;z-index:9999;pointer-events:none;animation:fx-particle 0.8s ease-out forwards;text-shadow:0 0 8px #4ade80`;
          document.body.appendChild(hpPop);
          setTimeout(() => hpPop.remove(), 800);
        }
      }
      // 粒子特效
      const monster = document.getElementById("monster");
      if (monster) {
        const r = monster.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        if (res.crit) {
          FX.critRing(cx, cy);
          FX.shake(6, 250);
        } else {
          FX.explode(cx, cy, 10, ["#fbbf24", "#f97316", "#38bdf8"]);
          FX.shake(3, 120);
        }
        if (res.combo >= 5) FX.comboWave(res.combo);
        if (res.crystalGain) FX.crystalBurst(cx, cy + 40, res.crystalGain * 3);
      }
      // 连击播报
      if (res.combo === 5) Sound.narrate("五连击！太棒了！", { rate: 1.3, pitch: 1.4 });
      else if (res.combo === 10) Sound.narrate("十连击！不可思议！", { rate: 1.4, pitch: 1.5 });
      // BOSS 击杀庆祝（仅推图最终 BOSS 且战斗已结束）
      if (res.monsterDead && !res.formEvolved && b.finished && b.win) {
        setTimeout(() => FX.bossKill(), 200);
        Sound.narrate("Boss击败！太强了！", { rate: 1.2, pitch: 1.3 });
      }
    } else {
      this._shipHit(res);
      FX.shake(10, 400);
      FX.flash("#ef4444", 150);
      // HP 告急播报
      if (this.battle.hp > 0 && this.battle.hp <= 30) {
        Sound.narrate("护盾告急！小心！", { rate: 1.3, pitch: 1.0 });
      }
    }
    this._updateBars();
    setTimeout(() => {
      if (b.finished) {
        if (b.win) FX.victory();
        this._renderResult();
      } else if (res.formEvolved) {
        FX.evolve();
        this._showEvolve(() => this._renderBattle());
      } else {
        this._renderBattle();
      }
    }, res.correct ? 900 : 1100);
  },

  _battlePetsHtml() {
    const pets = Combat.getDeployedPets();
    if (!pets.length) return "";
    return `<div class="battle-pets">${pets
      .map((pp, i) => {
        const def = PETS.find((d) => d.id === pp.species);
        if (!def) return "";
        const scale = getPetVisualScale(pp.level);
        return `<div class="battle-pet" id="pet-${pp.species}" style="--pet-color:${def.color};--pet-scale:${scale};--i:${i}" title="${def.name} Lv.${pp.level}">
          <span class="battle-pet-art">${getPetImg(pp.species, Math.round(28 * scale))}</span>
          <span class="battle-pet-lv">Lv.${pp.level}</span>
        </div>`;
      })
      .join("")}</div>`;
  },

  _petAttackFx() {
    document.querySelectorAll(".battle-pet").forEach((el) => {
      el.classList.remove("pet-attack");
      void el.offsetWidth;
      el.classList.add("pet-attack");
      setTimeout(() => el.classList.remove("pet-attack"), 450);
    });
  },

  _fireLaser(crit) {
    const stage = document.getElementById("stage");
    if (!stage) return;
    const w = WEAPONS[Storage.get().player.suit] || WEAPONS.pulse;
    const beam = document.createElement("div");
    beam.className = "laser-beam" + (crit ? " crit" : "");
    beam.style.background = crit ? `linear-gradient(to top, #fff, ${w.critColor}, ${w.color})` : w.beam;
    beam.style.width = (crit ? w.beamWidth + 6 : w.beamWidth) + "px";
    beam.style.boxShadow = `0 0 24px ${w.color}, 0 0 48px ${w.color}44`;
    stage.appendChild(beam);
    if (crit) {
      const flash = document.createElement("div");
      flash.className = "crit-flash";
      flash.style.background = `radial-gradient(circle at 50% 30%, ${w.critColor}66, transparent 60%)`;
      stage.appendChild(flash);
      setTimeout(() => flash.remove(), 450);
    }
    setTimeout(() => beam.remove(), 380);
  },

  _hitMonster(res) {
    const m = document.getElementById("monster");
    const stage = document.getElementById("stage");
    if (m) {
      setTimeout(() => {
        m.classList.add("hit");
        setTimeout(() => m.classList.remove("hit"), 350);
      }, 180);
    }
    // 浮动伤害
    if (stage) {
      const fn = document.createElement("div");
      fn.className = "float-num";
      fn.style.left = "48%";
      fn.style.top = "60px";
      fn.style.color = res.crit ? "#fbbf24" : "#fff";
      fn.textContent = (res.crit ? "暴击 -" : "-") + res.damage;
      stage.appendChild(fn);
      setTimeout(() => fn.remove(), 900);
      if (res.petDamage) {
        const pfn = document.createElement("div");
        pfn.className = "float-num";
        pfn.style.left = "38%";
        pfn.style.top = "78px";
        pfn.style.color = "#a78bfa";
        pfn.style.fontSize = "13px";
        pfn.textContent = `宠物 -${res.petDamage}`;
        stage.appendChild(pfn);
        setTimeout(() => pfn.remove(), 900);
      }
    }
    // combo 显示
    const combo = document.getElementById("combo");
    if (combo && res.combo >= 2) {
      combo.style.display = "block";
      combo.textContent = `Combo x${res.combo}`;
      combo.classList.remove("bump");
      void combo.offsetWidth;
      combo.classList.add("bump");
    }
  },

  _shipHit(res) {
    const ship = document.getElementById("ship");
    const stage = document.getElementById("stage");
    if (ship) {
      ship.classList.add("shake");
      setTimeout(() => ship.classList.remove("shake"), 400);
    }
    if (stage && res.selfDamage) {
      const fn = document.createElement("div");
      fn.className = "float-num";
      fn.style.left = "48%";
      fn.style.bottom = "20px";
      fn.style.top = "auto";
      fn.style.color = "#ef4444";
      fn.textContent = "护盾 -" + res.selfDamage;
      stage.appendChild(fn);
      setTimeout(() => fn.remove(), 900);
    }
    const combo = document.getElementById("combo");
    if (combo) combo.style.display = "none";
  },

  _updateBars() {
    const st = this.battle.status();
    const set = (id, w) => {
      const e = document.getElementById(id);
      if (e) e.style.width = w + "%";
    };
    set("mhp", (st.monster.hp / st.monster.maxHp) * 100);
    set("hp", st.hp);
    set("cr", (st.crystals / st.crystalGoal) * 100);
    const mt = document.getElementById("mhp-text");
    if (mt) mt.textContent = `${st.monster.hp}/${st.monster.maxHp}`;
    const ht = document.getElementById("hp-text");
    if (ht) ht.textContent = `${st.hp}/${st.maxHp}`;
    const ct = document.getElementById("cr-text");
    if (ct) ct.textContent = `${st.crystals}/${st.crystalGoal}`;
  },

  _showEvolve(cb) {
    const st = this.battle.status();
    const forms = this.battle.forms || (typeof getActiveMonsterForms === "function" ? getActiveMonsterForms() : MONSTER_FORMS);
    const form = forms[this.battle.formIndex];
    const skillLabel = form ? form.skillLabel : "";
    const banner = document.createElement("div");
    banner.className = "alert-banner";
    banner.innerHTML = `
      <div class="text-center animate__animated animate__zoomIn">
        <div style="font-size:72px">${st.monster.emoji}</div>
        <div class="text-2xl font-black" style="color:${st.monster.color}">怪兽进化！</div>
        <div class="opacity-90 mt-1">${st.monster.name} 出现了！</div>
        ${skillLabel ? `<div class="chip mt-2" style="display:inline-block;background:${st.monster.color}22;color:${st.monster.color}">🎯 技能挑战：${skillLabel}</div>` : ""}
      </div>`;
    document.body.appendChild(banner);
    Sound.alarm();
    Sound.narrate(`警告！${st.monster.name}出现！准备接受${skillLabel}挑战！`, { rate: 1.1, pitch: 1.1 }).then(() => {
      banner.remove();
      cb();
    });
  },

  quitBattle() {
    if (confirm("确定撤退吗？本次战斗的进度将保留已收集的水晶。")) {
      this._battleStartToken += 1;
      this._startingBattle = false;
      this.battle._end(false);
      this.showMenu();
    }
  },

  // ============ 结算界面 ============
  _renderResult() {
    const b = this.battle;
    if (b.win) Sound.win();
    const hpZero = b.hp <= 0;

    let title, sub, icon;
    if (b.win && b.mode === "review") {
      title = "突袭击退！";
      sub = "红色警报已解除！下次复习之前不会再有怪兽突袭。";
      icon = "✨";
      Sound.narrate("突袭击退！红色警报解除！", { rate: 1.1 });
    } else if (b.win && b.perfectClear) {
      title = "⭐ 完美通关！";
      sub = "三形态 BOSS 全灭 + 水晶集齐 + 遗忘队列清零，星域恢复光明！";
      icon = "🏆";
      Sound.narrate("完美通关！你太厉害了！星域恢复光明！", { rate: 1.1, pitch: 1.3 });
    } else if (b.win) {
      title = "星域解放！";
      sub = "三形态遗忘吞噬怪全部击败！新星域已解锁！继续复习可达成「完美通关」。";
      icon = "🎉";
      Sound.narrate("恭喜！星域解放！所有怪兽已被消灭！", { rate: 1.1, pitch: 1.2 });
    } else if (hpZero) {
      title = "飞船进入充能模式";
      sub = "护盾耗尽，飞船自动休眠充能。先去现实世界休息一下吧！";
      icon = "😴";
      Sound.narrate("飞船护盾耗尽，休息一下再战！", { rate: 1.0, pitch: 0.9 });
    } else {
      title = "本轮突袭结束";
      sub = "成功守住防线，记忆又巩固了一层！";
      icon = "✨";
      Sound.narrate("防线守住了！好样的！", { rate: 1.1 });
    }

    this._render(`
      <div class="screen">
        ${this._topBar()}
        <div class="panel text-center p-6 mt-6 animate__animated animate__zoomIn">
          <div style="font-size:64px">${icon}</div>
          <h1 class="text-2xl font-black title-glow mt-2">${title}</h1>
          <p class="text-sm opacity-70 mt-2 px-3">${sub}</p>
          <div class="grid grid-cols-3 gap-2 mt-5">
            <div class="panel p-3"><div class="text-xs opacity-60">战功</div><div class="text-xl font-black" style="color:var(--gold)">+${b.scoreGained}</div></div>
            <div class="panel p-3"><div class="text-xs opacity-60">水晶</div><div class="text-xl font-black" style="color:var(--crystal)">+${b.crystalsGained}</div></div>
            <div class="panel p-3"><div class="text-xs opacity-60">最高连击</div><div class="text-xl font-black">x${b.bestCombo}</div></div>
          </div>
          <div class="grid gap-3 mt-6">
            ${b.mode === "campaign" && !b.win && !hpZero ? `<button class="btn" onclick="UI.startCampaign('${b.unit.id}')">继续进攻</button>` : ""}
            <button class="btn secondary" onclick="UI.showLevelSelect()">🌌 返回星图</button>
            <button class="btn secondary" onclick="UI.showMenu()">🏠 返回基地</button>
          </div>
        </div>
      </div>`);
  },

  // ============ 武器库 ============
  showStore() {
    const p = Storage.get().player;
    const weaponCards = Object.entries(WEAPONS).map(([id, w]) => {
      const owned = p.ownedSuits.includes(id);
      const equipped = p.suit === id;
      return `
        <div class="panel p-4 text-center" style="border-color:${equipped ? w.color : ""}">
          <button type="button" class="asset-preview-trigger" title="点击查看大图" onclick="UI.showAssetPreview('weapon','${id}')">
            <div class="flex justify-center"><div class="asset-box" style="width:48px;height:48px">${getWeaponImg(id, 48)}</div></div>
          </button>
          <div class="font-bold mt-1" style="color:${w.color}">${w.name}</div>
          <div class="text-xs opacity-60">${w.desc}</div>
          ${w.ability ? `<div class="text-xs mt-1" style="color:var(--gold)">⚡ ${w.ability}</div>` : ""}
          <div class="text-xs opacity-50">${Combat.weaponDamageLabel(id)}</div>
          <div class="text-xs opacity-60 mb-2">${owned ? "已拥有" : "🏅 " + w.price}</div>
          ${equipped
            ? `<button class="btn gold" style="width:100%" disabled>装备中</button>`
            : owned
            ? `<button class="btn" style="width:100%" onclick="UI.equipSuit('${id}')">装备</button>`
            : `<button class="btn secondary" style="width:100%" ${p.score < w.price ? "disabled" : ""} onclick="UI.buySuit('${id}')">兑换</button>`
          }
        </div>`;
    }).join("");

    const petCards = PETS.map((pet) => {
      const owned = (Storage.get().pets || []).find(pp => pp.species === pet.id);
      return `
        <div class="panel p-4 text-center">
          <button type="button" class="asset-preview-trigger" title="点击查看大图" onclick="UI.showAssetPreview('pet','${pet.id}')">
            <div class="flex justify-center"><div class="asset-box" style="width:52px;height:52px">${getPetImg(pet.id, 52)}</div></div>
          </button>
          <div class="font-bold mt-1" style="color:${pet.color}">${pet.name}</div>
          <div class="text-xs opacity-60">${pet.ability}</div>
          <div class="text-xs opacity-60 mb-2">${owned ? "Lv." + owned.level : "💎 " + pet.price}</div>
          ${owned
            ? `<button class="btn" style="width:100%" onclick="UI.showPets()">查看</button>`
            : `<button class="btn secondary" style="width:100%" ${p.crystals < pet.price ? "disabled" : ""} onclick="UI.buyPet('${pet.id}')">领养</button>`
          }
        </div>`;
    }).join("");

    this._render(`
      <div class="screen">
        ${this._topBar()}
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-black title-glow">⚔️ 武器库 & 宠物</h1>
          <button class="btn secondary" onclick="UI.showMenu()">返回</button>
        </div>
        <h2 class="text-lg font-bold mt-4 mb-2">🔫 武器系统（用战功🏅兑换）</h2>
        <div class="grid grid-cols-2 gap-3">${weaponCards}</div>
        <h2 class="text-lg font-bold mt-5 mb-2">🐾 太空宠物（用水晶💎领养）</h2>
        <div class="grid grid-cols-2 gap-3">${petCards}</div>
        <div class="h-6"></div>
      </div>`);
  },

  showAssetPreview(kind, id) {
    const previewSize = Math.min(280, Math.max(160, Math.round(window.innerWidth * 0.55)));
    let title = "";
    let desc = "";
    let extra = "";
    let imgHtml = "";
    let accent = "";

    if (kind === "weapon") {
      const w = WEAPONS[id];
      if (!w) return;
      title = w.name;
      desc = w.desc;
      accent = w.color;
      const parts = [Combat.weaponDamageLabel(id)];
      if (w.ability) parts.push(`⚡ ${w.ability}`);
      extra = parts.join(" · ");
      imgHtml = getWeaponImg(id, previewSize);
    } else if (kind === "pet") {
      const pet = PETS.find((p) => p.id === id);
      if (!pet) return;
      title = pet.name;
      desc = pet.ability;
      accent = pet.color;
      const owned = (Storage.get().pets || []).find((pp) => pp.species === id);
      extra = owned ? `已领养 · Lv.${owned.level}` : `领养需要 💎 ${pet.price}`;
      imgHtml = getPetImg(id, previewSize);
    } else {
      return;
    }

    this.closeAssetPreview();
    const overlay = document.createElement("div");
    overlay.id = "asset-preview-overlay";
    overlay.className = "asset-preview-overlay";
    overlay.innerHTML = `
      <div class="asset-preview-bg" onclick="UI.closeAssetPreview()"></div>
      <div class="asset-preview-card" role="dialog" aria-modal="true" aria-label="${this._esc(title)}">
        <button type="button" class="asset-preview-close" onclick="UI.closeAssetPreview()" aria-label="关闭">✕</button>
        <div class="asset-preview-art">${imgHtml}</div>
        <div class="asset-preview-title" style="color:${accent}">${this._esc(title)}</div>
        <div class="asset-preview-desc">${this._esc(desc)}</div>
        <div class="asset-preview-extra">${this._esc(extra)}</div>
        <p class="asset-preview-hint">点击空白处关闭</p>
      </div>`;
    document.body.appendChild(overlay);
  },

  closeAssetPreview() {
    const el = document.getElementById("asset-preview-overlay");
    if (el) el.remove();
  },

  buySuit(id) {
    const p = Storage.get().player;
    const w = WEAPONS[id];
    if (p.score < w.price) return;
    p.score -= w.price;
    p.ownedSuits.push(id);
    p.suit = id;
    Storage.save();
    Sound.win();
    FX.explode(window.innerWidth / 2, window.innerHeight / 2, 20, [w.color, "#fbbf24", "#fff"]);
    this.showStore();
  },

  equipSuit(id) {
    Storage.get().player.suit = id;
    Storage.save();
    this.showStore();
  },

  buyPet(speciesId) {
    const p = Storage.get().player;
    const pet = PETS.find(pp => pp.id === speciesId);
    if (p.crystals < pet.price) return;
    p.crystals -= pet.price;
    if (!Storage.get().pets) Storage.get().pets = [];
    Storage.get().pets.push({ species: speciesId, level: 1, exp: 0, fedAt: Date.now() });
    const child = Storage.getActiveChild();
    if (child) {
      if (!Array.isArray(child.deployedPets)) child.deployedPets = [];
      if (child.deployedPets.length < Combat.MAX_BATTLE_PETS && !child.deployedPets.includes(speciesId)) {
        child.deployedPets.push(speciesId);
      }
    }
    Storage.save();
    Sound.win();
    FX.crystalBurst(window.innerWidth / 2, window.innerHeight / 2, 12);
    this.showPets();
  },

  // ============ 宠物舱 ============
  showPets() {
    const pets = Storage.get().pets || [];
    const p = Storage.get().player;
    const deployedIds = Combat.getDeployedPetIds();
    const slotsFull = deployedIds.length >= Combat.MAX_BATTLE_PETS;
    let content;
    if (!pets.length) {
      content = `<div class="panel p-6 text-center opacity-70">还没有宠物。<br/>去武器库用💎领养一只吧！</div>`;
    } else {
      content = pets.map((pp) => {
        const def = PETS.find(d => d.id === pp.species);
        const maxed = pp.level >= def.maxLevel;
        const feedCost = pp.level * 8;
        const expNeeded = pp.level * 20;
        const pct = Math.min(100, Math.round((pp.exp / expNeeded) * 100));
        const deployed = deployedIds.includes(pp.species);
        return `
          <div class="panel p-4 text-center" style="${deployed ? "border-color:" + def.color : ""}">
            <div class="text-3xl">${getPetStageEmoji(def, pp.level)}</div>
            <button type="button" class="asset-preview-trigger" title="点击查看大图" onclick="UI.showAssetPreview('pet','${pp.species}')">
              <div class="flex justify-center mt-1"><div class="asset-box" style="width:${Math.round(48 * getPetVisualScale(pp.level))}px;height:${Math.round(48 * getPetVisualScale(pp.level))}px;transition:transform 0.3s">${getPetImg(pp.species, Math.round(48 * getPetVisualScale(pp.level)))}</div></div>
            </button>
            <div class="font-bold mt-1" style="color:${def.color}">${def.name}</div>
            <div class="text-xs" style="color:var(--gold)">Lv.${pp.level}${maxed ? " MAX" : ""}</div>
            <div class="text-xs opacity-80 mt-1" style="color:${def.color}">⚡ ${Combat.describePet(pp)}</div>
            <div class="hpbar mt-2"><i style="width:${pct}%;background:linear-gradient(90deg,${def.color},var(--gold))"></i></div>
            <div class="text-xs opacity-50 mt-1">EXP ${pp.exp}/${expNeeded}</div>
            ${deployed
              ? `<button class="btn gold" style="width:100%;margin-top:8px" onclick="UI.toggleDeployPet('${pp.species}')">⚔️ 出战中（点击换下）</button>`
              : `<button class="btn secondary" style="width:100%;margin-top:8px" ${slotsFull ? "disabled" : ""} onclick="UI.toggleDeployPet('${pp.species}')">${slotsFull ? "出战位已满" : "⚔️ 设为出战"}</button>`
            }
            ${maxed ? `<div class="text-xs mt-2" style="color:var(--gold)">🌟 满级！能力全开</div>` :
              `<button class="btn" style="width:100%;margin-top:8px" ${p.crystals < feedCost ? "disabled" : ""} onclick="UI.feedPet('${pp.species}')">🍖 喂养 (${feedCost}💎)</button>`
            }
          </div>`;
      }).join("");
    }

    this._render(`
      <div class="screen">
        ${this._topBar()}
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-black title-glow">🐾 宠物舱</h1>
          <button class="btn secondary" onclick="UI.showMenu()">返回</button>
        </div>
        <p class="text-xs opacity-60 mt-2">选择最多 <b>${Combat.MAX_BATTLE_PETS}</b> 只宠物出战，它们会跟你一起上战场！当前出战：${deployedIds.length ? deployedIds.map((id) => PETS.find((d) => d.id === id)?.name || id).join("、") : "无"}</p>
        <div class="grid grid-cols-2 gap-3 mt-4">${content}</div>
        <div class="h-6"></div>
      </div>`);
  },

  toggleDeployPet(speciesId) {
    const child = Storage.getActiveChild();
    const pets = Storage.get()?.pets || [];
    if (!child || !pets.some((p) => p.species === speciesId)) return;
    if (!Array.isArray(child.deployedPets)) child.deployedPets = [];
    const idx = child.deployedPets.indexOf(speciesId);
    if (idx >= 0) {
      child.deployedPets.splice(idx, 1);
    } else {
      if (child.deployedPets.length >= Combat.MAX_BATTLE_PETS) return;
      child.deployedPets.push(speciesId);
    }
    Storage.save();
    this.showPets();
  },

  feedPet(speciesId) {
    const p = Storage.get().player;
    const pets = Storage.get().pets || [];
    const pp = pets.find(x => x.species === speciesId);
    const def = PETS.find(d => d.id === speciesId);
    if (!pp || pp.level >= def.maxLevel) return;
    const feedCost = pp.level * 8;
    if (p.crystals < feedCost) return;
    p.crystals -= feedCost;
    pp.exp += 10 + Math.floor(Math.random() * 6);
    const expNeeded = pp.level * 20;
    if (pp.exp >= expNeeded) {
      pp.level += 1;
      pp.exp = 0;
      Sound.win();
      Sound.narrate(`${def.name}升级到 ${pp.level} 级！${getPetStageEmoji(def, pp.level)}`, { rate: 1.2, pitch: 1.3 });
      FX.explode(window.innerWidth / 2, window.innerHeight / 3, 24, [def.color, "#fbbf24", "#fff"]);
    } else {
      Sound.correct();
    }
    pp.fedAt = Date.now();
    Storage.save();
    this.showPets();
  },

  // ============ 设置 ============
  showSettings() {
    const prefs = Storage.getChildPrefs();
    const soundOn = Storage.getSoundEnabled();
    const ctx = Storage.getContext();
    const spellOn = prefs.enableSpelling;
    const mode = prefs.spellInputMode;
    this._render(`
      <div class="screen">
        ${this._topBar()}
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-2xl font-black title-glow">⚙️ 设置</h1>
          <button class="btn secondary" onclick="UI.showMenu()">返回</button>
        </div>
        <p class="text-xs opacity-50 mb-3">当前小航员：${this._esc(ctx.name || "小航员")}（拼写相关设置仅对本孩子生效）</p>

        <div class="panel p-4 mb-3">
          <div class="flex items-center justify-between gap-3">
            <div class="text-left">
              <div class="font-bold">需要拼写单词</div>
              <div class="text-xs opacity-60 mt-1">关闭后跳过拼写吞噬怪（听→读→口语）</div>
            </div>
            <button class="settings-toggle ${spellOn ? "on" : ""}" onclick="UI.toggleEnableSpelling()">${spellOn ? "开" : "关"}</button>
          </div>
        </div>

        <div class="panel p-4 mb-3 ${spellOn ? "" : "opacity-40"}">
          <div class="font-bold mb-1">拼写输入方式</div>
          <div class="text-xs opacity-60 mb-3">仅在开启拼写时生效</div>
          <div class="grid grid-cols-2 gap-2">
            <button class="btn ${mode === "tiles" ? "" : "secondary"}" ${spellOn ? "" : "disabled"} onclick="UI.setSpellInputMode('tiles')">🔤 点选字母</button>
            <button class="btn ${mode === "keyboard" ? "" : "secondary"}" ${spellOn ? "" : "disabled"} onclick="UI.setSpellInputMode('keyboard')">⌨️ 键盘输入</button>
          </div>
        </div>

        <div class="panel p-4 mb-3">
          <div class="flex items-center justify-between gap-3">
            <div class="text-left">
              <div class="font-bold">音效</div>
              <div class="text-xs opacity-60 mt-1">本设备全局开关（所有孩子共用）</div>
            </div>
            <button class="settings-toggle ${soundOn ? "on" : ""}" onclick="UI.toggleSound()">${soundOn ? "开" : "关"}</button>
          </div>
        </div>
      </div>`);
  },

  toggleEnableSpelling() {
    const prefs = Storage.getChildPrefs();
    Storage.updateChildPrefs({ enableSpelling: !prefs.enableSpelling });
    this.showSettings();
  },

  setSpellInputMode(mode) {
    if (!Storage.getChildPrefs().enableSpelling) return;
    Storage.updateChildPrefs({ spellInputMode: mode === "keyboard" ? "keyboard" : "tiles" });
    this.showSettings();
  },

  toggleSound() {
    Storage.setSoundEnabled(!Storage.getSoundEnabled());
    this.showSettings();
  },

  // ============ 学情数据（家长端预览） ============
  showStats() {
    const save = Storage.get();
    const mastery = save.mastery;
    const keys = Object.keys(mastery);
    const learned = keys.length;
    const mastered = keys.filter((k) => mastery[k].level >= EBBINGHAUS.maxLevel).length;
    const totalCorrect = keys.reduce((s, k) => s + (mastery[k].correct || 0), 0);
    const totalWrong = keys.reduce((s, k) => s + (mastery[k].wrong || 0), 0);
    const acc = totalCorrect + totalWrong > 0 ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100) : 0;
    const pending = ReviewQueue.pendingCount();
    const dueNow = ReviewQueue.dueCount();
    const completedUnits = Object.values(save.progress).filter((p) => p.completed).length;

    // 易错词 Top
    const wrongList = keys
      .filter((k) => mastery[k].wrong > 0)
      .sort((a, b) => mastery[b].wrong - mastery[a].wrong)
      .slice(0, 6)
      .map((k) => {
        const en = k.split("::")[2];
        return `<span class="chip" style="color:#fca5a5">${en} ×${mastery[k].wrong}</span>`;
      })
      .join(" ");

    this._render(`
      <div class="screen">
        ${this._topBar()}
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-black title-glow">📊 高能护航学情</h1>
          <button class="btn secondary" onclick="UI.showMenu()">返回</button>
        </div>
        <div class="panel p-4 mt-4">
          <p class="leading-relaxed">
            您的小航员已接触 <b style="color:var(--accent)">${learned}</b> 个语言点，
            其中 <b style="color:var(--ok)">${mastered}</b> 个已牢固掌握；
            答题正确率 <b style="color:var(--gold)">${acc}%</b>，
            完美通关 <b style="color:var(--crystal)">${completedUnits}</b> 个星域。
            ${dueNow > 0 ? `当前有 <b style="color:var(--danger)">${dueNow}</b> 个遗忘怪兽正在突袭，完成一次复习突袭即可全部清剿！` : pending > 0 ? `复习队列共 <b>${pending}</b> 项，下次到期前暂无警报。` : "暂无待清剿的遗忘怪兽，状态极佳！"}
          </p>
        </div>
        <div class="grid grid-cols-2 gap-3 mt-3">
          <div class="panel p-4 text-center"><div class="text-xs opacity-60">累计答对</div><div class="text-2xl font-black" style="color:var(--ok)">${totalCorrect}</div></div>
          <div class="panel p-4 text-center"><div class="text-xs opacity-60">待复习（已到期）</div><div class="text-2xl font-black" style="color:var(--danger)">${dueNow}</div></div>
          <div class="panel p-4 text-center"><div class="text-xs opacity-60">复习队列总数</div><div class="text-2xl font-black" style="color:var(--accent)">${pending}</div></div>
        </div>
        <h2 class="text-lg font-bold mt-4 mb-2">⚠️ 高频易错单词</h2>
        <div class="flex flex-wrap gap-2">${wrongList || '<span class="opacity-50 text-sm">暂无易错记录，棒极了！</span>'}</div>

        <h2 class="text-lg font-bold mt-5 mb-2">🏅 成就徽章</h2>
        <div class="grid grid-cols-2 gap-2">${this._renderAchievements()}</div>

        <h2 class="text-lg font-bold mt-5 mb-2">🎖️ 段位晋升</h2>
        ${this._renderRankProgress()}

        <div class="mt-6 grid gap-3">
          <button class="btn secondary" style="width:100%" onclick="UI.exportSave()">📤 导出学习存档</button>
          <button class="btn secondary" style="width:100%" onclick="UI.importSave()">📥 导入学习存档</button>
          <button class="btn secondary" style="width:100%" onclick="UI.confirmReset()">🗑️ 重置所有存档</button>
        </div>
        <div class="h-6"></div>
      </div>`);
  },

  _renderAchievements() {
    const save = Storage.get();
    return ACHIEVEMENTS.map((a) => {
      const unlocked = a.check(save);
      return `<div class="panel p-3 ${unlocked ? "" : "opacity-40"}" style="text-align:center">
        <div style="font-size:28px">${a.icon}</div>
        <div class="font-bold text-sm mt-1">${a.name}</div>
        <div class="text-xs opacity-60">${a.desc}</div>
        ${unlocked ? '<div class="text-xs mt-1" style="color:var(--ok)">✓ 已解锁</div>' : ""}
      </div>`;
    }).join("");
  },

  _renderRankProgress() {
    const score = Storage.get().player.score;
    const rank = getPlayerRank(score);
    const nextIdx = RANKS.indexOf(rank) + 1;
    const next = nextIdx < RANKS.length ? RANKS[nextIdx] : null;
    const pct = next ? Math.min(100, Math.round(((score - rank.min) / (next.min - rank.min)) * 100)) : 100;
    return `
      <div class="panel p-4">
        <div class="flex items-center justify-between">
          <div>
            <span style="font-size:24px">${rank.icon}</span>
            <span class="font-bold ml-2" style="color:${rank.color}">${rank.name}</span>
          </div>
          ${next ? `<span class="text-xs opacity-60">下一段：${next.icon} ${next.name} (${next.min}分)</span>` : `<span class="text-xs" style="color:var(--gold)">满段位 MAX</span>`}
        </div>
        <div class="hpbar mt-2"><i style="width:${pct}%;background:linear-gradient(90deg,${rank.color},${next ? next.color : rank.color})"></i></div>
        <div class="text-xs opacity-60 mt-1 text-right">${score} / ${next ? next.min : "MAX"}</div>
      </div>`;
  },

  confirmReset() {
    if (confirm("确定要清空所有存档吗？此操作不可恢复。")) {
      Storage.reset();
      this.showMenu();
    }
  },

  exportSave() {
    try {
      const json = Storage.exportJSON();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const ctx = Storage.getContext();
      const name = (ctx.name || "save").replace(/[^\w\u4e00-\u9fa5-]+/g, "");
      a.href = url;
      a.download = `language-astronauts-${name}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      alert("存档已导出！请妥善保存 JSON 文件。");
    } catch (e) {
      alert("导出失败：" + e.message);
    }
  },

  importSave() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      if (!confirm("导入将覆盖当前设备上的全部学习进度，确定继续吗？")) return;
      try {
        const text = await file.text();
        Storage.importJSON(text);
        ReviewQueue.consolidate();
        alert("导入成功！学习进度已恢复。");
        this.showMenu();
      } catch (e) {
        alert("导入失败：" + e.message);
      }
    };
    input.click();
  },
};

if (typeof window !== "undefined") window.UI = UI;
