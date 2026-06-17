/**
 * 战斗视觉特效系统
 * 粒子爆炸、暴击火焰、BOSS 击杀庆祝烟花、连击能量波、屏幕震动
 */

const FX = {
  container: null,

  init() {
    if (document.getElementById("fx-layer")) return;
    const layer = document.createElement("div");
    layer.id = "fx-layer";
    layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:100;overflow:hidden";
    document.body.appendChild(layer);
    this.container = layer;
  },

  _spawn(html, duration = 1000) {
    this.init();
    const el = document.createElement("div");
    el.innerHTML = html;
    this.container.appendChild(el);
    setTimeout(() => el.remove(), duration);
    return el;
  },

  /** 屏幕震动 */
  shake(intensity = 6, duration = 300) {
    const app = document.getElementById("app");
    if (!app) return;
    app.style.transition = "none";
    const start = Date.now();
    const loop = () => {
      const elapsed = Date.now() - start;
      if (elapsed > duration) {
        app.style.transform = "";
        return;
      }
      const decay = 1 - elapsed / duration;
      const x = (Math.random() - 0.5) * intensity * decay * 2;
      const y = (Math.random() - 0.5) * intensity * decay * 2;
      app.style.transform = `translate(${x}px, ${y}px)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  },

  /** 屏幕闪光 */
  flash(color = "#fff", duration = 150) {
    this.init();
    const el = document.createElement("div");
    el.style.cssText = `position:fixed;inset:0;background:${color};opacity:0.4;z-index:99;transition:opacity ${duration}ms ease;pointer-events:none`;
    this.container.appendChild(el);
    requestAnimationFrame(() => { el.style.opacity = "0"; });
    setTimeout(() => el.remove(), duration + 50);
  },

  /** 粒子爆炸（击中怪兽/击杀时） */
  explode(x, y, count = 16, colors = ["#fbbf24", "#f97316", "#ef4444", "#a78bfa"]) {
    this.init();
    let html = "";
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const dist = 40 + Math.random() * 80;
      const size = 4 + Math.random() * 6;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;
      const dur = 400 + Math.random() * 400;
      html += `<div style="position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;
        border-radius:50%;background:${color};box-shadow:0 0 6px ${color};
        animation:fx-particle ${dur}ms ease-out forwards;
        --tx:${tx}px;--ty:${ty}px"></div>`;
    }
    this._spawn(html, 900);
  },

  /** 暴击火焰环 */
  critRing(x, y) {
    this.init();
    const html = `<div style="position:absolute;left:${x - 50}px;top:${y - 50}px;width:100px;height:100px;
      border-radius:50%;border:4px solid #fbbf24;box-shadow:0 0 30px #f97316,inset 0 0 20px #fbbf24;
      animation:fx-ring 0.5s ease-out forwards"></div>`;
    this._spawn(html, 600);
    this.flash("#fbbf24", 100);
  },

  /** 连击能量波（Combo>=5 时触发） */
  comboWave(level) {
    this.init();
    const colors = level >= 10 ? "#ef4444" : level >= 7 ? "#f97316" : "#fbbf24";
    const html = `<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
      width:10px;height:10px;border-radius:50%;border:3px solid ${colors};
      box-shadow:0 0 40px ${colors};animation:fx-wave 0.6s ease-out forwards"></div>`;
    this._spawn(html, 700);
  },

  /** 星星碎片飞散（获得水晶时） */
  crystalBurst(x, y, count = 8) {
    const colors = ["#67e8f9", "#a5f3fc", "#06b6d4", "#38bdf8"];
    let html = "";
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const dist = 30 + Math.random() * 50;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist - 20;
      const color = colors[Math.floor(Math.random() * colors.length)];
      html += `<div style="position:absolute;left:${x}px;top:${y}px;font-size:${12 + Math.random() * 8}px;
        animation:fx-particle ${400 + Math.random() * 300}ms ease-out forwards;
        --tx:${tx}px;--ty:${ty}px;filter:drop-shadow(0 0 4px ${color})">💎</div>`;
    }
    this._spawn(html, 800);
  },

  /** BOSS 击杀庆祝大烟花 */
  bossKill() {
    this.shake(12, 500);
    this.flash("#fbbf24", 200);
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight * 0.3;
    setTimeout(() => this.explode(cx, cy, 30, ["#fbbf24", "#f97316", "#ef4444", "#e879f9", "#67e8f9"]), 100);
    setTimeout(() => this.explode(cx - 80, cy + 40, 20, ["#a78bfa", "#f0abfc", "#67e8f9"]), 350);
    setTimeout(() => this.explode(cx + 80, cy + 40, 20, ["#34d399", "#fbbf24", "#38bdf8"]), 550);
    setTimeout(() => this._showBossKillText(), 300);
  },

  _showBossKillText() {
    this.init();
    const html = `<div style="position:absolute;left:50%;top:35%;transform:translate(-50%,-50%) scale(0);
      font-size:36px;font-weight:900;text-align:center;
      background:linear-gradient(135deg,#fbbf24,#f97316,#ef4444);-webkit-background-clip:text;background-clip:text;color:transparent;
      text-shadow:0 0 30px rgba(251,191,36,0.5);white-space:nowrap;
      animation:fx-bosstext 1.5s ease forwards">
      💥 BOSS DEFEATED! 💥
    </div>`;
    this._spawn(html, 2000);
  },

  /** 怪兽进化特效 */
  evolve() {
    this.shake(8, 400);
    this.flash("#7c3aed", 150);
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight * 0.25;
    this.explode(cx, cy, 20, ["#7c3aed", "#a78bfa", "#c4b5fd", "#f0abfc"]);
  },

  /** 通关庆祝（全屏撒花） */
  victory() {
    this.init();
    const colors = ["#fbbf24", "#ef4444", "#34d399", "#38bdf8", "#a78bfa", "#f97316", "#e879f9"];
    const emojis = ["⭐", "🌟", "✨", "💫", "🎉", "🎊"];
    let html = "";
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 100;
      const delay = Math.random() * 1500;
      const dur = 2000 + Math.random() * 1500;
      const size = 14 + Math.random() * 16;
      const item = Math.random() > 0.5
        ? `<span style="font-size:${size}px">${emojis[Math.floor(Math.random() * emojis.length)]}</span>`
        : `<div style="width:${size * 0.6}px;height:${size * 0.6}px;background:${colors[Math.floor(Math.random() * colors.length)]};border-radius:${Math.random() > 0.5 ? "50%" : "2px"};"></div>`;
      html += `<div style="position:absolute;left:${x}%;top:-30px;animation:fx-confetti ${dur}ms ${delay}ms ease-in forwards">${item}</div>`;
    }
    this._spawn(html, 4000);
  },

  /** 飞船尾迹特效（始终显示在战斗中） */
  trail(shipEl, color = "#38bdf8") {
    if (!shipEl) return;
    const rect = shipEl.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.bottom - 4;
    this.init();
    const html = `<div style="position:absolute;left:${x}px;top:${y}px;width:3px;height:12px;
      background:${color};border-radius:2px;opacity:0.7;filter:blur(1px);
      animation:fx-trail 0.4s ease-out forwards"></div>`;
    this._spawn(html, 450);
  },
};

