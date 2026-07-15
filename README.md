# 时空语航员 · Language Astronauts

> **Status:** Current  
> **Applies to:** Web/PWA MVP v4  
> **Last verified:** 2026-07-15

一款面向深圳小学 **1–6 年级** 的多教材英语功能游戏（Serious Game），支持：

- **沪教牛津版（2024 新版 · 六三制一起）**
- **沪教版英语口语交际**

把单词记忆与课文练习，转化为「能核飞船 × 星际防御」冒险，并用**艾宾浩斯遗忘曲线**伪装成「怪兽突袭」，驱动自发复习。

当前可运行形态是纯前端 Web/PWA MVP（0 服务器 / 0 广告 / 0 内购）。已确认下一阶段迁往 **Cocos Creator 3.8.8** 的离线 **iOS/Android** 原生独立 App（见下方「Cocos v2 迁移」）。

更细的代码真值见 [`docs/current-state.md`](docs/current-state.md)。文档状态索引见 [`docs/document-status.md`](docs/document-status.md)。

## 账号与教材

- **多孩子账号**：一部设备可创建多个孩子；进度、复习队列、宠物等完全隔离。
- **教材绑定**：创建时选择教材 + 年级/学期；星图默认显示当前学期。
- **存档**：LocalStorage v4；支持 JSON 导出/导入。

## 玩法概览（当前 Web MVP 真值）

- **星图远征**：每个单元一个星域；四关 Boss 依次考察 **听 → 读 → 拼写 → 口语**。
- **多模态答题**：弹药选择 / 听音辨词 / 阅读选义 / 拼写填空 / 口语评测（Web Speech）。
- **Combo**：连续答对可触发暴击与更高战功；答错清零。
- **双轨通关**：击杀四 Boss = 星域解放；水晶 `30/30` **且本单元** 复习队列清空 = 完美通关。
- **护盾 HP**：答错扣血；归零进入「睡眠充能」。
- **红色警报突袭**：艾宾浩斯队列到期伪装成怪兽突袭（严禁说教式复习文案）。
- **武器库 / 宠物舱**：战功换武器，水晶领养与喂养宠物（最多出战 2 只）。
- **军衔 / 成就 / 学情**：战功晋升展示；家长向学情摘要本地查看。
- **星际花园**：数据字段存在，**玩法 UI 尚未实现**（不是当前可玩功能）。

## 艾宾浩斯记忆层级（运行时真值）

| 层级 | 冷却 | 游戏内表现 |
| --- | --- | --- |
| Level 1 | 20 分钟 | 浅层警报 |
| Level 2 | 2 小时 | 中层突袭 |
| Level 3 | 1 天 | 领地保卫战 |
| Level 4 | 3 天 | 星域大 BOSS 逆袭 |
| Level 5 | 7 天 | 终极遗忘之主 |

答错 → 层级重置为 Level 1。威胁数值 `damage/steal` 当前仅用于文案。

## 技术栈（当前）

- HTML5 + Tailwind CSS（CDN）+ Animate.css（CDN）+ 原生 JavaScript
- 存储：`LocalStorage` v4
- 音效：WebAudio 合成；发音 / 解说：`SpeechSynthesis`
- 特效：`js/fx.js` DOM 粒子
- PWA：`manifest.webmanifest`

## 目录结构

```
index.html              入口
manifest.webmanifest    PWA 清单
css/style.css           太空主题样式
js/
  data.js / data-kouyu.js / catalog.js / storage.js
  ebbinghaus.js / audio.js / combat.js / game.js
  fx.js / sprites.js / ui.js / main.js
assets/svg/             外部 SVG（当前未被路径引用）
docs/                   审计、规格、实施计划
scripts/generate-kouyu-data.js
```

## 本地运行

```bash
python3 -m http.server 8799
# 浏览器打开 http://localhost:8799
```

## Cocos v2 迁移

- **当前**：Web MVP 仍在仓库根目录运行。
- **可玩切片（推荐开发试玩）**：`play/` Vite App，共享 `app/assets/scripts` 领域层。
  ```bash
  cd play && npm install && npm run dev
  # 打开 http://127.0.0.1:5173
  ```
  领域测试：`cd app && npm test -- --run`
- **未来**：Cocos 工程根目录统一为 `app/`（本机 Creator 3.8.7 可用；规格目标 3.8.8）。
- **引擎 / 平台**：Cocos Creator → 离线 **iOS/Android** 原生包；领域代码不依赖 `cc`，便于先 Web/Capacitor 后接编辑器。
- **规划入口**：
  - 产品 GDD：`docs/product/GDD-v2-cocos.md`
  - 总体规格：`docs/superpowers/specs/2026-07-15-language-astronauts-cocos-redesign-design.md`
  - 总计划：`docs/superpowers/plans/2026-07-15-language-astronauts-cocos-master-plan.md`
  - 状态索引：`docs/document-status.md`
- 上列为目标规划；`play/` 已可完整体验切片闭环（档案/星图/战斗/武器宠物/结算）。

## 存档迁移

旧版 v3 单用户存档会在首次加载时迁移为 v4 多孩子格式。
