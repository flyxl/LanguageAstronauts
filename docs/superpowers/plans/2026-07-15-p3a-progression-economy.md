# P3A Progression & Economy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 1–50 级航员成长、11 档军衔、星域星章、三项日常任务、防刷规则以及合金/星晶双货币，并安全写入 `SaveDataV5`。

**Architecture:** 所有公式与奖励规则位于纯 TypeScript `domain/progression`，配置仅承载可审计常量；`ProgressionService` 消费强类型答题与战斗事件并返回不可变补丁，由既有存档端口统一提交。时间只能来自注入的 `Clock`，同日防刷使用本地日键和 `contentId` 计数，不读取 Cocos API。

**Tech Stack:** Cocos Creator 3.8.8、TypeScript strict、Vitest、JSON 配置、既有强类型 EventBus 与 SaveDataV5 存档端口。

## Global Constraints

- 目标平台是 iOS/Android 原生独立 App，不是微信小游戏。
- 首发完全离线，不接账号、后端、广告、内购、第三方分析或在线活动。
- 全局横屏；答题使用全屏专注布局，答题与战斗演出不得重叠。
- 不使用 Spine 或其他付费骨骼编辑工具。
- 学习真值、游戏规则和表现层必须隔离；武器、宠物和等级不能修改答案或复习判定。
- 目标用户为小学 1–6 年级，1–3 与 4–6 年级采用不同交互复杂度。
- 每个阶段必须先写失败测试，再实现最小功能，再运行验证。
- 统一目录为 `app/assets/scripts/core/`、`app/assets/scripts/domain/progression/`、`app/assets/config/`、`app/tests/`。
- 共享接口固定为 `Clock.now(): number`、`RandomSource.next(): number`、强类型 `EventBus`、`QuestionResult(outcome, quality, contentId, questionType)`、`BattleSnapshot`、`SaveDataV5`。
- 等级、货币、星章、日常任务不得修改正确答案、掌握度、难度、稳定度或复习到期时间。
- 本计划不迁移旧 Web 的“战功可消费、武器直接购买、星晶喂宠”规则；`js/game.js:400-403`、`js/ui.js:1456-1583`、`js/storage.js:197-208` 仅作冲突审计依据。
- 设计真值：`docs/superpowers/specs/2026-07-15-language-astronauts-cocos-redesign-design.md`。

---

## Shared Contracts

以下接口由 P1 生产，本计划只消费：

```ts
export interface Clock { now(): number }
export interface RandomSource { next(): number }
export type QuestionOutcome = 'first_correct' | 'corrected' | 'wrong' | 'skipped' | 'device_failure'
export type QuestionType = 'choice' | 'listening' | 'reading' | 'spelling' | 'speaking'
export interface QuestionResult {
  outcome: QuestionOutcome
  quality: number
  contentId: string
  questionType: QuestionType
}
export interface EventBus<Events extends Record<string, unknown>> {
  emit<K extends keyof Events>(type: K, payload: Events[K]): void
  on<K extends keyof Events>(type: K, handler: (payload: Events[K]) => void): () => void
}
export interface SaveRepository {
  load(): Promise<SaveDataV5>
  commit(next: SaveDataV5): Promise<void>
}
```

本计划要求 `SaveDataV5.activeChild.progression` 最终采用：

```ts
export interface ProgressionSave {
  totalXp: number
  alloy: number
  starCrystal: number
  contentPracticeByDay: Record<string, Record<string, number>>
  missions: Record<string, { completed: boolean; claimed: boolean; progress: number }>
  navigationLog: string[]
  starMedals: Record<string, 0 | 1 | 2 | 3>
  firstFullStarMissionIds: string[]
  firstKilledBossIds: string[]
}
```

### Task 1: 等级、军衔与解锁公式

**Files:**
- Create: `app/assets/config/progression.json`
- Create: `app/assets/scripts/domain/progression/progression-types.ts`
- Create: `app/assets/scripts/domain/progression/level-rules.ts`
- Test: `app/tests/progression/level-rules.test.ts`

