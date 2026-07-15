# P4B Learning Save Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 Web `localStorage` v4 多孩子存档无损导入 Cocos 离线存档，并完成艾宾浩斯层级 → 目标态掌握模型的可逆映射。

**Architecture:** 纯函数迁移器 `migrateV4ToV2(raw): SaveV2`；导入前备份；失败回滚。领域测试用固定 JSON fixtures。

**Tech Stack:** TypeScript、Vitest、设备文件桥。

## Global Constraints

- `suit/classic` → `weaponId=pulse`；保留 score/crystals/progress/pets。
- 学习数据优先保真：不得清空孩子已学记录。
- 前置：`p4a-curriculum-migration`。

---

### Task 1: Fixture corpus

- [ ] 从真实/合成 v4 JSON 固化 3 套 fixtures（空、中度、满武器满宠）
- [ ] commit

### Task 2: Schema V2 + migrator

- [ ] 映射表与默认补齐
- [ ] 断言：孩子数、武器拥有、复习条数下限
- [ ] commit

### Task 3: Ebbinghaus → mastery mapping

- [ ] Level 1–5 → 稳定度种子公式（见设计规格 §6）
- [ ] 错词 wrong 计数保留
- [ ] commit

### Task 4: Import UI + backup

- [ ] 选择文件 → 预览摘要 → 确认替换
- [ ] 失败不破坏旧档
- [ ] commit

## 验收

- [ ] fixtures 全绿
- [ ] 真机导入后可继续同一单元
