# 内容 Schema

> **Status:** Target  
> **Applies to:** Cocos 独立 App v2  
> **Last verified:** 2026-07-15

## 1. 层级

`教材 / 年级 / 学期 / 单元.json`

知识点字段：`contentId` / `kind` / `en` / `zh` / `audioRef` / `questionTypes` / `distractorTags`。

## 2. 3A-U1 示例（子集）

```json
{
  "unitId": "3A-U1",
  "name": "How do we feel?",
  "items": [
    {
      "contentId": "ox-3a-u1-happy",
      "kind": "vocab",
      "en": "happy",
      "zh": "高兴的",
      "audioRef": "ox-3a-u1-happy",
      "questionTypes": ["choice", "listening", "reading", "spelling", "speaking"],
      "distractorTags": ["feeling"]
    }
  ]
}
```

## 3. 校验必须覆盖

- `contentId` 唯一；
- `en`/`zh` 非空；
- 题型枚举有效；
- 音频存在或显式 `ttsFallback: true`；
- 干扰项数量与无重复正确答案；
- 教材单元引用有效；
- 生成文件（口语改编）不可手改（以生成戳校验）。

## 4. 错误格式

固定为：`文件路径:JSON Pointer:错误码:消息`

示例：`assets/content/oxford/3A/1/u1.json:/items/0/en:EMPTY_TEXT:en must be non-empty`
