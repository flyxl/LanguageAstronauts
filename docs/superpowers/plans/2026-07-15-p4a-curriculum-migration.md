# P4A 教材内容迁移 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将两套教材 1A–6B 的旧 JavaScript 常量确定性转换为按教材/年级/学期/单元分包的离线 JSON、稳定 `contentId` 与可审计音频清单，并通过全量自动校验和规定的人工抽样。

**Architecture:** `tools/` 中的只读转换器把 `js/data.js` 与 `js/data-kouyu.js` 解析为规范化源数据，再按固定 ID 规则写入 `app/assets/config/curriculum/`；运行时 `content/` 只消费经 JSON Schema 验证的清单和单元包。音频以 `contentId` 为唯一关联键，缺失资源必须显式标记 `tts-fallback`，生成目录禁止手工编辑。

**Tech Stack:** Cocos Creator 3.8.8、TypeScript、Node.js 20、Vitest、JSON Schema Draft 2020-12、Ajv 8、WAV/MP3 离线资源。

## Global Constraints

- 目标平台是 iOS/Android 原生独立 App，不是微信小游戏。
- 首发完全离线，不接账号、后端、广告、内购、第三方分析或在线活动。
- 全局横屏；答题使用全屏专注布局，答题与战斗演出不得重叠。
- 不使用 Spine 或其他付费骨骼编辑工具。
- 学习真值、游戏规则和表现层必须隔离；武器、宠物和等级不能修改答案或复习判定。
- 目标用户为小学 1–6 年级，1–3 与 4–6 年级采用不同交互复杂度。
- 每个阶段必须先写失败测试，再实现最小功能，再运行验证。
- 内容目录统一为 `app/assets/config/curriculum/`，教学音频目录统一为 `app/assets/audio/learning/`，内容领域代码统一为 `app/assets/scripts/domain/content/`，测试统一为 `app/tests/`，转换工具统一为 `tools/`。
- 两套教材 ID 固定为 `hujiao-oxford-2024` 与 `hujiao-kouyu-2025`；年级学期固定为 `1A`–`6B`。
- `contentId` 一经发布不可因文案、排序、翻译或音频变更而变化。
- 生成文件不可手工修改；唯一输入真值为旧数据文件和工具内显式修订表。
- 核心单词和句型使用预生成离线音频；每个单元人工试听不少于 10% 且不少于 5 条。
- 每本教材每学期抽取不少于 2 个单元；被抽单元校对全部标题、全部对话和不少于 20% 的词汇，发现结构性错误后扩展为该学期全量校对。
- 共享接口由前序计划提供：`Clock`、`RandomSource`、`SaveRepository`、`SaveDataV5`、`ContentItem`、`QuestionResult`、强类型 `EventBus`；本计划不得复制或弱化这些定义。
- 设计真值：`docs/superpowers/specs/2026-07-15-language-astronauts-cocos-redesign-design.md`。

---

## 文件结构与稳定标识规则

生成树必须严格为：

```text
app/assets/config/curriculum/
  curriculum.schema.json
  catalog.json
  hujiao-oxford-2024/{1..6}/{A|B}/unit-{01..12}.json
  hujiao-kouyu-2025/{1..6}/{A|B}/unit-{01..08}.json
  audio-manifest.json
app/assets/audio/learning/<contentId>.mp3
```

`contentId` 只由不可变来源坐标组成：

```text
la.<textbookId>.<gradeNumber>.<semesterLower>.<unitNumber2>.<kind>.<ordinal3>
```

示例：`la.hujiao-oxford-2024.3.a.01.vocab.001`、`la.hujiao-kouyu-2025.1.b.06.dialogue.003`。`kind` 仅允许 `vocab | pattern | dialogue`；旧 `vocab` 按数组序号映射为 `vocab`，旧 `dialogue` 按数组序号映射为 `dialogue`。不使用英文文本哈希，因为修正拼写会破坏存档关联；转换器必须用 `tools/curriculum-id-lock.json` 检测已发布坐标的重排或删除。

### Task 1: 固化内容领域类型与 ID 生成器

**Files:**
- Create: `app/assets/scripts/domain/content/ContentTypes.ts`
- Create: `app/assets/scripts/domain/content/ContentId.ts`
- Create: `app/tests/content/ContentId.test.ts`

**Interfaces:**
- Consumes: 共享 `ContentItem`；若前序定义字段更多，保留其字段并使下列字段成为必填子集。
- Produces: `ContentKind`、`CurriculumUnit`、`CurriculumCatalog`、`ContentIdParts`、`createContentId(parts: ContentIdParts): string`、`parseContentId(id: string): ContentIdParts`。

- [ ] **Step 1: 写失败测试，锁定格式、补零和非法坐标**

