# P0 Documentation Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 先把当前 Web/PWA MVP 的代码真值写准确，再建立 Cocos v2 的产品、系统、架构、内容、存档、资产与测试文档真值。

**Architecture:** 文档分为 `Current`、`Target`、`Archived` 三类，任何文件只描述一个适用版本。当前态文档以现有 JavaScript 代码审计为依据，目标态文档以已批准的 Cocos 重构设计规格为依据，并由状态索引明确两者关系。

**Tech Stack:** Markdown、原生 JavaScript Web/PWA 审计、Cocos Creator 3.8.8 + TypeScript 目标架构、Python 3 文档断言脚本、Git。

## Global Constraints

- 本计划只修改文档；不得创建 `app/`、修改业务代码或引入依赖。
- 目标平台是 iOS/Android 原生独立 App，不是微信小游戏。
- 首发完全离线，不接账号、后端、广告、内购、第三方分析或在线活动。
- 全局横屏；答题使用全屏专注布局，答题与战斗演出不得重叠。
- 不使用 Spine 或其他付费骨骼编辑工具。
- 目标用户为小学 1–6 年级，并区分 1–3 年级与 4–6 年级交互。
- 每份正式文档首部必须包含 `Status`、`Applies to`、`Last verified`，日期固定为 `2026-07-15`。
- `Current` 只陈述现有 Web/PWA；`Target` 只陈述 Cocos v2；旧 GDD 标记为 `Archived`。
- Cocos 未来根目录统一为 `app/`；领域代码为 `app/assets/scripts/domain/`，基础接口为 `app/assets/scripts/core/`，基础设施为 `app/assets/scripts/infrastructure/`，表现代码为 `app/assets/scripts/presentation/`，测试为 `app/tests/`，内容工具为 `tools/`。
- 设计真值是 `docs/superpowers/specs/2026-07-15-language-astronauts-cocos-redesign-design.md`；不得改写该规格。

---

### Task 1: 固化 Web MVP 审计与文档断言

**Files:**
- Create: `docs/current-state.md`
- Test: `docs/current-state.md`

**Interfaces:**
- Consumes: `index.html` 的脚本加载顺序；`js/storage.js` 的 v4 多孩子存档；`js/ebbinghaus.js` 的 5 级冷却；`js/game.js` 的四 Boss/五题型；`js/combat.js` 的 5 武器/3 宠物。
- Produces: `docs/current-state.md`，包含“运行形态、教材、账户与存档、学习、战斗、成长、表现、已知缺口、代码索引”九节，供 Task 2 和后续目标文档引用。

- [x] **Step 1: 写入会先失败的当前态断言（2–5 分钟）**

运行：

```bash
python3 - <<'PY'
from pathlib import Path
p = Path("docs/current-state.md")
assert p.exists(), "docs/current-state.md missing"
text = p.read_text()
for token in ["Status:** Current", "Web/PWA MVP v4", "20 分钟", "2 小时", "1 天", "3 天", "7 天", "听觉吞噬怪", "语音吞噬怪", "零自动化测试"]:
    assert token in text, token
PY
```

预期：FAIL，首个错误为 `docs/current-state.md missing`。

- [x] **Step 2: 创建状态头与运行形态章节（2–5 分钟）**

文件开头必须逐字写入：

```markdown
# 当前 Web/PWA MVP 审计

> **Status:** Current
> **Applies to:** Web/PWA MVP，存档 v4
> **Last verified:** 2026-07-15

本文只记录仓库当前可运行的 Web/PWA 实现，不描述 Cocos v2 已完成能力。
```

随后写明：无构建链、无后端、无自动化测试；入口为 `index.html`；Tailwind CSS 与 Animate.css 来自 CDN；业务脚本按 `sprites → fx → data → storage → catalog → ebbinghaus → audio → combat → game → ui → main` 加载；本地以 `python3 -m http.server 8799` 启动。

- [x] **Step 3: 写账户、教材与存档真值（2–5 分钟）**

