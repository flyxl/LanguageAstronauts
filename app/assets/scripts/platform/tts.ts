import { native, sys } from "cc";

export type SpeakRequest = {
  text: string;
  lang?: string;
  enabled: boolean;
};

export type SpeakResult = {
  attempted: boolean;
  backend: "android" | "web" | "none";
};

export type NativeReflection = {
  callStaticMethod: (
    className: string,
    methodName: string,
    methodSignature: string,
    ...args: unknown[]
  ) => unknown;
};

export type WebSpeechSynthesis = {
  cancel: () => void;
  speak: (utterance: unknown) => void;
};

export type WebSpeechUtteranceCtor = new (text: string) => {
  lang: string;
  rate: number;
};

export type TtsEnv = {
  os?: string;
  isNative?: boolean;
  reflection?: NativeReflection | null;
  speechSynthesis?: WebSpeechSynthesis | null;
  SpeechSynthesisUtterance?: WebSpeechUtteranceCtor | null;
};

export function normalizeSpeakText(text: string): string {
  return String(text ?? "").trim();
}

export function resolveTtsBackend(env: TtsEnv): SpeakResult["backend"] {
  const os = String(env.os ?? "").toLowerCase();
  if (env.isNative && os === "android" && env.reflection?.callStaticMethod) {
    return "android";
  }
  if (env.speechSynthesis && env.SpeechSynthesisUtterance) {
    return "web";
  }
  return "none";
}

export function speakLearningText(req: SpeakRequest, env: TtsEnv): SpeakResult {
  const text = normalizeSpeakText(req.text);
  const backend = resolveTtsBackend(env);
  if (!req.enabled || !text) {
    return { attempted: false, backend };
  }

  const lang = req.lang ?? "en-US";

  if (backend === "android" && env.reflection) {
    env.reflection.callStaticMethod(
      "com/cocos/game/TtsBridge",
      "speak",
      "(Ljava/lang/String;Ljava/lang/String;)V",
      text,
      lang
    );
    return { attempted: true, backend };
  }

  if (backend === "web" && env.speechSynthesis && env.SpeechSynthesisUtterance) {
    env.speechSynthesis.cancel();
    const utterance = new env.SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.95;
    env.speechSynthesis.speak(utterance);
    return { attempted: true, backend };
  }

  return { attempted: false, backend: "none" };
}

export function stopLearningSpeech(env: TtsEnv): void {
  const backend = resolveTtsBackend(env);
  if (backend === "android" && env.reflection) {
    env.reflection.callStaticMethod("com/cocos/game/TtsBridge", "stop", "()V");
    return;
  }
  if (backend === "web" && env.speechSynthesis) {
    env.speechSynthesis.cancel();
  }
}

/** Runtime TTS env — must use cc.native on device builds (globalThis.native is empty). */
export function readRuntimeTtsEnv(): TtsEnv {
  let reflection: NativeReflection | null = null;
  try {
    const bridge = native?.reflection;
    if (bridge?.callStaticMethod) {
      reflection = bridge as NativeReflection;
    }
  } catch {
    reflection = null;
  }

  const g = globalThis as {
    speechSynthesis?: WebSpeechSynthesis;
    SpeechSynthesisUtterance?: WebSpeechUtteranceCtor;
  };

  return {
    os: sys.os,
    isNative: sys.isNative,
    reflection,
    speechSynthesis: g.speechSynthesis ?? null,
    SpeechSynthesisUtterance: g.SpeechSynthesisUtterance ?? null,
  };
}