// 注入 CSS 动画关键帧
(function injectFxStyles() {
  if (document.getElementById("fx-styles")) return;
  const style = document.createElement("style");
  style.id = "fx-styles";
  style.textContent = `
    @keyframes fx-particle {
      0% { transform: translate(0, 0) scale(1); opacity: 1; }
      100% { transform: translate(var(--tx), var(--ty)) scale(0.3); opacity: 0; }
    }
    @keyframes fx-ring {
      0% { transform: scale(0.3); opacity: 1; }
      100% { transform: scale(2.5); opacity: 0; }
    }
    @keyframes fx-wave {
      0% { width: 10px; height: 10px; opacity: 1; }
      100% { width: 300px; height: 300px; opacity: 0; transform: translate(-50%, -50%); }
    }
    @keyframes fx-bosstext {
      0% { transform: translate(-50%, -50%) scale(0) rotate(-10deg); opacity: 0; }
      30% { transform: translate(-50%, -50%) scale(1.3) rotate(3deg); opacity: 1; }
      60% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
      100% { transform: translate(-50%, -50%) scale(1.1) rotate(0deg); opacity: 0; }
    }
    @keyframes fx-confetti {
      0% { transform: translateY(0) rotate(0deg); opacity: 1; }
      100% { transform: translateY(${window.innerHeight + 100}px) rotate(${360 + Math.random() * 360}deg); opacity: 0.6; }
    }
    @keyframes fx-trail {
      0% { transform: translateY(0); opacity: 0.7; }
      100% { transform: translateY(20px); opacity: 0; height: 2px; }
    }
  `;
  document.head.appendChild(style);
})();

if (typeof window !== "undefined") window.FX = FX;
