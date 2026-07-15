# P3B Weapon System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 交付 5 个配置驱动武器家族、1–10 级升级、3/7 二选一模块、5 级必杀、10 级终极模块，并从结构上保证任何伤害和模块都不能跳过知识装甲节点。

**Architecture:** `domain/weapons` 只消费 `QuestionResult`、`BattleSnapshot` 和显式战斗信号，输出表现伤害、护盾/冻结等 `WeaponCommand`，不持有学习状态。知识装甲由 `domain/battle/knowledge-armor.ts` 单点裁决：一次有效作答至多破坏一个节点，额外伤害只累积为核心阶段表现值。

**Tech Stack:** Cocos Creator 3.8.8、TypeScript strict、Vitest、JSON 武器配置、强类型 EventBus、P3A Wallet。

## Global Constraints

- 目标平台是 iOS/Android 原生独立 App，不是微信小游戏。
- 首发完全离线，不接账号、后端、广告、内购、第三方分析或在线活动。
- 全局横屏；答题使用全屏专注布局，答题与战斗演出不得重叠。
- 不使用 Spine 或其他付费骨骼编辑工具。
- 学习真值、游戏规则和表现层必须隔离；武器、宠物和等级不能修改答案或复习判定。
- 每个阶段必须先写失败测试，再实现最小功能，再运行验证。
- 武器固定为一件主武器、两个永久模块；等级 1–10；3、7 级各解锁一次二选一模块；5 级解锁专属必杀；10 级解锁终极模块。
- 升级成本固定为 `80 + 40 × (CurrentLevel - 1)` 合金；星晶不得购买武器数值。
- 武器 1–10 级总基础伤害差约 35%，任何高伤害、暴击、灼烧、连锁和终结技都不能减少必须完成的核心题量。
- 旧武器 ID `pulse/plasma/flame/frost/thunder` 原样保留；`classic` 仅在 P4 迁移时归一为 `pulse`。
- 本计划明确替换 `js/combat.js:5-10,134-175` 的直接倍率/水晶增益和 `js/game.js:382-388` 的 Boss 保底 1 HP 隐式规则，不复制旧全局对象。
- 统一目录为 `app/assets/scripts/core/`、`app/assets/scripts/domain/weapons/`、`app/assets/scripts/domain/battle/`、`app/assets/config/`、`app/tests/`。
- 设计真值：`docs/superpowers/specs/2026-07-15-language-astronauts-cocos-redesign-design.md`。

---

## Shared Contracts

```ts
export interface Clock { now(): number }
export interface RandomSource { next(): number }
export interface QuestionResult {
  outcome: 'first_correct' | 'corrected' | 'wrong' | 'skipped' | 'device_failure'
  quality: number
  contentId: string
  questionType: 'choice' | 'listening' | 'reading' | 'spelling' | 'speaking'
}
export interface BattleSnapshot {
  battleId: string
  phaseId: string
  phase: 'shield' | 'armor' | 'core'
  knowledgeArmorRemaining: number
  coreHp: number
  momentum: 0 | 1 | 2 | 3 | 4 | 5
  distinctContentIds: readonly string[]
  dueReview: boolean
}
```

P3A 生产并由本计划消费：

```ts
export interface Wallet {
  spend(currency: 'alloy' | 'starCrystal', amount: number, reason: 'weapon_upgrade' | 'pet_cosmetic' | 'base_toy' | 'projectile_color' | 'finisher_animation'): LedgerEntry
  snapshot(): { alloy: number; starCrystal: number }
}
```

### Task 1: 武器配置 Schema 与完整五武器目录

**Files:**
- Create: `app/assets/config/weapons.json`
- Create: `app/assets/scripts/domain/weapons/weapon-types.ts`
- Create: `app/assets/scripts/domain/weapons/weapon-catalog.ts`
- Test: `app/tests/weapons/weapon-catalog.test.ts`

**Interfaces:**
- Consumes: 配置加载器 `ConfigLoader.loadJson<T>(path: string): Promise<T>`。
- Produces: `WeaponId`、`WeaponDefinition`、`WeaponCatalog.get(id): WeaponDefinition`、`WeaponCatalog.validate(): readonly string[]`。

- [ ] **Step 1: 写失败测试，要求五个稳定 ID 和完整里程碑**

