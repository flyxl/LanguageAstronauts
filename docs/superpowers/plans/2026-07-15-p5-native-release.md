# P5 Native Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 产出可安装的 iOS/Android 离线包，完成真机矩阵、权限、图标与崩溃兜底。

**Architecture:** Cocos 原生构建流水线；无账号后端；麦克风权限仅在口语题申请。

**Tech Stack:** Cocos Creator 原生构建、Xcode、Android Studio。

## Global Constraints

- 独立 App，非微信、无广告无内购。
- 前置：P0–P4 门禁通过。

---

### Task 1: App identity

- [ ] Bundle ID / 应用名 / 图标 / 启动图
- [ ] commit 配置

### Task 2: Permissions & offline

- [ ] 麦克风用途说明；拒绝后口语走跟读自评
- [ ] 断网冷启动可进基地与开战
- [ ] commit

### Task 3: Device matrix

| 机型档 | iOS | Android |
| --- | --- | --- |
| 低端 | 最近 2 代入门 | 4GB RAM 机型 |
| 中端 | 常规机 | 中端 SoC |
| 检查项 | 切片一局、导入导出、触觉、TTS、口语降级 | 同左 |

- [ ] 填写 `docs/qa/p5-device-matrix.md`
- [ ] commit

### Task 4: Crash & recovery

- [ ] 战斗中杀进程 → 再进可恢复或安全回基地
- [ ] commit

## 验收

- [ ] 两平台安装包可分发测试
- [ ] 矩阵全绿
- [ ] 无强制联网弹窗
