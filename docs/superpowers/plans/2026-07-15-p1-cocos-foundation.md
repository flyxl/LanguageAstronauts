# P1 Cocos Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立可测试的 Cocos Creator 3.8.8 工程、纯 TypeScript 领域骨架、强类型基础端口、v5 本地存档、六场景导航和可恢复的孩子档案流程。

**Architecture:** `app/` 是唯一 Cocos 工程根目录；领域代码不引用 `cc`，只依赖 `app/assets/scripts/core/` 的端口与类型。Cocos、存储和随机/时间实现位于 infrastructure/presentation，由组合根注入，Vitest 直接测试纯 TypeScript。

**Tech Stack:** Cocos Creator 3.8.8、TypeScript 5、Vitest、Node.js 20、Cocos `sys.localStorage`、Git。

## Global Constraints

- 目标平台是 iOS/Android 原生独立 App；首发完全离线。
- Cocos 工程根目录固定为 `app/`。
- 纯领域代码放 `app/assets/scripts/domain/`；基础接口放 `app/assets/scripts/core/`；基础设施放 `app/assets/scripts/infrastructure/`；Cocos 表现放 `app/assets/scripts/presentation/`；测试放 `app/tests/`；内容工具放 `tools/`。
- `domain/` 内禁止 `import ... from "cc"`；UI 不得直接写存档。
- EventBus 必须由 `AppEvents` 显式限定事件名和载荷，不接受任意字符串或 `any` 载荷。
- 时间、随机、存档和场景导航必须通过 `Clock`、`RandomSource`、`SaveRepository`、`SceneNavigator` 注入。
- 全局横屏；场景固定为 Boot、Profile、Base、StarMap、Battle、Report。
- 本阶段不加入正式美术、完整 FSRS、全教材或原生桥。
- 所有自动化测试均从仓库根运行 `cd app && npm test -- --run`。
- 设计真值：`docs/superpowers/specs/2026-07-15-language-astronauts-cocos-redesign-design.md`。

---

### Task 1: 创建 Cocos 工程与 Vitest 测试框架

**Files:**
- Create: `app/project.json`
- Create: `app/assets/`
- Create: `app/settings/`
- Create: `app/package.json`
- Create: `app/tsconfig.test.json`
- Create: `app/vitest.config.ts`
- Create: `app/tests/framework.test.ts`
- Modify: `.gitignore`
- Test: `app/tests/framework.test.ts`

**Interfaces:**
- Consumes: 已安装的 Cocos Creator 3.8.8、Node.js 20。
- Produces: `npm test -- --run` 测试入口；后续任务可导入 `assets/scripts/**/*.ts`。

- [ ] **Step 1: 用 Cocos Dashboard 创建空工程（2–5 分钟）**

在 Cocos Dashboard 选择 Creator `3.8.8`，模板选 Empty，项目名填 `LanguageAstronauts`，位置选择仓库内 `app/`。打开一次工程，等待 `library/`、`temp/` 和 `local/` 生成后关闭编辑器。

- [ ] **Step 2: 写测试框架失败样例（2–5 分钟）**

创建 `app/tests/framework.test.ts`：

```ts
import { describe, expect, it } from "vitest";
import { FOUNDATION_VERSION } from "../assets/scripts/core/foundation-version";

describe("foundation", () => {
  it("exposes the P1 contract version", () => {
    expect(FOUNDATION_VERSION).toBe("p1");
  });
});
```

- [ ] **Step 3: 配置依赖与测试 TypeScript（2–5 分钟）**

创建 `app/package.json`：

```json
{
  "name": "language-astronauts-cocos",
  "private": true,
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "typecheck:test": "tsc -p tsconfig.test.json --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.8.3",
    "vitest": "^3.2.4"
  }
}
```

创建 `app/tsconfig.test.json`：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "types": ["vitest/globals"]
  },
  "include": ["assets/scripts/core/**/*.ts", "assets/scripts/domain/**/*.ts", "assets/scripts/infrastructure/memory/**/*.ts", "tests/**/*.ts"]
}
```

创建 `app/vitest.config.ts`：

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    clearMocks: true
  }
});
```

- [ ] **Step 4: 安装并确认测试按预期失败（2–5 分钟）**

运行：`cd app && npm install && npm test -- --run tests/framework.test.ts`

预期：FAIL，错误包含 `Cannot find module '../assets/scripts/core/foundation-version'`。

- [ ] **Step 5: 写最小实现并忽略生成目录（2–5 分钟）**

创建 `app/assets/scripts/core/foundation-version.ts`：

```ts
export const FOUNDATION_VERSION = "p1" as const;
```

在 `.gitignore` 追加：

```gitignore
app/library/
app/local/
app/temp/
app/build/
app/node_modules/
```

- [ ] **Step 6: 验证测试框架（2–5 分钟）**

运行：`cd app && npm run typecheck:test && npm test -- --run tests/framework.test.ts`

预期：typecheck 成功；Vitest 显示 `1 passed`。

- [ ] **Step 7: Commit（2–5 分钟）**

```bash
git add .gitignore app/project.json app/assets app/settings app/package.json app/package-lock.json app/tsconfig.test.json app/vitest.config.ts app/tests/framework.test.ts
git commit -m "build: create Cocos testable foundation"
```

### Task 2: 锁定强类型 EventBus 与应用事件

**Files:**
- Create: `app/assets/scripts/core/app-events.ts`
- Create: `app/assets/scripts/core/event-bus.ts`
- Test: `app/tests/core/event-bus.test.ts`