```ts
import { describe, expect, it } from 'vitest'
import config from '../../assets/config/weapons.json'
import { WeaponCatalog } from '../../assets/scripts/domain/weapons/weapon-catalog'

describe('WeaponCatalog', () => {
  it('contains exactly five non-random blueprint weapons', () => {
    const catalog = new WeaponCatalog(config)
    expect(catalog.ids()).toEqual(['pulse', 'plasma', 'flame', 'frost', 'thunder'])
    expect(catalog.validate()).toEqual([])
    for (const id of catalog.ids()) {
      expect(catalog.get(id).acquisition).toBe('campaign_blueprint')
      expect(catalog.get(id).milestones).toEqual({ moduleA: 3, finisher: 5, moduleB: 7, ultimate: 10 })
      expect(catalog.get(id).visualLevels).toEqual([1, 5, 10])
    }
  })
})
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `cd app && npm test -- tests/weapons/weapon-catalog.test.ts`

Expected: FAIL，包含 `Cannot find module .../weapon-catalog`。

- [ ] **Step 3: 定义类型并写入完整配置**

`app/assets/scripts/domain/weapons/weapon-types.ts`：

```ts
export type WeaponId = 'pulse' | 'plasma' | 'flame' | 'frost' | 'thunder'
export type WeaponModuleId =
  | 'pulse_reinforced_shield' | 'pulse_momentum_buffer' | 'pulse_steady_core' | 'pulse_safe_overcharge' | 'pulse_ultimate_bastion'
  | 'plasma_extra_drone' | 'plasma_stable_drone' | 'plasma_crossfire' | 'plasma_chain_salvo' | 'plasma_ultimate_squadron'
  | 'flame_hotter_burn' | 'flame_armor_siphon' | 'flame_long_burn' | 'flame_safe_detonation' | 'flame_ultimate_inferno'
  | 'frost_double_barrier' | 'frost_quick_freeze' | 'frost_cold_guard' | 'frost_phase_lock' | 'frost_ultimate_zero'
  | 'thunder_due_amp' | 'thunder_chain_guard' | 'thunder_fourth_target' | 'thunder_storm_shield' | 'thunder_ultimate_judgment'
export interface WeaponDefinition {
  id: WeaponId
  role: string
  acquisition: 'campaign_blueprint'
  baseDamageLevel1: number
  baseDamageLevel10: number
  trigger: string
  milestones: { moduleA: 3; finisher: 5; moduleB: 7; ultimate: 10 }
  moduleChoices: { level3: readonly [WeaponModuleId, WeaponModuleId]; level7: readonly [WeaponModuleId, WeaponModuleId]; level10: WeaponModuleId }
  visualLevels: readonly [1, 5, 10]
}
```

`app/assets/config/weapons.json`：

```json
[
  {"id":"pulse","role":"stable_defense","acquisition":"campaign_blueprint","baseDamageLevel1":100,"baseDamageLevel10":135,"trigger":"every_3_effective_commands_grant_shield; corrected_momentum_loss_halved","milestones":{"moduleA":3,"finisher":5,"moduleB":7,"ultimate":10},"moduleChoices":{"level3":["pulse_reinforced_shield","pulse_momentum_buffer"],"level7":["pulse_steady_core","pulse_safe_overcharge"],"level10":"pulse_ultimate_bastion"},"visualLevels":[1,5,10]},
  {"id":"plasma","role":"combo_multihit","acquisition":"campaign_blueprint","baseDamageLevel1":100,"baseDamageLevel10":135,"trigger":"consecutive_first_correct_builds_1_to_3_drones; momentum_drop_removes_one_drone","milestones":{"moduleA":3,"finisher":5,"moduleB":7,"ultimate":10},"moduleChoices":{"level3":["plasma_extra_drone","plasma_stable_drone"],"level7":["plasma_crossfire","plasma_chain_salvo"],"level10":"plasma_ultimate_squadron"},"visualLevels":[1,5,10]},
  {"id":"flame","role":"armor_sustain","acquisition":"campaign_blueprint","baseDamageLevel1":100,"baseDamageLevel10":135,"trigger":"first_correct_adds_burn; detonate_at_phase_end; burn_never_breaks_knowledge_armor","milestones":{"moduleA":3,"finisher":5,"moduleB":7,"ultimate":10},"moduleChoices":{"level3":["flame_hotter_burn","flame_armor_siphon"],"level7":["flame_long_burn","flame_safe_detonation"],"level10":"flame_ultimate_inferno"},"visualLevels":[1,5,10]},
  {"id":"frost","role":"defense_control","acquisition":"campaign_blueprint","baseDamageLevel1":100,"baseDamageLevel10":135,"trigger":"every_2_effective_commands_freezes_boss_attack_counter_1_and_grants_barrier","milestones":{"moduleA":3,"finisher":5,"moduleB":7,"ultimate":10},"moduleChoices":{"level3":["frost_double_barrier","frost_quick_freeze"],"level7":["frost_cold_guard","frost_phase_lock"],"level10":"frost_ultimate_zero"},"visualLevels":[1,5,10]},
  {"id":"thunder","role":"due_review_burst","acquisition":"campaign_blueprint","baseDamageLevel1":100,"baseDamageLevel10":135,"trigger":"due_first_correct_chains; 3_distinct_content_ids_trigger_execution","milestones":{"moduleA":3,"finisher":5,"moduleB":7,"ultimate":10},"moduleChoices":{"level3":["thunder_due_amp","thunder_chain_guard"],"level7":["thunder_fourth_target","thunder_storm_shield"],"level10":"thunder_ultimate_judgment"},"visualLevels":[1,5,10]}
]
```

`app/assets/scripts/domain/weapons/weapon-catalog.ts`：

```ts
import type { WeaponDefinition, WeaponId } from './weapon-types'

