# 关键决策记录

- D-001 — 缓存强制刷新通过 `fetchHot(key, force)` 绕过 localStorage — 2026-08-25 — 原实现手动刷新时 fetchHot 仍优先命中缓存，导致"刷新"实际不生效 — 决策：fetchHot 增加 force 参数，force=true 时跳过缓存直接请求 — 理由：手动刷新应强制拉取最新数据 — 影响：`api/hotboard.ts` + `useHotboard` 传递 force

- D-002 — 配额感知降级：解析 RateLimit/Uapi-Credits-* 响应头 — 2026-08-25 — 第三方接口有配额/限流，耗尽即 429 — 决策：api 层解析配额头写入模块级 `quotaInfo`，Header 在 `status==='limited'` 时显示友好提示 — 理由：让用户感知配额被限，降低迷惑 — 影响：`api/hotboard.ts` + `Header.tsx`

- D-003 — 错误隔离指数退避 — 2026-08-25 — 单平台 429/网络错误不应一次性放弃 — 决策：doFetch 对 429/网络错误做退避重试（MAX_RETRY=2，1s/2s），超限再抛错 — 理由：缓解瞬时抖动，同时避免烧配额 — 影响：`api/hotboard.ts`

- D-004 — 深色模式用 CSS 变量 + tailwind `darkMode:'class'` — 2026-08-25 — 组件多，逐处添加 `dark:` 变体工作量大且易漏 — 决策：自定义色改为 `rgb(var(--x) / <alpha-value>)`，`:root`/`.dark` 定义变量实现全局换色；组件仅对白底卡片/选中态补 dark 变体 — 理由：全局换色最优雅，省去大量组件改动 — 影响：`tailwind.config.js`/`index.css`/`useTheme`/`App`/`Header`/各组件

- D-005 — 收藏功能用 useFavorites hook + `'fav'` 视图 — 2026-08-25 — 需要本地收藏热榜项 — 决策：`useFavorites`（localStorage `minihot:favorites`，toggle/isFavorite/remove），ViewKey 加 `'fav'`，新增 `FavoritesView` 渲染收藏 — 理由：本地持久化、可取消收藏 — 影响：`useFavorites`/`useHotboard`/`App`/`HotBoard`/`FavoritesView`/`RankItem`/`HostItem`/`PlatformTabs`

- D-006 — 移动端 tab 横向滚动 — 2026-08-25 — 8 个 tab 在手机上拥挤 — 决策：PlatformTabs 改 `overflow-x-auto` + `shrink-0 whitespace-nowrap`，增大触摸热区（py-1.5→py-2） — 影响：`PlatformTabs.tsx`

- D-007 — ESLint 使用 flat config（eslint 9/10） — 2026-08-25 — 项目缺 lint — 决策：`eslint.config.js` + `@eslint/js` + `typescript-eslint` + `react-hooks` + `react-refresh` + `globals`，`package.json` 加 `lint` script — 影响：`eslint.config.js`/`package.json`

- D-008 — GitHub Actions CI — 2026-08-25 — push 自动验证 — 决策：`.github/workflows/ci.yml`：npm ci → tsc → lint → test → build — 影响：`.github/workflows/ci.yml`

- D-009 — PWA 采用手写 manifest + service worker — 2026-08-25 — 需要离线壳 — 决策：`public/manifest.webmanifest` + `public/sw.js`（缓存 app shell、网络优先、不缓存第三方 API），main.tsx 生产环境注册 — 理由：少依赖、行为可控 — 影响：`public/webmanifest`/`sw.js`/`index.html`/`main.tsx`

- D-010 — 补 `src/vite-env.d.ts` 引入 vite/client 类型 — 2026-08-25 — `import.meta.env` 在 tsc 下缺类型 — 决策：新增 `vite-env.d.ts` 引用 `/// <reference types="vite/client" />` — 影响：`src/vite-env.d.ts`
- D-011 — 数据源抽象：PlatformMeta 增加 source 字段 — 2026-08-25 — 新增开发者社区板块（掘金/V2EX/CSDN/HackerNews），各平台数据源不同 — 决策：`source: 'uapis'|'hackernews'`，`fetchHot` 按 source 分派到 `doFetch`(uapis) / `fetchHackerNews`(Algolia)；掘金热度带"热度:"前缀、V2EX 热值为空(showHeat=false)、CSDN 用"w"、HN 用 points — 理由：不同平台数据源不同，需抽象封装，保持纯前端 CORS 直连 — 影响：`types.ts`/`platforms.ts`/`hotboard.ts`
- D-012 — GitHub 板块暂缓加入 — 2026-08-25 — 主人想加 GitHub，但 trending 页 CORS 不开放(前端 fetch 会被拦截)，api.github.com 虽 CORS 开放但无认证限速 10/min、且非真正 trending — 决策：暂不加入 GitHub，避免破坏"纯前端直连"架构与产品稳定性；HackerNews 用 Algolia(CORS 开放)替代 — 理由：主人强调"注意对原产品冲击和影响" — 影响：无(GitHub 未实现)