**Interfaces:**
- Consumes: 无运行时依赖。
- Produces: `EventBus<E extends object>`；`AppEvents`；`on<K extends keyof E>(type, handler): () => void`；`emit<K extends keyof E>(type, payload): void`。

- [ ] **Step 1: 写订阅、退订和类型载荷测试（2–5 分钟）**

创建 `app/tests/core/event-bus.test.ts`：

```ts
import { describe, expect, it, vi } from "vitest";
import type { AppEvents } from "../../assets/scripts/core/app-events";
import { EventBus } from "../../assets/scripts/core/event-bus";

describe("EventBus", () => {
  it("delivers a typed payload and supports unsubscribe", () => {
    const bus = new EventBus<AppEvents>();
    const handler = vi.fn();
    const off = bus.on("QuestionPresented", handler);

    bus.emit("QuestionPresented", { battleId: "b1", questionId: "q1", contentId: "3A-U1:vocab:happy" });
    off();
    bus.emit("QuestionPresented", { battleId: "b1", questionId: "q2", contentId: "3A-U1:vocab:sad" });

    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith({
      battleId: "b1",
      questionId: "q1",
      contentId: "3A-U1:vocab:happy"
    });
  });
});
```

- [ ] **Step 2: 运行测试确认失败（2–5 分钟）**

运行：`cd app && npm test -- --run tests/core/event-bus.test.ts`

预期：FAIL，缺少 `core/app-events` 或 `core/event-bus`。

- [ ] **Step 3: 定义全部基础事件载荷（2–5 分钟）**

创建 `app/assets/scripts/core/app-events.ts`：

```ts
export type AnswerOutcome =
  | "first_correct"
  | "corrected"
  | "skipped"
  | "device_failure"
  | "incorrect";

export type BossPhase = "shield" | "armor" | "core";

export interface AppEvents {
  QuestionPresented: { battleId: string; questionId: string; contentId: string };
  QuestionAnswered: { battleId: string; questionId: string; outcome: AnswerOutcome };
  CorrectionCompleted: { battleId: string; questionId: string };
  MasteryUpdated: { childId: string; contentId: string; stabilityDays: number; difficulty: number; dueAt: number };
  CommandResolved: { battleId: string; quality: number; momentum: number };
  AttackResolved: { battleId: string; damage: number; nodeBroken: boolean };
  BossPhaseChanged: { battleId: string; phase: BossPhase };
  PetSkillTriggered: { battleId: string; petId: string; skillId: string };
  BattleFinished: { battleId: string; result: "victory" | "evacuated" };
  SaveCommitted: { saveVersion: 5; committedAt: number };
}
```

- [ ] **Step 4: 实现同步、可退订 EventBus（2–5 分钟）**

创建 `app/assets/scripts/core/event-bus.ts`：

```ts
export type EventHandler<T> = (payload: T) => void;

export class EventBus<E extends object> {
  private readonly handlers = new Map<keyof E, Set<EventHandler<never>>>();

  on<K extends keyof E>(type: K, handler: EventHandler<E[K]>): () => void {
    const set = this.handlers.get(type) ?? new Set<EventHandler<never>>();
    set.add(handler as EventHandler<never>);
    this.handlers.set(type, set);
    return () => {
      set.delete(handler as EventHandler<never>);
      if (set.size === 0) this.handlers.delete(type);
    };
  }

  emit<K extends keyof E>(type: K, payload: E[K]): void {
    const snapshot = [...(this.handlers.get(type) ?? [])];
    for (const handler of snapshot) {
      (handler as EventHandler<E[K]>)(payload);
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}
```

- [ ] **Step 5: 验证运行时和编译期约束（2–5 分钟）**

运行：`cd app && npm run typecheck:test && npm test -- --run tests/core/event-bus.test.ts`

预期：typecheck 成功；Vitest 显示 `1 passed`。把任意事件名传给 `emit` 会被 TypeScript 拒绝，不为此保留失败代码。

- [ ] **Step 6: Commit（2–5 分钟）**

```bash
git add app/assets/scripts/core/app-events.ts app/assets/scripts/core/event-bus.ts app/tests/core/event-bus.test.ts
git commit -m "feat: add typed application event bus"
```

### Task 3: 锁定 Clock 与 RandomSource

**Files:**
- Create: `app/assets/scripts/core/clock.ts`
- Create: `app/assets/scripts/core/random-source.ts`
- Create: `app/assets/scripts/infrastructure/system/system-clock.ts`
- Create: `app/assets/scripts/infrastructure/system/math-random-source.ts`
- Create: `app/assets/scripts/infrastructure/memory/fake-clock.ts`
- Create: `app/assets/scripts/infrastructure/memory/sequence-random-source.ts`
- Test: `app/tests/core/time-random.test.ts`

**Interfaces:**
- Consumes: JavaScript `Date.now`、`setTimeout`、`Math.random`。
- Produces: `Clock.now()`、`Clock.setTimeout()`、`Clock.clearTimeout()`；`RandomSource.next()`；可确定性测试替身。

- [ ] **Step 1: 写确定性测试（2–5 分钟）**

创建 `app/tests/core/time-random.test.ts`：

```ts
import { describe, expect, it, vi } from "vitest";
import { FakeClock } from "../../assets/scripts/infrastructure/memory/fake-clock";
import { SequenceRandomSource } from "../../assets/scripts/infrastructure/memory/sequence-random-source";

describe("foundation sources", () => {
  it("advances fake time and fires due callbacks in order", () => {
    const clock = new FakeClock(1_000);
    const calls = vi.fn();
    clock.setTimeout(() => calls("late"), 20);
    clock.setTimeout(() => calls("early"), 10);
    clock.advanceBy(20);
    expect(calls.mock.calls.flat()).toEqual(["early", "late"]);
    expect(clock.now()).toBe(1_020);
  });

  it("returns a fixed random sequence", () => {
    const random = new SequenceRandomSource([0.75, 0.25]);
    expect([random.next(), random.next()]).toEqual([0.75, 0.25]);
    expect(() => random.next()).toThrow("Random sequence exhausted");
  });
});
```

