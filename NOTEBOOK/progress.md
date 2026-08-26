# Mini_hot 项目进展记录

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

### 文件清单
| 文件 | 说明 |
|------|------|
| `~/.dsh/skills/hotboard/SKILL.md` | `/hotboard` 技能（agent 读/操作热榜页） |
| `D:\Mini_hot\dsh-plugin\lib\index.js` | 插件服务端入口 |
| `D:\Mini_hot\dsh-plugin\lib\client.js` | 插件客户端 UI（按钮组件） |
| `D:\Mini_hot\dsh-plugin\cordis.patch.yml` | DSH 注入配置 |
| `D:\Mini_hot\dsh-plugin\package.json` | 包描述 |

---

> 最后更新：2026-08-26 17:12
