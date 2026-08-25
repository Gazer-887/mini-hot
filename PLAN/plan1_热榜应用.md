# Mini_hot 热榜聚合应用 — 实施计划

> 依据：用户需求"把 https://191d2bb...workbuddy.link/ 扒过来"，已确认复刻公开数据接口、UI 全新原创
> 制定：2026-08-23 | 状态：草稿 | 负责人：深深（主助手）

---

## 一、目标与范围

### 目标
在 `D:\Mini_hot` 新建一个 **Vite + React + TypeScript** 热榜聚合单页应用，聚合微博、知乎、B站、抖音、小红书、今日头条 6 个平台的热榜数据。数据架构参考原站（公开第三方接口），**UI/文案/设计全新原创**，不照抄原站。

### 范围
- ✅ 包含：
  - 热榜数据来自公开接口 `https://uapis.cn/api/v1/misc/hotboard?type={...}`
  - 6 平台切换（全部/微博/知乎/B站/抖音/小红书/头条）
  - 每平台 Top N 列表，含排名、标题、热度值、跳转链接
  - 平台切换、刷新按钮、更新时间、热度格式化（如 1146.8万）
  - 加载态 / 错误态兜底（接口失败时优雅降级）
  - 原创极简/治愈系深色或浅色主题，响应式
- ❌ 不包含：
  - 不照抄原站的金句漂流瓶、具体文案、排版、设计稿
  - 不做后端 / BFF（接口无 Key，前端直连）
  - 不做数据持久化、账号、评论、搜索
  - 不做 PWA 安装、离线缓存（可选后续）
  - 不爬取各平台官网（仅用聚合接口）

## 二、技术方案

- **构建**：Vite 5 + React 18 + TypeScript 5 + Tailwind CSS 3.4（锁版本安装）
- **依赖**：`react@18.2`、`react-dom@18.2`、`vite@5`、`@vitejs/plugin-react@4`、`typescript@5`、`tailwindcss@3.4`、`postcss@8`、`autoprefixer@10`、`@types/react@18`、`@types/react-dom@18`、`vitest`（测试）
- **StrictMode 策略**：**明确保留** React 18 StrictMode（开发期暴露真实竞态问题），但依赖 `useHotboard` 的 AbortController 消除双 fetch 副作用；生产构建不受影响。若实测发现双请求仍干扰，则关闭 StrictMode（在 main.tsx）→ 记录为决策。
- **部署 base 路径**：若部署到子路径（非根域名）需配 Vite `base`，否则 `npm run build` 产物引用 `/assets/` 会 404。部署步骤：`npm run build` → 产物在 `dist/` → 用静态托管（如 GitHub Pages / Vercel / Netlify）发布，并验证 base 路径。
- **数据流**：`useHotboard(type)` hook（AbortController + 竞态 + 三态 + 缓存）→ `fetch(...hotboard?type=X)` → `formatHeat` → 渲染。`api/hotboard.ts` 只负责**接口封装与归一化**，组件不裸 fetch（清晰分层）。
- **网络直连可行性（已实测确认）**：接口 `uapis.cn/api/v1/misc/hotboard` **CORS 反射式开放**（任意 Origin 均回显 `Access-Control-Allow-Origin`，实测 localhost:5173 / my-deploy.example.com / preview:4173 都过，OPTIONS 预检 204）。因此**前端可直连，无需 BFF/代理**。Referer/UA 均不校验。⚠️ 但部署到生产域名需**重新验证**（反射式 ACAO；`file://` 等非 http 源会失效）。

### 接口实测字段（2026-08-23 Node 实测，双子代理复核一致）
- 统一返回：`{ type, update_time, list: [ { index, title, url, hot_value, extra? } ] }`
- ⚠️ **字段已实测为固定这 5 个**：`index`(现成排名，连续 1..N)、`title`、`url`、`hot_value`、`extra?`。计划早期疑似的 `word/name/hot/num/mobileUrl/mobil_url/link` **全部不存在**（修正：不要再做多候选字段兜底，避免过度设计）。
- `update_time` 为 ISO 字符串，可直接用作 Header 更新时间。
- ⚠️ `hot_value` **恒为字符串**，3 种形态（最需关注的归一化对象）：
  | 平台 | hot_value 实测 | 处理 |
  |------|----------------|------|
  | 微博 weibo | `"11468191"`（裸数字串） | 转数字 → `1146.8万` |
  | 知乎 zhihu | `"1798 万热度"`（数字+空格+单位） | 提纯数字 → `1798万` |
  | B站 bilibili | `"2142239播放"`（数字+中文后缀"播放"） | 剥后缀 → `214.2万` |
  | 抖音 douyin | `"11821659"`（裸数字串） | 转数字 → `1182.2万` |
  | 小红书 xiaohongshu | `"920.8w"`（数字+小数+缩写"w"） | 解析 w=万 → `920.8万` |
  | 头条 toutiao | `""`（空） | 显示"--"或"热"兜底 |
