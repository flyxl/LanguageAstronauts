/**
 * 音效与语音
 * - SFX：用 WebAudio 合成，无需外部音频文件（0 资源体积）。
 * - 语音：使用浏览器内置 SpeechSynthesis 朗读英文单词/句子（发音教学）。
 */

const Sound = {
  ctx: null,

  _ensure() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this._warmupTTS();
      } catch (e) {
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  },

  _enabled() {
    return Storage.get().settings.sound;
  },

  _beep(freq, duration, type = "sine", gain = 0.15) {
    if (!this._enabled()) return;
    const ctx = this._ensure();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(g).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  },

  laser() {
    if (!this._enabled()) return;
    const ctx = this._ensure();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(900, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.25);
    g.gain.setValueAtTime(0.18, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
    osc.connect(g).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  },

  correct() {
    this._beep(660, 0.12, "triangle");
    setTimeout(() => this._beep(990, 0.16, "triangle"), 90);
  },

  wrong() {
    this._beep(200, 0.25, "square", 0.12);
  },

  combo() {
    this._beep(880, 0.08, "triangle");
    setTimeout(() => this._beep(1175, 0.1, "triangle"), 70);
  },

  alarm() {
    this._beep(440, 0.15, "square", 0.12);
    setTimeout(() => this._beep(330, 0.2, "square", 0.12), 160);
  },

  win() {
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this._beep(f, 0.18, "triangle"), i * 130));
  },

  /** 朗读英文（教学发音） */
  speak(text) {
    if (!this._enabled()) return;
    if (!("speechSynthesis" in window)) return;
    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = 0.85;
      u.pitch = 1;
      // 优先选择英文语音
      const voices = synth.getVoices();
      const enVoice = voices.find(v => v.lang.startsWith("en") && !v.localService === false)
        || voices.find(v => v.lang.startsWith("en"));
      if (enVoice) u.voice = enVoice;
      synth.speak(u);
      // iOS workaround: speechSynthesis 会在后台暂停，需要恢复
      if (synth.paused) synth.resume();
    } catch (e) {
      /* 忽略 */
    }
  },

  /** 预加载语音列表（应在首次用户交互时调用） */
  _warmupTTS() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.getVoices();
    const u = new SpeechSynthesisUtterance("");
    u.volume = 0;
    window.speechSynthesis.speak(u);
  },

  /** 中文语音播报（游戏事件解说） */
  narrate(text, opts = {}) {
    if (!this._enabled()) return;
    if (!("speechSynthesis" in window)) return;
    try {
      const synth = window.speechSynthesis;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = opts.lang || "zh-CN";
      u.rate = opts.rate || 1.1;
      u.pitch = opts.pitch || 1.2;
      u.volume = opts.volume || 1;
      const voices = synth.getVoices();
      if (opts.lang === "en-US") {
        const v = voices.find(v => v.lang.startsWith("en"));
        if (v) u.voice = v;
      } else {
        const v = voices.find(v => v.lang.includes("zh") || v.lang.includes("CN"));
        if (v) u.voice = v;
      }
      synth.speak(u);
      if (synth.paused) synth.resume();
    } catch (e) {}
  },
};

if (typeof window !== "undefined") window.Sound = Sound;
