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
    svg: `<svg viewBox="0 0 48 48" fill="none"><rect x="18" y="8" width="12" height="32" rx="4" fill="#38bdf8" stroke="#0891b2" stroke-width="1.5"/><circle cx="24" cy="16" r="5" fill="#0f172a" stroke="#67e8f9"/><rect x="20" y="34" width="8" height="6" rx="2" fill="#0891b2"/></svg>`,
  },
  plasma: {
    name: "等离子双管炮", price: 200,
    desc: "双倍射速，连击更猛", ability: "连击伤害+25%",
    color: "#a78bfa", beam: "linear-gradient(to top, #fff, #a78bfa, #7c3aed)",
    beamWidth: 6, critColor: "#c4b5fd",
    svg: `<svg viewBox="0 0 48 48" fill="none"><rect x="14" y="10" width="8" height="30" rx="3" fill="#a78bfa" stroke="#7c3aed" stroke-width="1.5"/><rect x="26" y="10" width="8" height="30" rx="3" fill="#a78bfa" stroke="#7c3aed" stroke-width="1.5"/><rect x="18" y="26" width="12" height="8" rx="2" fill="#7c3aed"/><circle cx="18" cy="14" r="3" fill="#c4b5fd"/><circle cx="30" cy="14" r="3" fill="#c4b5fd"/></svg>`,
  },
  flame: {
    name: "烈焰喷射器", price: 350,
    desc: "范围伤害，灼烧持续", ability: "答对后额外灼烧 5 伤害",
    color: "#f97316", beam: "linear-gradient(to top, #fbbf24, #f97316, #ef4444)",
    beamWidth: 14, critColor: "#fbbf24",
    svg: `<svg viewBox="0 0 48 48" fill="none"><path d="M24 6 L32 20 L30 36 L26 40 L22 40 L18 36 L16 20 Z" fill="#f97316" stroke="#ef4444" stroke-width="1.5"/><path d="M20 14 Q24 8 28 14" stroke="#fbbf24" stroke-width="2" fill="none"/><ellipse cx="24" cy="26" rx="4" ry="6" fill="#fbbf24" opacity="0.6"/><rect x="20" y="36" width="8" height="6" rx="2" fill="#b91c1c"/></svg>`,
  },
  frost: {
    name: "冰霜水晶炮", price: 500,
    desc: "冻结怪兽，水晶加成", ability: "水晶获取+30%",
    color: "#67e8f9", beam: "linear-gradient(to top, #fff, #67e8f9, #06b6d4)",
    beamWidth: 10, critColor: "#a5f3fc",
    svg: `<svg viewBox="0 0 48 48" fill="none"><polygon points="24,4 30,16 40,20 32,28 34,40 24,34 14,40 16,28 8,20 18,16" fill="#67e8f9" stroke="#0891b2" stroke-width="1.5"/><circle cx="24" cy="22" r="6" fill="#0f172a" stroke="#a5f3fc"/><path d="M24 18 L24 26 M20 22 L28 22" stroke="#a5f3fc" stroke-width="1.5"/></svg>`,
  },
  thunder: {
    name: "雷神电弧炮", price: 800,
    desc: "闪电连锁，暴击毁灭", ability: "暴击率+15%，暴击伤害+50%",
    color: "#fbbf24", beam: "linear-gradient(to top, #fff, #fbbf24, #f59e0b)",
    beamWidth: 12, critColor: "#fde68a",
    svg: `<svg viewBox="0 0 48 48" fill="none"><path d="M28 4 L20 20 L26 20 L18 44 L36 22 L28 22 Z" fill="#fbbf24" stroke="#f59e0b" stroke-width="1.5"/><circle cx="24" cy="24" r="10" fill="none" stroke="#fde68a" stroke-width="1" stroke-dasharray="3 3"/></svg>`,
  },
};