```ts
import { describe, expect, it } from 'vitest';
import { createContentId, parseContentId } from '../../assets/scripts/domain/content/ContentId';

describe('ContentId', () => {
  it('creates and parses an immutable source-coordinate id', () => {
    const id = createContentId({
      textbookId: 'hujiao-oxford-2024', grade: 3, semester: 'A',
      unit: 1, kind: 'vocab', ordinal: 1,
    });
    expect(id).toBe('la.hujiao-oxford-2024.3.a.01.vocab.001');
    expect(parseContentId(id)).toEqual({
      textbookId: 'hujiao-oxford-2024', grade: 3, semester: 'A',
      unit: 1, kind: 'vocab', ordinal: 1,
    });
  });

  it.each([{ grade: 0 }, { unit: 13 }, { ordinal: 0 }])('rejects %o', patch => {
    expect(() => createContentId({
      textbookId: 'hujiao-oxford-2024', grade: 3, semester: 'A',
      unit: 1, kind: 'vocab', ordinal: 1, ...patch,
    })).toThrow(/invalid content coordinate/);
  });
});
```

- [ ] **Step 2: 运行单测并确认失败**

Run: `npm --prefix app test -- --run tests/content/ContentId.test.ts`

Expected: FAIL，包含 `Cannot find module '../../assets/scripts/domain/content/ContentId'`。

- [ ] **Step 3: 实现完整类型和 ID 编解码**

```ts
// app/assets/scripts/domain/content/ContentTypes.ts
export type TextbookId = 'hujiao-oxford-2024' | 'hujiao-kouyu-2025';
export type Semester = 'A' | 'B';
export type ContentKind = 'vocab' | 'pattern' | 'dialogue';
export type QuestionType = 'choice' | 'listening' | 'reading' | 'spelling' | 'speaking';

export interface ContentItem {
  contentId: string;
  kind: ContentKind;
  english: string;
  chinese: string;
  speaker?: string;
  answer?: string;
  audioRef: string;
  questionTypes: QuestionType[];
  distractorTags: string[];
}

export interface CurriculumUnit {
  schemaVersion: 1;
  textbookId: TextbookId;
  grade: number;
  semester: Semester;
  unit: number;
  legacyUnitId: string;
  title: string;
  theme: string;
  npc: string;
  items: ContentItem[];
}

export interface CurriculumCatalog {
  schemaVersion: 1;
  generatedAt: string;
  textbooks: Array<{
    textbookId: TextbookId;
    name: string;
    grades: Array<{ grade: number; semesters: Semester[] }>;
  }>;
  units: Array<{
    textbookId: TextbookId; grade: number; semester: Semester;
    unit: number; path: string; itemCount: number;
  }>;
}
```

```ts
// app/assets/scripts/domain/content/ContentId.ts
import type { ContentKind, Semester, TextbookId } from './ContentTypes';

export interface ContentIdParts {
  textbookId: TextbookId;
  grade: number;
  semester: Semester;
  unit: number;
  kind: ContentKind;
  ordinal: number;
}

const RE = /^la\.(hujiao-(?:oxford-2024|kouyu-2025))\.([1-6])\.([ab])\.(0[1-9]|1[0-2])\.(vocab|pattern|dialogue)\.(\d{3})$/;

export function createContentId(p: ContentIdParts): string {
  if (p.grade < 1 || p.grade > 6 || p.unit < 1 || p.unit > 12 ||
      p.ordinal < 1 || p.ordinal > 999 || !['A', 'B'].includes(p.semester)) {
    throw new Error('invalid content coordinate');
  }
  return `la.${p.textbookId}.${p.grade}.${p.semester.toLowerCase()}.${String(p.unit).padStart(2, '0')}.${p.kind}.${String(p.ordinal).padStart(3, '0')}`;
}

export function parseContentId(id: string): ContentIdParts {
  const m = RE.exec(id);
  if (!m) throw new Error(`invalid contentId: ${id}`);
  return {
    textbookId: m[1] as TextbookId, grade: Number(m[2]),
    semester: m[3].toUpperCase() as Semester, unit: Number(m[4]),
    kind: m[5] as ContentKind, ordinal: Number(m[6]),
  };
}
```

- [ ] **Step 4: 运行测试并确认通过**

Run: `npm --prefix app test -- --run tests/content/ContentId.test.ts`

Expected: PASS，显示 `2 passed`。

- [ ] **Step 5: 提交本任务**

```bash
git add app/assets/scripts/domain/content/ContentTypes.ts app/assets/scripts/domain/content/ContentId.ts app/tests/content/ContentId.test.ts
git commit -m "feat(content): define stable curriculum identifiers"
```

### Task 2: 定义单元 JSON Schema 与目录 Schema

**Files:**
- Create: `app/assets/config/curriculum/curriculum.schema.json`
- Create: `app/assets/config/curriculum/catalog.schema.json`
- Create: `app/tests/content/SchemaContract.test.ts`
- Create: `app/tests/fixtures/content/valid-unit.json`

**Interfaces:**
- Consumes: Task 1 的 `CurriculumUnit` 与 `CurriculumCatalog`。
- Produces: Draft 2020-12 schema `$id` 分别为 `la://schema/curriculum-unit-v1`、`la://schema/curriculum-catalog-v1`。

- [ ] **Step 1: 写失败测试，验证合法样例并拒绝空文本、未知题型和额外字段**

