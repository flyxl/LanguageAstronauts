import { describe, expect, it, vi } from "vitest";
import {
  normalizeSpeakText,
  resolveTtsBackend,
  speakLearningText,
  stopLearningSpeech,
  type TtsEnv,
} from "../../assets/scripts/platform/tts";

describe("tts", () => {
  it("normalizes speak text", () => {
    expect(normalizeSpeakText("  hello  ")).toBe("hello");
    expect(normalizeSpeakText("")).toBe("");
  });

  it("prefers android reflection when native", () => {
    const env: TtsEnv = {
      isNative: true,
      os: "Android",
      reflection: { callStaticMethod: vi.fn() },
    };
    expect(resolveTtsBackend(env)).toBe("android");
  });

  it("falls back to web speech synthesis", () => {
    const env: TtsEnv = {
      speechSynthesis: { cancel: vi.fn(), speak: vi.fn() },
      SpeechSynthesisUtterance: class {
        lang = "";
        rate = 1;
        constructor(public text: string) {}
      },
    };
    expect(resolveTtsBackend(env)).toBe("web");
  });

  it("does not speak when disabled or empty", () => {
    const callStaticMethod = vi.fn();
    const env: TtsEnv = {
      isNative: true,
      os: "Android",
      reflection: { callStaticMethod },
    };
    expect(speakLearningText({ text: "hi", enabled: false }, env).attempted).toBe(false);
    expect(speakLearningText({ text: "  ", enabled: true }, env).attempted).toBe(false);
    expect(callStaticMethod).not.toHaveBeenCalled();
  });

  it("calls android bridge with english voice", () => {
    const callStaticMethod = vi.fn();
    const env: TtsEnv = {
      isNative: true,
      os: "Android",
      reflection: { callStaticMethod },
    };
    const result = speakLearningText({ text: "happy", enabled: true }, env);
    expect(result).toEqual({ attempted: true, backend: "android" });
    expect(callStaticMethod).toHaveBeenCalledWith(
      "com/cocos/game/TtsBridge",
      "speak",
      "(Ljava/lang/String;Ljava/lang/String;)V",
      "happy",
      "en-US"
    );
  });

  it("stops android speech", () => {
    const callStaticMethod = vi.fn();
    const env: TtsEnv = {
      isNative: true,
      os: "Android",
      reflection: { callStaticMethod },
    };
    stopLearningSpeech(env);
    expect(callStaticMethod).toHaveBeenCalledWith("com/cocos/game/TtsBridge", "stop", "()V");
  });
});
