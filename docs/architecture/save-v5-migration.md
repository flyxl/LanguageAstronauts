# 存档 v5 与 v4→v5 迁移

> **Status:** Target  
> **Applies to:** Cocos 独立 App v2  
> **Last verified:** 2026-07-15

## 1. v5 根结构（概念）

- `version: 5`
- `activeChildId`
- `children[id]`：档案、学习记录、进度、装备、宠物、诊断
- `settings`：`bgm` / `sfx` / `tts` / `haptics`

孩子内至少含：航员 XP/等级、合金、星晶、`legacyScore`、`legacyCrystals`、`weaponId`、`ownedWeapons`、`shipSkinId`、`ownedShipSkins`、任务星章、掌握度表、日常状态。

## 2. 原子存储与恢复

流程：写入临时文件 → 校验 → 替换主档 → 保留上一份备份。  
主档坏则回滚备份；双坏进入只读恢复模式。  
导入：先预览摘要，用户确认后才替换；失败不覆盖。

## 3. v4→v5 映射（逐字）

| 源（v4） | 目标（v5） |
| --- | --- |
| 军衔档位（由旧 score 阈值） | 映射等级锚点 `1/3/5/8/12/16/20/25/30/40/50` |
| `player.score` | 先定等级，再 **1:1** 转为合金，并保留 `legacyScore` |
| `player.crystals` | **10:1** 向下取整为星晶；非零且不足 10 → 转 **1**；保留 `legacyCrystals` |
| `player.suit` | `weaponId`（`classic` → `pulse`） |
| （缺省） | 默认 `shipSkinId = classic` |
| 宠物 `level` 1–5 | 羁绊 `1/5/10/15/20` |
| mastery `level` 1–5 | 稳定度种子（天）`0.014/0.083/1/3/7`，难度初始 **5.0** |
| `reviewQueue.dueAt` | **保留** dueAt |
| `progress.completed` / `perfectClear` | 星章 **1 / 3** |

多孩子结构原样迁移；设置字段扩展默认 true（音效）并补齐四分开关。