- [ ] **Step 2: 运行测试确认失败（2–5 分钟）**

运行：`cd app && npm test -- --run tests/core/time-random.test.ts`

预期：FAIL，缺少 fake clock。

- [ ] **Step 3: 定义端口与生产实现（2–5 分钟）**

创建 `app/assets/scripts/core/clock.ts`：

```ts
export type TimerHandle = ReturnType<typeof setTimeout>;

export interface Clock {
  now(): number;
  setTimeout(callback: () => void, delayMs: number): TimerHandle;
  clearTimeout(handle: TimerHandle): void;
}
```

创建 `app/assets/scripts/core/random-source.ts`：

```ts
export interface RandomSource {
  next(): number;
}
```

创建 `app/assets/scripts/infrastructure/system/system-clock.ts`：

```ts
import type { Clock, TimerHandle } from "../../core/clock";

export class SystemClock implements Clock {
  now(): number { return Date.now(); }
  setTimeout(callback: () => void, delayMs: number): TimerHandle { return setTimeout(callback, delayMs); }
  clearTimeout(handle: TimerHandle): void { clearTimeout(handle); }
}
```

创建 `app/assets/scripts/infrastructure/system/math-random-source.ts`：

```ts
import type { RandomSource } from "../../core/random-source";

export class MathRandomSource implements RandomSource {
  next(): number { return Math.random(); }
}
```

- [ ] **Step 4: 实现测试替身（2–5 分钟）**

创建 `app/assets/scripts/infrastructure/memory/fake-clock.ts`：

```ts
import type { Clock, TimerHandle } from "../../core/clock";

interface PendingTimer {
  id: number;
  dueAt: number;
  callback: () => void;
}

export class FakeClock implements Clock {
  private time: number;
  private nextId = 1;
  private readonly timers: PendingTimer[] = [];

  constructor(startAt = 0) { this.time = startAt; }
  now(): number { return this.time; }

  setTimeout(callback: () => void, delayMs: number): TimerHandle {
    const id = this.nextId++;
    this.timers.push({ id, dueAt: this.time + delayMs, callback });
    return id as unknown as TimerHandle;
  }

  clearTimeout(handle: TimerHandle): void {
    const id = handle as unknown as number;
    const index = this.timers.findIndex((timer) => timer.id === id);
    if (index >= 0) this.timers.splice(index, 1);
  }

  advanceBy(milliseconds: number): void {
    const target = this.time + milliseconds;
    while (true) {
      this.timers.sort((a, b) => a.dueAt - b.dueAt || a.id - b.id);
      const next = this.timers[0];
      if (!next || next.dueAt > target) break;
      this.timers.shift();
      this.time = next.dueAt;
      next.callback();
    }
    this.time = target;
  }
}
```

创建 `app/assets/scripts/infrastructure/memory/sequence-random-source.ts`：

```ts
import type { RandomSource } from "../../core/random-source";

export class SequenceRandomSource implements RandomSource {
  private index = 0;
  constructor(private readonly values: readonly number[]) {}

  next(): number {
    if (this.index >= this.values.length) throw new Error("Random sequence exhausted");
    const value = this.values[this.index++];
    if (value < 0 || value >= 1) throw new Error(`Random value out of range: ${value}`);
    return value;
  }
}
```

- [ ] **Step 5: 运行验证（2–5 分钟）**

运行：`cd app && npm run typecheck:test && npm test -- --run tests/core/time-random.test.ts`

预期：typecheck 成功；Vitest 显示 `2 passed`。

- [ ] **Step 6: Commit（2–5 分钟）**

```bash
git add app/assets/scripts/core/clock.ts app/assets/scripts/core/random-source.ts app/assets/scripts/infrastructure app/tests/core/time-random.test.ts
git commit -m "feat: inject clock and random sources"
```

### Task 4: 定义 v5 SaveRepository 并实现可恢复提交

**Files:**
- Create: `app/assets/scripts/core/save-repository.ts`
- Create: `app/assets/scripts/domain/save/save-v5.ts`
- Create: `app/assets/scripts/domain/save/create-default-save.ts`
- Create: `app/assets/scripts/infrastructure/memory/memory-save-repository.ts`
- Create: `app/assets/scripts/infrastructure/cocos/cocos-save-repository.ts`
- Test: `app/tests/save/save-repository.test.ts`

**Interfaces:**
- Consumes: `Clock`；Cocos `sys.localStorage` 仅限生产实现。
- Produces: `SaveRepository.load(): Promise<SaveV5 | null>`；`commit(save: SaveV5): Promise<void>`；`SaveV5` 根 schema。

- [ ] **Step 1: 写提交隔离与损坏回滚测试（2–5 分钟）**

创建 `app/tests/save/save-repository.test.ts`：