- 各平台条目数：weibo 50 / zhihu 30 / bilibili 100 / douyin 50 / xiaohongshu 20 / toutiao 50（展示统一 cap 50）
- 限流/配额头（实测）：`RateLimit-Policy`(ip-daily 2000/天、visitor-rate 52/13s、visitor-quota 1500 credits)、`RateLimit`、`Uapi-Debit-Status`、`Uapi-Stop-On-Empty=true`。429 与网络错误需区分处理。

### 归一化函数设计（formatHeat，独立文件 src/utils/formatHeat.ts）
输入恒为 string，3 种形态：裸数字串 / 数字+中文后缀(播放) / 数字+小数+缩写(w·万·亿)。按平台分支：
1. 先 `String(v)` 去空格；
2. 用正则剥离非数字/小数点（`/[^\d.]/g`）提纯数字；
3. 识别量级词：`w`→万、`万`→万、`亿`→亿，无词则按数值分档（≥1亿→亿、≥1万→万）；
4. 空值/解析失败 → 返回 `"--"`。
```ts
export function formatHeat(raw: string): string {
  if (!raw) return "--";
  const s = String(raw).trim();
  const m = s.match(/([\d.]+)\s*(亿|万|w|W)?/);
  if (!m) return s;
  let num = parseFloat(m[1]);
  let unit = (m[2] ?? "").toLowerCase();
  if (unit === "w") unit = "万";
  if (unit) return keepDecimals(num) + unit;
  if (num >= 1e8) return keepDecimals(num/1e8) + "亿";
  if (num >= 1e4) return keepDecimals(num/1e4) + "万";
  return cleanNumber(num);
}
```
（`keepDecimals` 保留 1 位小数并去尾 0；`cleanNumber` 处理整数/带千分位。）

### 目录结构（项目根 + src 全会列出）
```
Mini_hot/                 # 项目根（已建）
├── index.html            # Vite 入口 HTML（mount #root + 引 main.tsx）
├── vite.config.ts        # Vite 配置（react 插件 + @ 别名 + server.port 5173）
├── tsconfig.json         # TS 配置（参考 src 目录）
├── postcss.config.js     # Tailwind 3 必需（plugins: [tailwindcss, autoprefixer]）
├── tailwind.config.js    # Tailwind content: ["./index.html","./src/**/*.{ts,tsx}"]
├── package.json          # scripts: dev/build/preview
├── src/
│   ├── main.tsx          # React 入口（mount <App/>，严格按是否需要决定 StrictMode）
│   ├── App.tsx           # 顶层布局 + 全局状态
│   ├── index.css         # Tailwind 三行指令 + 全局样式
│   ├── types.ts          # HotItem(热值/extra 可空化) / Platform / 平台状态
│   ├── api/hotboard.ts   # 接口封装 + 缓存层 + 平台配置 + 归一化 + 错误隔离
│   ├── hooks/useHotboard.ts # 每平台拉取 hook（AbortController + 竞态 + 三态）
│   ├── utils/formatHeat.ts  # 热值归一化（分平台分支处理）
│   ├── data/platforms.ts # 6 平台元信息（名称/type/颜色/热值单位/是否显示热值/有封图）
│   └── components/
│       ├── Header.tsx        # 标题 + 更新时间 + 刷新
│       ├── PlatformTabs.tsx  # 平台切换（含全部）
│       ├── HostItem.tsx      # 单条热榜项（含 RankItem 复用逻辑）
│       ├── RankItem.tsx      # 单条热榜（封面/标题/热度/链接）
│       ├── HotBoard.tsx      # 主体：三态 + 列表
│       └── StateBox.tsx      # 统一 加载/错误/空 三态组件
└── docs/ NOTEBOOK/ PLAN/ scripts/ tests/ resources/   # 已建的非源码目录
```

## 三、实施步骤

