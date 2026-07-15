# P3C Pet System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 交付 3 只首发宠物的配置驱动编队、羁绊升级、形态切换与战场主动/共鸣演出，且任何宠物效果不得修改答题对错或复习判定。

**Architecture:** `domain/pets` 消费 `QuestionResult` / `BattleSnapshot`，输出 `PetCommand`（护盾、标记、动量保护、终结演出请求）；表现层订阅事件播放动画。配置入口 `app/assets/config/pets.json`。

**Tech Stack:** Cocos Creator 3.8.8、TypeScript、Vitest、JSON 配置、ParticleSystem2D / 帧动画（禁 Spine）。

## Global Constraints

- 独立 iOS/Android App；离线首发；武器/宠物不得改答案或调度。
- 编队：1 先锋 + 1 支援；共鸣技每组合固定。
- 羁绊 1–20；5/12/20 形态节点。
- 旧物种 ID `star_fox` / `nebula_cat` / `crystal_dragon` 原样保留。
- 设计真值：`docs/superpowers/specs/2026-07-15-language-astronauts-cocos-redesign-design.md` §10。
- 前置：`p3a-progression-economy`、`p3b-weapon-system`、纵向切片 `p2`。

---

### Task 1: pets.json schema + catalog

**Files:**
- Create: `app/assets/config/pets.json`
- Create: `app/assets/scripts/domain/pets/pet-types.ts`
- Create: `app/assets/scripts/domain/pets/pet-catalog.ts`
- Test: `app/tests/pets/pet-catalog.test.ts`

- [ ] **Step 1:** 写失败测试：三物种、三阶段阈值、技能 id 齐全
- [ ] **Step 2:** 实现 catalog + validate
- [ ] **Step 3:** Vitest PASS
- [ ] **Step 4:** Commit `feat(pets): add pet catalog`

### Task 2: Bond / evolution domain

**Files:**
- Create: `app/assets/scripts/domain/pets/pet-progress.ts`
- Test: `app/tests/pets/pet-progress.test.ts`

规则摘要（规格 §10.3）：

```
有效作答 +1 羁绊 XP；到期复习首次答对额外 +1；每日基地互动 +3
5 → 成长形态；12 → 专属任务后进化；20 → 星辉觉醒
```

- [ ] 写失败测试覆盖阈值与每日上限
- [ ] 实现 + 验证 + commit

### Task 3: Deployment + resonance

**Files:**
- Create: `app/assets/scripts/domain/pets/pet-loadout.ts`
- Create: `app/assets/config/pet-resonances.json`
- Test: `app/tests/pets/pet-loadout.test.ts`

- [ ] 先锋/支援槽校验
- [ ] 组合共鸣表 3×3 对角线+配对
- [ ] commit

### Task 4: Battle PetDirector

**Files:**
- Create: `app/assets/scripts/domain/pets/pet-director.ts`
- Test: `app/tests/pets/pet-director.test.ts`

- [ ] 对 `first_correct` / `wrong` / `phase_end` 发出命令
- [ ] 断言不能跳过知识装甲节点
- [ ] commit

### Task 5: Presentation wiring

**Files:**
- Create: `app/assets/scripts/presentation/battle/PetPresenter.ts`
- Modify: 战斗场景宠物挂点

- [ ] 先锋常驻、支援切入、共鸣首次完整播放后续可跳过
- [ ] 编辑器内预览 3 宠命中/技能循环
- [ ] commit

### Task 6: Save migration hooks

- [ ] v4 pets[] → 羁绊字段补齐默认值
- [ ] 测试固定样例
- [ ] commit

## 验收

- [ ] 三宠外貌与技能演出可区分
- [ ] 答错动量保护（星云猫）不修改 wrong 判定
- [ ] 共鸣不增加必须题量之外的通关捷径
- [ ] Vitest 宠物域全绿
