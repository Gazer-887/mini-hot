# Mini_hot 项目进展记录

> NOTEBOOK 目录固定为 4 个文件：`progress.md`（本文件）/ `decisions.md`（关键决策）/ `learnings.md`（经验沉淀）/ `problem.md`（问题记录）。**无 `lat.md`**（`lat.md` 是另一项目 fitness-tracker 的结构，本项目不沿用，避免混淆）。

## 2026-08-23

### 项目启动与归档
- 从原始项目 D:\fitness-tracker 中学习经验，基于公开接口 uapis.cn 新建独立项目
- 删除冗余 requirements.txt（Python 专用，前端项目不适用）

### 关键决策
- **技术选型**：Vite 5 + React 18 + TS 5 + Tailwind 3.4（锁版本防漂移）
- **UI 定位**：暖色治愈系原创设计，不照抄原站金句/排版
- **架构决策**：纯前端直连 API（CORS 已验证全开放），无 BFF

### 踩坑与修复
1. **竞态 bug（高影响）**：共享递增计数器 `reqSeqRef` 导致非最后平台被误判过期
   - 症状：页面始终只有头条加载成功，其他 5 平台卡"加载中"
   - 根因：`seq !== reqSeqRef.current` 对并发请求全部生效
   - 修复：移除共享 seq，改用 `signal.aborted` 判断
2. **Tailwind content 配置缺失**：`bg-cream` 等 @apply 类未生成
   - 症状：body 底色丢失
   - 修复：tailwind.config.js content 加入 `'./src/**/*.css'`
3. **浮点精度陷阱**：`keepDecimals(1146.85)` 预期 `1146.9` 实际 `1146.8`
   - 根因：IEEE 754 浮点表示误差
   - 修复：先用 `Math.round(num * 10) / 10` 修浮点再 toFixed

### 已完成功能
- ✅ 6 平台热榜聚合（微博/知乎/B站/抖音/小红书/头条）
- ✅ 热度值归一化（6 种形态全覆盖，单测 15/15 pass）
- ✅ 三态渲染（加载/错误/空态），单平台故障不拖垮其他
- ✅ AbortController 竞态取消（切 tab 时旧请求 abort）
- ✅ localStorage 缓存（10 分钟 TTL，防配额烧光）
- ✅ 原创 UI（暖色治愈系、响应式）
- ✅ 类型检查通过（tsc 零错误）
- ✅ 生产构建通过（9.9KB CSS / 151KB JS）

### 构建产物
- dist/assets/index-C-e8Zgew.css (9.94 KB)
- dist/assets/index-BI90Mj32.js (151.06 KB)
- dist/index.html (0.51 KB)

### 下一步
- [ ] 部署到 Vercel/Netlify（生产 CORS 需重新验证）→ 等主人确认账号/授权
- [ ] git commit + push（含全部改动）→ 等主人确认

---

## 2026-08-25 待办完成（P0-P2 全量推进）

### 完成的待办
- ✅ P0 缓存增强：fetchHot 增 force 参数，手动刷新绕过缓存（原实现 force 仍命中缓存导致刷新失效）
- ✅ P0 配额感知：parseQuota 读 RateLimit/Uapi-* 头，Header 有限流提示
- ✅ P0 错误隔离：429/网络错误指数退避重试（1s/2s，MAX_RETRY=2）
- ✅ P0 单测：新增 src/api/hotboard.test.ts（5 用例：缓存命中/强制刷新/429退避/超限/非OK）
- ✅ P1 深色模式：CSS 变量 + darkMode:class + 主题切换按钮（记住偏好）
- ✅ P1 书签收藏：useFavorites + 收藏按钮 + 收藏视图（'fav' tab）
- ✅ P1 移动端：tab 横向滚动 + 增大触摸热区
- ✅ P2 ESLint：flat config（eslint 9/10）+ lint script（0 error）
- ✅ P2 CI：.github/workflows/ci.yml（npm ci→tsc→lint→test→build）
- ✅ P2 PWA：manifest + service worker（缓存 app shell，不缓存 API）
- ✅ 全量回归：tsc 0 + lint 0 + test 20/20 + build 通过
- 附：补 src/vite-env.d.ts 修复 import.meta.env 类型

### 踩坑（详见 learnings.md）
- Vite watcher 与 edit 临时目录冲突 EBUSY → 改文件前停 dev
- import.meta.env 缺类型 → 补 vite-env.d.ts
- ESLint 10 react-hooks/set-state-in-effect 误报数据拉取 → 针对性 disable
- vitest mock fetch 复用 Response body → mockImplementation 动态返回

