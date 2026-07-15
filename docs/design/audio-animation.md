# 音画与触觉真值

> **Status:** Target  
> **Applies to:** Cocos 独立 App v2  
> **Last verified:** 2026-07-15

## 1. 音频总线

至少六总线：`Master`、`BGM`、`SFX`、`Voice`（教学英语）、`Narration`（中文解说）、`UI`。

设置开关：`bgm` / `sfx` / `tts` / `haptics`。

## 2. 动态音乐

五状态：`menu` / `battle_normal` / `battle_boss` / `review_alert` / `victory`。  
跨状态淡化 **0.4–0.8** 秒；英语 `Voice` 播放时 BGM **−12 dB** ducking。

## 3. 攻击表现事件链

每次有效攻击：`prepare` → `launch` → `impact` → `recover`。  
逻辑伤害结算只发生在 **`impact`**。  
命中停顿档位：**33 / 67 / 100** ms；停顿不冻结教学语音。

## 4. 性能预算

- 目标 **60** FPS，低端保底 **30** FPS；
- 高档活动粒子 ≤ **400**，低档 ≤ **120**；
- 同时播放声音 ≤ **16**；
- 高/中/低三档特效；「减少动态效果」关闭强震屏、快闪与视差。

## 5. 触觉

`light` / `medium` / `heavy` 映射原生 API；关闭时零调用。
