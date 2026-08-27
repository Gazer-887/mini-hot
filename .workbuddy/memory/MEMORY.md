# Mini_hot 项目长期笔记（MEMORY.md）

> 跨会话关键事实。下次进入项目先读这个 + 今日 log。

## 项目定位
- **迷你今日热榜** 单页应用：聚合 10 平台（微博/知乎/B站/抖音/小红书/头条 + 掘金/V2EX/CSDN/HackerNews）实时热榜。
- 数据源：`uapis.cn/api/v1/misc/hotboard?type=X`（CORS 开放，前端直连）+ HackerNews Algolia。**无 BFF/后端**。
- 技术栈：Vite 5 + React 18 + TS 5 + Tailwind 3.4（锁版本）。Vitest 22 用例。ESLint flat + GH Actions CI + 手写 PWA（public/sw.js + manifest.webmanifest，**非** vite-plugin-pwa）。
- 暖色治愈系原创 UI（不照抄原站）。本地凭据库无；DSH 凭据用户拒绝入 api_database.env。
- 路径基线：项目根 `D:\Mini_hot`；NOTEBOOK 固定 4 文件 `progress/decisions/learnings/problem`（**无 lat.md**，lat 属 fitness-tracker）。

## 三态版本现状
| 形态 | 壳 | 状态 |
|---|---|---|
| 🌐 Web | Vite | ✅ |
| 🤖 Android | Capacitor **6.2.1** | ✅ 2026-08-27（debug APK 3.8MB，AVD `Medium_Phone_API_36` 端到端验证） |
| 🪟 Windows | Electron | 📋 计划 |
| 🔌 DSH 集成 | better-sidebar Tab（v0.2.0，dsh-hotboard） | 📋 计划（用户 08-27 表示"DSH 还在用"先不动） |

架构共识：单库 + 多薄壳（`src/` 全共享，壳只放入口/配置/构建脚本）。

## 安卓壳关键事实（Capacitor 6.2.1）
- 选型：SDK 仅 android-34 → Capacitor 6（compileSdk 34），不上 7（需 API 35）。
- `capacitor.config.ts`：appId=`com.minihot.app`, appName=`迷你热榜`, webDir=`dist`, androidScheme=`https`。
- Vite `base: './'` 已是对相对路径，Capacitor 友好。
- `tsconfig.json` include 仅 `["src"]`，`capacitor.config.ts` 不被 tsc 编译。
- **APK 产物**：`android/app/build/outputs/apk/debug/app-debug.apk`（~3.8MB，minSdk 22 / target 34 / compile 34）。
- **构建方式**：`./gradlew assembleDebug`（**不要**用 `npx cap build android`，默认走 release 强制要 keystore 签名）。
- **Gradle 分发**：wrapper 8.2.1，`distributionUrl` 改**腾讯云镜像**（`mirrors.cloud.tencent.com/gradle/gradle-8.2.1-all.zip`）绕墙；`networkTimeout` 10000→60000。
- **环境变量**：ANDROID_HOME=`D:\Tools\Android\Sdk`（含 android-34/build-tools 34.0.0/licenses/，**无** cmdline-tools），JAVA_HOME=`D:\Tools\JDK-17`（JDK 17 Temurin），ANDROID_SDK_ROOT 可不设。
- **代理坑**：Clash Verge 监听 7897/7898/7899（非默认 7890），Java 进程不读 TUN → 走国内镜像最稳，不要给 JVM 加代理属性。
- AVD：`Medium_Phone_API_36`（system-image android-36 x86_64）已用 30s 开机 + install + start + screencap 全通。
- .gitignore 已补：`android/.gradle/` `android/app/build/` `android/build/` `android/local.properties` `android/*.keystore` `android/app/release/` `android/captures/`。
- **待做**：release 签名（keystore + `signingConfigs`）、真机覆盖测、上架（无市场账号）。

## DSH 插件壳（暂不动）
- 位置：`D:\Mini_hot\dsh-plugin/`（v0.2.0），已 `dsh plugin add file:...` 安装，desktop profile 挂载 dsh-better-sidebar。
- 形态：**better-sidebar 侧边栏 Tab**（非底部按钮）：`ctx.betterSidebar.registerTab({id:'hotboard', title:'🔥 热榜', single:true, component})`，Tab 内 iframe 嵌热榜。
- 踩坑记录：plugin install 后异常退出/强杀 DSH 会卡 `recovery-pending`（phase 推进 + verifiedAt 解决）；client bundle 需 `package.json` 有 `dsh.client` + `exports["./client"]` 才会被收集执行。
- 待 Netlify 部署后：把 `client.js` 的 HOTBOARD_URL 与 `~/.dsh/skills/hotboard/SKILL.md` 地址切到在线 URL（现指 `localhost:5174` vite preview）。

## 开发环境与代理
- Node：**managed 22.22.2** at `C:\Users\Gazer\.workbuddy\binaries\node\versions\22.22.2\node.exe`（与 npm 10.9.7 配套，项目 node_modules 即此版本装的）。
- npm 镜像：`registry.npmmirror.com`（npm 装包走它能通）。
- Clash Verge：`D:\Clash Verge\clash-verge.exe` + `verge-mihomo.exe`，监听 7897/7898/7899。TUN 模式——**Java/Gradle 不自动走 TUN**（超时），需显式代理属性或换镜像源。
- DNS 代理在 127.0.0.1，曾触发 Node fetch 负缓存问题。

## vite watch.ignored（已修过但有遗漏）
- 现仅忽略：`\.tmpdir`、`NOTEBOOK/`、`PLAN/`、`docs/`、`dsh-plugin/`（函数正则，tsc 5.1 兼容用 .test 不用 .includes）。
- **建议补**（本次未改）：`android/` 与 `.vite/`（防 dev 期间另终端构建安卓时 EBUSY；progress.md 2026-08-26 深夜段曾声称已加，实际**未加**，与代码不符——以当前代码为准）。

## 文档漂移治理（已修）
- 上午修：DSH 快捷按钮→better-sidebar Tab（index.js 注释+日志、dsh.plugin.json、plan4 三处、progress.md 文件清单）。
- 下午发现并澄清：progress.md 2026-08-26 深夜段描述"项目根已有 android/ + capacitor.config.ts + vite 扩展忽略"——实际仓库**没有**（是我 08-27 新建的），可能属另一情境/被回滚/计划叙述。**以 2026-08-27 为真实落地状态。**