**Interfaces:**
- Consumes: `SaveDataV5.activeChild.progression.totalXp: number`。
- Produces: `xpThreshold(level: number): number`、`levelForXp(totalXp: number): number`、`rankForLevel(level: number): RankDefinition`、`unlocksForLevel(level: number): readonly UnlockId[]`。

- [ ] **Step 1: 写失败测试，锁定 1–50 级公式、11 档军衔与功能解锁**

```ts
import { describe, expect, it } from 'vitest'
import { levelForXp, rankForLevel, unlocksForLevel, xpThreshold } from '../../assets/scripts/domain/progression/level-rules'

describe('level rules', () => {
  it('uses T(L)=round(60*(L-1)^1.55) and caps at 50', () => {
    expect(xpThreshold(1)).toBe(0)
    expect(xpThreshold(2)).toBe(60)
    expect(xpThreshold(10)).toBe(Math.round(60 * 9 ** 1.55))
    expect(levelForXp(xpThreshold(25))).toBe(25)
    expect(levelForXp(Number.MAX_SAFE_INTEGER)).toBe(50)
  })

  it('promotes every five levels across eleven ranks', () => {
    expect(rankForLevel(1).id).toBe('cadet')
    expect(rankForLevel(5).id).toBe('private_third')
    expect(rankForLevel(50).id).toBe('language_ace')
    expect(rankForLevel(50).combatMultiplier).toBe(1)
  })

  it('unlocks systems at exact levels', () => {
    expect(unlocksForLevel(1)).toEqual([])
    expect(unlocksForLevel(2)).toContain('weapon_upgrade')
    expect(unlocksForLevel(3)).toContain('pet_bay')
    expect(unlocksForLevel(5)).toContain('tactical_chip')
    expect(unlocksForLevel(8)).toContain('boss_bounty')
  })
})
```

- [ ] **Step 2: 运行测试并确认因模块缺失而失败**

Run: `cd app && npm test -- tests/progression/level-rules.test.ts`

Expected: FAIL，包含 `Cannot find module '../../assets/scripts/domain/progression/level-rules'`。

- [ ] **Step 3: 写入精确配置和最小实现**

`app/assets/config/progression.json`：

```json
{
  "maxLevel": 50,
  "xpCoefficient": 60,
  "xpExponent": 1.55,
  "rankLevelStarts": [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
  "rankIds": ["cadet", "private_third", "private_second", "private_first", "senior_private", "corporal", "sergeant", "staff_sergeant", "warrant_officer", "second_lieutenant", "language_ace"],
  "unlockLevels": { "weapon_upgrade": 2, "pet_bay": 3, "tactical_chip": 5, "boss_bounty": 8 }
}
```

`app/assets/scripts/domain/progression/progression-types.ts`：

```ts
export type UnlockId = 'weapon_upgrade' | 'pet_bay' | 'tactical_chip' | 'boss_bounty'
export interface RankDefinition {
  id: 'cadet' | 'private_third' | 'private_second' | 'private_first' | 'senior_private' |
    'corporal' | 'sergeant' | 'staff_sergeant' | 'warrant_officer' | 'second_lieutenant' | 'language_ace'
  minLevel: number
  combatMultiplier: 1
}
```

`app/assets/scripts/domain/progression/level-rules.ts`：

