# 界面截图

本目录由 E2E / 冒烟采集，对应文档场景（见 `docs/architecture/cocos-app.md`）。

| 文件 | 场景 / 说明 |
|------|-------------|
| `01-profile.png` | Profile：创建孩子档案 |
| `02-base-starmap.png` | Base + StarMap |
| `03-weapons.png` | 武器库 |
| `04-pets.png` | 宠物舱 |
| `05-battle.png` | Battle |
| `06-settlement.png` | Settlement |
| `07-native-boot.png` | Cocos Native Boot / Profile |
| `08-native-starmap.png` | Cocos Native 星图 |
| `09-native-sortie.png` | Cocos Native 出击反馈 |

Web 截图：`cd play && npm run test:e2e`（Playwright 写入本目录）。

Native 主链路：`adb install -r releases/language-astronauts-debug.apk` 后冷启动，横屏 `adb exec-out screencap -p` 采集 `07–09`（见 `.superpowers/sdd/task-8-brief.md`）。
