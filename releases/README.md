# Android 发布说明

> **Status:** Target delivered (Cocos Native debug)  
> **Applies to:** Cocos Creator 原生 Android（非 WebView / 非 Capacitor）  
> **Last verified:** 2026-07-15

## 交付口径（硬约束）

- **唯一合法安装包**：由 Cocos Creator **Native Android** 构建产出的 APK/AAB。  
- **明确禁止**：Capacitor、Cordova、PWA 壳、任意 WebView 包装作为正式交付。  
- 历史误用 Capacitor 打出的 debug 包**已作废**。

## 产物（Cocos Native）

| 文件 | 说明 |
| --- | --- |
| `releases/language-astronauts-debug.apk` | Cocos Creator 3.8.7 Native `assembleDebug`（约 22MB） |

- package: `com.languageastronauts.app`
- launchable-activity: `com.cocos.game.AppActivity`
- minSdk 28 / targetSdk 28 / compileSdk 34
- **含** `lib/arm64-v8a/libcocos.so`（原生引擎，非 Capacitor）

## 本地构建

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export JAVA_HOME=$HOME/.sdkman/candidates/java/jdk17   # Gradle 8.0.2 需 Java 17
export NDK_ROOT=$ANDROID_HOME/ndk/28.2.13676358

# 1) Creator 导出（需 unset ELECTRON_RUN_AS_NODE）
env -u ELECTRON_RUN_AS_NODE \
  "/Applications/Cocos/Creator/3.8.7/CocosCreator.app/Contents/MacOS/CocosCreator" \
  --project "$PWD/app" \
  --build "configPath=$PWD/app/build-android-debug.json"

# 2) 若 API Level 写入 NaN，手动修正后：
#    app/build/android/proj/gradle.properties
#    PROP_COMPILE_SDK_VERSION=34 / PROP_MIN_SDK_VERSION=28 / PROP_TARGET_SDK_VERSION=28

cd app/build/android/proj
./gradlew :android:assembleDebug --no-daemon
cp build/android/outputs/apk/debug/android-debug.apk ../../../releases/language-astronauts-debug.apk
```

安装：

```bash
adb install -r releases/language-astronauts-debug.apk
adb shell am start -n com.languageastronauts.app/com.cocos.game.AppActivity
```

## 验证清单

- [x] Native `assembleDebug` BUILD SUCCESSFUL（含链接 `libcocos.so`）
- [x] APK 含 `lib/arm64-v8a/libcocos.so`，无 Capacitor 业务链
- [x] `aapt dump badging`：包名与 `com.cocos.game.AppActivity` 正确
- [x] AVD `la_api28_arm` 安装成功并冷启动（pid 存活）
- [ ] Boot UI（`BootApp`）完整挂接与玩法冒烟（下一迭代）