```ts
import type { RankDefinition, UnlockId } from './progression-types'

const MAX_LEVEL = 50
const RANK_IDS: RankDefinition['id'][] = [
  'cadet', 'private_third', 'private_second', 'private_first', 'senior_private',
  'corporal', 'sergeant', 'staff_sergeant', 'warrant_officer', 'second_lieutenant', 'language_ace',
]
const UNLOCK_LEVEL: Record<UnlockId, number> = {
  weapon_upgrade: 2, pet_bay: 3, tactical_chip: 5, boss_bounty: 8,
}

export function xpThreshold(level: number): number {
  if (!Number.isInteger(level) || level < 1 || level > MAX_LEVEL) throw new RangeError('level must be 1..50')
  return Math.round(60 * (level - 1) ** 1.55)
}

export function levelForXp(totalXp: number): number {
  const safeXp = Math.max(0, Math.floor(totalXp))
  for (let level = MAX_LEVEL; level >= 1; level -= 1) {
    if (safeXp >= xpThreshold(level)) return level
  }
  return 1
}

export function rankForLevel(level: number): RankDefinition {
  const safeLevel = Math.min(MAX_LEVEL, Math.max(1, Math.floor(level)))
  const index = safeLevel === 50 ? 10 : Math.floor(safeLevel / 5)
  return { id: RANK_IDS[index], minLevel: index === 10 ? 50 : Math.max(1, index * 5), combatMultiplier: 1 }
}

export function unlocksForLevel(level: number): readonly UnlockId[] {
  return (Object.keys(UNLOCK_LEVEL) as UnlockId[]).filter((id) => level >= UNLOCK_LEVEL[id])
}
```

- [ ] **Step 4: 运行等级测试**

Run: `cd app && npm test -- tests/progression/level-rules.test.ts`

Expected: PASS，显示 `3 tests passed`。

- [ ] **Step 5: 提交本任务**

```bash
git add app/assets/config/progression.json app/assets/scripts/domain/progression/progression-types.ts app/assets/scripts/domain/progression/level-rules.ts app/tests/progression/level-rules.test.ts
git commit -m "feat(progression): add level and rank rules"
```

### Task 2: 答题 XP 与同日防刷

**Files:**
- Create: `app/assets/scripts/domain/progression/xp-policy.ts`
- Test: `app/tests/progression/xp-policy.test.ts`

**Interfaces:**
- Consumes: `QuestionResult`、`Clock.now(): number`、`PracticeContext`。
- Produces: `XpPolicy.evaluate(result: QuestionResult, context: PracticeContext, priorCount: number): XpAward`。

- [ ] **Step 1: 写失败测试，覆盖来源、题型、结果倍率和第 3 次非到期练习归零**

```ts
import { describe, expect, it } from 'vitest'
import { XpPolicy } from '../../assets/scripts/domain/progression/xp-policy'

const result = { outcome: 'first_correct', quality: 1, contentId: '3A-U1-v-happy', questionType: 'choice' } as const

describe('XpPolicy', () => {
  const policy = new XpPolicy()
  it('awards base XP by learning context', () => {
    expect(policy.evaluate(result, { source: 'new' }, 0).xp).toBe(10)
    expect(policy.evaluate(result, { source: 'due' }, 9).xp).toBe(14)
    expect(policy.evaluate(result, { source: 'early' }, 0).xp).toBe(4)
  })
  it('applies question and outcome multipliers with final rounding', () => {
    expect(policy.evaluate({ ...result, questionType: 'spelling', outcome: 'corrected' }, { source: 'new' }, 0).xp).toBe(8)
    expect(policy.evaluate({ ...result, questionType: 'speaking', outcome: 'device_failure' }, { source: 'due' }, 0).xp).toBe(4)
  })
  it('blocks the third same-day non-due practice but never blocks due review', () => {
    expect(policy.evaluate(result, { source: 'early' }, 2)).toEqual({ xp: 0, reason: 'daily_repeat_cap' })
    expect(policy.evaluate(result, { source: 'due' }, 20).xp).toBe(14)
  })
})
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `cd app && npm test -- tests/progression/xp-policy.test.ts`

Expected: FAIL，包含 `Cannot find module .../xp-policy`。

- [ ] **Step 3: 实现可审计 XP 策略**

```ts
import type { QuestionResult } from '../../core/question-result'

export interface PracticeContext { source: 'new' | 'due' | 'early' }
export interface XpAward { xp: number; reason: 'awarded' | 'daily_repeat_cap' }

