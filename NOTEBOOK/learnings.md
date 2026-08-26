# 经验沉淀

- L-009 — DSH 客户端插件必须在 package.json 声明 `dsh.client` 字段 — 工具 — 之前只写了 `lib/client.js` + `id: hotboard` 的 patch，但 package.json 缺 `"dsh.client": { "platform": "web" }` 和 `exports["./client"]`，导致 DSH 启动时不收集该 client bundle，侧边栏按钮不出现 — 修复：package.json 加 `dsh.client` + `./client` export；client.js 用 `factory: (require) => {...}` 引入 react/react-jsx-runtime/@deepseek-ai/dsh-client-ui-primitives，`const inject = ['slots','locale']`，`exports.apply/inject` — 教训：写 DSH UI 插件先对照 community-market 的已知正确结构，别想当然

- L-008 — DSH 受管安装恢复事务（startup-unconfirmed 阻塞） — 运维 — `dsh plugin add` 装插件后重启 DSH，弹 `manual-plugin-install@unresolved requires a recovery choice after startup-unconfirmed` — 根因：受管安装记录 phase 停在非终态 `recovery-pending`（验证环节 `startup-unconfirmed` 未确认），`claimLocked` 只认终态放行 — 解决方案：确认安装实际成功（package.json 哈希 = 记录 after + node_modules 有包）后，备份 `state.json` 并把 phase 改为 `verified`、删 failureReason、补 verifiedAt — 教训：装插件后要正常退出 DSH 让验证跑完；若弹窗已出现可直接点"确认恢复"，避免每次手动改 state.json（hotboard 安装后已处置一次，voice-input 后同类事件第二次）

- L-007 — DSH 插件 UI 注入机制：sidebar.footer.action slot — 工具 — 在 DSH 桌面端侧边栏底部注册快捷按钮，需通过 `ctx.slots.inject("sidebar.footer.action", ...)` 注册组件；order 越小越靠前（社区市场 order=10，热榜 order=20 排在后）；客户端用 `window.__ModuleLoader__.load({...})` 而非标准 ES module — 教训：研究已有插件（dsh-community-market）源码是理解 DSH slot 系统最快的方式

- L-006 — React 18 StrictMode 下 `react-hooks/set-state-in-effect` 与数据拉取的交叠 — 工具 — 项目保留 StrictMode，useHotboard 的 effect 触发数据拉取；新版 eslint 规则将其标为 error — 处理：针对性 disable，保留功能 — 教训：新 lint 规则与既有架构冲突时，先判断是否误报再决定是否禁用

- L-005 — noUnusedLocals 对多余 prop 报错 — 类型 — RankItem 加了未使用的 `platformName` prop → TS6133 — 根因：prop 声明但 JSX 中未用 — 解决方案：删除未用 prop — 教训：新增 prop 前先确认是否真的会在渲染中用到

- L-004 — vitest mock fetch 复用响应体导致解析失败 — 测试 — 用 `mockResolvedValue(new Response(...))` 时二次调用复用已消费的 Response body → `res.json()` 抛"数据解析失败" — 根因：Response body 只能消费一次 — 解决方案：改用 `mockImplementation` / `mockImplementationOnce` 每次返回新 Response — 教训：mock fetch 需返回动态响应时别复用同一个 Response 对象

- L-003 — ESLint 10 新规则 `react-hooks/set-state-in-effect` 误报 — 工具 — eslint 报 effect 里调用 `run(view)`（内部同步 setState） — 根因：规则过于激进，对"effect 触发数据获取"的标准模式是误报 — 解决方案：该行加 `// eslint-disable-next-line react-hooks/set-state-in-effect` — 教训：新版 react-hooks 规则需按场景权衡；数据获取在 effect 触发是常见模式

- L-002 — `import.meta.env` 缺类型 — 类型 — tsc 报 `Property 'env' does not exist on type 'ImportMeta'` — 根因：缺 vite/client 类型引用 — 解决方案：新增 `src/vite-env.d.ts` 引 `/// <reference types="vite/client" />` — 教训：Vite 项目都应有该文件，否则用 import.meta.env 时 tsc 报错

- L-001 — Vite watcher 与编辑工具临时目录冲突（EBUSY） — 工具 — 修改 src 文件时 Vite dev server 崩溃（`Error: EBUSY ... watch 'src\.xxx.tmpdir\xxx.tmp'`） — 根因：编辑工具原子写入产生的临时目录被 Vite 监听且文件被锁 — 解决方案：改代码前先停 dev server，改完再重启 — 教训：大规模编辑源码时不常驻 dev server，避免 watcher 反复崩溃