```ts
import { describe, expect, it } from "vitest";
import { createDefaultSave } from "../../assets/scripts/domain/save/create-default-save";
import { MemorySaveRepository } from "../../assets/scripts/infrastructure/memory/memory-save-repository";

describe("SaveRepository", () => {
  it("returns a clone of the committed v5 save", async () => {
    const repo = new MemorySaveRepository();
    const save = createDefaultSave(100);
    save.settings.soundEnabled = false;
    await repo.commit(save);
    save.settings.soundEnabled = true;
    expect((await repo.load())?.settings.soundEnabled).toBe(false);
  });

  it("recovers the previous valid snapshot when the main snapshot is corrupt", async () => {
    const repo = new MemorySaveRepository();
    const first = createDefaultSave(100);
    const second = createDefaultSave(200);
    await repo.commit(first);
    await repo.commit(second);
    repo.corruptMainForTest();
    expect((await repo.load())?.updatedAt).toBe(100);
  });
});
```

- [ ] **Step 2: 运行测试确认失败（2–5 分钟）**

运行：`cd app && npm test -- --run tests/save/save-repository.test.ts`

预期：FAIL，缺少 save 模块。

- [ ] **Step 3: 定义 v5 schema 和端口（2–5 分钟）**

创建 `app/assets/scripts/domain/save/save-v5.ts`：

```ts
export interface ChildProfile {
  id: string;
  name: string;
  textbookId: string;
  grade: string;
  createdAt: number;
}

export interface SaveV5 {
  version: 5;
  activeChildId: string | null;
  children: Record<string, ChildProfile>;
  learning: Record<string, {
    stabilityDays: number;
    difficulty: number;
    dueAt: number;
    firstCorrect: number;
    corrected: number;
    skipped: number;
    deviceFailures: number;
    incorrect: number;
  }>;
  progression: {
    totalXp: number;
    alloy: number;
    starCrystals: number;
    weaponId: string;
    shipSkinId: string;
    petIds: string[];
  };
  settings: {
    soundEnabled: boolean;
    reduceMotion: boolean;
  };
  createdAt: number;
  updatedAt: number;
}
```

创建 `app/assets/scripts/core/save-repository.ts`：

```ts
import type { SaveV5 } from "../domain/save/save-v5";

export interface SaveRepository {
  load(): Promise<SaveV5 | null>;
  commit(save: SaveV5): Promise<void>;
}
```

创建 `app/assets/scripts/domain/save/create-default-save.ts`：

```ts
import type { SaveV5 } from "./save-v5";

export function createDefaultSave(now: number): SaveV5 {
  return {
    version: 5,
    activeChildId: null,
    children: {},
    learning: {},
    progression: {
      totalXp: 0,
      alloy: 0,
      starCrystals: 0,
      weaponId: "pulse",
      shipSkinId: "classic",
      petIds: []
    },
    settings: { soundEnabled: true, reduceMotion: false },
    createdAt: now,
    updatedAt: now
  };
}
```

- [ ] **Step 4: 实现内存仓库（2–5 分钟）**

创建 `app/assets/scripts/infrastructure/memory/memory-save-repository.ts`：

```ts
import type { SaveRepository } from "../../core/save-repository";
import type { SaveV5 } from "../../domain/save/save-v5";

export class MemorySaveRepository implements SaveRepository {
  private main: string | null = null;
  private backup: string | null = null;

  async load(): Promise<SaveV5 | null> {
    for (const raw of [this.main, this.backup]) {
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw) as SaveV5;
        if (parsed.version === 5) return structuredClone(parsed);
      } catch {
        continue;
      }
    }
    return null;
  }

  async commit(save: SaveV5): Promise<void> {
    if (save.version !== 5) throw new Error("Unsupported save version");
    this.backup = this.main;
    this.main = JSON.stringify(save);
  }

  corruptMainForTest(): void {
    this.main = "{corrupt";
  }
}
```

- [ ] **Step 5: 实现 Cocos localStorage 主档/备份（2–5 分钟）**

创建 `app/assets/scripts/infrastructure/cocos/cocos-save-repository.ts`：

```ts
import { sys } from "cc";
import type { SaveRepository } from "../../core/save-repository";
import type { SaveV5 } from "../../domain/save/save-v5";

const MAIN_KEY = "language_astronauts_save_v5";
const BACKUP_KEY = "language_astronauts_save_v5_backup";
const TEMP_KEY = "language_astronauts_save_v5_temp";

function parse(raw: string | null): SaveV5 | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as SaveV5;
    return value.version === 5 ? value : null;
  } catch {
    return null;
  }
}

export class CocosSaveRepository implements SaveRepository {
  async load(): Promise<SaveV5 | null> {
    return parse(sys.localStorage.getItem(MAIN_KEY)) ?? parse(sys.localStorage.getItem(BACKUP_KEY));
  }

  async commit(save: SaveV5): Promise<void> {
    if (save.version !== 5) throw new Error("Unsupported save version");
    const next = JSON.stringify(save);
    sys.localStorage.setItem(TEMP_KEY, next);
    if (!parse(sys.localStorage.getItem(TEMP_KEY))) throw new Error("Temporary save validation failed");
    const current = sys.localStorage.getItem(MAIN_KEY);
    if (current) sys.localStorage.setItem(BACKUP_KEY, current);
    sys.localStorage.setItem(MAIN_KEY, next);
    sys.localStorage.removeItem(TEMP_KEY);
  }
}
```

- [ ] **Step 6: 运行验证（2–5 分钟）**

运行：`cd app && npm run typecheck:test && npm test -- --run tests/save/save-repository.test.ts`

预期：测试 TypeScript 不编译 `infrastructure/cocos/`；typecheck 成功；Vitest 显示 `2 passed`。随后在 Cocos 编辑器打开工程，控制台不出现 `cocos-save-repository.ts` 编译错误。

- [ ] **Step 7: Commit（2–5 分钟）**