const BASE_XP: Record<PracticeContext['source'], number> = { new: 10, due: 14, early: 4 }
const TYPE_MULTIPLIER: Record<QuestionResult['questionType'], number> = {
  choice: 1, listening: 1, reading: 1, spelling: 1.25, speaking: 1.3,
}
const OUTCOME_MULTIPLIER: Record<QuestionResult['outcome'], number> = {
  first_correct: 1, corrected: 0.65, wrong: 0, skipped: 0.2, device_failure: 0.2,
}

export class XpPolicy {
  evaluate(result: QuestionResult, context: PracticeContext, priorCount: number): XpAward {
    if (context.source !== 'due' && priorCount >= 2) return { xp: 0, reason: 'daily_repeat_cap' }
    const xp = Math.round(BASE_XP[context.source] * TYPE_MULTIPLIER[result.questionType] * OUTCOME_MULTIPLIER[result.outcome])
    return { xp, reason: 'awarded' }
  }
}
```

- [ ] **Step 4: 运行 XP 测试**

Run: `cd app && npm test -- tests/progression/xp-policy.test.ts`

Expected: PASS，显示 `3 tests passed`。

- [ ] **Step 5: 提交本任务**

```bash
git add app/assets/scripts/domain/progression/xp-policy.ts app/tests/progression/xp-policy.test.ts
git commit -m "feat(progression): enforce XP anti-farming"
```

### Task 3: 合金与星晶账本

**Files:**
- Create: `app/assets/scripts/domain/progression/wallet.ts`
- Test: `app/tests/progression/wallet.test.ts`

**Interfaces:**
- Consumes: `ProgressionSave.alloy: number`、`ProgressionSave.starCrystal: number`。
- Produces: `Wallet.credit(currency, amount, reason): LedgerEntry`、`Wallet.spend(currency, amount, reason): LedgerEntry`、`WalletSnapshot`；P3B 消费 `Wallet.spend('alloy', amount, 'weapon_upgrade')`。

- [ ] **Step 1: 写失败测试，锁定双货币用途与非负余额**

```ts
import { describe, expect, it } from 'vitest'
import { Wallet } from '../../assets/scripts/domain/progression/wallet'

describe('Wallet', () => {
  it('credits alloy and star crystal from allowed sources', () => {
    const wallet = new Wallet({ alloy: 0, starCrystal: 0 })
    wallet.credit('alloy', 40, 'campaign_settlement')
    wallet.credit('starCrystal', 2, 'due_review')
    expect(wallet.snapshot()).toEqual({ alloy: 40, starCrystal: 2 })
  })
  it('permits alloy for weapon upgrades and rejects star crystal', () => {
    const wallet = new Wallet({ alloy: 500, starCrystal: 99 })
    expect(wallet.spend('alloy', 80, 'weapon_upgrade').balanceAfter).toBe(420)
    expect(() => wallet.spend('starCrystal', 1, 'weapon_upgrade')).toThrow('currency_not_allowed')
  })
  it('never permits a negative balance', () => {
    expect(() => new Wallet({ alloy: 10, starCrystal: 0 }).spend('alloy', 11, 'weapon_upgrade')).toThrow('insufficient_funds')
  })
})
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `cd app && npm test -- tests/progression/wallet.test.ts`

Expected: FAIL，包含 `Cannot find module .../wallet`。

- [ ] **Step 3: 实现白名单账本**

