import catalog from "../../app/assets/content/catalog.json";
import type { AppEvents } from "../../app/assets/scripts/core/app-events";
import { EventBus } from "../../app/assets/scripts/core/event-bus";
import { BattleSession } from "../../app/assets/scripts/domain/battle/battle-session";
import type { BattleQuestion } from "../../app/assets/scripts/domain/battle/question-builder";
import type { ContentCatalog } from "../../app/assets/scripts/domain/content/content-types";
import { ProfileService } from "../../app/assets/scripts/domain/profile/profile-service";
import { calculateLevel } from "../../app/assets/scripts/domain/progression/xp";
import { PETS, type PetId } from "../../app/assets/scripts/domain/progression/pets";
import { ensureChildProgression } from "../../app/assets/scripts/domain/save/create-default-save";
import { WEAPONS, type WeaponId } from "../../app/assets/scripts/domain/weapons/weapons";
import { MathRandomSource } from "../../app/assets/scripts/infrastructure/system/math-random-source";
import { SystemClock } from "../../app/assets/scripts/infrastructure/system/system-clock";
import { LocalStorageSaveRepository } from "../../app/assets/scripts/infrastructure/system/local-storage-save-repository";

const root = document.getElementById("app")!;
const fxRoot = document.getElementById("fx")!;
const clock = new SystemClock();
const random = new MathRandomSource();
const repo = new LocalStorageSaveRepository();
const bus = new EventBus<AppEvents>();
const profile = new ProfileService(repo, clock, random);
const content = catalog as ContentCatalog;

let session: BattleSession | null = null;
let currentQ: BattleQuestion | null = null;
let answering = false;
let spellBuffer = "";

const BOSS_EMOJI = ["👾", "📖", "🐙", "🐲"];

async function boot() {
  await profile.start();
  render();
}

function save() {
  return profile.currentSave();
}

function activeChild() {
  const s = save();
  return s.activeChildId ? s.children[s.activeChildId] : null;
}

function prog() {
  const child = activeChild();
  if (!child) return null;
  return ensureChildProgression(save(), child.id);
}