```bash
git add app/assets/scripts/core/save-repository.ts app/assets/scripts/domain/save app/assets/scripts/infrastructure/memory/memory-save-repository.ts app/assets/scripts/infrastructure/cocos/cocos-save-repository.ts app/tests/save/save-repository.test.ts
git commit -m "feat: add versioned save repository"
```

### Task 5: 创建孩子档案用例并验证重启恢复

**Files:**
- Create: `app/assets/scripts/domain/profile/profile-service.ts`
- Test: `app/tests/profile/profile-service.test.ts`

**Interfaces:**
- Consumes: `SaveRepository`、`Clock`、`RandomSource`、`SaveV5`。
- Produces: `ProfileService.start()`、`createChild(input)`、`selectChild(childId)`、`currentSave()`。

- [ ] **Step 1: 写创建、选择和恢复测试（2–5 分钟）**

创建 `app/tests/profile/profile-service.test.ts`：

```ts
import { describe, expect, it } from "vitest";
import { ProfileService } from "../../assets/scripts/domain/profile/profile-service";
import { FakeClock } from "../../assets/scripts/infrastructure/memory/fake-clock";
import { MemorySaveRepository } from "../../assets/scripts/infrastructure/memory/memory-save-repository";
import { SequenceRandomSource } from "../../assets/scripts/infrastructure/memory/sequence-random-source";

describe("ProfileService", () => {
  it("creates and restores an active child", async () => {
    const repository = new MemorySaveRepository();
    const clock = new FakeClock(1_000);
    const first = new ProfileService(repository, clock, new SequenceRandomSource([0.25]));
    await first.start();
    const child = await first.createChild({ name: " 小星 ", textbookId: "hujiao-oxford-2024", grade: "3A" });

    const restarted = new ProfileService(repository, clock, new SequenceRandomSource([]));
    await restarted.start();
    expect(restarted.currentSave().activeChildId).toBe(child.id);
    expect(restarted.currentSave().children[child.id]).toMatchObject({
      name: "小星",
      textbookId: "hujiao-oxford-2024",
      grade: "3A"
    });
  });
});
```

- [ ] **Step 2: 运行测试确认失败（2–5 分钟）**

运行：`cd app && npm test -- --run tests/profile/profile-service.test.ts`

预期：FAIL，缺少 `profile-service`。

- [ ] **Step 3: 实现档案用例（2–5 分钟）**

创建 `app/assets/scripts/domain/profile/profile-service.ts`：

```ts
import type { Clock } from "../../core/clock";
import type { RandomSource } from "../../core/random-source";
import type { SaveRepository } from "../../core/save-repository";
import { createDefaultSave } from "../save/create-default-save";
import type { ChildProfile, SaveV5 } from "../save/save-v5";

export interface CreateChildInput {
  name: string;
  textbookId: string;
  grade: string;
}

export class ProfileService {
  private save: SaveV5 | null = null;

  constructor(
    private readonly repository: SaveRepository,
    private readonly clock: Clock,
    private readonly random: RandomSource
  ) {}

  async start(): Promise<void> {
    this.save = (await this.repository.load()) ?? createDefaultSave(this.clock.now());
  }

  currentSave(): SaveV5 {
    if (!this.save) throw new Error("ProfileService has not started");
    return this.save;
  }

  async createChild(input: CreateChildInput): Promise<ChildProfile> {
    const save = this.currentSave();
    const name = input.name.trim();
    if (!name) throw new Error("Child name is required");
    if (!input.textbookId) throw new Error("Textbook is required");
    if (!/^[1-6][AB]$/.test(input.grade)) throw new Error("Grade must match 1A through 6B");
    const now = this.clock.now();
    const id = `child_${now.toString(36)}_${Math.floor(this.random.next() * 1_000_000).toString(36)}`;
    const child: ChildProfile = { id, name, textbookId: input.textbookId, grade: input.grade, createdAt: now };
    save.children[id] = child;
    save.activeChildId = id;
    save.updatedAt = now;
    await this.repository.commit(save);
    return child;
  }

  async selectChild(childId: string): Promise<void> {
    const save = this.currentSave();
    if (!save.children[childId]) throw new Error(`Unknown child: ${childId}`);
    save.activeChildId = childId;
    save.updatedAt = this.clock.now();
    await this.repository.commit(save);
  }
}
```

- [ ] **Step 4: 运行验证（2–5 分钟）**

运行：`cd app && npm run typecheck:test && npm test -- --run tests/profile/profile-service.test.ts`

预期：typecheck 成功；Vitest 显示 `1 passed`。

- [ ] **Step 5: Commit（2–5 分钟）**

```bash
git add app/assets/scripts/domain/profile/profile-service.ts app/tests/profile/profile-service.test.ts
git commit -m "feat: add persistent child profiles"
```

### Task 6: 建立可模拟的战斗状态机骨架

**Files:**
- Create: `app/assets/scripts/domain/battle/battle-state.ts`
- Create: `app/assets/scripts/domain/battle/battle-machine.ts`
- Test: `app/tests/battle/battle-machine.test.ts`

**Interfaces:**
- Consumes: `Clock`、`EventBus<AppEvents>`。
- Produces: `BattleMachine.state`；`presentQuestion()`、`answer(outcome)`、`presentationCompleted()`、`finish()`；合法状态链与表现超时。

- [ ] **Step 1: 写合法转换和动画超时测试（2–5 分钟）**

创建 `app/tests/battle/battle-machine.test.ts`：