```ts
import Ajv2020 from 'ajv/dist/2020';
import { describe, expect, it } from 'vitest';
import schema from '../../assets/config/curriculum/curriculum.schema.json';
import valid from '../fixtures/content/valid-unit.json';

const validate = new Ajv2020({ allErrors: true, strict: true }).compile(schema);
describe('curriculum schema', () => {
  it('accepts the canonical unit', () => expect(validate(valid)).toBe(true));
  it.each([
    { ...valid, title: '' },
    { ...valid, items: [{ ...valid.items[0], questionTypes: ['unknown'] }] },
    { ...valid, unexpected: true },
  ])('rejects invalid unit %#', candidate => {
    expect(validate(candidate)).toBe(false);
  });
});
```

- [ ] **Step 2: 运行测试并确认 schema 缺失**

Run: `npm --prefix app test -- --run tests/content/SchemaContract.test.ts`

Expected: FAIL，包含 `Cannot find module '../../assets/config/curriculum/curriculum.schema.json'`。

- [ ] **Step 3: 写完整单元 schema 和固定样例**

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "la://schema/curriculum-unit-v1",
  "type": "object",
  "additionalProperties": false,
  "required": ["schemaVersion","textbookId","grade","semester","unit","legacyUnitId","title","theme","npc","items"],
  "properties": {
    "schemaVersion": { "const": 1 },
    "textbookId": { "enum": ["hujiao-oxford-2024","hujiao-kouyu-2025"] },
    "grade": { "type": "integer", "minimum": 1, "maximum": 6 },
    "semester": { "enum": ["A","B"] },
    "unit": { "type": "integer", "minimum": 1, "maximum": 12 },
    "legacyUnitId": { "type": "string", "minLength": 4 },
    "title": { "type": "string", "minLength": 1 },
    "theme": { "type": "string", "minLength": 1 },
    "npc": { "type": "string", "minLength": 1 },
    "items": {
      "type": "array", "minItems": 1,
      "items": {
        "type": "object", "additionalProperties": false,
        "required": ["contentId","kind","english","chinese","audioRef","questionTypes","distractorTags"],
        "properties": {
          "contentId": { "type": "string", "pattern": "^la\\.hujiao-(oxford-2024|kouyu-2025)\\.[1-6]\\.[ab]\\.(0[1-9]|1[0-2])\\.(vocab|pattern|dialogue)\\.\\d{3}$" },
          "kind": { "enum": ["vocab","pattern","dialogue"] },
          "english": { "type": "string", "minLength": 1 },
          "chinese": { "type": "string", "minLength": 1 },
          "speaker": { "type": "string", "minLength": 1 },
          "answer": { "type": "string", "minLength": 1 },
          "audioRef": { "type": "string", "minLength": 1 },
          "questionTypes": { "type": "array", "minItems": 1, "uniqueItems": true, "items": { "enum": ["choice","listening","reading","spelling","speaking"] } },
          "distractorTags": { "type": "array", "minItems": 1, "uniqueItems": true, "items": { "type": "string", "minLength": 1 } }
        }
      }
    }
  }
}
```

```json
{
  "schemaVersion": 1,
  "textbookId": "hujiao-oxford-2024",
  "grade": 3,
  "semester": "A",
  "unit": 1,
  "legacyUnitId": "3A-U1",
  "title": "Unit 1 How do we feel?",
  "theme": "情绪星域",
  "npc": "Ms Wu",
  "items": [{
    "contentId": "la.hujiao-oxford-2024.3.a.01.vocab.001",
    "kind": "vocab",
    "english": "happy",
    "chinese": "开心的",
    "audioRef": "la.hujiao-oxford-2024.3.a.01.vocab.001",
    "questionTypes": ["choice","listening","reading","spelling","speaking"],
    "distractorTags": ["vocab","grade-3","emotion"]
  }]
}
```

同时创建 `catalog.schema.json`，要求 `schemaVersion: 1`、RFC 3339 `generatedAt`、两个唯一教材、24 个年级学期组合、每条 unit 包含 `path` 与正整数 `itemCount`，并设置 `additionalProperties: false`。

- [ ] **Step 4: 运行 schema 合约测试**

Run: `npm --prefix app test -- --run tests/content/SchemaContract.test.ts`

Expected: PASS，显示 `4 passed`。

- [ ] **Step 5: 提交本任务**

```bash
git add app/assets/config/curriculum/curriculum.schema.json app/assets/config/curriculum/catalog.schema.json app/tests/content/SchemaContract.test.ts app/tests/fixtures/content/valid-unit.json
git commit -m "feat(content): add curriculum JSON schemas"
```

### Task 3: 构建确定性旧数据转换器

**Files:**
- Create: `tools/lib/load-legacy-course.ts`
- Create: `tools/lib/convert-curriculum.ts`
- Create: `tools/convert-curriculum.ts`
- Create: `tools/curriculum-id-lock.json`
- Create: `app/tests/content/CurriculumConverter.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `js/data.js` 的 `COURSE_DATA`、`js/data-kouyu.js` 的 `COURSE_DATA_KOUYU`、Task 1 的 ID 规则。
- Produces: `loadLegacyConstant(path: string, constantName: string): LegacyGrade[]`、`convertGrade(input: LegacyGrade, textbookId: TextbookId): CurriculumUnit[]`、CLI `npm run content:convert`。

- [ ] **Step 1: 写失败测试，覆盖 3A-U1、口语 ID、稳定输出与源文件只读**