export class WeaponCatalog {
  private readonly byId: Map<WeaponId, WeaponDefinition>
  constructor(definitions: readonly WeaponDefinition[]) {
    this.byId = new Map(definitions.map((definition) => [definition.id, definition]))
  }
  ids(): WeaponId[] { return [...this.byId.keys()] }
  get(id: WeaponId): WeaponDefinition {
    const value = this.byId.get(id)
    if (!value) throw new Error(`unknown_weapon:${id}`)
    return value
  }
  validate(): readonly string[] {
    const errors: string[] = []
    if (this.byId.size !== 5) errors.push('weapon_count_must_be_5')
    for (const definition of this.byId.values()) {
      if (definition.baseDamageLevel10 / definition.baseDamageLevel1 > 1.36) errors.push(`${definition.id}:damage_growth_exceeds_36_percent`)
      if (new Set([...definition.moduleChoices.level3, ...definition.moduleChoices.level7]).size !== 4) errors.push(`${definition.id}:module_choices_not_unique`)
    }
    return errors
  }
}
```

- [ ] **Step 4: 运行目录测试**

Run: `cd app && npm test -- tests/weapons/weapon-catalog.test.ts`

Expected: PASS，显示 `1 test passed`。

- [ ] **Step 5: 提交本任务**

```bash
git add app/assets/config/weapons.json app/assets/scripts/domain/weapons/weapon-types.ts app/assets/scripts/domain/weapons/weapon-catalog.ts app/tests/weapons/weapon-catalog.test.ts
git commit -m "feat(weapons): add five-weapon catalog"
```

### Task 2: 1–10 级升级与模块树

**Files:**
- Create: `app/assets/scripts/domain/weapons/weapon-progression.ts`
- Test: `app/tests/weapons/weapon-progression.test.ts`

**Interfaces:**
- Consumes: P3A `Wallet.spend('alloy', amount, 'weapon_upgrade')`、`WeaponDefinition`。
- Produces: `upgradeCost(currentLevel): number`、`WeaponProgression.upgrade()`、`WeaponProgression.chooseModule(level, moduleId)`、`WeaponProgression.resetModules()`。

- [ ] **Step 1: 写失败测试，覆盖成本、等级门槛、两槽和免费重置**

```ts
import { describe, expect, it, vi } from 'vitest'
import { WeaponProgression, upgradeCost } from '../../assets/scripts/domain/weapons/weapon-progression'

describe('WeaponProgression', () => {
  it('uses 80 + 40 * (currentLevel - 1)', () => {
    expect(upgradeCost(1)).toBe(80)
    expect(upgradeCost(9)).toBe(400)
    expect(() => upgradeCost(10)).toThrow('weapon_max_level')
  })
  it('spends alloy and unlocks exact milestones', () => {
    const wallet = { spend: vi.fn(() => ({ balanceAfter: 920 })) }
    const state = { id: 'pulse', level: 2, modules: [] }
    const progression = new WeaponProgression(state, pulseDefinition, wallet as never)
    progression.upgrade()
    progression.chooseModule(3, 'pulse_reinforced_shield')
    expect(wallet.spend).toHaveBeenCalledWith('alloy', 120, 'weapon_upgrade')
    expect(progression.snapshot().modules).toEqual(['pulse_reinforced_shield'])
  })
  it('resets modules for free and retains level', () => {
    const progression = makeLevel10Pulse()
    progression.resetModules()
    expect(progression.snapshot()).toEqual({ id: 'pulse', level: 10, modules: [] })
  })
})
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `cd app && npm test -- tests/weapons/weapon-progression.test.ts`

Expected: FAIL，包含 `Cannot find module .../weapon-progression`。

- [ ] **Step 3: 实现升级和模块选择**