```ts
import { describe, expect, it } from "vitest";
import type { AppEvents } from "../../assets/scripts/core/app-events";
import { EventBus } from "../../assets/scripts/core/event-bus";
import { BattleMachine } from "../../assets/scripts/domain/battle/battle-machine";
import { FakeClock } from "../../assets/scripts/infrastructure/memory/fake-clock";

describe("BattleMachine", () => {
  it("simulates one command without Cocos", () => {
    const clock = new FakeClock();
    const machine = new BattleMachine("b1", clock, new EventBus<AppEvents>());
    machine.presentQuestion("q1", "3A-U1:vocab:happy");
    machine.answer("first_correct");
    expect(machine.state).toBe("Presentation");
    clock.advanceBy(2_000);
    expect(machine.state).toBe("PhaseCheck");
    machine.presentQuestion("q2", "3A-U1:vocab:sad");
    expect(machine.state).toBe("QuestionFocus");
  });

  it("rejects an illegal transition", () => {
    const machine = new BattleMachine("b1", new FakeClock(), new EventBus<AppEvents>());
    expect(() => machine.answer("incorrect")).toThrow("Cannot answer from Entering");
  });
});
```

- [ ] **Step 2: 运行测试确认失败（2–5 分钟）**

运行：`cd app && npm test -- --run tests/battle/battle-machine.test.ts`

预期：FAIL，缺少 battle machine。

- [ ] **Step 3: 定义状态并实现最小状态机（2–5 分钟）**

创建 `app/assets/scripts/domain/battle/battle-state.ts`：

```ts
export type BattleState =
  | "Entering"
  | "QuestionFocus"
  | "CommandResolve"
  | "Presentation"
  | "PhaseCheck"
  | "BossFinish"
  | "Settlement";
```

创建 `app/assets/scripts/domain/battle/battle-machine.ts`：

```ts
import type { AnswerOutcome, AppEvents } from "../../core/app-events";
import type { Clock, TimerHandle } from "../../core/clock";
import type { EventBus } from "../../core/event-bus";
import type { BattleState } from "./battle-state";

export class BattleMachine {
  state: BattleState = "Entering";
  private presentationTimer: TimerHandle | null = null;

  constructor(
    private readonly battleId: string,
    private readonly clock: Clock,
    private readonly events: EventBus<AppEvents>
  ) {}

  presentQuestion(questionId: string, contentId: string): void {
    if (this.state !== "Entering" && this.state !== "PhaseCheck") {
      throw new Error(`Cannot present question from ${this.state}`);
    }
    this.state = "QuestionFocus";
    this.events.emit("QuestionPresented", { battleId: this.battleId, questionId, contentId });
  }

  answer(outcome: AnswerOutcome): void {
    if (this.state !== "QuestionFocus") throw new Error(`Cannot answer from ${this.state}`);
    this.state = "CommandResolve";
    const quality = outcome === "first_correct" ? 1 : outcome === "corrected" ? 0.6 : outcome === "incorrect" ? 0 : 0.2;
    this.events.emit("CommandResolved", { battleId: this.battleId, quality, momentum: 0 });
    this.state = "Presentation";
    this.presentationTimer = this.clock.setTimeout(() => this.presentationCompleted(), 2_000);
  }

  presentationCompleted(): void {
    if (this.state !== "Presentation") return;
    if (this.presentationTimer) this.clock.clearTimeout(this.presentationTimer);
    this.presentationTimer = null;
    this.state = "PhaseCheck";
  }

  finish(): void {
    if (this.state !== "PhaseCheck") throw new Error(`Cannot finish from ${this.state}`);
    this.state = "BossFinish";
    this.state = "Settlement";
    this.events.emit("BattleFinished", { battleId: this.battleId, result: "victory" });
  }
}
```

- [ ] **Step 4: 运行验证（2–5 分钟）**

运行：`cd app && npm run typecheck:test && npm test -- --run tests/battle/battle-machine.test.ts`

预期：typecheck 成功；Vitest 显示 `2 passed`。

- [ ] **Step 5: Commit（2–5 分钟）**

```bash
git add app/assets/scripts/domain/battle app/tests/battle/battle-machine.test.ts
git commit -m "feat: add testable battle state machine"
```

### Task 7: 建立内容 schema 与启动校验

**Files:**
- Create: `app/assets/scripts/domain/content/content-types.ts`
- Create: `app/assets/scripts/domain/content/validate-content.ts`
- Create: `app/assets/content/catalog.json`
- Create: `tools/validate-content.ts`
- Test: `app/tests/content/validate-content.test.ts`

**Interfaces:**
- Consumes: JSON 内容包。
- Produces: `validateContentCatalog(input): ValidationIssue[]`；开发启动和命令行使用相同纯函数。

- [ ] **Step 1: 写无效引用测试（2–5 分钟）**

创建 `app/tests/content/validate-content.test.ts`：

```ts
import { describe, expect, it } from "vitest";
import { validateContentCatalog } from "../../assets/scripts/domain/content/validate-content";

describe("validateContentCatalog", () => {
  it("reports duplicate IDs, empty text and missing audio fallback", () => {
    const issues = validateContentCatalog({
      units: [{
        id: "3A-U1",
        title: "How do we feel?",
        items: [
          { contentId: "x", kind: "vocabulary", en: "happy", zh: "开心的", questionTypes: ["choice"], distractorTags: [], audioRef: null, ttsFallback: false },
          { contentId: "x", kind: "vocabulary", en: "", zh: "伤心的", questionTypes: ["choice"], distractorTags: [], audioRef: null, ttsFallback: true }
        ]
      }]
    });
    expect(issues.map((issue) => issue.code)).toEqual(["AUDIO_REQUIRED", "DUPLICATE_CONTENT_ID", "EN_REQUIRED"]);
  });
});
```