```ts
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { convertAll } from '../../tools/lib/convert-curriculum';

describe('legacy curriculum conversion', () => {
  it('converts both textbooks deterministically without mutating sources', async () => {
    const before = readFileSync('../js/data-kouyu.js', 'utf8');
    const a = mkdtempSync(join(tmpdir(), 'la-a-'));
    const b = mkdtempSync(join(tmpdir(), 'la-b-'));
    const first = await convertAll({ repoRoot: '..', outputRoot: a, generatedAt: '2026-07-15T00:00:00.000Z' });
    const second = await convertAll({ repoRoot: '..', outputRoot: b, generatedAt: '2026-07-15T00:00:00.000Z' });
    expect(first.digest).toBe(second.digest);
    expect(first.units.find(u => u.legacyUnitId === '3A-U1')?.items[0].contentId)
      .toBe('la.hujiao-oxford-2024.3.a.01.vocab.001');
    expect(first.units.find(u => u.legacyUnitId === 'KY-1A-U1')?.items[0].contentId)
      .toBe('la.hujiao-kouyu-2025.1.a.01.vocab.001');
    expect(readFileSync('../js/data-kouyu.js', 'utf8')).toBe(before);
  });
});
```

- [ ] **Step 2: 运行转换器测试并确认失败**

Run: `npm --prefix app test -- --run tests/content/CurriculumConverter.test.ts`

Expected: FAIL，包含 `Cannot find module '../../tools/lib/convert-curriculum'`。

- [ ] **Step 3: 实现安全解析、转换和分包写出**

```ts
// tools/lib/load-legacy-course.ts
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

export interface LegacyGrade { id: string; name: string; units: LegacyUnit[] }
export interface LegacyUnit {
  id: string; name: string; theme?: string; npc?: string;
  vocab?: Array<{ en: string; zh: string }>;
  dialogue?: Array<{ speaker: string; prompt: string; zh: string; answer: string }>;
}

export async function loadLegacyConstant(path: string, constantName: string): Promise<LegacyGrade[]> {
  const source = await readFile(path, 'utf8');
  const context = vm.createContext(Object.create(null));
  new vm.Script(`${source}\n;globalThis.__result = ${constantName};`, { filename: path, timeout: 1_000 })
    .runInContext(context, { timeout: 1_000 });
  const value = context.__result;
  if (!Array.isArray(value)) throw new Error(`${constantName} is not an array`);
  return structuredClone(value);
}
```

```ts
// tools/lib/convert-curriculum.ts
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { CurriculumUnit, TextbookId } from '../../app/assets/scripts/domain/content/ContentTypes';
import { createContentId } from '../../app/assets/scripts/domain/content/ContentId';
import { loadLegacyConstant, type LegacyGrade } from './load-legacy-course';

export function convertGrade(input: LegacyGrade, textbookId: TextbookId): CurriculumUnit[] {
  const grade = Number(input.id[0]);
  const semester = input.id[1] as 'A' | 'B';
  return input.units.map((unit, unitIndex) => {
    const coordinate = { textbookId, grade, semester, unit: unitIndex + 1 };
    const vocab = (unit.vocab ?? []).map((v, index) => ({
      contentId: createContentId({ ...coordinate, kind: 'vocab', ordinal: index + 1 }),
      kind: 'vocab' as const, english: v.en.trim(), chinese: v.zh.trim(),
      audioRef: createContentId({ ...coordinate, kind: 'vocab', ordinal: index + 1 }),
      questionTypes: ['choice','listening','reading','spelling','speaking'] as const,
      distractorTags: ['vocab', `grade-${grade}`, unit.theme?.trim() || 'general'],
    }));
    const dialogue = (unit.dialogue ?? []).map((d, index) => ({
      contentId: createContentId({ ...coordinate, kind: 'dialogue', ordinal: index + 1 }),
      kind: 'dialogue' as const, english: d.prompt.trim(), chinese: d.zh.trim(),
      speaker: d.speaker.trim(), answer: d.answer.trim(),
      audioRef: createContentId({ ...coordinate, kind: 'dialogue', ordinal: index + 1 }),
      questionTypes: ['choice','listening','reading','speaking'] as const,
      distractorTags: ['dialogue', `grade-${grade}`, unit.theme?.trim() || 'general'],
    }));
    return {
      schemaVersion: 1, textbookId, grade, semester, unit: unitIndex + 1,
      legacyUnitId: unit.id, title: unit.name.trim(),
      theme: unit.theme?.trim() || '未分类星域', npc: unit.npc?.trim() || 'Ms Wu',
      items: [...vocab, ...dialogue],
    };
  });
}

export async function convertAll(o: { repoRoot: string; outputRoot: string; generatedAt: string }) {
  const specs = [
    ['js/data.js','COURSE_DATA','hujiao-oxford-2024'],
    ['js/data-kouyu.js','COURSE_DATA_KOUYU','hujiao-kouyu-2025'],
  ] as const;
  const units: CurriculumUnit[] = [];
  for (const [path, name, textbookId] of specs) {
    const grades = await loadLegacyConstant(join(o.repoRoot, path), name);
    units.push(...grades.flatMap(g => convertGrade(g, textbookId)));
  }
  units.sort((a, b) => a.textbookId.localeCompare(b.textbookId) ||
    a.grade - b.grade || a.semester.localeCompare(b.semester) || a.unit - b.unit);
  for (const unit of units) {
    const dir = join(o.outputRoot, unit.textbookId, String(unit.grade), unit.semester);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, `unit-${String(unit.unit).padStart(2, '0')}.json`),
      `${JSON.stringify(unit, null, 2)}\n`);
  }
  const canonical = JSON.stringify(units);
  return { units, digest: createHash('sha256').update(canonical).digest('hex') };
}
```