```ts
export type Currency = 'alloy' | 'starCrystal'
export type CreditReason = 'campaign_settlement' | 'normal_mission' | 'due_review' | 'first_full_star' | 'boss_first_kill'
export type SpendReason = 'weapon_upgrade' | 'pet_cosmetic' | 'base_toy' | 'projectile_color' | 'finisher_animation'
export interface WalletSnapshot { alloy: number; starCrystal: number }
export interface LedgerEntry { currency: Currency; delta: number; reason: CreditReason | SpendReason; balanceAfter: number }

const SPEND_CURRENCY: Record<SpendReason, Currency> = {
  weapon_upgrade: 'alloy',
  pet_cosmetic: 'starCrystal',
  base_toy: 'starCrystal',
  projectile_color: 'starCrystal',
  finisher_animation: 'starCrystal',
}

export class Wallet {
  private value: WalletSnapshot
  constructor(initial: WalletSnapshot) { this.value = { ...initial } }
  snapshot(): WalletSnapshot { return { ...this.value } }
  credit(currency: Currency, amount: number, reason: CreditReason): LedgerEntry {
    if (!Number.isInteger(amount) || amount <= 0) throw new Error('invalid_amount')
    this.value[currency] += amount
    return { currency, delta: amount, reason, balanceAfter: this.value[currency] }
  }
  spend(currency: Currency, amount: number, reason: SpendReason): LedgerEntry {
    if (SPEND_CURRENCY[reason] !== currency) throw new Error('currency_not_allowed')
    if (!Number.isInteger(amount) || amount <= 0) throw new Error('invalid_amount')
    if (this.value[currency] < amount) throw new Error('insufficient_funds')
    this.value[currency] -= amount
    return { currency, delta: -amount, reason, balanceAfter: this.value[currency] }
  }
}
```

- [ ] **Step 4: 运行钱包测试**

Run: `cd app && npm test -- tests/progression/wallet.test.ts`

Expected: PASS，显示 `3 tests passed`。

- [ ] **Step 5: 提交本任务**

```bash
git add app/assets/scripts/domain/progression/wallet.ts app/tests/progression/wallet.test.ts
git commit -m "feat(economy): add restricted dual-currency wallet"
```

### Task 4: 星域短任务与三星章

**Files:**
- Create: `app/assets/config/star-regions.json`
- Create: `app/assets/scripts/domain/progression/star-medals.ts`
- Test: `app/tests/progression/star-medals.test.ts`

**Interfaces:**
- Consumes: `MissionLearningSummary { missionId; completed; firstAttemptCorrectRate; targetCorrectRate; dueReviewCompleted }`。
- Produces: `evaluateStarMedals(summary): 0 | 1 | 2 | 3`、`isMissionUnlocked(previousMissionCompleted: boolean): boolean`。

- [ ] **Step 1: 写失败测试，证明解锁不要求满星**

```ts
import { describe, expect, it } from 'vitest'
import { evaluateStarMedals, isMissionUnlocked } from '../../assets/scripts/domain/progression/star-medals'

describe('star medals', () => {
  it('awards one star per explicit condition', () => {
    expect(evaluateStarMedals({ missionId: '3A-U1-M1', completed: true, firstAttemptCorrectRate: 0.7, targetCorrectRate: 0.8, dueReviewCompleted: false })).toBe(1)
    expect(evaluateStarMedals({ missionId: '3A-U1-M1', completed: true, firstAttemptCorrectRate: 0.8, targetCorrectRate: 0.8, dueReviewCompleted: true })).toBe(3)
  })
  it('unlocks next mission from completion, not full stars', () => {
    expect(isMissionUnlocked(true)).toBe(true)
    expect(isMissionUnlocked(false)).toBe(false)
  })
})
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `cd app && npm test -- tests/progression/star-medals.test.ts`

Expected: FAIL，包含 `Cannot find module .../star-medals`。

- [ ] **Step 3: 写入 3–5 短任务配置样例和规则**

`app/assets/config/star-regions.json`：

```json
{
  "3A-U1": {
    "missionIds": ["3A-U1-M1", "3A-U1-M2", "3A-U1-M3"],
    "targetFirstAttemptCorrectRate": 0.8,
    "fullStarRewards": ["story", "boss_skin", "collection"]
  }
}
```

`app/assets/scripts/domain/progression/star-medals.ts`：

```ts
export interface MissionLearningSummary {
  missionId: string
  completed: boolean
  firstAttemptCorrectRate: number
  targetCorrectRate: number
  dueReviewCompleted: boolean
}

export function evaluateStarMedals(summary: MissionLearningSummary): 0 | 1 | 2 | 3 {
  const count = Number(summary.completed) +
    Number(summary.firstAttemptCorrectRate >= summary.targetCorrectRate) +
    Number(summary.dueReviewCompleted)
  return count as 0 | 1 | 2 | 3
}

