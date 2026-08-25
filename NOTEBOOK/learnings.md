# 经验沉淀

- L-001 — Vite watcher 与编辑工具临时目录冲突（EBUSY） — 工具 — 修改 src 文件时 Vite dev server 崩溃（`Error: EBUSY ... watch 'src\.xxx.tmpdir\xxx.tmp'`） — 根因：编辑工具原子写入产生的临时目录被 Vite 监听且文件被锁 — 解决方案：改代码前先停 dev server，改完再重启 — 教训：大规模编辑源码时不常驻 dev server，避免 watcher 反复崩溃

- L-002 — `import.meta.env` 缺类型 — 类型 — tsc 报 `Property 'env' does not exist on type 'ImportMeta'` — 根因：缺 vite/client 类型引用 — 解决方案：新增 `src/vite-env.d.ts` 引 `/// <reference types="vite/client" />` — 教训：Vite 项目都应有该文件，否则用 import.meta.env 时 tsc 报错

- L-003 — ESLint 10 新规则 `react-hooks/set-state-in-effect` 误报 — 工具 — eslint 报 effect 里调用 `run(view)`（内部同步 setState） — 根因：规则过于激进，对"effect 触发数据获取"的标准模式是误报 — 解决方案：该行加 `// eslint-disable-next-line react-hooks/set-state-in-effect` — 教训：新版 react-hooks 规则需按场景权衡；数据获取在 effect 触发是常见模式

- L-004 — vitest mock fetch 复用响应体导致解析失败 — 测试 — 用 `mockResolvedValue(new Response(...))` 时二次调用复用已消费的 Response body → `res.json()` 抛"数据解析失败" — 根因：Response body 只能消费一次 — 解决方案：改用 `mockImplementation` / `mockImplementationOnce` 每次返回新 Response — 教训：mock fetch 需返回动态响应时别复用同一个 Response 对象

- L-005 — noUnusedLocals 对多余 prop 报错 — 类型 — RankItem 加了未使用的 `platformName` prop → TS6133 — 根因：prop 声明但 JSX 中未用 — 解决方案：删除未用 prop — 教训：新增 prop 前先确认是否真的会在渲染中用到

- L-006 — React 18 StrictMode 下 `react-hooks/set-state-in-effect` 与数据拉取的交叠 — 工具 — 项目保留 StrictMode，useHotboard 的 effect 触发数据拉取；新版 eslint 规则将其标为 error — 处理：针对性 disable，保留功能 — 教训：新 lint 规则与既有架构冲突时，先判断是否误报再决定是否禁用
