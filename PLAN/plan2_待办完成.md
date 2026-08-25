# Mini_hot 待办完成计划（P0-P2）

> 创建时间：2026-08-25 00:40
> 依据：主人指令"完成待办"，范围确认为全部（本地代码项 + 工程化/CI/PWA），部署/CI 涉及账号授权的先写好配置、git 提交/推送前提醒主人确认。

---

## 一、目标

把 `docs/项目上下文.md` 与 `NOTEBOOK/progress.md` 中列出的待办全部落地，并保证全量回归通过（tsc / lint / test / build），最终交付一个 β 版（可部署）。

## 二、任务拆解与方案

### P0 — 关键优化
1. **缓存增强**：`fetchHot(key, force)` 增加 force 参数，手动刷新绕过 localStorage 缓存（原实现 force 仍命中缓存导致刷新失效）。
2. **配额感知**：api 层解析 `RateLimit`/`Uapi-Credits-*` 响应头到模块级 `quotaInfo`，Header 在限流时显示友好提示。
3. **错误隔离**：`doFetch` 对 429/网络错误指数退避重试（MAX_RETRY=2，1s/2s），超限抛错。
4. **单测**：`src/api/hotboard.test.ts` 覆盖缓存命中/强制刷新/429退避/超限/非OK。

### P1 — 功能增强
5. **深色模式**：CSS 变量（`:root`/`.dark`）+ tailwind `darkMode:'class'`，`useTheme` 切换并记住偏好，Header 加切换按钮。
6. **书签收藏**：`useFavorites`（localStorage），条目加收藏按钮，新增 `'fav'` 视图。
7. **移动端**：PlatformTabs 横向滚动 + 增大触摸热区。

### P2 — 工程化
8. **ESLint**：flat config（eslint 9/10）+ `@eslint/js`/`typescript-eslint`/`react-hooks`/`react-refresh`/`globals`，加 `lint` script。
9. **CI**：`.github/workflows/ci.yml`（npm ci → tsc → lint → test → build）。
10. **PWA**：`public/manifest.webmanifest` + `public/sw.js`（缓存 app shell、不缓存 API），生产环境注册。

## 三、验证方式

- 单测：vitest（新增 hotboard 用例 + 原有 formatHeat）
- 类型：`tsc -b`（补 `src/vite-env.d.ts` 修复 `import.meta.env`）
- 静态检查：`eslint .`
- 构建：`vite build`（并 grep 产物确认 CSS 变量/.dark 生成）
- 手动：dev server + 浏览器验证深色切换、收藏、tab 横滚
- 交叉验证：2 个独立子代理审查改动

## 四、风险与处理

- Vite watcher 与 edit 临时目录 EBUSY → 改文件前停 dev server
- ESLint 10 `react-hooks/set-state-in-effect` 误报数据拉取 → 针对性 disable
- vitest mock fetch 复用 Response → mockImplementation 动态返回

---

## 修订历史

| 日期 | 变更内容 | 变更原因 |
|------|----------|----------|
| 2026-08-25 | 初稿 | 主人要求完成 P0-P2 全部待办 |

> 最后更新：2026-08-25
