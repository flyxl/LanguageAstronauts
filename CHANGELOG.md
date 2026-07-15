# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- `app/` 可测试 TypeScript 领域地基（存档 v5、档案、知识装甲战斗、武器/宠物/成长）。
- Cocos Creator 原生工程脚手架（`app/`）：2D Boot 场景 + Native Android 发包路径。
- Vitest：14 项领域测试通过。

### Removed

- **Capacitor / WebView APK 交付路径**（违背「Cocos 原生独立 App」约定；相关工程、文档口径与误打 APK 已清除）。

### Documentation

- P0 文档重整：固化 Web/PWA MVP 当前态审计，归档旧 GDD，建立 Current/Target/Archived 索引。
- 新增 Cocos v2 产品 GDD 与学习/战斗/成长/武器宠物/音画/架构/内容/存档/测试分册。
- README / `releases/README.md` 明确：**仅 Cocos Native 为合法安装包**；禁止 Capacitor。

> 可安装 APK 必须以 Cocos Creator Native Android 构建为准；`play/` 仅为领域预览，非交付。
