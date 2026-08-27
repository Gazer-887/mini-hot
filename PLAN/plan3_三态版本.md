# Mini_hot 三态版本 — 规划

> 创建时间：2026-08-25
> 目标：同一个热榜应用做成 **Windows 桌面 / 安卓 App / DSH 插件** 三种形态
> 架构共识：**单一代码库 + 三个薄壳**（非三分支三拷贝）
> 基线：commit `760b82d`（P0-P2 待办已完成，工作区干净）

---

## 一、架构（单库 + 多壳）

核心 `src/`（api / hooks / components / utils）一份**全共享**；三种形态只是把这份 Web 应用装进不同的"运行壳"。每个壳是一个薄目录，只放各自的入口、配置、构建脚本，`import` 共享的 `src/`。

```
Mini_hot/
├── src/                      # 共享核心（已有，勿复制）
├── electron/                 # Windows 壳（Electron）
│   ├── main.ts              # 主进程：建 BrowserWindow 加载 dist/index.html
│   └── preload.ts           # 预加载脚本（可选）
├── capacitor.config.ts      # Android 壳（Capacitor 配置）
├── android/                 # Capacitor 生成的 Android 原生工程
├── dsh-plugin/              # DSH 插件壳（形态待调研，见下）
└── package.json             # 各壳脚本集中在这
```

> 核心改动改成**一处、三态通吃**；避免三分支导致代码漂移/合并地狱。

## 二、壳选型（已确认）

| 形态 | 壳 | 说明 |
|------|----|------|
| Windows | **Electron** | 纯 JS 上手快，但打包体积大（~100MB+，含 Chromium） |
| Android | **Capacitor** | 官方，把 web 构建产物包成 APK，复用现有 src 最省力 |
| DSH 插件 | **待调研** | 最不确定，需先搞清 DSH 插件机制（见阶段 0） |

## 三、阶段划分

- **阶段 0**：DSH 插件机制调研（当前进行中）→ 确认热榜适合做成「面板 / 页面 / 技能 / 命令」哪种形态
- **阶段 1**：Electron 壳（最快出 Windows 成果，撞脸最小）
- **阶段 2**：Capacitor 壳（Android）✅ 2026-08-27 完成
- **阶段 3**：DSH 插件壳（依调研结果）
- **阶段 4**：三态共享核心的适配与分别发布

## 四、风险与依赖

- Electron：打包体积大；需确认主进程/预加载方案
- Capacitor：需 Android Studio / SDK 环境；本地打包 APK 依赖 Android SDK
- DSH 插件：依赖 DSH 插件开发 API（待调研；注意 `dsh-config` 只管配置运维，功能插件需另查插件开发）
- 共享核心后续改动自动惠及三态（单库优势）

---

## 修订历史

| 日期 | 变更 | 原因 |
|------|------|------|
| 2026-08-25 | 初稿 | 主人提出三态版本，确认单库+多壳、Electron、DSH 先调研 |
| 2026-08-27 | 阶段 2 Capacitor 壳完成 | 装 @capacitor/[core\|android\|cli]@6.2.1；`cap add android`；Gradle 分发改腾讯云镜像绕墙；`./gradlew assembleDebug` 产出 `app-debug.apk` 3.81MB；AVD `Medium_Phone_API_36` 端到端验证（WebView 渲染+uapis 数据加载+三态 UI 全通）|
| 2026-08-27 | 阶段 2 追加 release 签名 | 生成 keystore（alias=minihot，V3，有效期至 2054）+ `local.properties`（gitignore）存凭据 + `build.gradle` 加 `signingConfigs.release`；`./gradlew assembleRelease` 出 `app-release.apk` 3.04MB，keytool 验证签名生效 |

> 最后更新：2026-08-27
