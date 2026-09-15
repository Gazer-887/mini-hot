# Mini_hot 迷你今日热榜 🔥

> 聚合 **10 大平台**实时热榜的单页应用。纯前端直连公开 API（CORS 开放、无后端），UI 暖色治愈系原创设计。

**🚀 线上体验：https://gazer-887.github.io/mini-hot/**

---

## ✨ 功能

### 热榜核心
- 📊 **10 平台聚合**：微博 / 知乎 / B站 / 抖音 / 小红书 / 今日头条 + 掘金 / V2EX / CSDN / HackerNews
- 🔄 平台切换 + 一键刷新 + 更新时间显示
- 🔥 热度值归一化（裸数字 / `万` / `w缩写` / `热度:`前缀 / 空值 / HN points）
- 🌐 每条可跳转原平台，WebView 环境自动兜底（微信/QQ/钉钉等不跳出）

### 体验增强
- 🎨 **5 主题**：暖阳 / 薄荷 / 樱粉 / 墨夜 / 深空（CSS 变量全局换色，记住偏好 + 防 FOUC）
- 💬 **金句系统**：10 分钟时间桶轮换 + 漂流瓶投句（用户金句均匀混入）
- 👁️ **已读即隐藏**：点击即消失 + FLIP 动画补位 + 自然日重置 + 「今日已看 N 条」彩蛋（≥40）
- ⭐ **书签收藏**：localStorage 持久化，独立收藏视图
- 📱 **移动端优化**：Tab 横向滚动 + 触摸热区 + 滚动位置恢复（双写 session/localStorage）

### 工程化
- 💪 加载 / 错误 / 空三态兜底，单平台挂不影响其他
- 🛡 **配额感知** + 429/网络错误**指数退避** + localStorage 缓存（10 分钟 TTL）
- 🔄 **Failover 降级**：主源失败时 24h 内过期缓存兜底 + UI 提示
- 🛡 **Error Boundary**：全局异常捕获，防白屏
- 📱 **PWA**：手写 manifest + service worker（缓存 app shell，不缓存 API）

## 🧩 数据源

| 平台 | 数据源 |
|------|--------|
| 微博/知乎/B站/抖音/小红书/头条/掘金/V2EX/CSDN | `uapis.cn`（CORS 开放，前端直连） |
| HackerNews | Algolia `hn.algolia.com`（CORS 开放） |

- **无后端 / BFF**，数据源抽象（`PlatformMeta.source`），加平台只需在 `data/platforms.ts` 加一行
- ⚠️ uapis 有配额（ip-daily 2000/天），已做缓存 + 配额感知 + 过期缓存降级

## 🛠 技术栈

| 层 | 选型 |
|----|------|
| 构建 | Vite 5 + React 18 + TypeScript 5 |
| 样式 | Tailwind CSS 3.4（CSS 变量主题） |
| 状态 | React hooks（useHotboard / useTheme / useFavorites / useQuote / useReadHistory） |
| 测试 | Vitest（**50 用例**） |
| 工程化 | ESLint flat config + GitHub Actions CI + PWA |

## 🚀 三态版本（单库 + 多壳）

核心 `src/` 全共享，不同形态只是不同的运行「壳」：

| 形态 | 壳 | 状态 |
|------|----|------|
| 🌐 Web | Vite 静态站点 | ✅ **已上线** |
| 🤖 Android | Capacitor 6.2.1 | ✅ debug 3.8MB + release 3.0MB 已签名 |
| 🪟 Windows | Electron | 📋 计划 |
| 🔌 DSH 集成 | better-sidebar Tab | ⏸️ 暂缓 |

> 架构：**单一代码库 + 多薄壳**，壳只放入口/配置/构建脚本，避免三分支代码漂移。

## ⚡ 快速开始

```bash
npm install          # 安装依赖
npm run dev          # 开发模式（http://localhost:5173）
npm run build        # 生产构建（dist/）
npm run preview      # 预览构建产物（http://localhost:5174）
npm test             # 运行单测（50 用例）
npm run lint         # ESLint 检查
```

## 📁 目录结构

```
src/
├── main.tsx                  # React 入口（含 PWA 注册）
├── App.tsx                   # 顶层布局 + ErrorBoundary
├── index.css                 # Tailwind 指令 + 5 主题 CSS 变量
├── types.ts                  # 类型定义
├── api/hotboard.ts           # 数据源封装 + 缓存 + 配额 + 退避 + Failover
├── data/
│   ├── platforms.ts          # 10 平台元信息
│   └── quotes.ts             # 内置金句库
├── hooks/
│   ├── useHotboard.ts        # 热榜数据管理（竞态取消/三态/懒加载）
│   ├── useTheme.ts           # 5 主题切换（记住偏好）
│   ├── useFavorites.ts       # 书签收藏
│   ├── useReadHistory.ts     # 已读即隐藏（自然日重置）
│   ├── useQuote.ts           # 金句轮换（10 分钟桶 + 洗牌）
│   ├── useUserQuotes.ts      # 漂流瓶投句（localStorage）
│   ├── useFlip.ts            # FLIP 动画补位
│   ├── useScrollRestore.ts   # 移动端滚动恢复
│   └── useIsWebView.ts       # 受限 WebView 检测
├── utils/formatHeat.ts       # 热值归一化
└── components/
    ├── Header.tsx            # 标题 + 更新时间 + 刷新 + 主题色点
    ├── PlatformTabs.tsx      # 平台切换 Tab（accent 色跟随主题）
    ├── HotItemCard.tsx       # 热榜单条卡片（host 徽标 / rank 排名）
    ├── HotBoard.tsx          # 主体：全部/单平台/收藏 三视图 + stale 提示
    ├── FavoritesView.tsx     # 收藏视图
    ├── QuoteBar.tsx          # 顶部金句条
    ├── StateBox.tsx          # 加载/错误/空 三态组件
    └── ErrorBoundary.tsx     # 全局异常捕获
```

## 💻 开发环境

- Node.js **22.22.2**（managed）/ npm 10.9.7
- npm 镜像：`https://registry.npmmirror.com`
- JDK 17（Android 构建用）/ Android SDK 34

## 📄 项目文档

- `NOTEBOOK/` — 进度 / 决策 / 经验 / 问题
- `PLAN/` — 实施计划
- `.workbuddy/memory/` — 跨会话工作日志

---

> 本应用为原创 UI，仅使用公开聚合/官方接口，不爬取各平台官网。