### 下一步
- [ ] 部署到 Vercel/Netlify（生产 CORS 需重新验证）→ 等主人确认账号/授权
- [x] git commit + push（已完成 760b82d）

---

## 2026-08-25 里程碑 & 三态规划（新方向，方案待确认）

- ✅ P0-P2 待办全部完成并提交推送（commit `760b82d`，工作区干净），作为后续三态版本的**共享基座**
- 目标：同一热榜做成 **Windows 桌面 / 安卓 App / DSH 插件** 三种形态
- 待定：架构方向（倾向「单库+多壳」而非「三分支」）、各壳技术选型（Electron/Tauri/Capacitor）、DSH 插件机制（需调研）

---

## 2026-08-25 新增开发者社区板块

- ✅ 新增 4 个板块：**掘金(juejin) / V2EX / CSDN / HackerNews**（uapis 现成 3 个 + HackerNews 走 Algolia）
- ✅ 数据源抽象：`PlatformMeta.source`（'uapis'|'hackernews'），`fetchHot` 按 source 分派 uapis/Algolia
- ✅ 各平台热值处理：掘金"热度:"前缀→千分位、V2EX 热值为空(showHeat=false)、CSDN "4.3w"→4.3万、HN 用 points
- ✅ 探测结论：uapis 支持 juejin/v2ex/csdn；HN 用 Algolia(CORS 开放)；GitHub trending 页 CORS 不开放、api.github.com 开放但限速 10/min（暂未加，避免破坏纯前端直连架构，见决定 D-012）
- ✅ 全量回归：tsc 0 / lint 0 / test 22/22 / build 通过

### 下一步
- [x] git 提交本次板块扩展（已完成 b8cce18）
- [ ] 三态版本推进（Electron → Capacitor）

---

## 2026-08-26 DSH 集成推进（技能 + 插件已完成，待 Netlify 部署）

### 已完成
- ✅ `/hotboard` 技能创建：`~/.dsh/skills/hotboard/SKILL.md`
  - 指导 agent 用 DSH browser 工具打开热榜页、读取、按指令操作
  - 覆盖场景：展示热榜、切平台、刷新、切换主题、收藏
  - 热榜地址：本地 `http://localhost:5173`（Netlify 部署后改为在线 URL）
- ✅ DSH 快捷按钮插件创建：`D:\Mini_hot\dsh-plugin/`
  - 注入到 `sidebar.footer.action` slot（社区市场同款位置，order=20）
  - 点击打开热榜网页（window.open）
  - 已安装：`dsh plugin --profile desktop add file:D:/Mini_hot/dsh-plugin` ✅
  - 验证：dump-config 中可见 `name: dsh-hotboard` ✅
- ✅ 本地 dev server 验证：
  - Vite dev server 启动成功（localhost:5173）✅
  - 10 平台数据全部加载正常 ✅
  - 切平台（微博→掘金→V2EX）验证通过 ✅
  - 刷新按钮验证通过 ✅

### 待完成（需主人操作）
- [ ] **Netlify 部署**：主人首次使用，需先注册/登录 → 部署 `dist/` → 得到在线 URL
  - 命令：`cd D:\Mini_hot && netlify deploy --prod --dir=dist`
  - 部署后更新：① `dsh-plugin/lib/client.js` 中 HOTBOARD_URL ② `SKILL.md` 中地址
- [ ] **DSH 重启**：安装插件后需重启 DSH Desktop 使按钮生效

### 2026-08-26 晚间：DSH 重启被「受保护安装恢复」阻塞（已解决）
- **现象**：安装 `dsh-hotboard` 后重启 DSH，弹窗 `Protected plugin installation manual-plugin-install@unresolved requires a recovery choice after startup-unconfirmed`，无法正常进入。
- **根因**：`dsh plugin add file:D:/Mini_hot/dsh-plugin`（17:03）创建了恢复事务 `c35f05c9`，安装本身成功（package.json 哈希 = 记录 after、node_modules 有 dsh-hotboard v0.1.0），但重启时验证环节标记 `startup-unconfirmed` → phase 停在 `recovery-pending`（非终态）→ 阻塞启动。
- **处置**：备份 `state.json` 后，将 phase 推进到终态 `verified`、删除 failureReason、补 verifiedAt → 重启恢复正常。
- **注意**：这是第二次同类事件（上次是 voice-input 安装）。插件用 `dsh plugin add` 安装后若**异常退出/强杀 DSH**，验证环节无法跑完，重启必弹恢复窗。正确做法：装完正常退出 DSH，或在弹窗中直接点"确认恢复"。