```ts
import type { Wallet } from '../progression/wallet'
import type { WeaponDefinition, WeaponId, WeaponModuleId } from './weapon-types'

export interface WeaponSave { id: WeaponId; level: number; modules: WeaponModuleId[] }
export function upgradeCost(currentLevel: number): number {
  if (!Number.isInteger(currentLevel) || currentLevel < 1) throw new Error('invalid_weapon_level')
  if (currentLevel >= 10) throw new Error('weapon_max_level')
  return 80 + 40 * (currentLevel - 1)
}

export class WeaponProgression {
  private state: WeaponSave
  constructor(initial: WeaponSave, private readonly definition: WeaponDefinition, private readonly wallet: Wallet) {
    this.state = structuredClone(initial)
  }
  upgrade(): WeaponSave {
    this.wallet.spend('alloy', upgradeCost(this.state.level), 'weapon_upgrade')
    this.state.level += 1
    return this.snapshot()
  }
  chooseModule(level: 3 | 7 | 10, moduleId: WeaponModuleId): WeaponSave {
    if (this.state.level < level) throw new Error('module_level_locked')
    const allowed = level === 3 ? this.definition.moduleChoices.level3 :
      level === 7 ? this.definition.moduleChoices.level7 : [this.definition.moduleChoices.level10]
    if (!allowed.includes(moduleId as never)) throw new Error('module_not_in_branch')
    const branchIds = new Set<WeaponModuleId>(allowed as readonly WeaponModuleId[])
    this.state.modules = [...this.state.modules.filter((id) => !branchIds.has(id)), moduleId].slice(-3)
    return this.snapshot()
  }
  resetModules(): WeaponSave { this.state.modules = []; return this.snapshot() }
  snapshot(): WeaponSave { return structuredClone(this.state) }
}
```

- [ ] **Step 4: 运行升级测试**

Run: `cd app && npm test -- tests/weapons/weapon-progression.test.ts`

Expected: PASS，显示 `3 tests passed`。

- [ ] **Step 5: 提交本任务**

```bash
git add app/assets/scripts/domain/weapons/weapon-progression.ts app/tests/weapons/weapon-progression.test.ts
git commit -m "feat(weapons): add upgrades and module branches"
```

### Task 3: 知识装甲不可跳过

**Files:**
- Create: `app/assets/scripts/domain/battle/knowledge-armor.ts`
- Test: `app/tests/battle/knowledge-armor.test.ts`

**Interfaces:**
- Consumes: `QuestionResult`、当前 `BattleSnapshot`、`presentationDamage: number`。
- Produces: `resolveKnowledgeArmor(snapshot, result, presentationDamage): ArmorResolution`；后续所有武器与宠物效果只能通过该函数进入 Boss 结算。

- [ ] **Step 1: 写失败测试，覆盖暴击、灼烧、必杀都不能多破节点**

```ts
import { describe, expect, it } from 'vitest'
import { resolveKnowledgeArmor } from '../../assets/scripts/domain/battle/knowledge-armor'

describe('knowledge armor invariant', () => {
  it.each([100, 1000, 999999])('breaks at most one node for damage %i', (damage) => {
    const snapshot = battleSnapshot({ phase: 'armor', knowledgeArmorRemaining: 3, coreHp: 500 })
    const result = questionResult({ outcome: 'first_correct' })
    expect(resolveKnowledgeArmor(snapshot, result, damage)).toEqual({
      nodesBroken: 1, knowledgeArmorRemaining: 2, coreDamage: 0, presentationDamage: damage,
    })
  })
  it('does not break a node for skipped, device failure, or wrong', () => {
    for (const outcome of ['skipped', 'device_failure', 'wrong'] as const) {
      expect(resolveKnowledgeArmor(battleSnapshot({ knowledgeArmorRemaining: 3 }), questionResult({ outcome }), 9999).nodesBroken).toBe(0)
    }
  })
  it('applies damage to core only after armor is already empty', () => {
    expect(resolveKnowledgeArmor(battleSnapshot({ phase: 'core', knowledgeArmorRemaining: 0, coreHp: 500 }), questionResult({ outcome: 'first_correct' }), 135).coreDamage).toBe(135)
  })
})
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `cd app && npm test -- tests/battle/knowledge-armor.test.ts`

Expected: FAIL，包含 `Cannot find module .../knowledge-armor`。

- [ ] **Step 3: 实现唯一装甲裁决入口**

```ts
import type { BattleSnapshot } from './battle-snapshot'
import type { QuestionResult } from '../../core/question-result'

export interface ArmorResolution {
  nodesBroken: 0 | 1
  knowledgeArmorRemaining: number
  coreDamage: number
  presentationDamage: number
}