- [ ] **Step 2: 运行测试确认失败（2–5 分钟）**

运行：`cd app && npm test -- --run tests/content/validate-content.test.ts`

预期：FAIL，缺少 content validator。

- [ ] **Step 3: 定义内容类型并实现校验器（2–5 分钟）**

创建 `app/assets/scripts/domain/content/content-types.ts`：

```ts
export type ContentKind = "vocabulary" | "pattern" | "dialogue";
export type QuestionType = "choice" | "listening" | "spelling" | "speaking";

export interface ContentItem {
  contentId: string;
  kind: ContentKind;
  en: string;
  zh: string;
  questionTypes: QuestionType[];
  distractorTags: string[];
  audioRef: string | null;
  ttsFallback: boolean;
}

export interface ContentUnit {
  id: string;
  title: string;
  items: ContentItem[];
}

export interface ContentCatalog {
  units: ContentUnit[];
}

export interface ValidationIssue {
  path: string;
  code: string;
  message: string;
}
```

创建 `app/assets/scripts/domain/content/validate-content.ts`：

```ts
import type { ContentCatalog, ValidationIssue } from "./content-types";

export function validateContentCatalog(catalog: ContentCatalog): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const ids = new Set<string>();
  catalog.units.forEach((unit, unitIndex) => {
    unit.items.forEach((item, itemIndex) => {
      const path = `/units/${unitIndex}/items/${itemIndex}`;
      if (!item.audioRef && !item.ttsFallback) issues.push({ path, code: "AUDIO_REQUIRED", message: "audioRef or ttsFallback is required" });
      if (ids.has(item.contentId)) issues.push({ path: `${path}/contentId`, code: "DUPLICATE_CONTENT_ID", message: item.contentId });
      ids.add(item.contentId);
      if (!item.en.trim()) issues.push({ path: `${path}/en`, code: "EN_REQUIRED", message: "English text is required" });
      if (!item.zh.trim()) issues.push({ path: `${path}/zh`, code: "ZH_REQUIRED", message: "Chinese text is required" });
      if (item.questionTypes.length === 0) issues.push({ path: `${path}/questionTypes`, code: "QUESTION_TYPE_REQUIRED", message: "At least one question type is required" });
    });
  });
  return issues;
}
```

- [ ] **Step 4: 创建空目录 catalog 与命令行入口（2–5 分钟）**

创建 `app/assets/content/catalog.json`：

```json
{
  "units": []
}
```

创建 `tools/validate-content.ts`：

```ts
import { readFile } from "node:fs/promises";
import type { ContentCatalog } from "../app/assets/scripts/domain/content/content-types";
import { validateContentCatalog } from "../app/assets/scripts/domain/content/validate-content";

const file = process.argv[2] ?? "app/assets/content/catalog.json";
const catalog = JSON.parse(await readFile(file, "utf8")) as ContentCatalog;
const issues = validateContentCatalog(catalog);
for (const issue of issues) console.error(`${file}:${issue.path}:${issue.code}:${issue.message}`);
if (issues.length > 0) process.exitCode = 1;
```

- [ ] **Step 5: 运行验证（2–5 分钟）**

运行：`cd app && npm run typecheck:test && npm test -- --run tests/content/validate-content.test.ts`

预期：typecheck 成功；Vitest 显示 `1 passed`。

- [ ] **Step 6: Commit（2–5 分钟）**

```bash
git add app/assets/scripts/domain/content app/assets/content/catalog.json tools/validate-content.ts app/tests/content/validate-content.test.ts
git commit -m "feat: validate versioned content catalogs"
```

### Task 8: 锁定场景导航并接入六个空场景

**Files:**
- Create: `app/assets/scripts/core/scene-navigator.ts`
- Create: `app/assets/scripts/infrastructure/memory/memory-scene-navigator.ts`
- Create: `app/assets/scripts/presentation/navigation/cocos-scene-navigator.ts`
- Create: `app/assets/scripts/presentation/bootstrap/app-root.ts`
- Create: `app/assets/scripts/presentation/scenes/boot-controller.ts`
- Create: `app/assets/scenes/Boot.scene`
- Create: `app/assets/scenes/Profile.scene`
- Create: `app/assets/scenes/Base.scene`
- Create: `app/assets/scenes/StarMap.scene`
- Create: `app/assets/scenes/Battle.scene`
- Create: `app/assets/scenes/Report.scene`
- Modify: `app/settings/v2/packages/project.json`
- Test: `app/tests/navigation/scene-navigator.test.ts`

**Interfaces:**
- Consumes: `ProfileService`、`CocosSaveRepository`、`SystemClock`、`MathRandomSource`。
- Produces: `SceneNavigator.go<K extends SceneName>(scene, params)`；六场景可导航；Boot 按存档状态进入 Profile 或 Base。

- [ ] **Step 1: 写强类型导航记录测试（2–5 分钟）**

创建 `app/tests/navigation/scene-navigator.test.ts`：

```ts
import { describe, expect, it } from "vitest";
import { MemorySceneNavigator } from "../../assets/scripts/infrastructure/memory/memory-scene-navigator";

describe("SceneNavigator", () => {
  it("records typed scene parameters", async () => {
    const navigator = new MemorySceneNavigator();
    await navigator.go("Battle", { unitId: "3A-U1", mode: "campaign" });
    expect(navigator.current).toEqual({
      scene: "Battle",
      params: { unitId: "3A-U1", mode: "campaign" }
    });
  });
});
```

- [ ] **Step 2: 运行测试确认失败（2–5 分钟）**

