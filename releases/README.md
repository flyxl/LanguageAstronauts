# Android 发布说明

> **Status:** Target  
> **Applies to:** Cocos Creator 原生 Android（非 WebView / 非 Capacitor）  
> **Last verified:** 2026-07-15

## 交付口径（硬约束）

- **唯一合法安装包**：由 Cocos Creator **Native Android** 构建产出的 APK/AAB。  
- **明确禁止**：Capacitor、Cordova、PWA 壳、任意 WebView 包装作为正式交付。  
- 历史误用 Capacitor 打出的 debug 包**已作废**，不得再分发或写入发布清单。

## 产物（Cocos Native）

| 文件 | 说明 |
| --- | --- |
| `releases/language-astronauts-debug.apk` | Cocos Creator 3.8.x Native `assembleDebug` 安装包（构建成功后放置于此） |

包名目标：`com.languageastronauts.app`  
启动 Activity（Cocos Native 模板）：`com.cocos.game.AppActivity`

## 本地构建

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export NDK_ROOT=$ANDROID_HOME/ndk/28.2.13676358   # 按本机已装 NDK 调整

# 在 Creator 中打开 app/，或用 CLI：
"/Applications/Cocos/Creator/3.8.7/CocosCreator.app/Contents/MacOS/CocosCreator" \
  --project "$PWD/app" \
  --build "platform=android;debug=true;md5Cache=false;replaceSplashScreen=false;packages.android.packageName=com.languageastronauts.app;packages.android.apiLevel=android-28;packages.android.appABIs=['arm64-v8a'];packages.android.useDebugKeystore=true;packages.android.sdkPath=$ANDROID_HOME;packages.android.ndkPath=$NDK_ROOT"

# 构建完成后将 debug APK 复制到 releases/
```

安装：

```bash
adb install -r releases/language-astronauts-debug.apk
```

## 验证清单

- [ ] Cocos Creator Native `assembleDebug` / CLI build 成功  
- [ ] APK 内含 `libcocos.so`（或等价原生库），**不是** Capacitor/WebView 壳  
- [ ] `aapt dump badging` 包名与启动 Activity 正确  
- [ ] 模拟器/真机冷启动进入 Cocos 场景（非浏览器引擎）  
- [ ] logcat 无 Capacitor / Chrome WebView 业务加载链
