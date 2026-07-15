# 战斗系统真值

> **Status:** Target  
> **Applies to:** Cocos 独立 App v2  
> **Last verified:** 2026-07-15

## 1. BattleState 状态机

合法状态：`Entering` → `QuestionFocus` → `CommandResolve` → `Presentation` → `PhaseCheck` →（循环回 `QuestionFocus` 或）`BossFinish` → `Settlement`

| 状态 | 进入 | 退出 | 超时后继 |
| --- | --- | --- | --- |
| Entering | Boss 登场 | 入场动画结束 | QuestionFocus |
| QuestionFocus | 出题；**暂停**战斗音效与演出 | 提交答案 | 强制 CommandResolve（防卡死） |
| CommandResolve | 结算 AnswerOutcome 与命令质量 | 数值算完 | Presentation |
| Presentation | 隐藏题面；播攻击/受击 | 演出结束或 Clock 超时 | PhaseCheck |
| PhaseCheck | 检装甲节点/阶段/强化点 | 决策完毕 | QuestionFocus / BossFinish |
| BossFinish | 终结演出 | 结束 | Settlement |
| Settlement | 展示学习与游戏奖励 | 确认离开 | 退出战斗 |

动画回调丢失时由注入的 `Clock` 超时推进，不得卡死存档。

## 2. 知识装甲与三阶段

每阶段（护盾 / 装甲 / 核心）拥有 **3–4** 个**知识装甲**节点：

- 一次有效作答最多破坏 **一个**节点；
- 武器、暴击、宠物伤害 **不能跳过**节点；
- 节点清空后才结算核心表现生命；
- 高伤害只影响演出与奖励，不减少必须完成的核心题量。

## 3. 伤害公式

`Damage = BaseDamage × CommandQuality × WeaponMultiplier × MomentumMultiplier × TacticalMultiplier + PetDamage`

- 动量 **0–5** 层，每层 **+8%** 表现伤害；
- `first_correct` 动量 +1；`incorrect` 动量 −2；`corrected` 不增加；
- 武器 1–10 级总基础伤害差约 35%；
- 伤害不能影响掌握度。

## 4. Roguelite 强化

每 **3** 题二选一；同局最多 **3** 次；只影响战斗表现，不改正确答案与复习调度。

## 5. 失败

护盾归零 → 紧急撤离：保留知识进度与基础奖励；失去额外星章；不损宠物/装备/航行日志。

## 6. 验收样例（Given / When / Then）

1. **首次答对破一个节点**  
   Given 装甲剩余 3；When `first_correct`；Then 装甲剩余 2，不进入下一阶段除非清零。

2. **1000 伤害仍不能跳节点**  
   Given 装甲剩余 2；When 计算出 Damage=1000；Then 仍只破 1 节点，装甲剩余 1。

3. **设备失败不增加错误**  
   Given 某 contentId wrong=0；When `device_failure`；Then wrong 仍为 0，记 device_failure+1。

4. **动画超时进入 PhaseCheck**  
   Given Presentation 等待 impact 回调；When Clock 超时；Then 状态变为 PhaseCheck。