明确记录：两套教材、1A–6B；当前 3A-U1 名称为 `How do we feel?`；v4 根存档键 `language_astronauts_save_v4`；v3 自动迁移；多孩子隔离；`player.suit` 实际保存武器 ID；导入会直接覆盖当前根存档且没有预览、原子写入和备份。

- [x] **Step 4: 写学习与战斗真值（2–5 分钟）**

明确记录：复习层级为 5 级，冷却依次为 20 分钟、2 小时、1 天、3 天、7 天；答错重置为 Level 1；题型为选择、听力、阅读、拼写、口语；推图依次出现听觉、阅读、拼写、语音四个 Boss；高伤害通过 1 HP 保底不能提前击杀；水晶 30 且本单元复习队列为空才是完美通关。

- [x] **Step 5: 写成长、表现与缺口真值（2–5 分钟）**

明确记录：5 武器、3 宠物、最多双宠；11 档军衔、10 项成就、学情摘要；WebAudio、浏览器 TTS、SpeechRecognition、DOM/CSS 特效；花园只有字段/样式/成就线索而无可玩入口；`assets/svg` 未被运行时文件路径引用；怪兽资源 ID `word/dialogue/reading` 与运行时 `listen/read/write/speak` 不一致；无关卡解锁、后台偷水晶/扣血、后端、埋点和自动化测试。

- [x] **Step 6: 写逐文件代码索引并运行断言（2–5 分钟）**

索引至少列出 `index.html`、`js/data.js`、`js/data-kouyu.js`、`js/catalog.js`、`js/storage.js`、`js/ebbinghaus.js`、`js/combat.js`、`js/game.js`、`js/ui.js`、`js/audio.js`、`js/fx.js`、`js/sprites.js`、`js/main.js`、`css/style.css`、`manifest.webmanifest`、`scripts/generate-kouyu-data.js`，每项用一句话说明职责。重新运行 Step 1；预期：PASS，无输出。

- [x] **Step 7: Commit（2–5 分钟）**

```bash
git add docs/current-state.md
git commit -m "docs: audit current web MVP"
```

### Task 2: 先校准 README、归档旧 GDD 并建立状态索引

**Files:**
- Modify: `README.md`
- Create: `docs/archive/GDD-v1-web-mvp.md`
- Delete: `docs/时空语航员_游戏策划案.md`
- Create: `docs/document-status.md`
- Test: `README.md`
- Test: `docs/document-status.md`

**Interfaces:**
- Consumes: Task 1 的当前态事实；原 `docs/时空语航员_游戏策划案.md` 全文。
- Produces: 准确的仓库入口、只读归档 GDD、状态索引；Task 3–7 创建的目标文档均须登记到该索引。

- [x] **Step 1: 运行旧 README 冲突断言（2–5 分钟）**

运行：

```bash
python3 - <<'PY'
from pathlib import Path
t = Path("README.md").read_text()
assert "Status:** Current" in t
assert "Level 1 | 20 分钟" in t
assert "Cocos Creator 3.8.8" in t
assert "微信小游戏" not in t
PY
```

预期：FAIL，缺少 `Status:** Current`。

- [x] **Step 2: 重写 README 的当前态说明（2–5 分钟）**

README 使用 `Current / Web/PWA MVP v4 / 2026-07-15` 状态头；保留项目一句话、两套教材、多孩子、五种题型、四 Boss、五武器、三宠物、存档导入导出和本地启动；把复习表改成 20 分钟、2 小时、1 天、3 天、7 天；删除“口语评测是未来能力”“Word/Dialogue/Reading 三形态”“宇航服商店/可玩花园”等错误陈述。

- [x] **Step 3: 在 README 写清迁移方向（2–5 分钟）**

新增“Cocos v2 迁移”节，准确写明：当前 Web MVP 仍在根目录运行；未来 Cocos 工程根目录为 `app/`；目标是 Cocos Creator 3.8.8 的离线 iOS/Android App；规划入口为总体规格、总体计划和 `docs/document-status.md`；迁移方向不是当前已实现能力。

