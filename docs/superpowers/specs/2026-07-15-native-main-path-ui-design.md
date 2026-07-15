# 主链路 UI 改版（Cocos Native · 横屏）

> **Status:** Draft for review  
> **Date:** 2026-07-15  
> **Scope:** Boot/Profile → StarMap → Sortie 确认（主链路三屏）  
> **Out of scope:** 完整 Battle 演出、Report、武器/宠物养成全页、插画资源流水线

## 1. 背景与问题

当前 Native APK 的 `BootApp` 是调试壳：纯色深底、灰字、单按钮，并在主流程展示「运行时 / 引擎 / 领域层」等工程文案。截图不可作为产品验收；与既有规格（全局横屏、电影化指令 RPG）及 `docs/mockups/cocos-redesign/` 不一致。

## 2. 目标与成功标准

1. **固定横屏**（与 redesign 规格一致），设计参考分辨率 `1280×720`，左右安全边距。
2. **三屏可辨识**：首屏品牌+建档、星图关卡选择、出击确认；玩家向文案，零工程泄漏。
3. **视觉像游戏壳**：深空氛围、清晰层级、琥珀 CTA；不要求最终插画，允许程序星空与几何面板。
4. **领域逻辑复用**：继续走 `ProfileService` + catalog；Sortie 可先接确认层，完整战斗场景绑定可后续包。
5. **新截图**：`docs/screenshot/` 下 `01–06`（或更新 `07–09` native 系列）替换为改版后画面，可作为评审材料。

## 3. 方案选择（已批准）

**方案 B：** 拆分三块 UI 预制体/模块 + 共享视觉令牌；替换加厚调试 `BootApp` 的路径。不采用「仅写 BootApp Graphics」的长期方案；也不阻塞在 HTML mockup 批次上（HTML 可作为对照，非门禁）。

## 4. 视觉令牌

| Token | 用途 | 值 |
|-------|------|-----|
| `bg.deep` | 主背景 | `#0B1220` |
| `bg.panel` | 半透明面板 | `#142033` @ ~88% |
| `stroke.panel` | 面板细边 | `#3A5578` |
| `text.primary` | 主文案 | `#E8EEF8` |
| `text.secondary` | 次要说明 | `#9BB0C9` |
| `accent.cta` | 主按钮 / 当前关 / 出击 | `#F0B429` |
| `accent.info` | 标签、进度、星章 | `#4CC9F0` |
| `starfield` | 背景星点 | 低密度白/青点，程序绘制 |

**排版层级（字号相对 720p 高）：** 品牌标题 ≫ 屏标题 ≫ 卡片标题 ≫ 说明。首版可用引擎默认字体，但层级与字重必须分明；后续可换专用显示字体，不阻塞本包。

**禁止出现在玩家主 UI：**  
`运行时`、`引擎`、`Cocos`、`WebView`、`领域层`、`BattleSession`、任何「下一包将…」技术说明。

## 5. 屏幕规格

### 5.1 Boot / Profile（首屏）

- **何时：** 无孩子档案。
- **布局：** 左品牌区（「时空语航员」+ 一句学习远征副文案）；右建档板（名字、教材、年级）+ CTA「创建并出航」。
- **行为：** 创建成功后进入 StarMap（不关工程 toast）。

### 5.2 StarMap（星图）

- **顶栏：** 孩子名 · 等级 · 合金 / 星晶 chip。
- **主区：** 关卡卡片（单元号、标题、语言点数、星章 `★☆☆`、可出击/锁定）。优先横滑或两列网格，避免竖向无结构灰字列表。
- **底栏：** 当前选中单元 + 琥珀「出击」。
- **行为：** 选中卡片 → 出击进入 Sortie 确认。

### 5.3 Sortie（出击确认）

- **顶：** 单元标题任务条。
- **中：** Boss 链四段可视化：听 → 读 → 拼 → 说（图标或短标签，非工程句）。
- **文案：** 「知识装甲待命，答对即发射。」
- **按钮：** 「返回星图」| 「开始远征」。后者若战斗场景未就绪：按钮样式成品，「开始远征」可进入轻量占位胜利/回星图，或显示可用态但有短反馈「战斗舱整备中」——**不得**再露出技术栈句子；实现计划中选定一种并写测试。

## 6. 技术落点（实现约束）

- **平台：** Cocos Creator Native Android/iOS only；禁止 Capacitor/WebView 壳。
- **结构建议：**
  - `presentation/ui/theme.ts`（色与字号常量）
  - `presentation/ui/StarfieldBg.ts` / 面板与按钮工厂
  - `presentation/screens/BootProfileScreen.ts`
  - `presentation/screens/StarMapScreen.ts`
  - `presentation/screens/SortieScreen.ts`
  - `BootApp.ts` 仅作组合根：朝向、导航、挂载当前屏
- **朝向：** Android / 项目设置锁定 landscape；启动时校验 `view` 宽≥高（调试日志可留，勿进 UI）。
- **内容：** 单元来自 catalog；星章读存档 progression（缺省 0）。

## 7. 非目标（本包不做）

- Report、武器库全页、宠物舱全页、完整四形态战斗演出与题型 UI。
- 商业插画、Spine、完整音频包装。
- Playwright 对 Native APK 的 E2E（Native 验收改用 adb/Maestro，另案）。

## 8. 验收清单

- [ ] 模拟器横屏冷启动：无孩子 → Profile 屏观感符合令牌。
- [ ] 建档 → StarMap：卡片可读、无工程文案。
- [ ] 出击 → Sortie：Boss 链与双按钮清晰。
- [ ] `docs/screenshot/` 更新至少 Profile / StarMap / Sortie 三张。
- [ ] 领域创建档案与单元列表行为不回归。

## 9. 决策记录

| 项 | 决定 |
|----|------|
| 范围 | 整条主链路三屏一起做 |
| 朝向 | 锁定横屏 |
| 落地方式 | 方案 B：分屏模块 + 视觉令牌 |
| 第 1 节设计 | 2026-07-15 用户批准 |
