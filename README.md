# Mini_hot 迷你今日热榜 🔥

> 一个聚合 **10 大平台**实时热榜的单页应用。数据来自公开接口（CORS 全开放、前端直连），UI 完全原创。
> 技术栈：**Vite 5 + React 18 + TypeScript 5 + Tailwind CSS 3.4**

---

## ✨ 功能

- 📊 **10 大平台热榜**：微博 / 知乎 / B站 / 抖音 / 小红书 / 今日头条 + **掘金 / V2EX / CSDN / HackerNews**
- 🔄 平台切换 + 一键刷新 + 更新时间显示
- 🔥 热度值归一化（裸数字 / `"NNN万"` / `"w缩写"` / `"热度:"前缀` / 空值）
- 🌐 每条可跳转原平台对应内容
- 🌙 **深色模式**（CSS 变量 + `darkMode:class`，记住偏好 + 防首屏闪白）
- ⭐ **书签收藏**（localStorage 持久化，独立「收藏」视图）
- 📱 **移动端优化**（Tab 横向滚动 + 触摸热区）
- 💪 加载 / 错误 / 空三态兜底，单平台挂不影响其他
- 🛡 **配额感知** + 429/网络错误**指数退避** + localStorage 缓存（10 分钟 TTL）

## 🧩 数据源

| 平台 | 数据源 |
|------|--------|
| 微博/知乎/B站/抖音/小红书/头条/掘金/V2EX/CSDN | `https://uapis.cn/api/v1/misc/hotboard?type=X`（CORS 反射式开放，前端直连） |
| HackerNews | Algolia `https://hn.algolia.com/api/v1/search?tags=front_page`（CORS 开放） |

- 前端直连，**无后端 / BFF**；数据源抽象（`PlatformMeta.source`），后续加平台好扩展
- ⚠️ uapis 有配额（ip-daily 2000/天、visitor-quota 1500 credits），已做缓存 + 配额感知降级
- ⚠️ **GitHub trending 页 CORS 不开放**，暂未支持（`api.github.com` 虽开放但无认证限速 10/min，接入需评估）

## 🛠 技术栈

- **构建**：Vite 5 + React 18 + TypeScript 5（锁版本防漂移）
- **样式**：Tailwind CSS 3.4（CSS 变量主题，支持 light / dark）
- **状态**：React hooks（`useHotboard` / `useTheme` / `useFavorites`）
- **测试**：Vitest（**22 用例**，覆盖缓存/退避/HackerNews 分派/热值归一化）
- **工程化**：ESLint（flat config）+ GitHub Actions CI + PWA

## 🚀 三态版本（单库 + 多壳）

核心 `src/` 一份全共享，三种形态只是不同的运行「壳」：

| 形态 | 壳 | 状态 |
|------|----|------|
| 🌐 Web（本仓库） | Vite 静态站点 | ✅ |
| 🪟 Windows | Electron | 📋 计划 |
| 🤖 Android | Capacitor | 📋 计划 |
| 🔌 DSH 集成 | 独立页面 + agent 浏览器读取 | 📋 计划 |

> 架构共识：**单一代码库 + 多薄壳**，避免三分支三拷贝导致代码漂移/合并地狱。

## ⚡ 快速开始

```bash
npm install          # 安装依赖
npm run dev          # 开发模式（http://localhost:5173）
npm run build        # 生产构建（dist/）
npm run preview      # 预览构建产物
npm test             # 运行单测（vitest）
npm run lint         # ESLint 检查
```

## 📁 目录结构

```
Mini_hot/src/
├── main.tsx              # React 入口（含 PWA 生产注册）
├── App.tsx               # 顶层布局（useHotboard/useTheme/useFavorites）
├── index.css             # Tailwind 三行指令 + 主题 CSS 变量(:root/.dark)
├── vite-env.d.ts         # Vite 客户端类型
├── types.ts              # 类型（HotItem/Platform/QuotaInfo/HackerNews）
├── api/hotboard.ts       # 数据源封装 + 缓存 + 配额 + 退避（uapis/Algolia 双路）
├── data/platforms.ts     # 10 平台元信息（名称/颜色/数据源）
├── hooks/
│   ├── useHotboard.ts    # 每平台拉取（竞态取消/三态/懒加载）
│   ├── useTheme.ts       # 深色/浅色切换（记住偏好）
│   └── useFavorites.ts   # 书签收藏（localStorage）
├── utils/formatHeat.ts   # 热值归一化（多态处理）
└── components/
    ├── Header.tsx        # 标题 + 更新时间 + 刷新 + 主题切换
    ├── PlatformTabs.tsx  # 平台切换（横向滚动）
    ├── RankItem.tsx      # 单条热榜（单平台视图，含收藏）
    ├── HostItem.tsx      # 单条热榜（全部视图，带平台徽标 + 收藏）
    ├── HotBoard.tsx      # 主体：三态 + 全部/单平台/收藏 视图
    ├── FavoritesView.tsx # 收藏视图
    └── StateBox.tsx      # 加载/错误/空 三态组件
```

## 💻 开发环境

- Node.js **v24.17.0** / npm **11.13.0**
- npm 镜像：`https://registry.npmmirror.com`
- 锁版本：React 18 / Vite 5 / TypeScript 5 / Tailwind 3.4（防漂移）

## 📄 项目文档

- `NOTEBOOK/` — 进度 (`progress`)、决策 (`decisions`)、经验 (`learnings`)、问题 (`problem`)
- `PLAN/` — 实施计划（`plan1` 立项 · `plan2` 待办 · `plan3` 三态 · `plan4` DSH 集成）
- `docs/项目上下文.md` — 项目上下文与开发笔记

---

> 本应用为原创 UI，仅使用公开聚合/官方接口，不爬取各平台官网。