- [x] **Step 4: 原样移动并标记旧 GDD（2–5 分钟）**

运行 `mkdir -p docs/archive && mv "docs/时空语航员_游戏策划案.md" docs/archive/GDD-v1-web-mvp.md`，然后在归档文件标题下插入：

```markdown
> **Status:** Archived
> **Applies to:** Web MVP v1 策划历史稿
> **Last verified:** 2026-07-15
>
> 本文保留历史决策，不代表当前 Web 实现或 Cocos v2 目标；当前真值见 `docs/current-state.md`，目标真值见 `docs/product/GDD-v2-cocos.md`。
```

- [x] **Step 5: 创建文档状态索引（2–5 分钟）**

按 `Current`、`Target`、`Archived` 三节列出所有正式文档。每项包含路径、适用版本、用途和真值优先级；明确规格高于目标分册、当前态以代码审计为准、归档文件不用于实现；把 Task 3–7 将创建的所有路径完整登记为 `Target / Cocos v2`。

- [x] **Step 6: 验证当前文档先于目标文档准确（2–5 分钟）**

运行：

```bash
python3 - <<'PY'
from pathlib import Path
r = Path("README.md").read_text()
a = Path("docs/archive/GDD-v1-web-mvp.md").read_text()
s = Path("docs/document-status.md").read_text()
assert "Status:** Current" in r and "Level 1 | 20 分钟" in r
assert "Cocos Creator 3.8.8" in r and "iOS/Android" in r
assert "Status:** Archived" in a
assert all(x in s for x in ["Current", "Target", "Archived", "docs/current-state.md", "docs/product/GDD-v2-cocos.md"])
PY
```

预期：PASS，无输出。

- [x] **Step 7: Commit（2–5 分钟）**

```bash
git add README.md docs/current-state.md docs/document-status.md docs/archive/GDD-v1-web-mvp.md "docs/时空语航员_游戏策划案.md"
git commit -m "docs: align current-state documentation"
```

### Task 3: 编写 Cocos v2 产品 GDD

**Files:**
- Create: `docs/product/GDD-v2-cocos.md`
- Modify: `docs/document-status.md`
- Test: `docs/product/GDD-v2-cocos.md`

**Interfaces:**
- Consumes: 设计规格的产品定位、分龄、循环、经济、非目标和分期；Task 2 的 Current/Target 边界。
- Produces: 产品级目标真值；系统分册只细化机制，不得改变本文件的产品规则。

- [x] **Step 1: 运行产品约束断言（2–5 分钟）**

运行：

```bash
python3 - <<'PY'
from pathlib import Path
t = Path("docs/product/GDD-v2-cocos.md").read_text()
for x in ["Status:** Target", "小学 1–6 年级", "电影化指令 RPG", "6–10 分钟", "不做实时 PvP", "完全离线"]:
    assert x in t, x
PY
```

预期：FAIL，文件不存在。

- [x] **Step 2: 写产品定位、目标与非目标（2–5 分钟）**

使用 `Target / Cocos 独立 App v2 / 2026-07-15` 状态头。定义一句话产品、六项按优先级排列的设计目标，以及明确不做 PvP、排行榜、社交、抽卡、广告、内购、强制等待、云账号和以总游戏时长为成功指标。

- [x] **Step 3: 写分龄与无障碍规则（2–5 分钟）**

逐项写明 1–3 年级的 64 dp、2×2/1×4、字母块、自动宠物、6–8 题与 5–8 分钟；4–6 年级的可选倒计时、键盘、模块、弱点和 8–12 题与 6–10 分钟；共同规则包含口语设备失败不算学习错误、减少动态效果、双通道状态表达、颜色不作为唯一编码。

- [x] **Step 4: 写局外、单局和失败循环（2–5 分钟）**

完整列出基地到再次出发的七步局外循环、入场到结算的八步单局循环；主线/到期复习/弱项专项的题量与时长；紧急撤离保留知识进度和基础奖励，不损宠物、装备与航行日志。