// 宠物系统
const PETS = [
  { id: "star_fox", name: "星尘狐", emoji: "🦊", price: 80, ability: "答对护盾+3", maxLevel: 5, color: "#f97316",
    stages: ["🥚", "🦊", "🦊✨", "🔥🦊", "⭐🦊"],
    svg: `<svg viewBox="0 0 48 48" fill="none"><ellipse cx="24" cy="28" rx="14" ry="12" fill="#fdba74" stroke="#f97316" stroke-width="1.5"/><path d="M14 18 L18 10 L22 18" fill="#fdba74" stroke="#f97316"/><path d="M26 18 L30 10 L34 18" fill="#fdba74" stroke="#f97316"/><circle cx="20" cy="26" r="3" fill="#1e293b"/><circle cx="28" cy="26" r="3" fill="#1e293b"/><circle cx="21" cy="25" r="1" fill="#fff"/><circle cx="29" cy="25" r="1" fill="#fff"/><ellipse cx="24" cy="32" rx="2" ry="1.5" fill="#1e293b"/><path d="M12 34 Q8 38 10 40" stroke="#f97316" stroke-width="2" fill="none"/></svg>` },
  { id: "nebula_cat", name: "星云猫", emoji: "🐱", price: 120, ability: "连击门槛-1（2连开始算暴击）", maxLevel: 5, color: "#a78bfa",
    stages: ["🥚", "🐱", "🐱✨", "💜🐱", "👑🐱"],
    svg: `<svg viewBox="0 0 48 48" fill="none"><ellipse cx="24" cy="28" rx="13" ry="12" fill="#c4b5fd" stroke="#7c3aed" stroke-width="1.5"/><path d="M12 18 L16 8 L20 18" fill="#c4b5fd" stroke="#7c3aed"/><path d="M28 18 L32 8 L36 18" fill="#c4b5fd" stroke="#7c3aed"/><circle cx="19" cy="26" r="3.5" fill="#1e1b4b"/><circle cx="29" cy="26" r="3.5" fill="#1e1b4b"/><circle cx="20" cy="25" r="1.5" fill="#a78bfa"/><circle cx="30" cy="25" r="1.5" fill="#a78bfa"/><path d="M22 33 Q24 35 26 33" stroke="#7c3aed" stroke-width="1.5" fill="none"/><path d="M12 28 L6 27 M12 30 L6 31 M36 28 L42 27 M36 30 L42 31" stroke="#a78bfa" stroke-width="1"/></svg>` },
  { id: "crystal_dragon", name: "水晶龙", emoji: "🐉", price: 150, ability: "每3回合自动恢复15护盾", maxLevel: 5, color: "#67e8f9",
    stages: ["🥚", "🐉", "🐉✨", "💎🐉", "🌟🐉"],
    svg: `<svg viewBox="0 0 48 48" fill="none"><ellipse cx="24" cy="26" rx="12" ry="14" fill="#a5f3fc" stroke="#0891b2" stroke-width="1.5"/><path d="M16 16 L12 8 L18 14" fill="#67e8f9" stroke="#0891b2"/><path d="M32 16 L36 8 L30 14" fill="#67e8f9" stroke="#0891b2"/><circle cx="20" cy="24" r="3" fill="#083344"/><circle cx="28" cy="24" r="3" fill="#083344"/><circle cx="21" cy="23" r="1.2" fill="#67e8f9"/><circle cx="29" cy="23" r="1.2" fill="#67e8f9"/><path d="M20 32 Q24 36 28 32" stroke="#0891b2" stroke-width="1.5" fill="none"/><path d="M14 34 Q10 38 12 42" stroke="#0891b2" stroke-width="2" fill="none"/><path d="M34 34 Q38 38 36 42" stroke="#0891b2" stroke-width="2" fill="none"/></svg>` },
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

  init() {
    this.el = document.getElementById("app");
    this._buildStarfield();
    this.showMenu();
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

  // ============ 顶部资源条 ============
  _topBar() {
    const p = Storage.get().player;
    const due = ReviewQueue.getDue().length;
    const rank = getPlayerRank(p.score);
    return `
      <div class="flex items-center justify-between gap-2 mb-3">
        <div class="flex gap-2 flex-wrap">
          <span class="chip"><span style="display:inline-block;width:18px;height:18px;vertical-align:middle">${(WEAPONS[p.suit]||WEAPONS.pulse).svg}</span> <span style="color:${rank.color}">${rank.icon} ${rank.name}</span></span>
          <span class="chip" style="color:var(--gold)">🏅 ${p.score}</span>
          <span class="chip" style="color:var(--crystal)">💎 ${p.crystals}</span>
        </div>
        ${due > 0 ? `<span class="chip" style="color:var(--danger)"><span class="review-dot"></span> 警报 ${due}</span>` : ""}
      </div>`;
  },

  // ============ 主菜单 ============
  showMenu() {
    Sound._ensure();
    const due = ReviewQueue.getDue().length;
    const p = Storage.get().player;
    this._render(`
      <div class="screen">
        ${this._topBar()}
        <div class="panel text-center p-6 mt-6">
          <div class="ship-hero" style="position:relative">${getShipSVG("classic", 100)}<div style="position:absolute;bottom:0;right:-10px;width:36px;height:36px">${(WEAPONS[p.suit]||WEAPONS.pulse).svg}</div></div>
          <h1 class="text-3xl font-black title-glow mt-2">时空语航员</h1>
          <p class="text-sm opacity-70 mt-1">Language Astronauts · 沪教牛津深圳版</p>
          <p class="text-xs opacity-50 mt-3 leading-relaxed px-2">
            语航星系的「核心语言水晶」碎裂了，<br/>驾驶能核飞船，用语言密码击败遗忘吞噬怪，修复宇宙！
          </p>
          <div class="grid gap-3 mt-6">
            <button class="btn" onclick="UI.showLevelSelect()">🌌 星图远征</button>
            ${due > 0 ? `<button class="btn gold animate__animated animate__pulse animate__infinite" onclick="UI.startReview()">🚨 红色警报突袭 (${due})</button>` : ""}
            <div class="grid grid-cols-2 gap-3">
              <button class="btn secondary" onclick="UI.showStore()">⚔️ 武器库</button>
              <button class="btn secondary" onclick="UI.showPets()">🐾 宠物舱</button>
            </div>
            <button class="btn secondary" onclick="UI.showStats()">📊 学情数据</button>
          </div>
        </div>
        <p class="text-center text-xs opacity-30 mt-4">0 广告 · 0 内购 · 体力靠学习获取</p>
      </div>`);
  },

  // ============ 关卡选择（星图） ============
  showLevelSelect() {
    let body = "";
    COURSE_DATA.forEach((grade) => {
      body += `<h2 class="text-lg font-bold mt-4 mb-2 opacity-90">${grade.name}</h2><div class="grid gap-3">`;
      grade.units.forEach((unit, i) => {
        const prog = Storage.getUnitProgress(unit.id);
        // 解锁规则：每个年级第一关默认解锁，其余需前一关完成
        const prevUnit = grade.units[i - 1];
        const locked = i > 0 && prevUnit && !Storage.getUnitProgress(prevUnit.id).completed;
        const pct = Math.round((prog.crystals / CRYSTAL_GOAL) * 100);
        body += `
          <div class="panel unit-card ${locked ? "unit-locked" : ""}" ${locked ? "" : `onclick="UI.startCampaign('${unit.id}')"`}>
            ${prog.perfectClear ? '<span class="badge-done">⭐ 完美通关</span>' : prog.completed ? '<span class="badge-done" style="background:#38bdf8;color:#0c1a33">已解放 ✓</span>' : ""}
            <div class="flex items-center gap-3">
              <div class="text-3xl">${locked ? "🔒" : "🪐"}</div>
              <div class="flex-1">
                <div class="font-bold">${unit.name}</div>
                <div class="text-xs opacity-60">${unit.theme} · 词汇 ${unit.vocab.length} · 会话 ${unit.dialogue.length}</div>
                <div class="crystal-bar"><i style="width:${pct}%"></i></div>
              </div>
              <div class="text-xs opacity-70" style="color:var(--crystal)">💎${prog.crystals}/${CRYSTAL_GOAL}</div>
            </div>
          </div>`;
      });
      body += `</div>`;
    });
    this._render(`
      <div class="screen">
        ${this._topBar()}
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-black title-glow">🌌 星图远征</h1>
          <button class="btn secondary" onclick="UI.showMenu()">返回</button>
        </div>
        <div class="scrollable">${body}</div>
        <div class="h-6"></div>
      </div>`);
  },

  // ============ 启动战斗 ============
  startCampaign(unitId) {
    const unit = this._findUnit(unitId);
    if (!unit) return;
    this.battle = new Battle(unit, "campaign");
    this._renderBattle();
  },

  startReview() {
    const due = ReviewQueue.getDue();
    if (!due.length) {
      this.showMenu();
      return;
    }
    // 复习突袭：用首个到期条目所属单元作为战场
    const unit = this._findUnit(due[0].unitId) || COURSE_DATA[0].units[0];
    this.battle = new Battle(unit, "review", due.slice(0, 12));
    this._showAlert(due[0], () => this._renderBattle());
  },

  _findUnit(unitId) {
    for (const g of COURSE_DATA) {
      const u = g.units.find((x) => x.id === unitId);
      if (u) return u;
    }
    return null;
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
    setTimeout(() => {
      banner.remove();
      cb();
    }, 1500);
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
      spell: "⌨️ 拼写填空",
      speak: "🎤 口语评测",
    };
    const styleBadge = `<div class="chip" style="font-size:12px;padding:3px 10px;position:absolute;right:10px;top:-12px">${STYLE_LABEL[q.style] || ""}</div>`;
    const speakBtn = `<button class="chip" style="position:absolute;left:10px;top:-12px" onclick="Sound.speak('${(q.speak || "").replace(/'/g, "")}')">🔊</button>`;

    let promptHtml, answersHtml;

    if (q.style === "listen") {
      // 听音辨词：隐藏文字，只能靠听
      promptHtml = `
        <div class="text-xs opacity-60 mb-2">仔细听，选出听到的单词：</div>
        <button class="btn" style="margin:0 auto" onclick="Sound.speak('${(q.speak || "").replace(/'/g, "")}')">🔊 再听一次</button>`;
      answersHtml = q.options.map((o, i) => `<button class="missile" data-i="${i}" onclick="UI.choose(${i}, this)">${o}</button>`).join("");
    } else if (q.style === "spell") {
      // 拼写填空：字母拼块
      promptHtml = `
        <div class="text-xs opacity-60 mb-1">为这个怪兽密码拼出英文：</div>
        <div class="text-2xl font-black" style="color:var(--gold)">${q.prompt}</div>
        <div id="spell-slots" class="flex justify-center gap-1 mt-3 flex-wrap" style="min-height:40px"></div>`;
      answersHtml = `
        <div class="flex flex-wrap justify-center gap-2" id="letter-tray">
          ${q.letters.map((c, i) => `<button class="missile" style="min-width:44px;min-height:44px;padding:8px;font-size:20px" data-li="${i}" onclick="UI.spellTap(${i}, this)">${c}</button>`).join("")}
        </div>
        <div class="grid grid-cols-2 gap-3 mt-3">
          <button class="btn secondary" onclick="UI.spellBackspace()">⌫ 退格</button>
          <button class="btn" id="fire-btn" onclick="UI.spellFire()">🚀 发射</button>
        </div>`;
    } else if (q.style === "speak") {
      // 口语评测：麦克风发音评分
      const supported = "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
      promptHtml = `
        <div class="flex items-center justify-center gap-2 mb-1">${getNpcSVG(q.speaker || "Peter", 28)}<span class="text-xs opacity-60">${q.speaker || "NPC"} 说：</span></div>
        <div class="text-lg font-bold">${q.prompt}</div>
        <div class="text-sm opacity-60 mt-1">${q.promptZh || ""}</div>
        <div class="mt-2 p-2 rounded-lg" style="background:rgba(56,189,248,0.12)">
          <div class="text-xs opacity-60">请大声读出回应：</div>
          <div class="text-xl font-black" style="color:var(--accent)">${q.correct}</div>
        </div>
        <div id="speak-status" class="text-sm mt-2 opacity-70">${supported ? "点击麦克风，发音越标准激光炮越强！" : "当前浏览器不支持语音识别，可点击「跳过朗读」直接发射。"}</div>`;
      answersHtml = supported
        ? `<div class="grid grid-cols-2 gap-3">
             <button class="btn gold" id="mic-btn" onclick="UI.startSpeak()">🎤 开始朗读</button>
             <button class="btn secondary" onclick="UI.skipSpeak()">跳过朗读</button>
           </div>`
        : `<button class="btn" onclick="UI.skipSpeak()">🚀 发射激光炮</button>`;
    } else if (q.type === "dialogue") {
      // 角色扮演：选择最合适回应
      promptHtml = `
        <div class="flex items-center justify-center gap-2 mb-1">${getNpcSVG(q.speaker || "Peter", 28)}<span class="text-xs opacity-60">${q.speaker || "NPC"} 说：</span></div>
        <div class="text-xl font-bold">${q.prompt}</div>
        <div class="text-sm opacity-60 mt-1">${q.promptZh || ""}</div>
        <div class="text-xs opacity-50 mt-2">选择最合适的回应，发射激光炮 →</div>`;
      answersHtml = q.options.map((o, i) => `<button class="missile" data-i="${i}" onclick="UI.choose(${i}, this)">${o}</button>`).join("");
    } else {
      // 词汇选择
      promptHtml = `
        <div class="text-xs opacity-60 mb-1">怪兽身上的密码：</div>
        <div class="text-2xl font-black" style="color:var(--gold)">${q.prompt}</div>
        <div class="text-xs opacity-50 mt-2">选择正确的英文导弹击中它 →</div>`;
      answersHtml = q.options.map((o, i) => `<button class="missile" data-i="${i}" onclick="UI.choose(${i}, this)">${o}</button>`).join("");
    }

    const useGrid = q.style === "mc" || q.style === "listen";

    this._render(`
      <div class="screen">
        <div class="flex items-center justify-between mb-2">
          <span class="chip">${modeLabel}</span>
          <button class="btn secondary" style="padding:8px 14px" onclick="UI.quitBattle()">撤退</button>
        </div>

        <!-- 战场 -->
        <div class="panel battle-stage" id="stage">
          <div class="combo-pop" id="combo" style="${st.combo >= 2 ? "" : "display:none"}">Combo x${st.combo}</div>
          <div class="monster" id="monster">${getMonsterSVG(st.monster.id, 90)}</div>
          <div class="player-ship" id="ship">
            ${getShipSVG("classic", 56)}
            <div style="position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);width:28px;height:28px">${(WEAPONS[Storage.get().player.suit] || WEAPONS.pulse).svg}</div>
          </div>
        </div>

        <!-- 怪兽信息 + 血条 -->
        <div class="mt-2">
          <div class="flex justify-between text-xs mb-1">
            <span>${st.monster.name} (形态 ${st.formIndex + 1}/${st.formTotal})</span>
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
      this._renderSpellSlots();
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

  // ---- 口语评测（麦克风发音评分） ----
  startSpeak() {
    if (this._locked) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      this.skipSpeak();
      return;
    }
    const status = document.getElementById("speak-status");
    const micBtn = document.getElementById("mic-btn");
    const target = this.battle.current.correct;

    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 3;

    if (status) status.innerHTML = '<span style="color:var(--accent)">🎙️ 聆听中…请朗读</span>';
    if (micBtn) micBtn.textContent = "🎙️ 录音中…";

    let done = false;
    rec.onresult = (e) => {
      done = true;
      const alts = [];
      for (let i = 0; i < e.results[0].length; i++) alts.push(e.results[0][i].transcript);
      const quality = this._scorePronunciation(target, alts);
      this._finishSpeak(quality, alts[0]);
    };
    rec.onerror = () => {
      if (done) return;
      if (status) status.innerHTML = '<span style="color:var(--danger)">没听清，可重试或跳过朗读。</span>';
      if (micBtn) micBtn.textContent = "🎤 重新朗读";
    };
    rec.onend = () => {
      if (!done && micBtn) micBtn.textContent = "🎤 重新朗读";
    };
    try {
      rec.start();
    } catch (err) {
      this.skipSpeak();
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
      // 连击分级视觉
      const comboEl = document.getElementById("combo");
      if (comboEl) {
        comboEl.classList.remove("fire", "inferno");
        if (res.combo >= 10) comboEl.classList.add("inferno");
        else if (res.combo >= 5) comboEl.classList.add("fire");
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
      // BOSS 击杀庆祝
      if (res.monsterDead && !res.formEvolved) {
        setTimeout(() => FX.bossKill(), 200);
      }
    } else {
      this._shipHit(res);
      FX.shake(10, 400);
      FX.flash("#ef4444", 150);
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
    const banner = document.createElement("div");
    banner.className = "alert-banner";
    banner.innerHTML = `
      <div class="text-center animate__animated animate__zoomIn">
        <div style="font-size:72px">${st.monster.emoji}</div>
        <div class="text-2xl font-black" style="color:${st.monster.color}">怪兽进化！</div>
        <div class="opacity-90 mt-1">${st.monster.name} 出现了！</div>
      </div>`;
    document.body.appendChild(banner);
    Sound.alarm();
    setTimeout(() => {
      banner.remove();
      cb();
    }, 1300);
  },

  quitBattle() {
    if (confirm("确定撤退吗？本次战斗的进度将保留已收集的水晶。")) {
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
      sub = "成功剿灭来袭的遗忘怪兽，记忆又巩固了一层！";
      icon = "✨";
    } else if (b.win && b.perfectClear) {
      title = "⭐ 完美通关！";
      sub = "三形态 BOSS 全灭 + 水晶集齐 + 遗忘队列清零，星域恢复光明！";
      icon = "🏆";
    } else if (b.win) {
      title = "星域解放！";
      sub = "三形态遗忘吞噬怪全部击败！新星域已解锁！继续复习可达成「完美通关」。";
      icon = "🎉";
    } else if (hpZero) {
      title = "飞船进入充能模式";
      sub = "护盾耗尽，飞船自动休眠充能。先去现实世界休息一下吧！";
      icon = "😴";
    } else {
      title = "本轮突袭结束";
      sub = "成功守住防线，记忆又巩固了一层！";
      icon = "✨";
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
          <div class="flex justify-center"><div style="width:48px;height:48px">${w.svg}</div></div>
          <div class="font-bold mt-1" style="color:${w.color}">${w.name}</div>
          <div class="text-xs opacity-60">${w.desc}</div>
          ${w.ability ? `<div class="text-xs mt-1" style="color:var(--gold)">⚡ ${w.ability}</div>` : ""}
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
          <div class="flex justify-center"><div style="width:52px;height:52px">${pet.svg}</div></div>
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
    Storage.save();
    Sound.win();
    FX.crystalBurst(window.innerWidth / 2, window.innerHeight / 2, 12);
    this.showPets();
  },

  // ============ 宠物舱 ============
  showPets() {
    const pets = Storage.get().pets || [];
    const p = Storage.get().player;
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
        return `
          <div class="panel p-4 text-center">
            <div class="flex justify-center"><div style="width:64px;height:64px">${def.svg}</div></div>
            <div class="font-bold mt-1" style="color:${def.color}">${def.name}</div>
            <div class="text-xs" style="color:var(--gold)">Lv.${pp.level}${maxed ? " MAX" : ""}</div>
            <div class="text-xs opacity-60 mt-1">⚡ ${def.ability}</div>
            <div class="hpbar mt-2"><i style="width:${pct}%;background:linear-gradient(90deg,${def.color},var(--gold))"></i></div>
            <div class="text-xs opacity-50 mt-1">EXP ${pp.exp}/${expNeeded}</div>
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
        <p class="text-xs opacity-60 mt-2">喂养宠物提升等级，解锁更强的战斗加成！</p>
        <div class="grid grid-cols-2 gap-3 mt-4">${content}</div>
        <div class="h-6"></div>
      </div>`);
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
      FX.explode(window.innerWidth / 2, window.innerHeight / 3, 24, [def.color, "#fbbf24", "#fff"]);
    } else {
      Sound.correct();
    }
    pp.fedAt = Date.now();
    Storage.save();
    this.showPets();
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
            ${pending > 0 ? `当前还有 <b style="color:var(--danger)">${pending}</b> 个遗忘怪兽潜伏，建议尽快出击！` : "暂无待清剿的遗忘怪兽，状态极佳！"}
          </p>
        </div>
        <div class="grid grid-cols-2 gap-3 mt-3">
          <div class="panel p-4 text-center"><div class="text-xs opacity-60">累计答对</div><div class="text-2xl font-black" style="color:var(--ok)">${totalCorrect}</div></div>
          <div class="panel p-4 text-center"><div class="text-xs opacity-60">复习队列</div><div class="text-2xl font-black" style="color:var(--danger)">${pending}</div></div>
        </div>
        <h2 class="text-lg font-bold mt-4 mb-2">⚠️ 高频易错单词</h2>
        <div class="flex flex-wrap gap-2">${wrongList || '<span class="opacity-50 text-sm">暂无易错记录，棒极了！</span>'}</div>

        <h2 class="text-lg font-bold mt-5 mb-2">🏅 成就徽章</h2>
        <div class="grid grid-cols-2 gap-2">${this._renderAchievements()}</div>

        <h2 class="text-lg font-bold mt-5 mb-2">🎖️ 段位晋升</h2>
        ${this._renderRankProgress()}

        <div class="mt-6">
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
};

if (typeof window !== "undefined") window.UI = UI;