运行：`cd app && npm test -- --run tests/navigation/scene-navigator.test.ts`

预期：FAIL，缺少 scene navigator。

- [ ] **Step 3: 定义导航端口与内存实现（2–5 分钟）**

创建 `app/assets/scripts/core/scene-navigator.ts`：

```ts
export interface SceneParams {
  Boot: undefined;
  Profile: { reason: "first_run" | "switch_child" };
  Base: undefined;
  StarMap: undefined;
  Battle: { unitId: string; mode: "campaign" | "review" };
  Report: { childId: string };
}

export type SceneName = keyof SceneParams;

export interface SceneNavigator {
  go<K extends SceneName>(scene: K, params: SceneParams[K]): Promise<void>;
}
```

创建 `app/assets/scripts/infrastructure/memory/memory-scene-navigator.ts`：

```ts
import type { SceneName, SceneNavigator, SceneParams } from "../../core/scene-navigator";

export class MemorySceneNavigator implements SceneNavigator {
  current: { scene: SceneName; params: SceneParams[SceneName] } | null = null;

  async go<K extends SceneName>(scene: K, params: SceneParams[K]): Promise<void> {
    this.current = { scene, params };
  }
}
```

- [ ] **Step 4: 实现 Cocos 导航与组合根（2–5 分钟）**

创建 `app/assets/scripts/presentation/navigation/cocos-scene-navigator.ts`：

```ts
import { director } from "cc";
import type { SceneName, SceneNavigator, SceneParams } from "../../core/scene-navigator";

export class CocosSceneNavigator implements SceneNavigator {
  private pending: { scene: SceneName; params: SceneParams[SceneName] } | null = null;

  async go<K extends SceneName>(scene: K, params: SceneParams[K]): Promise<void> {
    this.pending = { scene, params };
    await new Promise<void>((resolve, reject) => {
      director.loadScene(scene, (error) => error ? reject(error) : resolve());
    });
  }

  consume<K extends SceneName>(scene: K): SceneParams[K] | undefined {
    if (!this.pending || this.pending.scene !== scene) return undefined;
    const params = this.pending.params as SceneParams[K];
    this.pending = null;
    return params;
  }
}
```

创建 `app/assets/scripts/presentation/bootstrap/app-root.ts`：

```ts
import { ProfileService } from "../../domain/profile/profile-service";
import { CocosSaveRepository } from "../../infrastructure/cocos/cocos-save-repository";
import { MathRandomSource } from "../../infrastructure/system/math-random-source";
import { SystemClock } from "../../infrastructure/system/system-clock";
import { CocosSceneNavigator } from "../navigation/cocos-scene-navigator";

export const appRoot = {
  clock: new SystemClock(),
  random: new MathRandomSource(),
  saves: new CocosSaveRepository(),
  navigator: new CocosSceneNavigator(),
  profiles: null as ProfileService | null
};

appRoot.profiles = new ProfileService(appRoot.saves, appRoot.clock, appRoot.random);
```

创建 `app/assets/scripts/presentation/scenes/boot-controller.ts`：

```ts
import { _decorator, Component } from "cc";
import { appRoot } from "../bootstrap/app-root";

const { ccclass } = _decorator;

@ccclass("BootController")
export class BootController extends Component {
  async start(): Promise<void> {
    await appRoot.profiles!.start();
    const save = appRoot.profiles!.currentSave();
    if (save.activeChildId) await appRoot.navigator.go("Base", undefined);
    else await appRoot.navigator.go("Profile", { reason: "first_run" });
  }
}
```

- [ ] **Step 5: 创建六场景和构建列表（2–5 分钟）**

在 Cocos 编辑器中创建 `assets/scenes/Boot.scene`、`Profile.scene`、`Base.scene`、`StarMap.scene`、`Battle.scene`、`Report.scene`。每个场景根节点名与场景名一致，并各含 `Canvas`、`Camera`、一个显示场景名的 Label；Boot 根节点挂 `BootController`。在 Project Settings → Project Data → Start Scene 选择 Boot，在 Build 面板把六场景全部加入并保持上述顺序。

- [ ] **Step 6: 验证自动测试和编辑器导航（2–5 分钟）**

运行：`cd app && npm run typecheck:test && npm test -- --run`

预期：全部测试 PASS。随后在 Cocos 预览 Boot：无存档进入 Profile；创建孩子并重启预览后进入 Base；从临时按钮依次进入 StarMap、Battle、Report 再回 Base，控制台无异常且 `ProfileService.currentSave().activeChildId` 不变。

- [ ] **Step 7: Commit（2–5 分钟）**

```bash
git add app/assets/scripts/core/scene-navigator.ts app/assets/scripts/infrastructure/memory/memory-scene-navigator.ts app/assets/scripts/presentation app/assets/scenes app/settings app/tests/navigation/scene-navigator.test.ts
git commit -m "feat: wire persistent six-scene navigation"
```

## P1 Exit Gate

- `cd app && npm run typecheck:test && npm test -- --run` 全部通过。
- `app/assets/scripts/domain/` 搜索 `from "cc"` 返回零结果。
- EventBus、Clock、RandomSource、SaveRepository、SceneNavigator 的签名与本计划完全一致。
- 无正式美术时，纯 TypeScript 状态机可模拟至少一个完整“出题→作答→表现超时→阶段检查”循环。
- 首次启动可创建孩子并选择教材/年级；重启后恢复同一孩子。
- Boot/Profile/Base/StarMap/Battle/Report 六场景可切换，业务状态不依附场景节点。
- Cocos 编辑器和 Vitest 均无错误后，才允许执行 P2。
