# Native 主链路横屏 UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Cocos Native 主链路（Boot/Profile → StarMap → Sortie）从调试灰字壳升级为横屏、带视觉令牌的可用产品 UI，并更新 `docs/screenshot/` 截图。

**Architecture:** 纯 TS 视觉令牌与导航状态机可单测；Cocos 侧拆 `theme` / `ui-factory` / 三屏 builder；`BootApp` 只做组合根（存档、catalog、切屏）。Sortie「开始远征」本包反馈为短时玩家向文案「战斗舱整备中」，不进完整 Battle 场景、不泄漏工程词。

**Tech Stack:** Cocos Creator 3.8.7 Native、TypeScript、Vitest、Android debug APK + adb 截图。

## Global Constraints

- 独立 App，Cocos Creator Native only；禁止 Capacitor / WebView 壳。
- 全局横屏；设计参考 `1280×720`（见规格 `2026-07-15-native-main-path-ui-design.md`）。
- 玩家主 UI 禁止：`运行时`、`引擎`、`Cocos`、`WebView`、`领域层`、`BattleSession`、「下一包将」。
- 色板：`#0B1220` / `#142033` / `#3A5578` / `#E8EEF8` / `#9BB0C9` / `#F0B429` / `#4CC9F0`。
- 领域继续用 `ProfileService` + catalog；本包不做完整 Battle / Report / 武器宠物全页。

---

## File map

| Path | Responsibility |
|------|----------------|
| `app/assets/scripts/presentation/ui/theme.ts` | 色、字号、禁用文案检查 |
| `app/assets/scripts/presentation/ui/ui-factory.ts` | Label / 面板 / 琥珀按钮节点工厂 |
| `app/assets/scripts/presentation/ui/starfield.ts` | 程序星空背景 |
| `app/assets/scripts/presentation/main-path/main-path-nav.ts` | 纯 TS 导航状态 |
| `app/assets/scripts/presentation/screens/boot-profile-screen.ts` | 首屏 UI |
| `app/assets/scripts/presentation/screens/star-map-screen.ts` | 星图 UI |
| `app/assets/scripts/presentation/screens/sortie-screen.ts` | 出击确认 UI |
| `app/assets/scripts/presentation/BootApp.ts` | 组合根，替换旧灰字壳 |
| `app/project.json` / `app/settings/v2/packages/project.json` | designResolution → 1280×720 |
| `app/build-android-debug.json` | portrait false；landscapeLeft/Right true |
| `app/tests/presentation/theme.test.ts` | 令牌与禁用文案 |
| `app/tests/presentation/main-path-nav.test.ts` | 导航状态机 |
| `docs/screenshot/07-native-boot.png` 等 | 更新截图 |
| `docs/screenshot/README.md` | 与现截图对齐 |

---

### Task 1: Theme tokens + banned-copy gate (TDD)

**Files:**
- Create: `app/assets/scripts/presentation/ui/theme.ts`
- Create: `app/tests/presentation/theme.test.ts`

**Interfaces:**
- Produces: `UiTheme.colors`, `UiTheme.font`, `assertPlayerSafeCopy(text: string): void`（命中禁用词抛错）

- [ ] **Step 1: Write the failing test**

```ts
// app/tests/presentation/theme.test.ts
import { describe, expect, it } from "vitest";
import { UiTheme, assertPlayerSafeCopy } from "../../assets/scripts/presentation/ui/theme";

describe("UiTheme", () => {
  it("exposes approved palette", () => {
    expect(UiTheme.colors.bgDeep).toEqual({ r: 11, g: 18, b: 32, a: 255 });
    expect(UiTheme.colors.accentCta).toEqual({ r: 240, g: 180, b: 41, a: 255 });
    expect(UiTheme.colors.accentInfo).toEqual({ r: 76, g: 201, b: 240, a: 255 });
  });

  it("rejects engineering leaks in player copy", () => {
    expect(() => assertPlayerSafeCopy("运行时: Cocos Native")).toThrow(/forbidden/);
    expect(() => assertPlayerSafeCopy("领域层 BattleSession")).toThrow(/forbidden/);
    expect(() => assertPlayerSafeCopy("知识装甲待命，答对即发射。")).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd app && npx vitest run tests/presentation/theme.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation**

```ts
// app/assets/scripts/presentation/ui/theme.ts
export type Rgba = { r: number; g: number; b: number; a: number };

const FORBIDDEN = [
  "运行时",
  "引擎",
  "Cocos",
  "WebView",
  "领域层",
  "BattleSession",
  "下一包",
] as const;