function speak(text: string) {
  if (!save().settings.ttsEnabled || !("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = /[\u4e00-\u9fff]/.test(text) ? "zh-CN" : "en-US";
  u.rate = u.lang.startsWith("zh") ? 1.05 : 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

function beep(ok: boolean) {
  if (!save().settings.soundEnabled) return;
  try {
    const ctx = new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = ok ? "triangle" : "square";
    o.frequency.value = ok ? 880 : 180;
    g.gain.value = 0.08;
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.12);
  } catch {
    /* ignore */
  }
}

function shake() {
  if (save().settings.reduceMotion) return;
  root.animate(
    [
      { transform: "translate(0)" },
      { transform: "translate(-6px, 2px)" },
      { transform: "translate(5px, -2px)" },
      { transform: "translate(0)" }
    ],
    { duration: 220 }
  );
}

function fireBeam(color: string) {
  if (save().settings.reduceMotion) return;
  const el = document.createElement("div");
  el.className = "beam";
  el.style.setProperty("--accent", color);
  el.style.left = "80px";
  el.style.bottom = "40px";
  fxRoot.appendChild(el);
  setTimeout(() => el.remove(), 400);
}

function floatDamage(text: string) {
  const el = document.createElement("div");
  el.className = "float-dmg";
  el.textContent = text;
  el.style.left = "50%";
  el.style.top = "30%";
  fxRoot.appendChild(el);
  setTimeout(() => el.remove(), 800);
}

function render() {
  const child = activeChild();
  if (!child) {
    root.innerHTML = renderOnboarding();
    bindOnboarding();
    return;
  }
  if (session && !session.finished) {
    root.innerHTML = renderBattle();
    bindBattle();
    return;
  }
  if (session?.finished) {
    root.innerHTML = renderSettlement();
    bindSettlement();
    return;
  }
  root.innerHTML = renderBase();
  bindBase();
}

function renderOnboarding() {
  return `<div class="stack">
    <h1 class="title-glow">时空语航员</h1>
    <p class="muted">创建孩子档案，开始教材同步星际训练（Cocos 领域层驱动 · Web 可玩切片）。</p>
    <div class="panel stack">
      <label>孩子名字<input class="input" id="name" placeholder="小航员" /></label>
      <label>教材
        <select id="textbook">
          <option value="hujiao-oxford-2024">沪教牛津 2024</option>
          <option value="hujiao-kouyu">沪教口语交际</option>
        </select>
      </label>
      <label>年级学期
        <select id="grade">${["1A","1B","2A","2B","3A","3B","4A","4B","5A","5B","6A","6B"].map((g)=>`<option ${g==="3A"?"selected":""}>${g}</option>`).join("")}</select>
      </label>
      <button class="btn" id="create">创建并出发</button>
    </div>
  </div>`;
}

function bindOnboarding() {
  document.getElementById("create")!.onclick = async () => {
    const name = (document.getElementById("name") as HTMLInputElement).value;
    const textbookId = (document.getElementById("textbook") as HTMLSelectElement).value;
    const grade = (document.getElementById("grade") as HTMLSelectElement).value;
    await profile.createChild({ name: name || "小航员", textbookId, grade });
    await repo.commit(save());
    render();
  };
}

function renderBase() {
  const child = activeChild()!;
  const p = prog()!;
  const level = calculateLevel(p.totalXp);
  const units = content.units;
  return `<div class="stack">
    <div class="row" style="justify-content:space-between">
      <div>
        <h1 class="title-glow">${child.name}</h1>
        <div class="row">
          <span class="chip">Lv.${level}</span>
          <span class="chip">合金 ${p.alloy}</span>
          <span class="chip">星晶 ${p.starCrystals}</span>
          <span class="chip">${WEAPONS[p.weaponId as WeaponId]?.name ?? p.weaponId}</span>
        </div>
      </div>
      <button class="btn secondary" id="settings">设置</button>
    </div>
    <div class="panel stack">
      <h2>星图远征 · ${child.grade}</h2>
      <p class="muted">四关 Boss（听/读/拼/说）· 知识装甲 · 答对发射</p>
      <div class="stack">${units.map((unit) => {
        const stars = p.unitStars[unit.id] ?? 0;
        return `<div class="row" style="justify-content:space-between;align-items:flex-start">
          <div>
            <b>${unit.title}</b>
            <div class="muted">${unit.items.length} 语言点 · 星章 ${stars}/3</div>
          </div>
          <button class="btn" data-start="${unit.id}">出击</button>
        </div>`;
      }).join("")}</div>
    </div>
    <div class="panel stack">
      <h2>武器库</h2>
      <div class="stack">${Object.values(WEAPONS).map((w) => {
        const owned = p.ownedWeapons.includes(w.id);
        const eq = p.weaponId === w.id;
        return `<div class="row" style="justify-content:space-between">
          <div><b style="color:${w.color}">${w.name}</b> <span class="muted">${w.label}</span></div>
          ${eq ? `<span class="chip">已装备</span>` : owned
            ? `<button class="btn secondary" data-eq="${w.id}">装备</button>`
            : `<button class="btn secondary" data-buy-w="${w.id}">合金 ${w.id==="pulse"?0:w.id==="plasma"?80:w.id==="flame"?120:w.id==="frost"?160:220}</button>`}
        </div>`;
      }).join("")}</div>
    </div>
    <div class="panel stack">
      <h2>宠物舱（出战最多 2）</h2>
      <div class="stack">${Object.values(PETS).map((pet) => {
        const owned = p.petIds.includes(pet.id);
        const deployed = p.deployedPets.includes(pet.id);
        return `<div class="row" style="justify-content:space-between">
          <div><b style="color:${pet.color}">${pet.name}</b> <span class="muted">${pet.describe(p.petBond[pet.id]??1)}</span></div>
          ${!owned
            ? `<button class="btn secondary" data-buy-p="${pet.id}">星晶 ${pet.priceCrystal}</button>`
            : `<button class="btn secondary" data-dep="${pet.id}">${deployed?"撤下":"出战"}</button>`}
        </div>`;
      }).join("")}</div>
    </div>
  </div>`;
}

function bindBase() {
  root.querySelectorAll<HTMLButtonElement>("[data-start]").forEach((btn) => {
    btn.onclick = () => {
      const child = activeChild()!;
      const unit = content.units.find((u) => u.id === btn.dataset.start)!;
      session = new BattleSession(
        unit.id,
        unit.items,
        save(),
        child.id,
        clock,
        random,
        bus,
        "campaign"
      );
      currentQ = session.nextQuestion();
      answering = false;
      spellBuffer = "";
      render();
    };
  });
  document.getElementById("settings")!.onclick = () => {
    const s = save().settings;
    s.soundEnabled = !s.soundEnabled;
    void repo.commit(save()).then(render);
  };
  root.querySelectorAll<HTMLButtonElement>("[data-eq]").forEach((btn) => {
    btn.onclick = async () => {
      prog()!.weaponId = btn.dataset.eq!;
      await repo.commit(save());
      render();
    };
  });
  root.querySelectorAll<HTMLButtonElement>("[data-buy-w]").forEach((btn) => {
    btn.onclick = async () => {
      const id = btn.dataset.buyW! as WeaponId;
      const prices: Record<WeaponId, number> = { pulse: 0, plasma: 80, flame: 120, frost: 160, thunder: 220 };
      const p = prog()!;
      const cost = prices[id];
      if (p.alloy < cost) return alert("合金不足");
      p.alloy -= cost;
      if (!p.ownedWeapons.includes(id)) p.ownedWeapons.push(id);
      p.weaponId = id;
      await repo.commit(save());
      render();
    };
  });
  root.querySelectorAll<HTMLButtonElement>("[data-buy-p]").forEach((btn) => {
    btn.onclick = async () => {
      const id = btn.dataset.buyP! as PetId;
      const pet = PETS[id];
      const p = prog()!;
      if (p.starCrystals < pet.priceCrystal) return alert("星晶不足");
      p.starCrystals -= pet.priceCrystal;
      p.petIds.push(id);
      p.petBond[id] = 1;
      if (p.deployedPets.length < 2) p.deployedPets.push(id);
      await repo.commit(save());
      render();
    };
  });
  root.querySelectorAll<HTMLButtonElement>("[data-dep]").forEach((btn) => {
    btn.onclick = async () => {
      const id = btn.dataset.dep!;
      const p = prog()!;
      if (p.deployedPets.includes(id)) {
        p.deployedPets = p.deployedPets.filter((x) => x !== id);
      } else if (p.deployedPets.length < 2) {
        p.deployedPets.push(id);
      } else {
        alert("最多出战 2 只");
      }
      await repo.commit(save());
      render();
    };
  });
}

function renderBattle() {
  const hud = session!.hud();
  const q = currentQ!;
  const p = prog()!;
  const color = WEAPONS[p.weaponId as WeaponId]?.color ?? "#38bdf8";
  return `<div class="stack">
    <div class="row" style="justify-content:space-between">
      <span class="chip">${hud.bossName} · ${hud.bossSkill}</span>
      <span class="chip">形态 ${hud.formIndex + 1}/${hud.formTotal}</span>
      <button class="btn secondary" id="quit">撤离</button>
    </div>
    <div>
      <div class="muted">飞船护盾</div>
      <div class="bar danger"><i style="width:${(hud.shipHp / hud.shipMaxHp) * 100}%"></i></div>
    </div>
    <div>
      <div class="muted">知识装甲 · ${hud.phase}（${hud.nodesRemaining}/${hud.nodesTotal}）</div>
      <div class="bar phase"><i style="width:${(hud.nodesRemaining / hud.nodesTotal) * 100}%"></i></div>
    </div>
    <div class="battle-stage">
      <div class="boss" id="boss">${BOSS_EMOJI[hud.formIndex] ?? "👾"}</div>
      <div class="ship">🚀</div>
      <div class="pets">${p.deployedPets.map((id) => (id === "star_fox" ? "🦊" : id === "nebula_cat" ? "🐱" : "🐉")).join("")}</div>
    </div>
    <div class="row">
      <span class="chip">Combo ${hud.combo}</span>
      <span class="chip">动量 ${hud.momentum}</span>
      <span class="chip">水晶 +${hud.crystals}</span>
    </div>
    <div class="panel stack">
      <div class="muted">${q.promptLabel}</div>
      <h2>${q.prompt}</h2>
      ${q.type === "listening" || q.type === "speaking" ? `<button class="btn secondary" id="replay">🔊 再听一遍</button>` : ""}
      ${renderAnswerArea(q)}
    </div>
  </div>`;
}

function renderAnswerArea(q: BattleQuestion) {
  if (q.type === "spelling") {
    return `<div class="muted">已拼：<b id="spellOut">${spellBuffer || "…"}</b></div>
      <div class="letters" id="letters">${q.letters!.map((ch, i) => `<button class="letter" data-i="${i}" data-ch="${ch}">${ch}</button>`).join("")}</div>
      <div class="row"><button class="btn secondary" id="spellClear">清空</button><button class="btn" id="spellSubmit">发射</button></div>`;
  }
  if (q.type === "speaking") {
    return `<p class="muted">朗读：<b>${q.correct}</b></p>
      <div class="row">
        <button class="btn" id="speakOk">我已朗读（评分）</button>
        <button class="btn secondary" id="speakSkip">弱激光辅助</button>
      </div>`;
  }
  return `<div class="option-grid">${q.options
    .map((o) => `<button class="option" data-choice="${encodeURIComponent(o)}">${o}</button>`)
    .join("")}</div>`;
}

function bindBattle() {
  document.getElementById("quit")!.onclick = async () => {
    session = null;
    currentQ = null;
    await repo.commit(save());
    render();
  };
  document.getElementById("replay")?.addEventListener("click", () => speak(currentQ!.speakText));
  if (currentQ?.type === "listening") speak(currentQ.speakText);

  root.querySelectorAll<HTMLButtonElement>("[data-choice]").forEach((btn) => {
    btn.onclick = () => void submit(decodeURIComponent(btn.dataset.choice!));
  });
  document.getElementById("spellClear")?.addEventListener("click", () => {
    spellBuffer = "";
    render();
  });
  document.getElementById("spellSubmit")?.addEventListener("click", () => void submit(spellBuffer));
  root.querySelectorAll<HTMLButtonElement>(".letter").forEach((btn) => {
    btn.onclick = () => {
      spellBuffer += btn.dataset.ch!;
      btn.disabled = true;
      const out = document.getElementById("spellOut");
      if (out) out.textContent = spellBuffer;
    };
  });
  document.getElementById("speakOk")?.addEventListener("click", () =>
    void submit(currentQ!.correct, { quality: 0.85 })
  );
  document.getElementById("speakSkip")?.addEventListener("click", () =>
    void submit(currentQ!.correct, { assisted: true, quality: 0.55 })
  );
}

async function submit(choice: string, opts: { quality?: number; assisted?: boolean } = {}) {
  if (!session || !currentQ || answering) return;
  answering = true;
  const p = prog()!;
  const color = WEAPONS[p.weaponId as WeaponId]?.color ?? "#38bdf8";
  const res = session.answer(choice, opts);
  if (res.correct) {
    beep(true);
    fireBeam(color);
    document.getElementById("boss")?.classList.add("hit");
    floatDamage(`-${res.damage + res.petDamage}`);
  } else {
    beep(false);
    shake();
  }
  await new Promise((r) => setTimeout(r, save().settings.reduceMotion ? 200 : 650));
  if (session.finished) {
    await repo.commit(save());
    answering = false;
    spellBuffer = "";
    render();
    return;
  }
  currentQ = session.nextQuestion();
  spellBuffer = "";
  answering = false;
  render();
}

function renderSettlement() {
  const win = session!.win;
  const hud = session!.hud();
  return `<div class="stack">
    <h1 class="title-glow">${win ? "星域解放！" : "紧急撤离"}</h1>
    <div class="panel stack">
      <div class="chip">XP +${hud.xpGained}</div>
      <div class="chip">合金 +${hud.alloyGained}</div>
      <div class="chip">水晶 ${hud.crystals}</div>
      <p class="muted">${win ? "知识装甲已被清空。继续巩固复习可争取更多星章。" : "保留学习进度，休整后再战。"}</p>
      <button class="btn" id="home">返回基地</button>
    </div>
  </div>`;
}

function bindSettlement() {
  document.getElementById("home")!.onclick = () => {
    session = null;
    currentQ = null;
    render();
  };
}

boot();
