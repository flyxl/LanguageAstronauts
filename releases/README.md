# Android APK 发布说明

> **Status:** Target delivered (debug) · emulator verified  
> **Last verified:** 2026-07-15

## 产物

| 文件 | 说明 |
| --- | --- |
| `releases/language-astronauts-debug.apk` | Capacitor + Vite 可玩切片的 debug 安装包（约 4.0MB） |

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
# 若 wrapper 拉取失败，可用本机 Gradle 8.14：
# npm run cap:sync && ~/.gradle/wrapper/dists/gradle-8.14-all/.../bin/gradle -p android assembleDebug
cp play/android/app/build/outputs/apk/debug/app-debug.apk releases/language-astronauts-debug.apk
```

安装到设备：

```bash
adb install -r releases/language-astronauts-debug.apk
```

## 验证清单

- [x] `assembleDebug` BUILD SUCCESSFUL
- [x] APK 存在且 `unzip -t` 无错误
- [x] `aapt dump badging` 包名/启动 Activity/标签正确
- [x] AVD `la_api28_arm`（API 28 / arm64）安装成功
- [x] 冷启动后渲染「创建孩子档案」页（已修 WebView：关闭会生成 `?.65` 的 minify，并垫 `globalThis`）
- [x] 创建档案后进入「星图远征 · 3A」并可看到 Unit 出击列表
- [x] logcat 无 `SyntaxError` / `ReferenceError` / `js.error`

## 兼容性说明

旧系统镜像自带的 WebView（如 Chromium 66）能力较弱。`play/vite.config.ts` 使用 `build.target=es2019` 且 `minify:false`，`index.html` 注入 `globalThis` 垫片。真机通常自带可更新的 WebView，建议 Chromium ≥ 80。