`tools/convert-curriculum.ts` 调用 `convertAll`，写 `catalog.json` 和 `curriculum-id-lock.json`；若已有 lock 中任意 `legacyUnitId + kind + ordinal` 的 `contentId` 改变或消失，退出码为 1。根 `package.json` 增加：

```json
{
  "scripts": {
    "content:convert": "tsx tools/convert-curriculum.ts",
    "content:check-generated": "tsx tools/convert-curriculum.ts --check"
  }
}
```

- [ ] **Step 4: 运行测试并生成全部分包**

Run: `npm --prefix app test -- --run tests/content/CurriculumConverter.test.ts && npm run content:convert`

Expected: 测试 PASS；CLI 输出 `Converted 2 textbooks, 24 semesters`、实际单元数与内容项数、`contentId collisions: 0`。

- [ ] **Step 5: 提交本任务**

```bash
git add tools/lib/load-legacy-course.ts tools/lib/convert-curriculum.ts tools/convert-curriculum.ts tools/curriculum-id-lock.json package.json app/tests/content/CurriculumConverter.test.ts app/assets/config/curriculum/catalog.json app/assets/config/curriculum/hujiao-oxford-2024 app/assets/config/curriculum/hujiao-kouyu-2025
git commit -m "feat(content): convert legacy curricula into unit bundles"
```

### Task 4: 生成音频 manifest 并验证离线覆盖

**Files:**
- Create: `app/assets/scripts/domain/content/AudioManifest.ts`
- Create: `tools/build-audio-manifest.ts`
- Create: `app/assets/config/curriculum/audio-manifest.json`
- Create: `app/tests/content/AudioManifest.test.ts`
- Create: `app/assets/audio/learning/.gitkeep`
- Modify: `package.json`

**Interfaces:**
- Consumes: 所有 `CurriculumUnit.items[].audioRef`、`app/assets/audio/learning/<contentId>.mp3`。
- Produces: `AudioManifestEntry`、`AudioManifest`、`resolveLearningAudio(contentId: string, manifest: AudioManifest): AudioResolution`、CLI `npm run content:audio-manifest`。

- [ ] **Step 1: 写失败测试，要求资源存在或明确 TTS 兜底**

```ts
import { describe, expect, it } from 'vitest';
import { resolveLearningAudio } from '../../assets/scripts/domain/content/AudioManifest';

describe('audio manifest', () => {
  const manifest = { schemaVersion: 1 as const, generatedAt: '2026-07-15T00:00:00.000Z', entries: [
    { contentId: 'a', status: 'verified' as const, path: 'audio/learning/a.mp3', sha256: 'f'.repeat(64), durationMs: 910 },
    { contentId: 'b', status: 'tts-fallback' as const, reason: 'recording-not-produced' },
  ] };
  it('resolves packaged audio', () =>
    expect(resolveLearningAudio('a', manifest)).toEqual({ kind: 'file', path: 'audio/learning/a.mp3' }));
  it('resolves explicit fallback and rejects absent entries', () => {
    expect(resolveLearningAudio('b', manifest)).toEqual({ kind: 'tts', reason: 'recording-not-produced' });
    expect(() => resolveLearningAudio('c', manifest)).toThrow('missing audio manifest entry: c');
  });
});
```

- [ ] **Step 2: 运行测试并确认实现缺失**

Run: `npm --prefix app test -- --run tests/content/AudioManifest.test.ts`

Expected: FAIL，包含 `Cannot find module '../../assets/scripts/domain/content/AudioManifest'`。

- [ ] **Step 3: 实现类型、解析器和 manifest 生成规则**

```ts
export type AudioManifestEntry =
  | { contentId: string; status: 'verified'; path: string; sha256: string; durationMs: number }
  | { contentId: string; status: 'tts-fallback'; reason: 'recording-not-produced' | 'license-rejected' | 'quality-rejected' };

export interface AudioManifest {
  schemaVersion: 1;
  generatedAt: string;
  entries: AudioManifestEntry[];
}

export type AudioResolution = { kind: 'file'; path: string } | { kind: 'tts'; reason: string };

export function resolveLearningAudio(contentId: string, manifest: AudioManifest): AudioResolution {
  const entry = manifest.entries.find(e => e.contentId === contentId);
  if (!entry) throw new Error(`missing audio manifest entry: ${contentId}`);
  return entry.status === 'verified'
    ? { kind: 'file', path: entry.path }
    : { kind: 'tts', reason: entry.reason };
}
```