export function isMissionUnlocked(previousMissionCompleted: boolean): boolean {
  return previousMissionCompleted
}
```

- [ ] **Step 4: 运行星章测试**

Run: `cd app && npm test -- tests/progression/star-medals.test.ts`

Expected: PASS，显示 `2 tests passed`。

- [ ] **Step 5: 提交本任务**

```bash
git add app/assets/config/star-regions.json app/assets/scripts/domain/progression/star-medals.ts app/tests/progression/star-medals.test.ts
git commit -m "feat(progression): add star-region medal rules"
```

### Task 5: 每日三任务与七格航行日志

**Files:**
- Create: `app/assets/scripts/domain/progression/day-key.ts`
- Create: `app/assets/scripts/domain/progression/daily-missions.ts`
- Test: `app/tests/progression/daily-missions.test.ts`

**Interfaces:**
- Consumes: `Clock.now(): number`、`DailyProgressSignal`。
- Produces: `localDayKey(epochMs: number): string`、`DailyMissionTracker.apply(signal): DailyMissionState`、`appendNavigationLog(log, dayKey): string[]`。

- [ ] **Step 1: 写失败测试，锁定固定三任务和“不因漏一天清空”**

```ts
import { describe, expect, it } from 'vitest'
import { DailyMissionTracker, appendNavigationLog } from '../../assets/scripts/domain/progression/daily-missions'

describe('daily missions', () => {
  it('tracks one battle, due cleanup, and one weak-type completion', () => {
    const tracker = new DailyMissionTracker('2026-07-15')
    tracker.apply({ type: 'battle_finished' })
    tracker.apply({ type: 'due_reviews_cleared' })
    const state = tracker.apply({ type: 'weak_question_type_completed', questionType: 'spelling' })
    expect(Object.values(state.missions).every((mission) => mission.completed)).toBe(true)
  })
  it('keeps seven earned entries without resetting on missed days', () => {
    const old = ['2026-07-01', '2026-07-03', '2026-07-10']
    expect(appendNavigationLog(old, '2026-07-15')).toEqual([...old, '2026-07-15'])
    expect(appendNavigationLog([...old, '11', '12', '13', '14'], '2026-07-15')).toHaveLength(7)
  })
})
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `cd app && npm test -- tests/progression/daily-missions.test.ts`

Expected: FAIL，包含 `Cannot find module .../daily-missions`。

- [ ] **Step 3: 实现本地日键和三任务追踪**

`app/assets/scripts/domain/progression/day-key.ts`：

```ts
export function localDayKey(epochMs: number): string {
  const date = new Date(epochMs)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
```

`app/assets/scripts/domain/progression/daily-missions.ts`：

```ts
import type { QuestionType } from '../../core/question-result'

export type DailyMissionId = 'complete_any_battle' | 'clear_due_reviews' | 'complete_weak_type'
export type DailyProgressSignal =
  | { type: 'battle_finished' }
  | { type: 'due_reviews_cleared' }
  | { type: 'weak_question_type_completed'; questionType: QuestionType }
export interface DailyMissionState {
  dayKey: string
  missions: Record<DailyMissionId, { progress: number; completed: boolean; claimed: boolean }>
}

const empty = () => ({ progress: 0, completed: false, claimed: false })

export class DailyMissionTracker {
  private state: DailyMissionState
  constructor(dayKey: string) {
    this.state = { dayKey, missions: { complete_any_battle: empty(), clear_due_reviews: empty(), complete_weak_type: empty() } }
  }
  apply(signal: DailyProgressSignal): DailyMissionState {
    const id: DailyMissionId = signal.type === 'battle_finished' ? 'complete_any_battle' :
      signal.type === 'due_reviews_cleared' ? 'clear_due_reviews' : 'complete_weak_type'
    this.state.missions[id] = { ...this.state.missions[id], progress: 1, completed: true }
    return structuredClone(this.state)
  }
}

export function appendNavigationLog(log: readonly string[], dayKey: string): string[] {
  if (log.includes(dayKey)) return [...log].slice(-7)
  return [...log, dayKey].slice(-7)
}
```