export const UiTheme = {
  colors: {
    bgDeep: { r: 11, g: 18, b: 32, a: 255 } satisfies Rgba,
    bgPanel: { r: 20, g: 32, b: 51, a: 225 } satisfies Rgba,
    strokePanel: { r: 58, g: 85, b: 120, a: 255 } satisfies Rgba,
    textPrimary: { r: 232, g: 238, b: 248, a: 255 } satisfies Rgba,
    textSecondary: { r: 155, g: 176, b: 201, a: 255 } satisfies Rgba,
    accentCta: { r: 240, g: 180, b: 41, a: 255 } satisfies Rgba,
    accentInfo: { r: 76, g: 201, b: 240, a: 255 } satisfies Rgba,
  },
  font: {
    brand: 56,
    screenTitle: 32,
    cardTitle: 22,
    body: 18,
    chip: 16,
  },
  design: { width: 1280, height: 720 },
} as const;

export function assertPlayerSafeCopy(text: string): void {
  for (const word of FORBIDDEN) {
    if (text.includes(word)) {
      throw new Error(`forbidden player copy: ${word}`);
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd app && npx vitest run tests/presentation/theme.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/assets/scripts/presentation/ui/theme.ts app/tests/presentation/theme.test.ts
git commit -m "feat: add UI theme tokens and player-copy gate"
```

---

### Task 2: Main-path navigation state (TDD)

**Files:**
- Create: `app/assets/scripts/presentation/main-path/main-path-nav.ts`
- Create: `app/tests/presentation/main-path-nav.test.ts`

**Interfaces:**
- Produces:
  - `export type MainPathScreen = "profile" | "starmap" | "sortie"`
  - `export class MainPathNav { constructor(hasChild: boolean); screen: MainPathScreen; selectUnit(unitId: string): void; selectedUnitId: string | null; goSortie(): void; backToStarMap(): void; afterCreateChild(): void }`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { MainPathNav } from "../../assets/scripts/presentation/main-path/main-path-nav";

describe("MainPathNav", () => {
  it("starts on profile when no child", () => {
    expect(new MainPathNav(false).screen).toBe("profile");
  });

  it("starts on starmap when child exists", () => {
    expect(new MainPathNav(true).screen).toBe("starmap");
  });

  it("profile → starmap after create", () => {
    const nav = new MainPathNav(false);
    nav.afterCreateChild();
    expect(nav.screen).toBe("starmap");
  });

  it("starmap → sortie only with selected unit", () => {
    const nav = new MainPathNav(true);
    expect(() => nav.goSortie()).toThrow();
    nav.selectUnit("3A-U1");
    nav.goSortie();
    expect(nav.screen).toBe("sortie");
    expect(nav.selectedUnitId).toBe("3A-U1");
    nav.backToStarMap();
    expect(nav.screen).toBe("starmap");
  });
});
```

- [ ] **Step 2: Run test — expect FAIL (module missing)**

Run: `cd app && npx vitest run tests/presentation/main-path-nav.test.ts`

- [ ] **Step 3: Implement**

```ts
export type MainPathScreen = "profile" | "starmap" | "sortie";

export class MainPathNav {
  screen: MainPathScreen;
  selectedUnitId: string | null = null;

  constructor(hasChild: boolean) {
    this.screen = hasChild ? "starmap" : "profile";
  }

  afterCreateChild(): void {
    this.screen = "starmap";
  }

  selectUnit(unitId: string): void {
    this.selectedUnitId = unitId;
  }

  goSortie(): void {
    if (!this.selectedUnitId) throw new Error("no unit selected");
    this.screen = "sortie";
  }

  backToStarMap(): void {
    this.screen = "starmap";
  }
}
```

- [ ] **Step 4: Run tests — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add app/assets/scripts/presentation/main-path/main-path-nav.ts app/tests/presentation/main-path-nav.test.ts
git commit -m "feat: add main-path navigation state"
```

---

### Task 3: Lock landscape project + Android build config

**Files:**
- Modify: `app/project.json`
- Modify: `app/settings/v2/packages/project.json`
- Modify: `app/build-android-debug.json`
- Also check `app/settings/v2/packages/builder.json` or Cocos `project` orientation if present; set landscape.

**Interfaces:** none (config only)

- [ ] **Step 1: Set design resolution to 1280×720**

In both `app/project.json` and `app/settings/v2/packages/project.json`:

```json
"designResolution": {
  "width": 1280,
  "height": 720,
  "fitWidth": true,
  "fitHeight": false
}
```

- [ ] **Step 2: Android orientation landscape-only**

In `app/build-android-debug.json`:

```json
"orientation": {
  "portrait": false,
  "landscapeLeft": true,
  "landscapeRight": true,
  "upsideDown": false
}
```

If `app/native/engine/android/.../AndroidManifest.xml` or `AppActivity` forces portrait, align to `sensorLandscape` / `landscape`.

- [ ] **Step 3: Sanity grep**

Run: `rg -n '720|1280|portrait|landscape' app/project.json app/settings/v2/packages/project.json app/build-android-debug.json`
Expected: landscape flags true; design 1280×720

- [ ] **Step 4: Commit**

```bash
git add app/project.json app/settings/v2/packages/project.json app/build-android-debug.json
# plus any native orientation files changed
git commit -m "chore: lock Cocos design and Android build to landscape"
```

---

### Task 4: UI factory + starfield (pure helpers + thin cc wrappers)

**Files:**
- Create: `app/assets/scripts/presentation/ui/ui-factory.ts`
- Create: `app/assets/scripts/presentation/ui/starfield.ts`
- Test: extend `app/tests/presentation/theme.test.ts` OR add `starfield-layout.test.ts` for deterministic star positions (pure function)

**Interfaces:**
- Consumes: `UiTheme`
- Produces:
  - `colorOf(rgba: Rgba): Color`（在 factory 内 `import { Color } from "cc"`）
  - `makeLabel(parent, name, opts): Label`
  - `makePanel(parent, name, w, h): Node`
  - `makeCtaButton(parent, name, label, w, h, onTap): Node`
  - `attachStarfield(parent, width, height, seed): void`
  - `export function starPoints(width, height, count, seed): Array<{x,y,r}>`（纯函数，供测试）

- [ ] **Step 1: Pure star layout test**

```ts
import { starPoints } from "../../assets/scripts/presentation/ui/starfield";
it("is deterministic for a seed", () => {
  expect(starPoints(1280, 720, 40, 7)).toEqual(starPoints(1280, 720, 40, 7));
  expect(starPoints(1280, 720, 40, 7).length).toBe(40);
});
```

- [ ] **Step 2: Implement `starPoints` + `attachStarfield` + factory**

`attachStarfield`：深色 `Graphics` 全屏底 + 星点；`makeCtaButton`：琥珀圆角矩形 + 深色字（或近黑 `#0B1220` 字）+ `TOUCH_END`。

所有经 `makeLabel` 设置的 `string` 在赋值前调用 `assertPlayerSafeCopy`（动态拼接用户名等不含禁用词即可）。

- [ ] **Step 3: Run** `cd app && npx vitest run tests/presentation/`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git commit -am "feat: add starfield and UI node factory"
```

---

### Task 5: BootProfileScreen

**Files:**
- Create: `app/assets/scripts/presentation/screens/boot-profile-screen.ts`

**Interfaces:**
- Consumes: `ui-factory`, `UiTheme`, viewport size
- Produces: `class BootProfileScreen { constructor(root: Node, size: Size); render(opts: { onCreate: (name: string) => void }): void; destroy(): void }`

布局（相对 1280×720 中心坐标）：
- 左侧 x≈-320：品牌「时空语航员」`font.brand` + 副文案「教材同步星际训练，答对即发射。」
- 右侧面板：名字（`EditBox` 默认「小航员」；若 Native EditBox 不稳，退化为三档点选名：小航员/宇航员/启航者，须在实现时二选一并在 PR 说明）、教材固定展示「沪教牛津 2024」、年级展示「3A」（首包固定；控件可视觉为 chip）
- CTA：「创建并出航」→ `onCreate(name)`

- [ ] **Step 1: Implement screen builder（无 Vitest，靠 Task 8 真机）**
- [ ] **Step 2: Manual check in Creator preview if available**（横屏）
- [ ] **Step 3: Commit**

```bash
git add app/assets/scripts/presentation/screens/boot-profile-screen.ts
git commit -m "feat: add Boot/Profile landscape screen"
```

---

### Task 6: StarMapScreen

**Files:**
- Create: `app/assets/scripts/presentation/screens/star-map-screen.ts`

**Interfaces:**
- Consumes: catalog units `{ id, title, items? }[]`, child summary `{ name, level, alloy, starCrystals }`, `selectedUnitId`, callbacks
- Produces: `class StarMapScreen { render(model): void; destroy(): void }`

布局：
- 顶栏：name · `Lv.n` · 合金 · 星晶（info 色 chip）
- 主区：最多 8 张卡，两列（或横向排列），每卡：`Unit N`、title（截断）、`{n} 语言点`、星章字符串（`formatStars(0|1|2|3)` → `★★★` / `★★☆` 等）、选中描边用 `accentCta`
- 底右：「出击」仅当有选中；点击 → `onSortie()`

**Also create pure helper**（可单测）：

```ts
export function formatStars(n: number): string {
  const c = Math.max(0, Math.min(3, Math.floor(n)));
  return "★".repeat(c) + "☆".repeat(3 - c);
}
```

Test in `app/tests/presentation/format-stars.test.ts`.

- [ ] **Step 1: TDD `formatStars`**
- [ ] **Step 2: Implement StarMapScreen**
- [ ] **Step 3: Commit**

```bash
git commit -am "feat: add StarMap landscape screen"
```

---

### Task 7: SortieScreen + BootApp composition root

**Files:**
- Create: `app/assets/scripts/presentation/screens/sortie-screen.ts`
- Modify: `app/assets/scripts/presentation/BootApp.ts`（整文件替换为组合根）

**Interfaces:**
- Sortie `render({ unitTitle, onBack, onStart })`
- Boss 链四段固定文案：`["听", "读", "拼", "说"]`，展示为带 `accentInfo` 的串联芯片；正文：「知识装甲待命，答对即发射。」
- 「开始远征」→ 调用 `onStart`；BootApp 中实现：在屏内显示临时 Label「战斗舱整备中」约 1.2s 后移除（**不得**改工程文案）
- 「返回星图」→ `nav.backToStarMap()` 并重绘

BootApp 职责：
1. `ProfileService.start()` + load catalog（保留现 resources 加载 + fallback）
2. `MainPathNav` + `screenHost` 空节点；`renderCurrent()` 销毁子树再挂对应 Screen
3. 有孩子则 `listChildren()[0]`；合金/星晶/等级从 `ensureChildProgression` + `calculateLevel`（与 play 切片一致路径）
4. 创建档案：`createChild({ name, textbookId: "hujiao_oxford_2024", grade: "3A" })`
5. 默认选中第一个 unit

删除旧 `refreshSplash` / 灰字 `body.string` 路径。

- [ ] **Step 1: Implement SortieScreen**
- [ ] **Step 2: Rewrite BootApp as composition root**
- [ ] **Step 3: Domain unit tests still green**

Run: `cd app && npm test -- --run`
Expected: all PASS（含新 presentation 测试）

- [ ] **Step 4: Commit**

```bash
git add app/assets/scripts/presentation/
git commit -m "feat: wire landscape main-path screens in BootApp"
```

---

### Task 8: Rebuild APK, capture screenshots, docs

**Files:**
- Update: `docs/screenshot/07-native-boot.png`, `08-native-starmap.png`, `09-native-sortie.png`
- Update: `docs/screenshot/README.md`
- Optionally touch `docs/testing.md` 一行：主链路 UI 用 adb 截图验收
- Update: `CHANGELOG.md` 短条目

- [ ] **Step 1: Creator build + Gradle assembleDebug**（沿用已验证流程：`env -u ELECTRON_RUN_AS_NODE`、Java 17、SDK 34/28/28）
- [ ] **Step 2: adb install -r + 启动 `com.cocos.game.AppActivity`（或当前清单 Activity）**
- [ ] **Step 3: 横屏截三态**

```bash
# 清数据后冷启动 → Profile
adb shell pm clear com.languageastronauts.app
adb shell am start -n com.languageastronauts.app/com.cocos.game.AppActivity
adb exec-out screencap -p > docs/screenshot/07-native-boot.png
# 建档后
adb exec-out screencap -p > docs/screenshot/08-native-starmap.png
# 出击后
adb exec-out screencap -p > docs/screenshot/09-native-sortie.png
```

人工点按或用 `adb shell input tap`（按分辨率换算）。确认截图无禁用词、为横屏。

- [ ] **Step 4: Commit screenshots + changelog**

```bash
git add docs/screenshot docs/testing.md CHANGELOG.md
git commit -m "docs: refresh native main-path UI screenshots"
```

---

## Spec coverage self-check

| Spec 项 | Task |
|---------|------|
| 横屏 1280×720 | Task 3 |
| 色板与禁止文案 | Task 1, 4–7 |
| Profile 左右布局 | Task 5 |
| StarMap 顶栏+卡片+出击 | Task 6 |
| Sortie Boss 链+双按钮+整备中反馈 | Task 7 |
| 去调试壳 / BootApp 组合根 | Task 7 |
| 截图更新 | Task 8 |
| 不做完整 Battle / Playwright Native | 明确非目标 |

**Sortie 行为锁定：** 「开始远征」→ 短时「战斗舱整备中」（非跳转技术占位页）。

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-15-native-main-path-ui.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — 每任务新开子代理，任务间审查  
2. **Inline Execution** — 本会话按 executing-plans 连续推进并设检查点  

Which approach?