- [x] **Step 5: 写成长与内容规模（2–5 分钟）**

写明等级 1–50、每 5 级军衔、单元拆 3–5 任务、3 星章、合金和星晶用途、三个日常、5 武器、3 宠物、三阶段 Boss、每 3 题二选一强化，以及首发阶段 P0–P5 的交付边界。

- [x] **Step 6: 更新索引并验证（2–5 分钟）**

确认 `docs/document-status.md` 中该文件状态为 Target。运行 Step 1；预期：PASS，无输出。

- [x] **Step 7: Commit（2–5 分钟）**

```bash
git add docs/product/GDD-v2-cocos.md docs/document-status.md
git commit -m "docs: define Cocos v2 product design"
```

### Task 4: 编写学习与战斗系统真值

**Files:**
- Create: `docs/design/learning-system.md`
- Create: `docs/design/combat-system.md`
- Modify: `docs/document-status.md`
- Test: `docs/design/learning-system.md`
- Test: `docs/design/combat-system.md`

**Interfaces:**
- Consumes: `contentId`、答题结果、FSRS 式调度、战斗状态机、知识装甲和伤害公式。
- Produces: P1 的领域类型与 P2 的纵向切片验收规则；精确枚举 `AnswerOutcome` 与 `BattleState`。

- [x] **Step 1: 写并运行系统术语断言（2–5 分钟）**

运行：

```bash
python3 - <<'PY'
from pathlib import Path
l = Path("docs/design/learning-system.md").read_text()
b = Path("docs/design/combat-system.md").read_text()
for x in ["first_correct", "corrected", "skipped", "device_failure", "incorrect", "contentId"]:
    assert x in l, x
for x in ["Entering", "QuestionFocus", "CommandResolve", "Presentation", "PhaseCheck", "BossFinish", "Settlement", "知识装甲"]:
    assert x in b, x
PY
```

预期：FAIL，首个文件不存在。

- [x] **Step 2: 写知识点、掌握度和调度（2–5 分钟）**

学习文档使用 Target 状态头；定义知识点必填字段、五个显示阶段、稳定度/难度/到期时间；写清选题优先级、同知识点不连续、答错后延 2–3 题、首次答对重复防刷和干扰项约束。

- [x] **Step 3: 写答题结果与口语规则（2–5 分钟）**

定义稳定标识：`first_correct` 质量 1.0、`corrected` 0.6、`skipped` 0.2、`device_failure` 0.2、`incorrect` 0；说明各自对首次奖励、动量、错误计数、稳定度和重现的影响；口语写明文本标准化、最低置信度、一次重试、辅助录音确认、离线音频优先和系统 TTS 兜底。

- [x] **Step 4: 写战斗状态机和超时（2–5 分钟）**

战斗文档使用 Target 状态头；逐状态定义允许的前驱、进入动作、退出条件和超时后继；明确 `QuestionFocus` 暂停战斗音效与演出，`Presentation` 隐藏题面；动画丢失时由注入的 Clock 超时推进。

- [x] **Step 5: 写三阶段、知识装甲与伤害（2–5 分钟）**

写明护盾/装甲/核心三阶段，每阶段 3–4 节点、一次有效作答最多破一节点、伤害不能跳节点；逐字记录伤害公式、动量 0–5、每层 8%、首次答对 +1、答错 -2、纠错不增加；Boss 机制不得降低可读性。

- [x] **Step 6: 写强化、失败与验收样例并验证（2–5 分钟）**

包含每 3 题二选一、同局最多 3 次、只影响游戏表现；紧急撤离规则；至少给出“首次答对破一个节点”“1000 伤害仍不能跳节点”“设备失败不增加错误”“动画超时进入 PhaseCheck”四个 Given/When/Then 样例。运行 Step 1；预期：PASS。

- [x] **Step 7: Commit（2–5 分钟）**

```bash
git add docs/design/learning-system.md docs/design/combat-system.md docs/document-status.md
git commit -m "docs: specify learning and battle rules"
```

