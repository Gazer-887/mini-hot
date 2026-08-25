# Mini_hot 迷你今日热榜

> 一个聚合多个平台实时热榜的单页应用。数据来自公开第三方聚合接口，UI 原创。
> 技术栈：Vite 5 + React 18 + TypeScript 5 + Tailwind CSS 3.4

## 功能

- 📊 聚合 6 大平台热榜：微博 / 知乎 / B站 / 抖音 / 小红书 / 今日头条
- 🔄 平台切换 + 一键刷新 + 更新时间显示
- 🔥 热度值格式化（数字 / 万 / 亿）
- 🌐 每条可跳转原平台对应内容
- 💪 加载态 / 错误态 / 空态兜底，接口异常不崩页面

## 技术说明

- **数据源**：`https://uapis.cn/api/v1/misc/hotboard?type={weibo|zhihu|bilibili|douyin|xiaohongshu|toutiao}`
- **接口特性**：CORS 全开放（任意 Origin 回显 `Access-Control-Allow-Origin`），前端直连，无需后端/BFF
- **返回结构**：`{ type, update_time, list: [ { index, title, url, hot_value, extra? } ] }`
- ⚠️ `hot_value` 各平台格式不一（数字 / "NNN万" / "NZ播放" / "N.Nw" / 空），已做归一化

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式（http://localhost:5173）
npm run dev

# 构建
npm run build

# 预览构建产物
npm run preview
```

## 目录结构

```
Mini_hot/src/
├── main.tsx          # React 入口
├── App.tsx           # 顶层布局
├── index.css         # Tailwind 入口 + 全局样式
├── types.ts          # HotItem / Platform 类型
├── api/hotboard.ts   # 接口封装 + 平台配置 + 归一化
├── data/platforms.ts # 6 平台元信息（名称 / type / 颜色）
└── components/
    ├── Header.tsx        # 标题 + 更新时间 + 刷新
    ├── PlatformTabs.tsx  # 平台切换
    ├── RankItem.tsx      # 单条热榜
    └── HotBoard.tsx      # 主体 + 加载 / 错误态
```

## 开发环境

- Node.js v24.17.0 / npm 11.13.0
- npm 镜像：`https://registry.npmmirror.com`
