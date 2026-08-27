# Mini_hot DSH 集成方案（热榜页 + agent 可读可操作）

> 创建时间：2026-08-25 | 最后更新：2026-08-26 | 状态：**技能+插件已完成，待 Netlify 部署**

---

## 一、需求（主人 2026-08-25 确认）

1. DSH 里加一个**快捷按钮**（位置：**自动化按钮的邻右边**），点击打开热榜页面
2. **关键**：DSH 的 AI agent 能**自动读取这个页面**的信息 + **操作它**（切平台/刷新），像 DSH 的**自动化插件**那样——不是靠用户主动发图片/链接，而是 agent 本身具备**"看这个页面"和"操作这个页面"**的能力

---

## 二、方案

热榜保持独立 Web 应用（已就绪，10 平台），通过 **Netlify** 部署为在线 URL。DSH 侧做两件事：

1. **`/hotboard` 技能**：agent 收到命令后，用 DSH 自带的 **browser 工具**打开热榜 URL → 读取渲染后页面内容（各平台标题/热度）→ 结构化展示；用户说"切到掘金/刷新/看微博"，agent 用 browser **点击操作**页面
2. **DSH 客户端插件**：注册一个 **better-sidebar 侧边栏 Tab（`ctx.betterSidebar.registerTab`，order=60，single:true）**，Tab 内 iframe 嵌入热榜

---

## 三、进度（2026-08-26）

| 任务 | 状态 | 详情 |
|------|------|------|
| `/hotboard` 技能 | ✅ 完成 | `~/.dsh/skills/hotboard/SKILL.md` |
| DSH 热榜 Tab 插件 | ✅ 完成+已安装 | `D:\Mini_hot\dsh-plugin/`（better-sidebar Tab，v0.2.0），已注入 dump-config |
| 本地验证 | ✅ 完成 | dev server + browser 工具全场景通过 |
| Netlify 部署 | ⏳ 待主人操作 | 需登录 → `netlify deploy --prod --dir=dist` |
| DSH 重启 | ⏳ 待主人操作 | 重启后侧边栏出现「🔥 热榜」Tab（硬刷新浏览器即可热加载，无需重启 DSH）|

---

## 四、待完成（需主人操作）

### 1. Netlify 部署（获得在线 URL）
```bash
# 主人需在终端执行（需先 netlify login）
cd D:\Mini_hot
netlify deploy --prod --dir=dist --site=<your-site-name>
```
部署成功后更新两处 URL：
- `D:\Mini_hot\dsh-plugin\lib\client.js` 第 14 行：`HOTBOARD_URL`
- `~/.dsh/skills/hotboard/SKILL.md` 第二节：在线地址

### 2. DSH 重启
```
完全关闭 DSH Desktop（/restart 命令），重新打开使插件生效
```

---

## 五、风险/依赖

- Netlify 部署需主人账号授权（token 为敏感凭证，用后撤销、不写入 git/代码）
- 热榜已演进为 **better-sidebar 侧边栏 Tab**：client.js 用 `ctx.betterSidebar.registerTab` 注册（order=60，single:true），Tab 内 iframe 嵌入热榜；依赖 `dsh-better-sidebar` 0.12.3（桌面 profile 已默认启用）
- agent 读热榜页依赖 DSH browser 工具；页面为 JS 渲染，需等 fetch 完成才能读到（browser snapshot 可见）

---

> 最后更新：2026-08-26 17:12
