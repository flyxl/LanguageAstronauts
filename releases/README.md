# Android APK 发布说明

> **Status:** Target delivered (debug)  
> **Last verified:** 2026-07-15

## 产物

| 文件 | 说明 |
| --- | --- |
| `releases/language-astronauts-debug.apk` | Capacitor + Vite 可玩切片的 debug 安装包（约 3.9MB） |

## 包信息（aapt）

- package: `com.languageastronauts.app`
- label: 时空语航员
- versionName: `1.0` / versionCode: `1`
- minSdk: 24 / targetSdk: 36
- launchable-activity: `com.languageastronauts.app.MainActivity`
- zip integrity: OK

## 本地构建

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
cd play
npm install
npm run android:apk
# 或：
# npm run build && npx cap sync android
# 用本机 Gradle：
# ~/.gradle/wrapper/dists/gradle-8.14-all/.../bin/gradle -p android assembleDebug
```

安装到设备：

```bash
adb install -r releases/language-astronauts-debug.apk
```

## 验证清单

- [x] `assembleDebug` BUILD SUCCESSFUL
- [x] APK 存在且 `unzip -t` 无错误
- [x] `aapt dump badging` 包名/启动 Activity/标签正确
- [ ] 真机或模拟器安装后冷启动（当前无已连接 device；插上设备后执行 `adb install -r`）
