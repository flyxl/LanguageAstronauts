# 资产管线

> **Status:** Target  
> **Applies to:** Cocos 独立 App v2  
> **Last verified:** 2026-07-15

## 1. 清单字段

每个入库资产记录：来源、作者、许可证、修改分发条款、原件路径、加工路径、App 内路径、AI 提示词（若适用）。

## 2. 无 Spine 流程

分层 Node + Animation Clip + Shader / ParticleSystem2D。禁止依赖付费骨骼编辑器。

## 3. 命名

- 资源 ID：`snake_case`；
- 音频引用绑定 `contentId`；
- Boss / 武器 / 宠物资源 ID 必须与领域配置一致；
- 单位动画至少：`idle` / `anticipate` / `attack` / `hit` / `break` / `skill` / `victory`。

## 4. 预算与降级

见 `docs/design/audio-animation.md`：**400** / **120** 粒子，并发音频 **16**。  
缺图 → 色块占位；缺音 → silent；缺动画回调 → Clock 超时推进状态机。

## 5. 目录

加工产物进入 `app/assets/`；源素材与许可证表进 `docs/assets-source/`（按需创建，不入库大二进制除非授权明确）。
