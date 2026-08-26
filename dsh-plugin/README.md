# dsh-hotboard — DSH 热榜快捷按钮插件

> 在 DSH 桌面端侧边栏底部注册「🔥 热榜」按钮，点击打开 Mini_hot 热榜网页。

---

## 安装

```bash
dsh plugin --profile desktop add file:D:/Mini_hot/dsh-plugin
```

安装后重启 DSH Desktop 生效。

---

## 功能

- 侧边栏底部新增「🔥 热榜」按钮（社区市场按钮右侧）
- 点击打开热榜网页（新标签页）
- 热榜支持 10 个平台：微博/知乎/B站/抖音/小红书/头条/掘金/V2EX/CSDN/HackerNews
- 纯前端触发，无需后端服务

---

## 配置

编辑 `lib/client.js` 第 14 行修改热榜地址：

```js
const HOTBOARD_URL = 'https://mini-hot.netlify.app' // 生产
// const HOTBOARD_URL = 'http://localhost:5173'       // 开发
```

---

## 依赖

- DSH Desktop >= 0.0.1
- `slots`、`locale` 服务（内置）

---

## 文件结构

```
dsh-plugin/
├── package.json           # 包描述
├── cordis.patch.yml       # DSH 注入配置
├── dsh.plugin.json        # 插件元数据
├── README.md
└── lib/
    ├── index.js           # 服务端入口（无服务逻辑）
    └── client.js          # 客户端 UI 注入（按钮组件）
```
