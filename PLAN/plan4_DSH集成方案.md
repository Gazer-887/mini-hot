# Mini_hot DSH 集成方案（热榜页 + agent 可读可操作）

> 创建时间：2026-08-25 | 状态：**方案已定，待落地**（Netlify 部署 + 技能 + 快捷按钮，明日继续）

---

## 一、需求（主人 2026-08-25 确认）

1. DSH 里加一个**快捷按钮**（位置：**自动化按钮的邻右边**），点击打开热榜页面
2. **关键**：DSH 的 AI agent 能**自动读取这个页面**的信息 + **操作它**（切平台/刷新），像 DSH 的**自动化插件**那样——不是靠用户主动发图片/链接，而是 agent 本身具备**"看这个页面"和"操作这个页面"**的能力

> 注意：这**不同于**早期设想把完整 React 热榜 UI 塞进 DSH 侧边栏（DSH 客户端插件是纯 JS、侧边栏仅 ~280px、无路由，无法复用 TSX UI 且体验差）。改用**独立 Web 页面 + agent 用 DSH browser 访问**的方式，最贴合"agent 能看能操作"且绕过上述硬限制。

## 二、方案

热榜保持独立 Web 应用（已就绪，10 平台），通过 **Netlify** 部署为在线 URL。DSH 侧做两件事：

1. **`/hotboard` 技能**：agent 收到命令后，用 DSH 自带的 **browser 工具**打开热榜 URL → 读取渲染后页面内容（各平台标题/热度）→ 结构化展示；用户说"切到掘金/刷新/看微博"，agent 用 browser **点击操作**页面——完全像"自动化的插件"那样看和操作。
2. **DSH 客户端插件**：注册一个**快捷按钮（自动化按钮邻右）**，点击触发 `/hotboard`（或直接打开热榜）。

## 三、依赖顺序

1. **Netlify 部署热榜**（前置：agent 需要访问在线 URL，localhost 无法被 agent 通用访问）
2. `/hotboard` 技能（依赖已部署 URL）
3. DSH 快捷按钮插件（触发 /hotboard）

## 四、明日待办

- [ ] **Netlify 部署**：主人首次使用，需先注册/登录（login 或生成 Personal Access Token）→ 用已装好的 netlify-cli 部署 `dist/` → 得到在线 URL
- [ ] **建 `/hotboard` 技能**：`SKILL.md` 指导 agent 用 DSH browser 打开热榜 URL、读取、按指令操作
- [ ] **DSH 客户端插件**：自动化按钮旁快捷按钮（参考 `dsh-community-market`）
- [ ] 部署后验证：agent 能读到热榜、能操作（切平台/刷新）

## 五、风险/依赖

- Netlify 部署需主人账号授权（明天确认 login 或 token 方式；注意 token 为敏感凭证，用后撤销、不写入 git/代码）
- DSH 客户端插件纯 JS（React.createElement）；"自动化按钮邻右"的具体 slot 需查 DSH 源码确认
- agent 读热榜页依赖 DSH browser 工具；页面为 JS 渲染，需等 fetch 完成才能读到（browser snapshot 可见）

---

> 最后更新：2026-08-25