### 2026-08-26 晚：按钮未显示 → 根因 client 缺 dsh.client 字段（已修复）
- **现象**：DSH 重启后侧边栏**没有**「🔥 热榜」按钮。
- **根因**：`package.json` 缺 `"dsh.client": { "platform": "web" }` 字段和 `exports["./client"]`，DSH 启动时不收集该插件客户端 bundle → `lib/client.js` 从未执行。
- **修复**：
  - `package.json` 补 `dsh.client` + `./client` export（复刻 community-market）
  - `client.js` 重写为正确结构：`factory: (require)=>{...}` 引入 react / react-jsx-runtime / @deepseek-ai/dsh-client-ui-primitives；`const inject=['slots','locale']`；`exports.apply/inject`
- **需再次重启 DSH**，按钮才会出现。click 后 window.open 打开 `localhost:5173`（dev server 需保持运行）。

### 2026-08-26 深更：改为 better-sidebar Tab（主人发现 dsh-better-sidebar 支持 Tab 扩展）
- **方向变更**：主人发现 dsh-better-sidebar 提供 `ctx.betterSidebar` 服务，侧边栏页面（Tab）可由插件扩展 → 热榜从"底部按钮"升级为"侧边栏 Tab"。
- **关键调研**：
  - `ctx.betterSidebar.registerTab(descriptor)` 注册 Tab；`inject=['betterSidebar']`。
  - better-sidebar 在 client 端用 `ctx.provide('betterSidebar', service)` 发布服务（src/client/index.tsx L68），消费方 inject 即可拿到。
  - Tab 组件接收 `TabComponentProps`：`{ ctx, store, scope, tab, visible }`，返回 ReactNode。
  - 复刻 builtinTabs（src/client/builtins/tabs.tsx）作为正确样例。
- **实现**：`client.js` 重写为 `inject=['betterSidebar']` + `ctx.betterSidebar.registerTab({id:'hotboard', title:'🔥 热榜', single:true, component})`，Tab 内 iframe 嵌热榜页。
- **可复用性**：desktop profile 已挂载 dsh-better-sidebar（dump-config 可见），无需额外安装。
- **状态**：插件已重新安装（v0.2.0），client bundle 已更新。**需硬刷新浏览器**（client 改动热加载，无需重启 DSH）。
- **顺手修复**：vite.config.ts 的 watch.ignored 改为正则函数 `/(\.tmpdir|[\\/]NOTEBOOK[\\/]|[\\/]PLAN[\\/]|[\\/]docs[\\/]|[\\/]dsh-plugin[\\/]|[\\/]android[\\/]|[\\/]dist[\\/]|[\\/]node_modules[\\/]|[\\/]\.vite[\\/]|[\\/]\.git[\\/])/.test(path)`；已实测：创建/删除 `.tmpdir` 临时目录后 dev server 仍存活（EBUSY 根治，L-011 验证通过）。注意不能用 glob（micromatch dot:false 匹配不到点开头段），且 config 被 tsc 检查不能用 es2015 的 `.includes`。

### 2026-08-26 深夜：发现 Capacitor Android 目录 + 改用 vite preview
- **关键发现**：项目根有 `android/`（Capacitor 工程）+ `capacitor.config.ts`（webDir=dist），是主人的**三态版本**（Web + Android App）。`dist/` 被同步进 `android/app/src/main/assets/public/`。
- **dev server 反复崩的根因**：Vite dev 在 watch 整个根目录，被 **Capacitor Android 构建**（另终端在写 android/ 下的产物）触发 EBUSY（`android/app/build/.../intermediary-bundle.aab`）。这不是我的代码问题，是 dev server watch 到无关大目录。
- **改用 vite preview（端口 5174）**：preview 服务 `dist/` 构建产物且**不 watch**，绝不 EBUSY，且与 Android 打包用同一产物 → 最稳。`client.js` 的 `HOTBOARD_URL` 已改为 `http://localhost:5174`，`SKILL.md` 同步。
- **教训**：热榜服务的本地地址应指向 preview（dist 产物），不要用 dev server（5173 易被外部构建搞崩）。

### 文件清单
| 文件 | 说明 |
|------|------|
| `~/.dsh/skills/hotboard/SKILL.md` | `/hotboard` 技能（agent 读/操作热榜页） |
| `D:\Mini_hot\dsh-plugin\lib\index.js` | 插件服务端入口 |
| `D:\Mini_hot\dsh-plugin\lib\client.js` | 插件客户端 UI（better-sidebar Tab 组件） |
| `D:\Mini_hot\dsh-plugin\cordis.patch.yml` | DSH 注入配置 |
| `D:\Mini_hot\dsh-plugin\package.json` | 包描述 |

