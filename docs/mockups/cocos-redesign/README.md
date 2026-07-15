# Cocos 重构视觉草图

这些 HTML 片段记录 2026-07-15 产品评审中的视觉方案。它们是设计讨论材料，不是可直接投入生产的 Cocos UI。

## 文件

- `orientation-layout.html`：横屏、竖屏和混合方向比较；
- `question-aware-layout.html`：选择、拼写、听力和口语题型布局比较；
- `gameplay-directions.html`：指令 RPG、Roguelite 和轻动作路线比较；
- `combat-state-machine.html`：战斗状态与反馈分层；
- `weapon-system.html`：五种武器流派；
- `pet-system.html`：三只宠物、进化和双宠编队；
- `cocos-architecture.html`：领域、表现、存档和平台分层。

## 最终选择

- 全局横屏；
- 全屏专注答题；
- 电影化指令 RPG + 少量 Roguelite 二选一强化；
- 知识装甲保证学习题量，伤害负责爽感；
- 5 件机制型武器；
- 3 只三阶段宠物，一先锋一支援；
- 离线、分层、配置驱动的 Cocos 原生双端架构。

草图使用 Cursor 视觉伴侣提供的 CSS 类，仓库只保留内容片段；正式 UI 以设计规格和后续 Cocos 场景为准。
