# P3D Audio Animation Haptics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 交付可配置 BGM/SFX/VO 总线、战斗表现事件驱动动效、以及 iOS/Android 触觉，满足「答对必有可感知爽感」且可全部关闭。

**Architecture:** `AudioDirector` + `FxDirector` 只订阅领域 `PresentationEvent`；资源缺失时走超时兜底，禁止卡死状态机。禁 Spine。

**Tech Stack:** Cocos AudioSource、Animation、ParticleSystem2D、原生 vibrate 桥、Vitest（事件契约）。

## Global Constraints

- 设计规格 §12；性能：低端机战斗 ≥30 FPS。
- Settings：`bgm` / `sfx` / `tts` / `haptics` 四分开关。
- 前置：`p2-vertical-slice`；与 `p3b`/`p3c` 表现事件契约对齐。

---

### Task 1: PresentationEvent 契约

**Files:**
- Create: `app/assets/scripts/core/presentation-events.ts`
- Test: `app/tests/core/presentation-events.test.ts`

事件至少：`WeaponCharge` `BeamTravel` `Hit` `Crit` `ComboBanner` `BossEvolve` `BossKill` `PetSkill` `ShieldHurt` `RankUp` `LevelUp`

- [ ] 失败测试 → 实现联合类型 → PASS → commit

### Task 2: AudioDirector + buses

**Files:**
- Create: `app/assets/scripts/infrastructure/audio/AudioDirector.ts`
- Create: `app/assets/config/audio_cues.json`

- [ ] BGM crossfade 400ms；SFX 同 ID 节流 50ms；VO 队列语义对齐旧 `narrate`
- [ ] 无资源时 silent no-op，不抛异常
- [ ] commit

### Task 3: FxDirector + timing table

**Files:**
- Create: `app/assets/scripts/presentation/battle/FxDirector.ts`
- Create: `app/assets/config/battle_timing.json`

时序对齐规格攻击演出（充能→弹道→命中→飘字）；选项在序列结束前禁用。

- [ ] 编辑器 timeline 预览 pulse 武器完整循环
- [ ] commit

### Task 4: Haptics bridge

**Files:**
- Create: `app/assets/scripts/infrastructure/native/Haptics.ts`

- [ ] light/medium/heavy 映射 iOS/Android
- [ ] 设置关闭时零调用
- [ ] commit

### Task 5: Settings UI

- [ ] 四分开关写入存档并即时生效
- [ ] commit

## 验收

- [ ] 四 Boss / 五武器弹道音画可区分
- [ ] Combo 3/5/10 专属反馈
- [ ] 关闭任一总线不崩溃
- [ ] 真机触觉可感