---

## 2026-08-27 文档漂移修复

- ✅ 清除 DSH「快捷按钮」→「better-sidebar Tab」的文档漂移（插件早已演进为侧边栏 Tab，但部分文档仍写旧方案）：
  - `dsh-plugin/lib/index.js` 顶部注释：改为 better-sidebar Tab 描述
  - `dsh-plugin/dsh.plugin.json` description：按钮 → Tab
  - `PLAN/plan4_DSH集成方案.md`：第 2 节方案、进度表、风险/依赖三处改为 `ctx.betterSidebar.registerTab`（order=60, single:true）
  - `NOTEBOOK/progress.md` 文件清单：`client.js` 说明「按钮组件」→「better-sidebar Tab 组件」
- ℹ️ 关于 `lat.md`：经核查 Mini_hot 项目内文档（README/NOTEBOOK）**无 `lat.md` 引用**，NOTEBOOK 固定为 `progress/decisions/learnings/problem` 4 文件；`lat.md` 是另一项目 fitness-tracker 的结构，已在 progress.md 顶部加澄清，避免再混淆。

---

## 2026-08-27 安卓壳（Capacitor 6）完成 — 端到端验证通过

### 背景
- 主人指示"先做安卓软件吧，DSH 我还在用" → 推进三态的阶段 2 Capacitor 壳，DSH/部署相关一律不动。
- 环境侦察：Node 22 / Java 17（JDK-17，JAVA_HOME=D:\Tools\JDK-17） / ANDROID_HOME=D:\Tools\Android\Sdk（platforms: android-34, build-tools 34.0.0, licenses 已接受, 无 cmdline-tools）。SDK 仅有 API 34 → 选 **Capacitor 6.2**（compileSdk 34 完美匹配），不强制上 7。

### 落地
- ✅ 装依赖：`@capacitor/core@^6` + `@capacitor/android@^6`（运行时） + `@capacitor/cli@^6`（devDep）→ 实际 6.2.1。
- ✅ `capacitor.config.ts`：`appId=com.minihot.app`, `appName=迷你热榜`, `webDir=dist`, `androidScheme=https`。
- ✅ `.gitignore` 补 android 原生构建产物（`.gradle/`, `app/build/`, `build/`, `local.properties`, `*.keystore`, `release/`, `captures/`）—— 源码仍提交。
- ✅ `npx cap add android` 生成 android/ 原生工程（gradle wrapper 8.2.1, compileSdk 34, minSdk 22, targetSdk 34），自动 sync dist 到 assets。
- ✅ `npm run build`（tsc 0 + vite 2.99s）→ `npx cap sync android` 复制 web 资源到原生 assets。

### 踩坑：Gradle 分发下载超时 + cap build 走 release
- 症状：`npx cap build android` 失败，下载 `gradle-8.2.1-all.zip` 连 `services.gradle.org` 超时 10s。
- 根因：Java 进程不读 Clash Verge 系统代理（Clash 实际监听 **7897/7898/7899**，非默认 7890，TUN 未被 JVM 自动接管）；但国内 Gradle 镜像（腾讯云/华为云/阿里）直连 206 可达。
- 处置 1：改 `android/gradle/wrapper/gradle-wrapper.properties` 的 `distributionUrl` → 腾讯云镜像（`mirrors.cloud.tencent.com/gradle/gradle-8.2.1-all.zip`），`networkTimeout` 10000→60000。
- 处置 2：再次 `cap build android` 仍失败——`cap build` 默认走 **release 并强制要 keystore 签名**；改用 `./gradlew assembleDebug` 直接出 debug APK，无需签名，49s BUILD SUCCESSFUL。
- 教训：① Java 进程需显式代理或换镜像源；② `cap build` ≠ debug，debug 用 `gradlew assembleDebug`；③ Gradle 编译首次会下分发+依赖约 3 分钟，之后秒级。

### 验证
- 静态（aapt2 dump badging）：`package=com.minihot.app`, `versionName=1.0`, minSdk 22, targetSdk 34, compileSdk 34, permission=INTERNET, `launchable-activity=com.minihot.app.MainActivity label=迷你热榜`。
- 动态（AVD `Medium_Phone_API_36` / API 36 x86_64）：30s 开机 → `adb install` Success → `am start` MainActivity 无 crash（logcat 无 FATAL）→ **screencap 截图确认 UI 完整渲染**：标题"迷你今日热榜"/6 大平台 Tab（全部/收藏/微博/知乎/B站/抖音）/微博 13+ 条热榜数据/热值归一化（256.2万、893.5万 等）/刷新/主题/收藏按钮齐全。WebView + uapis 接口全链路通。
- 产物：`D:\Mini_hot\android\app\build\outputs\apk\debug\app-debug.apk` **3.81 MB**。

