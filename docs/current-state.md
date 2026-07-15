# 当前 Web/PWA MVP 审计

> **Status:** Current  
> **Applies to:** Web/PWA MVP v4  
> **Last verified:** 2026-07-15

本文只记录仓库当前可运行的 Web/PWA MVP v4 实现，不描述 Cocos v2 目标能力。

## 1. 运行形态

- 无构建链、无后端、无自动化测试。
- 入口：`index.html`；样式为自有 `css/style.css` + Tailwind CDN + Animate.css CDN。
- 业务脚本加载顺序：`sprites → fx → data → data-kouyu → storage → catalog → ebbinghaus → audio → combat → game → ui → main`。
- 本地启动：`python3 -m http.server 8799`，浏览器打开 `http://localhost:8799`。
- PWA：`manifest.webmanifest`（standalone、竖屏偏好）。

## 2. 账户、教材与存档

- 多孩子账号，进度完全隔离；无孩子建号，多孩子选择，单孩子直入。
- 双教材：`hujiao-oxford-2024`（沪教牛津 2024）、沪教版英语口语交际（`catalog.js`）。
- 覆盖年级 **1A–6B**（非仅 3–6）。
- 当前 3A-U1 单元名为 **How do we feel?**（非旧 Hello）。
- 存档键：`language_astronauts_save_v4`；可从 v3 自动迁移。
- `player.suit` **实际保存武器 ID**；`classic` 在战斗层归一为 `pulse`。
- 支持 JSON 导出/导入；导入直接覆盖根存档（无预览、无自动备份）。

## 3. 学习系统（真值）

艾宾浩斯运行时冷却（`js/ebbinghaus.js`），共 **5 级**：

| Level | 冷却 | 表现标签 |
| --- | --- | --- |
| 1 | 20 分钟 | 浅层警报 |
| 2 | 2 小时 | 中层突袭 |
| 3 | 1 天 | 领地保卫战 |
| 4 | 3 天 | 星域大 BOSS 逆袭 |
| 5 | 7 天 | 终极遗忘之主 |

- 答错 → Level 重置为 1。
- `threatByLevel` 的 damage/steal **仅用于警报文案**，不扣局外 HP/水晶。
- 完美通关：本单元水晶 ≥ 30 **且** 本单元复习队列为空（非全局队列）。

## 4. 战斗系统（真值）

四 Boss（听说读写），非 Word→Dialogue→Reading：

1. `listen` 听觉吞噬怪  
2. `read` 阅读吞噬怪  
3. `write` 拼写吞噬怪（skill=`spell`）  
4. `speak` 语音吞噬怪 BOSS  

题型：选择 / 听力 / 阅读 / 拼写 / 口语。  
Boss HP = Σ预估伤害 × 1.2；推图题库未答完前 HP 保底 1。  
口语：Web Speech recognition；`skipSpeak` 当前以 quality=1 计对（实现偏差）。  
结算文案仍有「三形态」字样，与四 Boss 矛盾。

## 5. 成长与经济（真值）

- 货币：战功 `score`、水晶 `crystals`。
- 武器 5 档（pulse/plasma/flame/frost/thunder），战功购买；数值在 `combat.js`。
- 宠物 3 种（star_fox/nebula_cat/crystal_dragon），水晶领养/喂养，最多出战 2 只。
- 军衔 11 档，仅按累计战功自动晋升，无特权数值。
- 成就 10 项，仅展示无领奖。
- 星际花园：`garden[]` + `PLANT_SEEDS` + CSS + 成就线索存在，**无可玩 UI**。
- 飞船皮肤 `SPRITES.ships` 存在，UI 写死 `classic`。

## 6. 表现层（真值）

- 音效：WebAudio 合成；英文学词 `SpeechSynthesis`；中文解说 `narrate` 队列。
- 无 BGM 文件轨。
- 特效：`fx.js` DOM 粒子 / 震屏；无 `navigator.vibrate`。
- `assets/svg/**` 共 22 文件**未被运行时路径引用**；UI/sprites 使用内联 SVG。
- 怪兽精灵键为 `word/dialogue/reading`，与 Boss id `listen/read/write/speak` 不一致 → 恒 fallback。

## 7. 已知缺口（Current）

- 无关卡解锁链。
- 无花园玩法；成就 `garden3` 不可达成。
- 无后端、埋点、家长推送。
- **零自动化测试**。
- CDN 依赖弱网风险。
- `ui.js` 上帝对象耦合。

## 8. 代码索引

| 文件 | 职责 |
| --- | --- |
| `index.html` | 入口与脚本顺序 |
| `js/data.js` | 牛津版课程数据 |
| `js/data-kouyu.js` | 口语交际课程数据（生成） |
| `js/catalog.js` | 教材注册与查询 |
| `js/storage.js` | LocalStorage v4 多孩子 |
| `js/ebbinghaus.js` | 复习队列与冷却真值 |
| `js/combat.js` | 武器/宠物伤害数值 |
| `js/game.js` | Battle 引擎、四 Boss |
| `js/ui.js` | 全部界面、武器宠物 UI、口语 |
| `js/audio.js` | SFX / TTS / narrate |
| `js/fx.js` | DOM 特效 |
| `js/sprites.js` | 内联 SVG 飞船/怪兽/NPC |
| `js/main.js` | 启动与复习轮询 |
| `css/style.css` | 主题与战斗样式 |
| `manifest.webmanifest` | PWA 元数据 |
| `scripts/generate-kouyu-data.js` | 口语数据生成管线 |