### Task 5: 编写成长、武器与宠物真值

**Files:**
- Create: `docs/design/progression-system.md`
- Create: `docs/design/weapons-and-pets.md`
- Modify: `docs/document-status.md`
- Test: `docs/design/progression-system.md`
- Test: `docs/design/weapons-and-pets.md`

**Interfaces:**
- Consumes: 等级公式、经济规则、五武器、三宠物及其成长约束。
- Produces: `calculateLevel(totalXp)`、`weaponUpgradeCost(currentLevel)` 和机制 ID 表，供后续 P3 计划实现。

- [x] **Step 1: 运行公式与标识断言（2–5 分钟）**

运行：

```bash
python3 - <<'PY'
from pathlib import Path
p = Path("docs/design/progression-system.md").read_text()
w = Path("docs/design/weapons-and-pets.md").read_text()
for x in ["round(60 × (L - 1)^1.55)", "80 + 40 × (CurrentLevel - 1)", "合金", "星晶"]:
    assert x in p, x
for x in ["pulse", "plasma", "flame", "frost", "thunder", "star_fox", "nebula_cat", "crystal_dragon"]:
    assert x in w, x
PY
```

预期：FAIL，文件不存在。

- [x] **Step 2: 写等级、军衔、星域与防刷（2–5 分钟）**

成长文档写入 Target 状态头、等级 1–50 公式和各 XP 来源/倍率；同知识点同日非到期第 3 次起无 XP；列出 2/3/5/8 级解锁；军衔只给外观；下一任务只需完成前置，不强制满星。

- [x] **Step 3: 写经济与任务（2–5 分钟）**

精确定义合金与星晶唯一用途、武器升级成本公式、星晶禁止购买战斗数值/孵化/进化；每日三任务和七格航行日志不清零规则。

- [x] **Step 4: 写五武器机制矩阵（2–5 分钟）**

武器宠物文档写 Target 状态头；以稳定 ID `pulse/plasma/flame/frost/thunder` 逐项记录定位、触发、状态、演出和不能改变学习判定的约束；记录等级 1–10、3/7 二选一模块、5 必杀、10 终极模块、1/5/10 外观阶段。

- [x] **Step 5: 写三宠物机制矩阵（2–5 分钟）**

以稳定 ID `star_fox/nebula_cat/crystal_dragon` 记录先锋/支援槽、固定共鸣、各自触发与演出；羁绊 1–20、5/12/20 阶段、宠物蛋获取和 3 次有效学习孵化；明确无饥饿、死亡、离家、降级惩罚。

- [x] **Step 6: 写跨系统不变量并验证（2–5 分钟）**

至少列出：伤害不改掌握度、武器宠物不改正确答案、不能跳知识节点、星晶不买数值、皮肤玩具无能力、旧武器 ID 原样迁移。运行 Step 1；预期：PASS。

- [x] **Step 7: Commit（2–5 分钟）**

```bash
git add docs/design/progression-system.md docs/design/weapons-and-pets.md docs/document-status.md
git commit -m "docs: specify progression weapons and pets"
```

### Task 6: 编写音画、资产与 Cocos 架构真值

**Files:**
- Create: `docs/design/audio-animation.md`
- Create: `docs/asset-pipeline.md`
- Create: `docs/architecture/cocos-app.md`
- Modify: `docs/document-status.md`
- Test: `docs/design/audio-animation.md`
- Test: `docs/architecture/cocos-app.md`

**Interfaces:**
- Consumes: 音频总线、动画事件、性能预算、无 Spine 管线、统一 `app/` 目录与依赖方向。
- Produces: P1 的项目目录、EventBus/Clock/RandomSource/SaveRepository/SceneNavigator 端口位置，以及 P2 的表现预算。

- [x] **Step 1: 运行架构边界断言（2–5 分钟）**

运行：