> 风险分层排期：先出一版**能跑的核心版**，再做**缓存/配额降级**，最后上线前做**生产验证**。

| 序号 | 步骤 | 预计耗时 | 负责人 | 前置依赖 |
|:----:|------|:--------:|:------:|----------|
| 1 | 初始化工程：写 index.html / vite.config.ts / tsconfig.json / postcss.config.js / tailwind.config.js / package.json（锁 React18+Vite5+TS5+Tailwind3.4 版本），`npm install` | 30 min | 深深 | 无 |
| 2 | 写 API 层：平台配置表 + 接口封装 + **缓存层**（localStorage + 过期）+ 热值归一化（分平台分支）| 25 min | 深深 | 步骤 1 |
| 3 | 写 hooks/useHotboard：**AbortController + 竞态取消 + 每平台独立三态**（loading/error/data）| 20 min | 深深 | 步骤 2 |
| 4 | 写 React 组件：App/Header/PlatformTabs/RankItem/HostItem/HotBoard + 统一 StateBox 三态组件 | 35 min | 深深 | 步骤 3 |
| 5 | 原创 UI：Tailwind 主题 + 响应式 + 交互态 + 各平台差异化渲染（热值单位/封面）| 25 min | 深深 | 步骤 4 |
| 6 | **加单测**：formatHeat 归一化 + 错误隔离（vitest）各平台热值用例 | 20 min | 深深 | 步骤 2 |
| 7 | 构建验证：TS 编译 + Vite build + 产物 CSS 非空检查 + dev 预览 | 15 min | 深深 | 步骤 5-6 |
| 8 | **生产域名 CORS 验证**：真实 URL 发 OPTIONS+GET，确认反射 ACAO 通过；file:// 等非 http 源降级说明 | 10 min | 深深 | 步骤 7 |
| 9 | 交叉验证：子代理独立审查接口/组件/样式/缓存策略 | 15 min | 子代理 x2 | 步骤 8 |
| 10 | 落地：提交 git + 更新 NOTEBOOK/PLAN 文档 | 10 min | 深深 | 步骤 9 |

> 合计约 195 min。被低估的耗时点：缓存/配额策略（架构决策非顺手）、StrictMode 竞态、热值多态、生产 CORS 验证、单测。

## 四、风险与应对

| 风险 | 概率 | 影响 | 应对 |
|------|:----:|:----:|------|
| **🔴 接口配额/限流**：非纯免费，`ip-daily`(2000次/天/IP) + `visitor-quota`(1500 credits) + `Uapi-Debit-Status: applied` + `Uapi-Stop-On-Empty: true`，耗尽即 403/429 | 高 | 高 | **前端缓存层**：localStorage 存热榜 + 过期（热榜约 10 分钟一刷）；**绝不每次 tab 切换/交互都发请求**，只拉当前 tab 且命中缓存不发；部署走共享出口 IP/代理/NAT 时配额被全体共享，需评估并发×刷新频率 vs 配额；可利用 `RateLimit`/`Uapi-Credits-*` 响应头做配额感知与降级 |
| **StrictMode 双 fetch + 切 tab 竞态**：开发模式 effect double-invoke → 6 平台×2=12 并发；快速切 tab 时慢请求覆盖新 tab 数据（各平台延迟不同，几乎必现）| 高 | 高 | `useEffect` 内 `AbortController`，cleanup 时 `abort`，判 `res.ok`/`cancelled`；或用 token 比较丢弃过期结果；**只拉当前 tab**，其余按需/缓存；明确是否需要 StrictMode |
| **CORS 反射式非 `*`**：返回 `Access-Control-Allow-Origin: <请求Origin>`（localhost 已验证通过），但生产域名必须重新验证；`file://` 等非 http 源会失效 | 中 | 高 | 上线前真实域名发 OPTIONS+GET 验证；若生产因跨域失败，备选 BFF/代理兜底（保留该权衡决策，不直接排除） |
| **热值多态**：`"11468191"`(数字串) / `"2142239播放"` / `"920.8w"`(小数缩写) / `"1798 万热度"` / 空字符串；douyin 嵌套 `extra`(封面/观看数)；各平台条数不一(20~100) | 高 | 中 | `formatHeat` **按平台分支解析**：weibo/douyin 数字归一、bilibili 剥"播放"、xiaohongshu 处理"w"、toutiao 判空显示"--"；`hot_value` 用 string 原样保留+可空；`extra` 用 `Record<string,unknown>` 不强约束；平台差异由 `data/platforms.ts` 配置驱动 |
| **错误/加载/空态**：某平台挂(超时/429/400/断网/解析失败)若直接渲染会白屏或 TypeError | 高 | 高 | `Promise.allSettled` 或**逐平台 fetch 错误隔离**：单平台失败仅该 tab 显示"加载失败重试"，不影响其他 5 平台；每平台独立 `{loading,error,data}`；统一 StateBox 三态组件；fetch 用 try/catch + AbortController 超时防慢平台永久 pending |
| **Tailwind 3.4 + Vite5 集成**：配置文件缺 content 配错会**静默生成空样式**（bg-red-500 全失效、页面裸 HTML，开发时不报错）| 中 | 高 | 步骤 1 显式列出 5 个工程文件；`tailwind.config.js` content 填 `["./index.html","./src/**/*.{ts,tsx}"]`；`index.css` 写 `@tailwind base/components/utilities` 三行；构建验证加"产物 CSS 非空/类生效"人工检查 |
| 版本漂移：`npm install` 默认装最新版(react19/vite8/ts7/tailwind4) | 高 | 高 | **锁版本**：`react@18.2`、`react-dom@18.2`、`vite@5`、`@vitejs/plugin-react@4`、`typescript@5`、`tailwindcss@3.4`、`postcss@8`、`autoprefixer@10` |
| 接口字段/结构漂移 | 中 | 中 | 归一化多候选字段兜底 + 单测覆盖；`Promise.allSettled` 容错 |
| 无持续集成/单测 | 中 | 中 | 补 vitest 单测（formatHeat + 错误隔离）；提交前跑通 |
| Node/npm 网络安装被墙 | 中 | 中 | 走 npmmirror 镜像（已配 `registry.npmmirror.com`）|

