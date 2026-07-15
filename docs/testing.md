# 测试与发布门槛

> **Status:** Target  
> **Applies to:** Cocos 独立 App v2  
> **Last verified:** 2026-07-15

## 1. 固定命令

```bash
cd app && npm test -- --run
cd app && npx vitest run tests/<file>.test.ts
cd app && node --import tsx ../tools/validate-content.ts assets/content
```

## 2. 自动化范围

- 领域：学习结局、知识装甲、伤害不改掌握度、升级成本、迁移 fixtures；
- 场景集成：Boot→Battle→Settlement 冒烟；
- 内容抽检：`validate-content` 全绿。

## 3. 真机矩阵（五类）

1. 离线冷启动进基地并可开战；  
2. 麦克风拒绝后口语降级路径；  
3. 存档导入导出往返；  
4. 低端机一局 ≥30 FPS；  
5. 战斗中杀进程后安全恢复或回基地。

## 4. 发布门槛

- P0–P4 门禁通过；
- iOS + Android **Cocos Creator Native** 可安装测试包（禁止 Capacitor / WebView 壳）；
- APK 验包需含原生引擎库（如 `libcocos.so`），不得以 Chrome/WebView 为业务运行时；
- 无强制联网弹窗；
- 变更写入 `CHANGELOG.md`。