export function resolveKnowledgeArmor(
  snapshot: BattleSnapshot,
  result: QuestionResult,
  presentationDamage: number,
): ArmorResolution {
  const valid = result.outcome === 'first_correct' || result.outcome === 'corrected'
  const damage = Math.max(0, Math.round(presentationDamage))
  if (snapshot.knowledgeArmorRemaining > 0) {
    const nodesBroken: 0 | 1 = valid ? 1 : 0
    return {
      nodesBroken,
      knowledgeArmorRemaining: snapshot.knowledgeArmorRemaining - nodesBroken,
      coreDamage: 0,
      presentationDamage: damage,
    }
  }
  return {
    nodesBroken: 0,
    knowledgeArmorRemaining: 0,
    coreDamage: valid && snapshot.phase === 'core' ? Math.min(snapshot.coreHp, damage) : 0,
    presentationDamage: damage,
  }
}
```

- [ ] **Step 4: 运行装甲测试**

Run: `cd app && npm test -- tests/battle/knowledge-armor.test.ts`

Expected: PASS，显示 `5 tests passed`（参数化用例展开计数）。

- [ ] **Step 5: 提交本任务**

```bash
git add app/assets/scripts/domain/battle/knowledge-armor.ts app/tests/battle/knowledge-armor.test.ts
git commit -m "fix(battle): enforce knowledge armor invariant"
```

### Task 4: 五武器运行时触发器

**Files:**
- Create: `app/assets/scripts/domain/weapons/weapon-runtime.ts`
- Create: `app/assets/scripts/domain/weapons/weapon-effects.ts`
- Test: `app/tests/weapons/weapon-runtime.test.ts`

**Interfaces:**
- Consumes: `QuestionResult`、`BattleSnapshot`、`WeaponSave`、阶段结束信号。
- Produces: `WeaponRuntime.onQuestion(result, snapshot): readonly WeaponCommand[]`、`WeaponRuntime.onPhaseEnd(snapshot): readonly WeaponCommand[]`。

- [ ] **Step 1: 写失败测试，逐一固定五武器核心触发**

```ts
import { describe, expect, it } from 'vitest'
import { WeaponRuntime } from '../../assets/scripts/domain/weapons/weapon-runtime'

describe('five weapon triggers', () => {
  it('pulse grants shield every three effective commands', () => {
    const runtime = weaponRuntime('pulse')
    runtime.onQuestion(correctedResult(), snapshot())
    runtime.onQuestion(firstCorrectResult('a'), snapshot())
    expect(runtime.onQuestion(firstCorrectResult('b'), snapshot())).toContainEqual({ type: 'grant_shield', amount: 12 })
  })
  it('plasma builds at most three drones and loses one on momentum drop', () => {
    const runtime = weaponRuntime('plasma')
    for (const id of ['a', 'b', 'c', 'd']) runtime.onQuestion(firstCorrectResult(id), snapshot())
    expect(runtime.state().plasmaDrones).toBe(3)
    runtime.onQuestion(wrongResult(), snapshot())
    expect(runtime.state().plasmaDrones).toBe(2)
  })
  it('flame stacks on first correct and detonates only at phase end', () => {
    const runtime = weaponRuntime('flame')
    expect(runtime.onQuestion(firstCorrectResult('a'), snapshot())).not.toContainEqual(expect.objectContaining({ type: 'core_damage' }))
    expect(runtime.onPhaseEnd(snapshot())).toContainEqual(expect.objectContaining({ type: 'presentation_damage', source: 'burn' }))
  })
  it('frost freezes one counter and grants barrier every two effective commands', () => {
    const runtime = weaponRuntime('frost')
    runtime.onQuestion(correctedResult(), snapshot())
    expect(runtime.onQuestion(firstCorrectResult('a'), snapshot())).toEqual(expect.arrayContaining([
      { type: 'freeze_boss_counter', amount: 1 }, { type: 'grant_shield', amount: 10 },
    ]))
  })
  it('thunder requires due first-correct and three distinct content ids', () => {
    const runtime = weaponRuntime('thunder')
    for (const id of ['a', 'b']) runtime.onQuestion(firstCorrectResult(id), snapshot({ dueReview: true }))
    expect(runtime.onQuestion(firstCorrectResult('c'), snapshot({ dueReview: true }))).toContainEqual({ type: 'presentation_damage', source: 'thunder_execution', amount: 180 })
  })
})
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `cd app && npm test -- tests/weapons/weapon-runtime.test.ts`

Expected: FAIL，包含 `Cannot find module .../weapon-runtime`。

- [ ] **Step 3: 实现统一命令与五个确定性触发器**