```bash
python3 - <<'PY'
from pathlib import Path
a = Path("docs/architecture/cocos-app.md").read_text()
v = Path("docs/design/audio-animation.md").read_text()
for x in ["app/assets/scripts/domain/", "app/assets/scripts/core/", "app/assets/scripts/infrastructure/", "app/assets/scripts/presentation/", "app/tests/", "tools/"]:
    assert x in a, x
for x in ["Master", "Voice", "prepare", "launch", "impact", "recover", "400", "120", "16"]:
    assert x in v, x
PY
```

预期：FAIL，文件不存在。

- [x] **Step 2: 写 Cocos 分层与目录（2–5 分钟）**

架构文档使用 Target 状态头；写出统一目录树；定义依赖方向 `presentation → domain`，`infrastructure → core`，`domain → core types only`；禁止领域引用 `cc`、UI 直接写存档、表现持有唯一业务状态。

- [x] **Step 3: 锁定核心端口和六场景职责（2–5 分钟）**

逐项说明强类型 `EventBus<AppEvents>`、`Clock.now/setTimeout/clearTimeout`、`RandomSource.next`、`SaveRepository.load/commit`、`SceneNavigator.go`；列出 Boot/Profile/Base/StarMap/Battle/Report 的进入参数、职责和合法出口；业务状态由组合根持有，不挂在 Scene 节点上。

- [x] **Step 4: 写音频、动画与降级（2–5 分钟）**

音画文档使用 Target 状态头；列出六音频总线、五音乐状态、0.4–0.8 秒淡化、英语播放时 -12 dB ducking；攻击事件 `prepare → launch → impact → recover`，逻辑伤害只在 impact；33/67/100 ms 命中停顿不冻结教学语音。

- [x] **Step 5: 写无 Spine 资产管线和预算（2–5 分钟）**

资产文档使用 Target 状态头；定义来源/作者/许可证/修改分发/原件/加工/App 路径字段和 AI 提示词记录；写分层 Node + Animation Clip + Shader/ParticleSystem2D 流程；明确 60 FPS 目标、低端 30 FPS、粒子 400/120、并发音频 16、高中低三档。

- [x] **Step 6: 写资源命名和验收并验证（2–5 分钟）**

定义 snake_case 资源 ID、`contentId` 音频引用、Boss/武器/宠物资源 ID 必须与领域配置一致；每个单位支持 idle/anticipate/attack/hit/break/skill/victory；列出缺图、缺音、缺动画回调的降级。运行 Step 1；预期：PASS。

- [x] **Step 7: Commit（2–5 分钟）**

```bash
git add docs/design/audio-animation.md docs/asset-pipeline.md docs/architecture/cocos-app.md docs/document-status.md
git commit -m "docs: define Cocos architecture and asset pipeline"
```

### Task 7: 编写内容、存档、测试与变更记录

**Files:**
- Create: `docs/architecture/content-schema.md`
- Create: `docs/architecture/save-v5-migration.md`
- Create: `docs/testing.md`
- Create: `CHANGELOG.md`
- Modify: `docs/document-status.md`
- Test: `docs/architecture/content-schema.md`
- Test: `docs/architecture/save-v5-migration.md`
- Test: `docs/testing.md`

**Interfaces:**
- Consumes: 内容校验规则、v4→v5 精确映射、测试矩阵和发布门槛。
- Produces: P1/P2 可实现的数据契约、迁移契约和测试命令规范；P0 完成门禁。

- [x] **Step 1: 运行最终文档门禁（2–5 分钟）**

运行：

```bash
python3 - <<'PY'
from pathlib import Path
required = [
 "docs/architecture/content-schema.md", "docs/architecture/save-v5-migration.md",
 "docs/testing.md", "CHANGELOG.md"
]
for name in required:
    assert Path(name).exists(), name
PY
```

预期：FAIL，首个文件不存在。

- [x] **Step 2: 写内容 schema 与校验错误格式（2–5 分钟）**