## 五、验证标准

- [ ] 步骤 1：`npm run dev` 能起 Vite，页面有骨架不报错；产物 CSS 非空，Tailwind 类生效（非裸 HTML）
- [ ] 步骤 2：API 层 6 平台全 fetch 成功；命中缓存不发请求；返回归一化数组
- [ ] 步骤 3：快速切 tab 无竞态脏数据；慢平台不覆盖新 tab；每平台独立三态
- [ ] 步骤 4：页面可切平台、每条有标题/热度/链接、有加载/错误/空态；单平台挂不影响其他 5 平台
- [ ] 步骤 5：响应式 + 主题生效，无布局错乱；平台差异化渲染（热值单位/封面）正确
- [ ] 步骤 6：vitest 单测通过（formatHeat 各平台热值用例 + 错误隔离）
- [ ] 步骤 7：`tsc` 零错误 + `vite build` 成功 + 产物 CSS 非空
- [ ] 步骤 8：生产域名 OPTIONS+GET 验证 CORS 通过；非 http 源降级说明
- [ ] 步骤 9：2 个子代理独立审查通过，diff 无盲区
- [ ] 整体验收：本地打开能看到 6 平台热榜、可切换、刷新正常、UI 原创美观、缓存生效、配额消耗可控

## 六、参考资源

- API 端点：`https://uapis.cn/api/v1/misc/hotboard?type={weibo|zhihu|bilibili|douyin|xiaohongshu|toutiao}`
- 返回结构（已实测）：`{ type, update_time, list: [ { index, title, url, hot_value, extra? } ] }`
- **配额响应头**（实测）：`RateLimit-Policy/ RateLimit/ Uapi-Debit-Status/ Uapi-Credits-* / Uapi-Stop-On-Empty`，前端可据此做配额感知
- 项目现有骨架：`D:\Mini_hot\`（src/docs/NOTEBOOK/PLAN/scripts/tests/resources）
- 规范：`writing-plans`、`working-norms`、`test-driven-development`

---

## 修订历史

| 日期 | 变更内容 | 变更原因 |
|------|----------|----------|
| 2026-08-23 | 初稿 | Mini_hot 立项，方向确认为热榜聚合应用 |
| 2026-08-23 | 补丁：配额缓存/StrictMode竞态/生产CORS/热值多态/三态健壮性/工程文件/单测/时间估算/部署步骤 | 2 个独立子代理交叉审查收敛（共识盲区），计划从"理想demo"升级为"生产稳健版" |

---

> 最后更新：2026-08-23