`tools/build-audio-manifest.ts` 必须遍历 catalog 中全部 `audioRef`；存在 MP3 时计算 SHA-256 并用 `ffprobe -v error -show_entries format=duration -of csv=p=0` 读取时长，不存在时仅在 `tools/audio-fallback-allowlist.json` 有相同 `contentId` 和三种合法原因之一时写兜底，否则退出 1。按 `contentId` 排序输出。根脚本增加：

```json
{
  "scripts": {
    "content:audio-manifest": "tsx tools/build-audio-manifest.ts",
    "content:audio-check": "tsx tools/build-audio-manifest.ts --check"
  }
}
```

- [ ] **Step 4: 生成并验证音频清单**

Run: `npm --prefix app test -- --run tests/content/AudioManifest.test.ts && npm run content:audio-manifest && npm run content:audio-check`

Expected: 测试 PASS；CLI 输出 `Audio refs: <N>, verified: <V>, explicit TTS fallback: <F>, missing: 0`，且 `<V> + <F> = <N>`。

- [ ] **Step 5: 提交本任务**

```bash
git add app/assets/scripts/domain/content/AudioManifest.ts app/assets/config/curriculum/audio-manifest.json app/assets/audio/learning/.gitkeep app/tests/content/AudioManifest.test.ts tools/build-audio-manifest.ts tools/audio-fallback-allowlist.json package.json
git commit -m "feat(content): add audited learning audio manifest"
```

### Task 5: 实现全量内容校验器与运行时加载器

**Files:**
- Create: `app/assets/scripts/domain/content/ContentValidator.ts`
- Create: `app/assets/scripts/domain/content/ContentRepository.ts`
- Create: `tools/validate-curriculum.ts`
- Create: `app/tests/content/ContentValidator.test.ts`
- Create: `app/tests/content/ContentRepository.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `CurriculumCatalog`、所有单元 JSON、`AudioManifest`。
- Produces: `ContentIssue { severity: 'error'|'warning'; code: string; file: string; contentId?: string; message: string }`、`validateCurriculum(input: ValidationInput): ContentIssue[]`、`ContentRepository.loadUnit(ref: UnitRef): Promise<CurriculumUnit>`。

- [ ] **Step 1: 写失败测试，覆盖全部硬性校验**

```ts
import { describe, expect, it } from 'vitest';
import { validateCurriculum } from '../../assets/scripts/domain/content/ContentValidator';
import valid from '../fixtures/content/valid-unit.json';