`app/assets/scripts/domain/weapons/weapon-effects.ts`：

```ts
export type WeaponCommand =
  | { type: 'presentation_damage'; source: 'base' | 'plasma_salvo' | 'burn' | 'thunder_chain' | 'thunder_execution' | 'finisher'; amount: number }
  | { type: 'grant_shield'; amount: number }
  | { type: 'freeze_boss_counter'; amount: 1 }
  | { type: 'reduce_momentum_loss'; amount: 1 }
```

`app/assets/scripts/domain/weapons/weapon-runtime.ts`：

```ts
import type { QuestionResult } from '../../core/question-result'
import type { BattleSnapshot } from '../battle/battle-snapshot'
import type { WeaponCommand } from './weapon-effects'
import type { WeaponSave } from './weapon-progression'

interface RuntimeState { effective: number; plasmaDrones: number; burn: number; thunderIds: string[] }
const isEffective = (result: QuestionResult) => result.outcome === 'first_correct' || result.outcome === 'corrected'

export class WeaponRuntime {
  private value: RuntimeState = { effective: 0, plasmaDrones: 0, burn: 0, thunderIds: [] }
  constructor(private readonly weapon: WeaponSave) {}
  state(): Readonly<RuntimeState> { return structuredClone(this.value) }
  onQuestion(result: QuestionResult, snapshot: BattleSnapshot): readonly WeaponCommand[] {
    const commands: WeaponCommand[] = []
    if (isEffective(result)) this.value.effective += 1
    if (this.weapon.id === 'pulse') {
      if (this.value.effective > 0 && this.value.effective % 3 === 0) commands.push({ type: 'grant_shield', amount: 12 })
      if (result.outcome === 'corrected') commands.push({ type: 'reduce_momentum_loss', amount: 1 })
    }
    if (this.weapon.id === 'plasma') {
      if (result.outcome === 'first_correct') this.value.plasmaDrones = Math.min(3, this.value.plasmaDrones + 1)
      if (result.outcome === 'wrong') this.value.plasmaDrones = Math.max(0, this.value.plasmaDrones - 1)
      if (this.value.plasmaDrones > 0 && isEffective(result)) commands.push({ type: 'presentation_damage', source: 'plasma_salvo', amount: this.value.plasmaDrones * 20 })
    }
    if (this.weapon.id === 'flame' && result.outcome === 'first_correct') this.value.burn += 24
    if (this.weapon.id === 'frost' && isEffective(result) && this.value.effective % 2 === 0) {
      commands.push({ type: 'freeze_boss_counter', amount: 1 }, { type: 'grant_shield', amount: 10 })
    }
    if (this.weapon.id === 'thunder' && snapshot.dueReview && result.outcome === 'first_correct') {
      commands.push({ type: 'presentation_damage', source: 'thunder_chain', amount: 35 })
      if (!this.value.thunderIds.includes(result.contentId)) this.value.thunderIds.push(result.contentId)
      if (this.value.thunderIds.length === 3) commands.push({ type: 'presentation_damage', source: 'thunder_execution', amount: 180 })
    }
    return commands
  }
  onPhaseEnd(_snapshot: BattleSnapshot): readonly WeaponCommand[] {
    if (this.weapon.id !== 'flame' || this.value.burn === 0) return []
    const amount = this.value.burn
    this.value.burn = 0
    return [{ type: 'presentation_damage', source: 'burn', amount }]
  }
}
```

- [ ] **Step 4: 运行五武器测试**

Run: `cd app && npm test -- tests/weapons/weapon-runtime.test.ts`

Expected: PASS，显示 `5 tests passed`。

- [ ] **Step 5: 提交本任务**

```bash
git add app/assets/scripts/domain/weapons/weapon-effects.ts app/assets/scripts/domain/weapons/weapon-runtime.ts app/tests/weapons/weapon-runtime.test.ts
git commit -m "feat(weapons): implement five weapon triggers"
```

### Task 5: 伤害公式、必杀和装甲路由

**Files:**
- Create: `app/assets/scripts/domain/weapons/weapon-damage.ts`
- Create: `app/assets/scripts/domain/weapons/weapon-battle-service.ts`
- Test: `app/tests/weapons/weapon-battle-service.test.ts`

**Interfaces:**
- Consumes: `Damage = BaseDamage × CommandQuality × WeaponMultiplier × MomentumMultiplier × TacticalMultiplier + PetDamage`、`resolveKnowledgeArmor`。
- Produces: `calculateWeaponDamage(input): number`、`WeaponBattleService.resolve(input): WeaponResolution`。

- [ ] **Step 1: 写失败测试，锁定 35% 成长、动量 8% 和统一装甲路由**

