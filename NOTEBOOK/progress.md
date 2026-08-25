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

## 2026-08-25 DSH 集成方案（热榜页 + agent 可读可操作）

- 需求：DSH 加**快捷按钮**（位置：自动化按钮邻右）打开热榜页；agent 能**自动读取 + 操作**热榜页（像 DSH 自动化插件，非用户发图/链接）
- 方案：Netlify 部署热榜在线 URL → `/hotboard` 技能（agent 用 DSH browser 打开 URL 读取/操作）+ DSH 客户端插件（快捷按钮，参考 dsh-community-market）
- 状态：**方案已定，待落地**（Netlify 首次使用需主人注册/授权；技能/按钮待做）
- 明日待办：① Netlify 部署（得在线 URL）② /hotboard 技能 ③ DSH 快捷按钮插件
- 详细见 `PLAN/plan4_DSH集成方案.md`；netlify-cli 已装好（113 包）
