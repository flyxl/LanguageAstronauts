# P2 Vertical Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用固定单元 `3A-U1 How do we feel?` 打通一条可真机运行的「选教材孩子 → 开战 → 全屏答题 → 演出 → 结算」竖切，证明架构与手感，再横向铺武器/宠物/全教材。

**Architecture:** 领域层纯 TS（学习出题 + BattleDirector 状态机 + 知识装甲）；Cocos 场景只订阅表现事件。内容先硬编码/小 JSON，不接全量 data.js。

**Tech Stack:** Cocos Creator 3.8.8、TypeScript、Vitest、真机 iOS/Android。

## Global Constraints

- 独立 App，非微信；全局横屏；答题与演出不重叠。
- 设计规格 §5–§8、§11。
- 前置：`p1-cocos-foundation` 通过。
- 门禁：真机一局完成且低端 ≥30 FPS。

---

### Task 1: Minimal curriculum pack

- [ ] `app/assets/config/content/3A-U1.json`（子集 vocab+dialogue）
- [ ] schema + loader 测试
- [ ] commit

### Task 2: Learning question picker (slice)

- [ ] 实现五种题型最小生成器（从 Web `game.js` 移植干扰逻辑）
- [ ] 错题延后 2–3 题位
- [ ] commit

### Task 3: BattleDirector + knowledge armor

- [ ] 状态机：`Entering → QuestionFocus → CommandResolve → Presentation → PhaseCheck → Settlement`
- [ ] 每阶段 3 知识装甲节点；一次有效作答最多破 1 节点
- [ ] 领域测试覆盖通关题量不因高伤害缩短
- [ ] commit

### Task 4: Fullscreen question UI

- [ ] 2×2 / 1×4 / 字母块 / 听力自动播 / 口语跟读占位（可先跳过识别）
- [ ] 答题期暂停战斗层
- [ ] commit

### Task 5: Presentation for pulse + listen boss only

- [ ] 一种武器弹道 + 一个 Boss 外形区分
- [ ] PresentationEvent 接线
- [ ] commit

### Task 6: Settlement + save progress

- [ ] 写回单元 crystals/completed 字段（兼容迁移映射）
- [ ] commit

### Task 7: Device gate

- [ ] iOS + Android 各跑通一局录像清单
- [ ] FPS 抽样记录进 `docs/qa/p2-slice-notes.md`
- [ ] commit

## 验收

- [ ] 不看策划也能按本计划交付可玩切片
- [ ] 知识装甲规则有自动化测试
- [ ] 真机门禁签字