```ts
import { describe, expect, it } from 'vitest'
import { calculateWeaponDamage } from '../../assets/scripts/domain/weapons/weapon-damage'
import { WeaponBattleService } from '../../assets/scripts/domain/weapons/weapon-battle-service'

describe('weapon battle service', () => {
  it('uses deterministic damage formula and level-10 growth of 35%', () => {
    expect(calculateWeaponDamage({ baseDamage: 100, commandQuality: 1, weaponMultiplier: 1.35, momentum: 5, tacticalMultiplier: 1, petDamage: 0 })).toBe(189)
  })
  it('routes finisher through knowledge armor and breaks one node only', () => {
    const service = new WeaponBattleService()
    const resolution = service.resolve({
      snapshot: battleSnapshot({ knowledgeArmorRemaining: 3 }),
      questionResult: firstCorrectResult('a'),
      presentationDamage: 9999,
    })
    expect(resolution.armor.nodesBroken).toBe(1)
    expect(resolution.armor.coreDamage).toBe(0)
  })
})
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `cd app && npm test -- tests/weapons/weapon-battle-service.test.ts`

Expected: FAIL，包含 `Cannot find module .../weapon-damage`。

- [ ] **Step 3: 实现公式和不可绕过的服务**

`app/assets/scripts/domain/weapons/weapon-damage.ts`：

```ts
export interface DamageInput {
  baseDamage: number
  commandQuality: number
  weaponMultiplier: number
  momentum: 0 | 1 | 2 | 3 | 4 | 5
  tacticalMultiplier: number
  petDamage: number
}
export function calculateWeaponDamage(input: DamageInput): number {
  const quality = Math.min(1, Math.max(0.2, input.commandQuality))
  const momentumMultiplier = 1 + input.momentum * 0.08
  return Math.round(input.baseDamage * quality * input.weaponMultiplier * momentumMultiplier * input.tacticalMultiplier + input.petDamage)
}
```

`app/assets/scripts/domain/weapons/weapon-battle-service.ts`：

```ts
import type { QuestionResult } from '../../core/question-result'
import type { BattleSnapshot } from '../battle/battle-snapshot'
import { resolveKnowledgeArmor, type ArmorResolution } from '../battle/knowledge-armor'

export interface WeaponResolveInput {
  snapshot: BattleSnapshot
  questionResult: QuestionResult
  presentationDamage: number
}
export interface WeaponResolution { armor: ArmorResolution }

export class WeaponBattleService {
  resolve(input: WeaponResolveInput): WeaponResolution {
    return { armor: resolveKnowledgeArmor(input.snapshot, input.questionResult, input.presentationDamage) }
  }
}
```

- [ ] **Step 4: 运行伤害与装甲测试**

Run: `cd app && npm test -- tests/weapons/weapon-battle-service.test.ts tests/battle/knowledge-armor.test.ts`

Expected: PASS，显示 `7 tests passed`。

- [ ] **Step 5: 提交本任务**

```bash
git add app/assets/scripts/domain/weapons/weapon-damage.ts app/assets/scripts/domain/weapons/weapon-battle-service.ts app/tests/weapons/weapon-battle-service.test.ts
git commit -m "feat(weapons): route damage through knowledge armor"
```

### Task 6: 强类型武器事件与 SaveDataV5 集成

**Files:**
- Create: `app/assets/scripts/core/events/weapon-events.ts`
- Modify: `app/assets/scripts/core/game-event-map.ts`
- Modify: `app/assets/scripts/core/save-data-v5.ts`
- Create: `app/assets/scripts/domain/weapons/weapon-service.ts`
- Test: `app/tests/weapons/weapon-service.test.ts`

**Interfaces:**
- Consumes: `EventBus<GameEventMap>`、P3A `Wallet`、`SaveRepository`、`QuestionResult`、`BattleSnapshot`。
- Produces: `WeaponService.upgrade(weaponId): Promise<WeaponSave>`、`WeaponService.resolveQuestion(input): WeaponResolution`；`WeaponTriggered` 与 `WeaponUpgraded` 供 P3D 消费。

- [ ] **Step 1: 写失败集成测试**

```ts
import { describe, expect, it, vi } from 'vitest'
import { WeaponService } from '../../assets/scripts/domain/weapons/weapon-service'