describe('content validation', () => {
  it('reports duplicate ids, bad references, weak distractors and answer leakage', () => {
    const broken = structuredClone(valid);
    broken.items.push({ ...broken.items[0], chinese: '', distractorTags: ['happy'] });
    const issues = validateCurriculum({
      units: [broken, valid], catalogPaths: new Set(['wrong.json']),
      audioIds: new Set(), knownQuestionTypes: new Set(['choice','listening','reading','spelling','speaking']),
    });
    expect(new Set(issues.map(i => i.code))).toEqual(new Set([
      'DUPLICATE_CONTENT_ID','EMPTY_CHINESE','INVALID_UNIT_PATH',
      'MISSING_AUDIO_DECLARATION','INSUFFICIENT_DISTRACTORS','ANSWER_IN_DISTRACTORS',
    ]));
  });
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm --prefix app test -- --run tests/content/ContentValidator.test.ts tests/content/ContentRepository.test.ts`

Expected: FAIL，两个模块均未找到。

- [ ] **Step 3: 实现纯函数校验和按单元懒加载**

```ts
export interface ContentIssue {
  severity: 'error' | 'warning';
  code: string;
  file: string;
  contentId?: string;
  message: string;
}

export interface ValidationInput {
  units: CurriculumUnit[];
  catalogPaths: Set<string>;
  audioIds: Set<string>;
  knownQuestionTypes: Set<string>;
}

export function validateCurriculum(input: ValidationInput): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const ids = new Set<string>();
  for (const unit of input.units) {
    const file = `${unit.textbookId}/${unit.grade}/${unit.semester}/unit-${String(unit.unit).padStart(2,'0')}.json`;
    if (!input.catalogPaths.has(file)) issues.push({ severity:'error', code:'INVALID_UNIT_PATH', file, message:'catalog path is absent' });
    for (const item of unit.items) {
      if (ids.has(item.contentId)) issues.push({ severity:'error', code:'DUPLICATE_CONTENT_ID', file, contentId:item.contentId, message:'contentId must be globally unique' });
      ids.add(item.contentId);
      if (!item.english.trim()) issues.push({ severity:'error', code:'EMPTY_ENGLISH', file, contentId:item.contentId, message:'english must not be empty' });
      if (!item.chinese.trim()) issues.push({ severity:'error', code:'EMPTY_CHINESE', file, contentId:item.contentId, message:'chinese must not be empty' });
      if (!input.audioIds.has(item.audioRef)) issues.push({ severity:'error', code:'MISSING_AUDIO_DECLARATION', file, contentId:item.contentId, message:'audioRef is absent from manifest' });
      if (item.distractorTags.length < 2) issues.push({ severity:'error', code:'INSUFFICIENT_DISTRACTORS', file, contentId:item.contentId, message:'at least two distractor tags are required' });
      if (item.distractorTags.some(t => t.toLocaleLowerCase() === item.english.toLocaleLowerCase())) issues.push({ severity:'error', code:'ANSWER_IN_DISTRACTORS', file, contentId:item.contentId, message:'correct answer appears in distractor tags' });
      for (const type of item.questionTypes) if (!input.knownQuestionTypes.has(type)) issues.push({ severity:'error', code:'INVALID_QUESTION_TYPE', file, contentId:item.contentId, message:`unknown question type: ${type}` });
    }
  }
  return issues.sort((a,b) => a.file.localeCompare(b.file) || a.code.localeCompare(b.code));
}
```

`ContentRepository` 构造器精确签名：

```ts
export interface UnitRef { textbookId: TextbookId; grade: number; semester: Semester; unit: number }
export interface JsonAssetLoader { loadJson<T>(path: string): Promise<T> }
export class ContentRepository {
  constructor(private readonly loader: JsonAssetLoader, private readonly catalog: CurriculumCatalog) {}
  async loadUnit(ref: UnitRef): Promise<CurriculumUnit> {
    const entry = this.catalog.units.find(u => u.textbookId === ref.textbookId && u.grade === ref.grade && u.semester === ref.semester && u.unit === ref.unit);
    if (!entry) throw new Error(`unknown curriculum unit: ${JSON.stringify(ref)}`);
    return this.loader.loadJson<CurriculumUnit>(`config/curriculum/${entry.path}`);
  }
}
```

开发启动调用校验器后遇 error 直接阻断；发布构建对损坏单元写诊断并跳过，catalog 或 schema 损坏阻断进入主界面。

- [ ] **Step 4: 运行单测和全量校验**

Run: `npm --prefix app test -- --run tests/content/ContentValidator.test.ts tests/content/ContentRepository.test.ts && npm run content:validate`

Expected: 测试 PASS；CLI 输出 `Schema errors: 0`、`contentId collisions: 0`、`invalid question refs: 0`、`missing audio declarations: 0`、`curriculum validation passed`。

- [ ] **Step 5: 提交本任务**

```bash
git add app/assets/scripts/domain/content/ContentValidator.ts app/assets/scripts/domain/content/ContentRepository.ts app/tests/content/ContentValidator.test.ts app/tests/content/ContentRepository.test.ts tools/validate-curriculum.ts package.json
git commit -m "feat(content): validate and lazily load curriculum bundles"
```

### Task 6: 建立生成漂移、全量门禁与统计快照

**Files:**
- Create: `tools/curriculum-baseline.json`
- Create: `app/tests/content/FullCurriculum.test.ts`
- Create: `app/tests/content/GeneratedFiles.test.ts`
- Create: `docs/qa/curriculum-automated-validation.md`
- Modify: `package.json`

**Interfaces:**
- Consumes: Tasks 3–5 的转换、音频和校验 CLI。
- Produces: `npm run content:gate`；基线字段 `textbooks`、`semesters`、`unitsByTextbook`、`itemsByKind`、`sha256`。

- [ ] **Step 1: 写失败测试，要求全量分包、24 学期和无生成漂移**

```ts
import { describe, expect, it } from 'vitest';
import baseline from '../../tools/curriculum-baseline.json';
import { inspectGeneratedCurriculum } from '../../tools/lib/inspect-curriculum';

describe('full curriculum gate', () => {
  it('matches the reviewed baseline', async () => {
    const actual = await inspectGeneratedCurriculum('../app/assets/config/curriculum');
    expect(actual.textbooks).toBe(2);
    expect(actual.semesters).toBe(24);
    expect(actual.unitsByTextbook).toEqual(baseline.unitsByTextbook);
    expect(actual.itemsByKind).toEqual(baseline.itemsByKind);
    expect(actual.sha256).toBe(baseline.sha256);
  });
});
```

- [ ] **Step 2: 运行门禁并确认基线/检查器缺失**

Run: `npm --prefix app test -- --run tests/content/FullCurriculum.test.ts tests/content/GeneratedFiles.test.ts`

Expected: FAIL，包含 `curriculum-baseline.json` 或 `inspect-curriculum` 缺失。

- [ ] **Step 3: 实现统计检查器、记录审阅基线和组合命令**

`inspectGeneratedCurriculum(root: string)` 必须按相对路径排序后读取全部单元，返回精确类型：

```ts
export interface CurriculumBaseline {
  textbooks: number;
  semesters: number;
  unitsByTextbook: Record<'hujiao-oxford-2024' | 'hujiao-kouyu-2025', number>;
  itemsByKind: Record<'vocab' | 'pattern' | 'dialogue', number>;
  sha256: string;
}
```

`GeneratedFiles.test.ts` 在临时目录重新运行转换器并逐字节比较 catalog、单元包、ID lock 和音频 manifest。根脚本：

```json
{
  "scripts": {
    "content:gate": "npm run content:check-generated && npm run content:audio-check && npm run content:validate && npm --prefix app test -- --run tests/content"
  }
}
```

`docs/qa/curriculum-automated-validation.md` 逐项记录 schema、唯一 ID、非空中英文、题型引用、音频声明、干扰项、答案泄漏、教材/单元引用、生成漂移、基线计数的失败码与修复入口。

- [ ] **Step 4: 运行完整自动门禁**

Run: `npm run content:gate`

Expected: 退出码 0，最后输出 `curriculum validation passed` 与 `Test Files ... passed`；任何生成差异、缺音频声明或计数变化均退出码 1。

- [ ] **Step 5: 提交本任务**

```bash
git add tools/curriculum-baseline.json tools/lib/inspect-curriculum.ts app/tests/content/FullCurriculum.test.ts app/tests/content/GeneratedFiles.test.ts docs/qa/curriculum-automated-validation.md package.json
git commit -m "test(content): gate complete curriculum migration"
```

### Task 7: 执行并留档规定的人工抽样

**Files:**
- Create: `docs/qa/curriculum-sampling-2026-07-15.md`
- Create: `docs/qa/audio-listening-2026-07-15.md`
- Create: `tools/select-curriculum-samples.ts`
- Create: `app/tests/content/SamplingPlan.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `CurriculumCatalog`、所有单元包、`AudioManifest`、固定种子 `20260715`。
- Produces: `selectSamples(catalog: CurriculumCatalog, seed: number): SamplingSelection`；`SamplingSelection` 对每个教材的每个学期恰好选择 2 个不同单元。

- [ ] **Step 1: 写失败测试，锁定 48 组教材学期抽样与音频最低数量**

```ts
import { describe, expect, it } from 'vitest';
import catalog from '../../assets/config/curriculum/catalog.json';
import { selectSamples } from '../../tools/select-curriculum-samples';

describe('manual sampling plan', () => {
  it('selects two units per textbook-semester deterministically', () => {
    const result = selectSamples(catalog, 20260715);
    expect(result.groups).toHaveLength(24);
    for (const group of result.groups) {
      expect(new Set(group.unitNumbers).size).toBe(2);
      expect(group.unitNumbers).toHaveLength(2);
    }
    expect(selectSamples(catalog, 20260715)).toEqual(result);
  });
});
```

- [ ] **Step 2: 运行测试并确认抽样器缺失**

Run: `npm --prefix app test -- --run tests/content/SamplingPlan.test.ts`

Expected: FAIL，包含 `Cannot find module '../../tools/select-curriculum-samples'`。

- [ ] **Step 3: 实现固定种子抽样并生成不可留空的检查表**

```ts
export interface SamplingGroup {
  textbookId: string;
  grade: number;
  semester: 'A' | 'B';
  unitNumbers: [number, number];
}
export interface SamplingSelection { seed: number; groups: SamplingGroup[] }

export function selectSamples(catalog: CurriculumCatalog, seed: number): SamplingSelection {
  let state = seed >>> 0;
  const next = () => ((state = (1664525 * state + 1013904223) >>> 0) / 0x100000000);
  const keys = [...new Set(catalog.units.map(u => `${u.textbookId}|${u.grade}|${u.semester}`))].sort();
  return {
    seed,
    groups: keys.map(key => {
      const [textbookId, grade, semester] = key.split('|');
      const candidates = catalog.units.filter(u => `${u.textbookId}|${u.grade}|${u.semester}` === key).map(u => u.unit).sort((a,b) => a-b);
      const first = candidates.splice(Math.floor(next() * candidates.length), 1)[0];
      const second = candidates.splice(Math.floor(next() * candidates.length), 1)[0];
      return { textbookId, grade: Number(grade), semester: semester as 'A'|'B', unitNumbers: [first, second].sort((a,b) => a-b) as [number,number] };
    }),
  };
}
```

生成的 `curriculum-sampling-2026-07-15.md` 每个抽中单元必须列出：标题逐字核对结果、全部对话逐条结果、按 `ceil(vocabCount × 0.2)` 选择的词汇及结果、检查人、日期、证据页码/来源、结构性错误 `是/否`；选择“是”时同一学期所有单元自动加入扩展表，未完成项使 `content:manual-gate` 失败。

`audio-listening-2026-07-15.md` 每单元选择 `max(5, ceil(audioCount × 0.1))` 条，记录音量、首尾截断、发音三项；任一异常必须把该单元全部音频加入复检表。状态仅允许 `PASS | FAIL`，不得留空。

- [ ] **Step 4: 生成人工表、完成检查后运行门禁**

Run: `npm run content:sampling:generate && npm run content:manual-gate`

Expected before human review: `content:manual-gate` 退出码 1，输出精确未完成行号；全部记录完成后退出码 0，输出 `Curriculum samples: 48 units PASS`、`Audio samples meet >=10% and >=5 per unit`、`Expanded semester audits pending: 0`。

- [ ] **Step 5: 提交本任务**

```bash
git add tools/select-curriculum-samples.ts app/tests/content/SamplingPlan.test.ts docs/qa/curriculum-sampling-2026-07-15.md docs/qa/audio-listening-2026-07-15.md package.json
git commit -m "docs(content): record curriculum and audio sampling"
```

## 最终验收

Run: `npm run content:gate && npm run content:manual-gate`

Expected: 两条命令均退出码 0；两套教材 24 个学期全部分包；所有 `contentId` 唯一且与 ID lock 一致；全部音频引用为已校验文件或显式 TTS 兜底；48 个抽中单元和每单元规定比例的音频均有完成记录；不存在手工修改生成文件。