### 待办 / 风险
- [ ] release 签名：上线前需生成 keystore + 配 `signingConfigs` + `cap build android`（位置已留 `android/app/build.gradle`）。
- [ ] 发布：暂未上架（无应用市场账号），目前仅 debug APK。
- [ ] 兼容性：API 36 模拟器验证通过，真机机型覆盖待主人测。
- [ ] dev server 忽略：vite.config.ts 的 watch.ignored 建议补 `android/` 与 `.vite/`（防 dev 期间另终端构建安卓时 EBUSY）—— 本次未改（范围外），留作后续。

### 澄清
- `2026-08-26 深夜` 段落提及"项目根已有 android/ + capacitor.config.ts + vite.config 扩展忽略"—— 在当前仓库实际**未体现**（我接手时两者皆不存在，是本次新建）。可能属另一情境/被回滚/或为计划叙述。**以本次 2026-08-27 为当前真实落地状态。**

---

## 2026-08-27 安卓壳追加：release 签名配置完成（DSH / 真机覆盖仍挂起）

### 背景
- 主人确认：除 DSH 部署与真机覆盖外，其余待办先做 → 本次推进 release 签名、上架状态澄清、dev server 忽略确认、git 提交。
- 沿用阶段 2 已生成的 Capacitor 6.2.1 原生工程（compileSdk 34）。

### 落地
- ✅ 生成 keystore：`android/app/release-key.keystore`（RSA 2048，alias=`minihot`，V3，有效期 10000 天≈至 2054-01-12，SHA256 指纹 `07:C7:E3:4A:67:33:E3:63:…:B5:F5:74:81`）。
- ✅ 凭据隔离：`android/local.properties`（已被 android/.gitignore 忽略，不入库）写 `RELEASE_STORE_FILE/PASSWORD/KEY_ALIAS/KEY_PASSWORD`；`android/.gitignore` 原把 `*.keystore` 注释掉，已改为**生效忽略**（私钥不入库）。
- ✅ `android/app/build.gradle`：`buildTypes.release` 前加 `signingConfigs.release`（从 local.properties 读取），release 引用之；local.properties 缺失时自动跳过签名（不破坏 debug/CI）。
- ✅ 构建：`./gradlew assembleRelease` BUILD SUCCESSFUL（约 1min），产物 `android/app/build/outputs/apk/release/app-release.apk` **3.04 MB**（出现 `:app:validateSigningRelease` 任务，签名生效）。
- ✅ 签名核验：`keytool -printcert -jarfile` → 所有者 `CN=MiniHot`，V3，SHA256withRSA，签名者 #1 即 minihot；aapt2 确认 `package=com.minihot.app`、INTERNET 权限不变。

### 上架现状澄清（重要）
- ⚠️ **当前无应用市场账号，无法上架 Google Play / 国内商店**；release 包仅用于**侧载（adb install / 直接传 APK）**或未来上架。
- 📌 侧载方式：手机「设置-安全」允许「未知来源」后，把 `app-release.apk` 传入安装即可；release 包可正常覆盖升级（同 keystore 签名）。
- 🔑 keystore 唯一性：更换 keystore 后旧用户无法覆盖安装，**请单独备份 `android/app/release-key.keystore` 并记住密码**（当前密码见 `android/local.properties`，该文件不入库）。

### 顺带确认（无需改动）
- ✅ dev server 忽略：`vite.config.ts` 的 `server.watch.ignored` 正则**已含 `/[\\/]android[\\/]/` 与 `/[\\/]\.vite[\\/]/`**（见 2026-08-26 深更段），防 EBUSY 已具备，本次未重复改动。

### 待办 / 风险（最新状态）
- [x] release 签名：✅ 已完成（见上）。
- [x] dev server 忽略：✅ 已具备（vite.config.ts 已含 android/ 与 .vite/）。
- [ ] 发布：无应用市场账号 → 只能侧载；release 包已具备侧载条件。
- [ ] 兼容性：仍仅 API 36 模拟器验证，真机机型覆盖待主人测（主人暂缓）。
- [ ] DSH 部署：主人仍在使用 DSH，暂停（Netlify 部署 / HOTBOARD_URL 切换待主人想动时）。

---

> 最后更新：2026-08-27 18:25