describe('WeaponService', () => {
  it('commits upgrade before emitting and exposes presentation-only trigger', async () => {
    const order: string[] = []
    const repo = { load: vi.fn(async () => makeSaveDataV5()), commit: vi.fn(async () => { order.push('commit') }) }
    const bus = { emit: vi.fn(() => { order.push('emit') }), on: vi.fn() }
    const service = makeWeaponService(repo, bus)
    await service.upgrade('pulse')
    expect(order).toEqual(['commit', 'emit'])
    expect(bus.emit).toHaveBeenCalledWith('WeaponUpgraded', expect.objectContaining({ weaponId: 'pulse', level: 2 }))
  })
})
```

- [ ] **Step 2: 运行集成测试并确认失败**

Run: `cd app && npm test -- tests/weapons/weapon-service.test.ts`

Expected: FAIL，包含 `Cannot find module .../weapon-service`。

- [ ] **Step 3: 定义事件、存档字段和服务边界**

`app/assets/scripts/core/events/weapon-events.ts`：

```ts
import type { WeaponId } from '../../domain/weapons/weapon-types'
import type { WeaponCommand } from '../../domain/weapons/weapon-effects'

export interface WeaponEventMap {
  WeaponTriggered: { battleId: string; weaponId: WeaponId; commands: readonly WeaponCommand[] }
  WeaponUpgraded: { weaponId: WeaponId; level: number }
}
```

将以下字段加入 `SaveDataV5.activeChild`：

```ts
weapons: {
  equippedId: WeaponId
  owned: Partial<Record<WeaponId, { id: WeaponId; level: number; modules: WeaponModuleId[] }>>
}
```

`app/assets/scripts/domain/weapons/weapon-service.ts`：

```ts
import type { EventBus } from '../../core/event-bus'
import type { GameEventMap } from '../../core/game-event-map'
import type { SaveRepository } from '../../core/ports/save-repository'
import type { BattleSnapshot } from '../battle/battle-snapshot'
import type { QuestionResult } from '../../core/question-result'
import { WeaponProgression } from './weapon-progression'
import { WeaponRuntime } from './weapon-runtime'
import type { WeaponCatalog } from './weapon-catalog'
import type { WeaponId } from './weapon-types'
import type { Wallet } from '../progression/wallet'

export class WeaponService {
  constructor(
    private readonly saves: SaveRepository,
    private readonly events: EventBus<GameEventMap>,
    private readonly catalog: WeaponCatalog,
    private readonly wallet: Wallet,
  ) {}
  async upgrade(weaponId: WeaponId) {
    const save = await this.saves.load()
    const current = save.activeChild.weapons.owned[weaponId]
    if (!current) throw new Error('weapon_not_owned')
    const progression = new WeaponProgression(current, this.catalog.get(weaponId), this.wallet)
    const next = progression.upgrade()
    save.activeChild.weapons.owned[weaponId] = next
    Object.assign(save.activeChild.progression, this.wallet.snapshot())
    await this.saves.commit(save)
    this.events.emit('WeaponUpgraded', { weaponId, level: next.level })
    return next
  }
  resolveQuestion(weaponId: WeaponId, result: QuestionResult, snapshot: BattleSnapshot) {
    const runtime = new WeaponRuntime({ id: weaponId, level: 1, modules: [] })
    const commands = runtime.onQuestion(result, snapshot)
    this.events.emit('WeaponTriggered', { battleId: snapshot.battleId, weaponId, commands })
    return commands
  }
}
```

- [ ] **Step 4: 运行 P3B 全套测试和类型检查**

Run: `cd app && npm test -- tests/weapons tests/battle/knowledge-armor.test.ts && npm run typecheck`

Expected: PASS；Vitest 显示 `19 tests passed`，TypeScript 退出码为 `0` 且无诊断。

- [ ] **Step 5: 提交本任务**

```bash
git add app/assets/scripts/core/events/weapon-events.ts app/assets/scripts/core/game-event-map.ts app/assets/scripts/core/save-data-v5.ts app/assets/scripts/domain/weapons/weapon-service.ts app/tests/weapons/weapon-service.test.ts
git commit -m "feat(weapons): integrate weapon events and save data"
```

## P3B Completion Gate

- [ ] 五个武器 ID、核心触发、1/5/10 视觉形态和 3/5/7/10 里程碑均配置驱动。
- [ ] 武器升级只扣合金，模块可在基地免费重置，所有功能武器只由主线蓝图获得。
- [ ] 烈焰灼烧、雷神连锁、等离子多段、宠物附伤和必杀统一经过 `resolveKnowledgeArmor`。
- [ ] 任意单次有效作答最多破坏一个知识装甲节点；无效结果破坏零个。
- [ ] 不存在武器自动答题、改变答案、改变掌握判定、减少题量或用星晶购买数值的路径。
- [ ] `cd app && npm test -- tests/weapons tests/battle/knowledge-armor.test.ts && npm run typecheck` 全部通过。
