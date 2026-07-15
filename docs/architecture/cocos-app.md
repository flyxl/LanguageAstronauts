# Cocos App 架构

> **Status:** Target  
> **Applies to:** Cocos 独立 App v2  
> **Last verified:** 2026-07-15

## 1. 统一目录

```
app/
  assets/
    scripts/
      domain/           # 纯 TS 领域
      core/             # 端口与共享类型
      infrastructure/   # 文件、音频、触觉适配
      presentation/     # 场景、动画、UI 绑定
    config/             # JSON 表
    content/            # 教材分包
  tests/                # Vitest
tools/                  # 内容校验与生成
```

路径字面量（供实现与断言）：  
`app/assets/scripts/domain/`  
`app/assets/scripts/core/`  
`app/assets/scripts/infrastructure/`  
`app/assets/scripts/presentation/`  
`app/tests/`  
`tools/`

## 2. 依赖方向

- `presentation → domain`
- `infrastructure → core`
- `domain → core types only`

禁止：领域引用 `cc`；UI 直接写存档；表现层持有唯一业务状态。

## 3. 核心端口

- `EventBus<AppEvents>`：强类型，禁止任意字符串事件名；
- `Clock`：`now` / `setTimeout` / `clearTimeout`；
- `RandomSource`：`next()`；
- `SaveRepository`：`load` / `commit`；
- `SceneNavigator`：`go(sceneId, params)`。

业务状态由组合根持有，不挂在 Scene 节点上。

## 4. 六场景

| 场景 | 进入参数 | 职责 | 合法出口 |
| --- | --- | --- | --- |
| Boot | 无 | 校验配置、恢复/迁移存档 | Profile / Base |
| Profile | 可选 childId | 孩子、教材、年级 | Base |
| Base | childId | 任务、养成、设置 | StarMap / Battle / Report / Profile |
| StarMap | childId | 单元路线 | Battle / Base |
| Battle | session | 题目与战斗 | Settlement→Base/Report |
| Report | childId | 学情、导入导出 | Base |
