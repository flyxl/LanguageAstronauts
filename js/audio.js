/**
 * 音效与语音
 * - SFX：用 WebAudio 合成，无需外部音频文件（0 资源体积）。
 * - 语音：使用浏览器内置 SpeechSynthesis 朗读英文单词/句子（发音教学）。
 */

const Sound = {
  ctx: null,
  _narrateQueue: [],
  _narrating: false,

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

  _pickVoice(lang) {
    if (!("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (lang === "en-US") {
      return voices.find((v) => v.lang.startsWith("en")) || null;
    }
    return voices.find((v) => v.lang.includes("zh") || v.lang.includes("CN")) || null;
  },

  _drainNarrateQueue() {
    if (this._narrating || !this._narrateQueue.length) return;
    if (!this._enabled() || !("speechSynthesis" in window)) {
      this._narrateQueue.forEach((item) => item.resolve());
      this._narrateQueue = [];
      return;
    }

    const { text, opts, resolve } = this._narrateQueue.shift();
    this._narrating = true;
    const synth = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance(text);
    const lang = opts.lang || "zh-CN";
    u.lang = lang;
    u.rate = opts.rate || 1.1;
    u.pitch = opts.pitch || 1.2;
    u.volume = opts.volume ?? 1;
    const voice = this._pickVoice(lang);
    if (voice) u.voice = voice;

    let resumeTimer = null;
    const finish = () => {
      if (resumeTimer) clearInterval(resumeTimer);
      this._narrating = false;
      resolve();
      this._drainNarrateQueue();
    };

    u.onend = finish;
    u.onerror = finish;
    u.onstart = () => {
      resumeTimer = setInterval(() => {
        if (synth.speaking || synth.pending) synth.resume();
      }, 4000);
    };

    synth.speak(u);
    if (synth.paused) synth.resume();
  },

  /** 中文语音播报（游戏事件解说）；多条自动排队，避免互相打断 */
  narrate(text, opts = {}) {
    if (!this._enabled() || !("speechSynthesis" in window)) {
      return Promise.resolve();
    }
    const raw = String(text || "").trim();
    if (!raw) return Promise.resolve();
    return new Promise((resolve) => {
      this._narrateQueue.push({ text: raw, opts, resolve });
      this._drainNarrateQueue();
    });
  },

  /** 清空待播报到队列（不影响正在播放的一句） */
  clearNarrateQueue() {
    this._narrateQueue = [];
  },

  /** 朗读英文（教学发音）；会中断游戏解说队列 */
  speak(text) {
    if (!this._enabled()) return;
    if (!("speechSynthesis" in window)) return;
    const raw = String(text || "").trim();
    if (!raw) return;
    try {
      this.clearNarrateQueue();
      this._narrating = false;
      const synth = window.speechSynthesis;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(raw);
      u.lang = "en-US";
      u.rate = 0.85;
      u.pitch = 1;
      const enVoice = this._pickVoice("en-US");
      if (enVoice) u.voice = enVoice;
      synth.speak(u);
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
};

if (typeof window !== "undefined") window.Sound = Sound;