内容文档使用 Target 状态头；定义教材/年级/学期/单元 JSON 层级，知识点字段 `contentId/kind/en/zh/audioRef/questionTypes/distractorTags`；给出 3A-U1 的完整 JSON 示例；校验必须覆盖唯一 ID、非空文本、有效题型、音频或 TTS 标记、干扰项数量/重复答案、教材单元引用和生成文件不可手改；错误格式固定为 `文件路径:JSON Pointer:错误码:消息`。

- [x] **Step 3: 写 v5 schema、原子存储与恢复（2–5 分钟）**

存档文档使用 Target 状态头；定义根版本、孩子档案、学习记录、进度、装备、设置、诊断字段；描述临时文件→校验→替换主档→保留备份；主档坏则回滚，双坏进入只读恢复；导入先预览后确认，失败不覆盖。

- [x] **Step 4: 写全部 v4→v5 映射（2–5 分钟）**

逐字记录：军衔等级映射 `1/3/5/8/12/16/20/25/30/40/50`；score 先定等级再 1:1 合金并保留 `legacyScore`；水晶 10:1 向下取整且非零不足 10 转 1，并保留 `legacyCrystals`；`suit → weaponId`；默认 `shipSkinId`；宠物 1–5 → 羁绊 `1/5/10/15/20`；mastery → 稳定度 `0.014/0.083/1/3/7` 天且难度 5.0；保留 dueAt；完成/完美为 1/3 星。

- [x] **Step 5: 写自动化与真机测试矩阵（2–5 分钟）**

测试文档使用 Target 状态头；固定纯领域命令 `cd app && npm test -- --run`、单文件命令 `npx vitest run tests/<file>.test.ts`、内容命令 `node --import tsx ../tools/validate-content.ts assets/content`；列出领域、场景集成、内容抽检、离线启动、录音拒绝、导入导出和五类真机矩阵。

- [x] **Step 6: 写发布门槛、Changelog 并运行全量检查（2–5 分钟）**

`CHANGELOG.md` 使用 Keep a Changelog 结构，在 `Unreleased / Documentation` 下记录 P0 文档重整，不声称 Cocos 已实现。运行：

```bash
python3 - <<'PY'
from pathlib import Path
paths = [
 "README.md", "docs/current-state.md", "docs/document-status.md",
 "docs/archive/GDD-v1-web-mvp.md", "docs/product/GDD-v2-cocos.md",
 "docs/design/learning-system.md", "docs/design/combat-system.md",
 "docs/design/progression-system.md", "docs/design/weapons-and-pets.md",
 "docs/design/audio-animation.md", "docs/architecture/cocos-app.md",
 "docs/architecture/content-schema.md", "docs/architecture/save-v5-migration.md",
 "docs/asset-pipeline.md", "docs/testing.md"
]
for name in paths:
    text = Path(name).read_text()
    assert "Status:**" in text, name
    assert "Applies to:**" in text, name
    assert "Last verified:** 2026-07-15" in text, name
forbidden = ["T" + "BD", "T" + "ODO", "适当处理", "参照前文"]
joined = "\n".join(Path(p).read_text() for p in paths)
assert not any(x in joined for x in forbidden)
PY
```

预期：PASS，无输出。

- [x] **Step 7: Commit（2–5 分钟）**

```bash
git add docs/architecture/content-schema.md docs/architecture/save-v5-migration.md docs/testing.md CHANGELOG.md docs/document-status.md
git commit -m "docs: define content save and testing contracts"
```

> **Note:** 文档与门禁已落地；本会话按用户规则跳过各 Task 的 git commit，待用户明确要求再提交。

## P0 Exit Gate

- [x] 当前 Web 文档已先完成校准，且 README 不再把目标能力写成现状。
- [x] 每个现有功能都能从 `docs/current-state.md` 定位到代码文件。
- [x] Current、Target、Archived 状态无混写，旧 GDD 已归档。
- [x] 已知冲突均在当前态或对应目标分册中给出明确结论。
- [x] 所有目标文档均使用统一 `app/` 目录与一致的类型/ID 命名。
- [x] 全量状态头、禁用占位语和关键规则断言通过后，才允许执行 P1。