- [ ] **Step 4: 运行日常任务测试**

Run: `cd app && npm test -- tests/progression/daily-missions.test.ts`

Expected: PASS，显示 `2 tests passed`。

- [ ] **Step 5: 提交本任务**

```bash
git add app/assets/scripts/domain/progression/day-key.ts app/assets/scripts/domain/progression/daily-missions.ts app/tests/progression/daily-missions.test.ts
git commit -m "feat(progression): add daily mission tracking"
```

### Task 6: 成长结算服务、强类型事件与 SaveDataV5 集成

**Files:**
- Create: `app/assets/scripts/core/events/progression-events.ts`
- Create: `app/assets/scripts/domain/progression/progression-service.ts`
- Modify: `app/assets/scripts/core/game-event-map.ts`
- Modify: `app/assets/scripts/core/save-data-v5.ts`
- Test: `app/tests/progression/progression-service.test.ts`

**Interfaces:**
- Consumes: `EventBus<GameEventMap>`、`Clock.now(): number`、`SaveRepository`、`QuestionResult`、`BattleSnapshot`。
- Produces: `ProgressionService.recordQuestion(result, context): Promise<void>`、`ProgressionService.settleBattle(input): Promise<ProgressionSettlement>`；事件 `ProgressionAwarded` 与 `WalletChanged` 供基地 UI、P3B 和 P3C 消费。

- [ ] **Step 1: 写失败集成测试，证明一次结算、首次奖励和原子提交**

```ts
import { describe, expect, it, vi } from 'vitest'
import { ProgressionService } from '../../assets/scripts/domain/progression/progression-service'

describe('ProgressionService', () => {
  it('records anti-farm count and emits one settlement after commit', async () => {
    const save = makeSaveDataV5({ totalXp: 0, alloy: 0, starCrystal: 0 })
    const repo = { load: vi.fn(async () => save), commit: vi.fn(async () => undefined) }
    const bus = { emit: vi.fn(), on: vi.fn() }
    const service = new ProgressionService(repo, bus, { now: () => new Date(2026, 6, 15, 12).getTime() })
    await service.recordQuestion(
      { outcome: 'first_correct', quality: 1, contentId: '3A-U1-v-happy', questionType: 'speaking' },
      { source: 'due' },
    )
    await service.settleBattle({ battleId: 'b1', missionId: '3A-U1-M1', alloy: 40, dueReviewCleared: true, firstBossKillId: 'boss-3A-U1' })
    expect(repo.commit).toHaveBeenCalledTimes(2)
    expect(bus.emit).toHaveBeenCalledWith('ProgressionAwarded', expect.objectContaining({ totalXp: 18 }))
    expect(bus.emit).toHaveBeenCalledWith('WalletChanged', expect.objectContaining({ alloy: 40, starCrystal: 3 }))
  })
})
```

- [ ] **Step 2: 运行集成测试并确认失败**

Run: `cd app && npm test -- tests/progression/progression-service.test.ts`

Expected: FAIL，包含 `Cannot find module .../progression-service`。

- [ ] **Step 3: 定义事件并实现结算服务**

`app/assets/scripts/core/events/progression-events.ts`：

```ts
export interface ProgressionAwarded {
  totalXp: number
  levelBefore: number
  levelAfter: number
  xpAwarded: number
}
export interface WalletChanged { alloy: number; starCrystal: number }
export interface ProgressionEventMap {
  ProgressionAwarded: ProgressionAwarded
  WalletChanged: WalletChanged
}
```

将以下交叉类型加入 `GameEventMap`，不得改成字符串索引：

```ts
export interface GameEventMap extends ProgressionEventMap, BattleEventMap, WeaponEventMap, PetEventMap, PresentationEventMap {}
```

`app/assets/scripts/domain/progression/progression-service.ts`：

