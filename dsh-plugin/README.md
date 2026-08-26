# dsh-hotboard — DSH 热榜侧边栏 Tab 插件

> 通过 **better-sidebar** 的 `ctx.betterSidebar.registerTab` 注册「🔥 热榜」侧边栏 Tab，Tab 内 iframe 嵌入 Mini_hot 热榜页面。

---

## 安装

**前置**：需先安装 [dsh-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar)（桌面 profile 已默认启用）。

```bash
# 在 DSH 所在环境的终端执行（DSH home 下）
cd ~/.dsh
dsh plugin --profile desktop add file:D:/Mini_hot/dsh-plugin
```

装完**硬刷新浏览器**（Cmd/Ctrl+Shift+R）——client 改动热加载，无需重启 DSH。

---

## 功能

- 侧边栏「+」菜单新增 **🔥 热榜** Tab（order=60，排在内置浏览器 tab 之后）
- 点击 Tab，侧边栏内 iframe 嵌入热榜页面
- 热榜支持 10 个平台：微博/知乎/B站/抖音/小红书/头条/掘金/V2EX/CSDN/HackerNews
- 单例 Tab（`single: true`），重复打开只会聚焦已有 Tab

---

## 配置

编辑 `lib/client.js` 第 10 行的 `HOTBOARD_URL`：

```js
const HOTBOARD_URL = 'http://localhost:5173'          // 开发（需先 npm run dev）
// const HOTBOARD_URL = 'https://mini-hot.netlify.app' // 生产（Netlify 部署后）
```

---

## 依赖

- DSH Desktop >= 0.0.1
- **dsh-better-sidebar** 0.12.3（提供 `ctx.betterSidebar` 服务）
- `react`（better-sidebar client bundle 已打包）

---

## 关键技术点

`client.js` 用宿主 `window.__ModuleLoader__.load({...})` 注册，`factory: (require) => {...}`，`inject=['betterSidebar']`，在 `apply(ctx)` 里：

```js
ctx.betterSidebar.registerTab({
  id: 'hotboard',
  title: () => '🔥 热榜',
  single: true,
  component: (props) => <iframe src={HOTBOARD_URL} />,
})
```

---

## 文件结构

```
dsh-plugin/
├── package.json           # 包描述（dsh.client + peerDeps dsh-better-sidebar）
├── cordis.patch.yml       # DSH 注入配置
├── dsh.plugin.json        # 插件元数据
├── README.md
└── lib/
    ├── index.js           # 服务端入口（无服务逻辑）
    └── client.js          # 客户端 UI 注入（better-sidebar Tab）
```
