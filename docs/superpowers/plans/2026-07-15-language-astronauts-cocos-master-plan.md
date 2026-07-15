# 《时空语航员》Cocos 独立 App 总体实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有 Web/PWA 英语学习游戏全量迁移为离线优先的 Cocos Creator iOS/Android 独立 App，并交付电影化指令战斗、等级、武器、宠物、音画反馈和旧存档迁移。

**Architecture:** 以纯 TypeScript 领域层承载学习调度、战斗和成长规则，Cocos 场景只负责交互与表现；教材、武器、宠物和 Boss 均配置驱动。实施拆成十份独立计划，每份产生可运行、可测试、可评审的交付物。

**Tech Stack:** Cocos Creator 3.8.8、TypeScript、Vitest、Cocos Native iOS/Android、JSON Schema、Cocos Animation/ParticleSystem2D、原生文件与触觉桥接。

## Global Constraints

- 目标平台是 iOS/Android 原生独立 App，不是微信小游戏。
- 首发完全离线，不接账号、后端、广告、内购、第三方分析或在线活动。
- 全局横屏；答题使用全屏专注布局，答题与战斗演出不得重叠。
- 不使用 Spine 或其他付费骨骼编辑工具。
- 学习真值、游戏规则和表现层必须隔离；武器、宠物和等级不能修改答案或复习判定。
- 目标用户为小学 1–6 年级，1–3 与 4–6 年级采用不同交互复杂度。
- 每个阶段必须先写失败测试，再实现最小功能，再运行验证。
- 不批量制作全量美术，直到 P2 纵向切片通过。
- 设计真值：`docs/superpowers/specs/2026-07-15-language-astronauts-cocos-redesign-design.md`。

---

## 执行顺序

1. `2026-07-15-p0-documentation-alignment.md`（文档真值；README/current-state 已部分落地）
2. `2026-07-15-p1-cocos-foundation.md`
3. `2026-07-15-p2-vertical-slice.md`
4. `2026-07-15-p3a-progression-economy.md`
5. `2026-07-15-p3b-weapon-system.md`
6. `2026-07-15-p3c-pet-system.md`
7. `2026-07-15-p3d-audio-animation.md`
8. `2026-07-15-p4a-curriculum-migration.md`
9. `2026-07-15-p4b-learning-save-migration.md`（待补全文，门禁见下）
10. `2026-07-15-p5-native-release.md`（待补全文，门禁见下）

## 阶段门禁

- [x] **P0 → P1：** 当前态和目标态文档均有状态标识，已知文档冲突全部关闭。
- [ ] **P1 → P2：** 纯 TypeScript 领域测试通过，六场景骨架可导航，存档可恢复。
- [ ] **P2 → P3：** `3A-U1 How do we feel?` 在 iOS/Android 真机完成一局，低端设备不低于 30 FPS。
- [ ] **P3 → P4：** 5 武器、3 宠物、等级经济和音画系统均配置驱动且有自动化测试。
- [ ] **P4 → P5：** 两套教材全部通过 schema 校验，FSRS 和 v4 导入通过固定样例测试。
- [ ] **发布门禁：** 真机矩阵、离线启动、导入导出、断电恢复和完整学习闭环全部通过。

## 提交策略

每份子计划中的任务单独提交。提交只能包含该任务列出的文件；不得把后续阶段的脚手架、临时资源或无关重构混入当前提交。