```ts
import type { Clock } from '../../core/ports/clock'
import type { EventBus } from '../../core/event-bus'
import type { GameEventMap } from '../../core/game-event-map'
import type { QuestionResult } from '../../core/question-result'
import type { SaveRepository } from '../../core/ports/save-repository'
import { localDayKey } from './day-key'
import { levelForXp } from './level-rules'
import { Wallet } from './wallet'
import { XpPolicy, type PracticeContext } from './xp-policy'

export interface BattleProgressionInput {
  battleId: string
  missionId: string
  alloy: number
  dueReviewCleared: boolean
  firstBossKillId?: string
}
export interface ProgressionSettlement { alloy: number; starCrystal: number }

export class ProgressionService {
  constructor(
    private readonly saves: SaveRepository,
    private readonly events: EventBus<GameEventMap>,
    private readonly clock: Clock,
    private readonly xpPolicy = new XpPolicy(),
  ) {}

  async recordQuestion(result: QuestionResult, context: PracticeContext): Promise<void> {
    const save = await this.saves.load()
    const progression = save.activeChild.progression
    const day = localDayKey(this.clock.now())
    const counts = progression.contentPracticeByDay[day] ?? {}
    const priorCount = counts[result.contentId] ?? 0
    const before = progression.totalXp
    const award = this.xpPolicy.evaluate(result, context, priorCount)
    progression.totalXp += award.xp
    counts[result.contentId] = priorCount + 1
    progression.contentPracticeByDay[day] = counts
    await this.saves.commit(save)
    this.events.emit('ProgressionAwarded', {
      totalXp: progression.totalXp,
      levelBefore: levelForXp(before),
      levelAfter: levelForXp(progression.totalXp),
      xpAwarded: award.xp,
    })
  }

  async settleBattle(input: BattleProgressionInput): Promise<ProgressionSettlement> {
    const save = await this.saves.load()
    const progression = save.activeChild.progression
    const wallet = new Wallet({ alloy: progression.alloy, starCrystal: progression.starCrystal })
    wallet.credit('alloy', input.alloy, 'campaign_settlement')
    if (input.dueReviewCleared) wallet.credit('starCrystal', 2, 'due_review')
    if (input.firstBossKillId && !progression.firstKilledBossIds.includes(input.firstBossKillId)) {
      wallet.credit('starCrystal', 1, 'boss_first_kill')
      progression.firstKilledBossIds.push(input.firstBossKillId)
    }
    Object.assign(progression, wallet.snapshot())
    await this.saves.commit(save)
    this.events.emit('WalletChanged', wallet.snapshot())
    return wallet.snapshot()
  }
}
```

- [ ] **Step 4: 运行 P3A 全套测试和类型检查**

Run: `cd app && npm test -- tests/progression && npm run typecheck`

Expected: PASS；Vitest 显示 `13 tests passed`，TypeScript 退出码为 `0` 且无诊断。

- [ ] **Step 5: 提交本任务**

```bash
git add app/assets/scripts/core/events/progression-events.ts app/assets/scripts/core/game-event-map.ts app/assets/scripts/core/save-data-v5.ts app/assets/scripts/domain/progression/progression-service.ts app/tests/progression/progression-service.test.ts
git commit -m "feat(progression): integrate rewards with save v5"
```

## P3A Completion Gate

- [ ] `T(L) = round(60 × (L - 1)^1.55)` 在 1、2、10、25、50 级有固定测试，累计 XP 不下降。
- [ ] 11 档军衔只产生称号/展示数据，`combatMultiplier` 恒为 `1`。
- [ ] 同知识点同日本地非到期练习第 3 次起 XP 为 `0`；到期复习不受该上限影响。
- [ ] 星域每单元配置 3–5 个短任务，后续任务只依赖前置完成，不依赖满星。
- [ ] 三个固定日常任务在 10–15 分钟目标内可完成，七格日志漏日不清零。
- [ ] 合金只用于武器升级；星晶只用于宠物外观、基地玩具、弹道颜色和终结动画。
- [ ] `cd app && npm test -- tests/progression && npm run typecheck` 全部通过。
