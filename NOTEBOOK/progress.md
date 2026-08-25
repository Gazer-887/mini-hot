# Mini_hot 项目进展记录

## 2026-08-23

### 项目启动与归档
- 从原始项目 D:\fitness-tracker 中学习经验，基于公开接口 uapis.cn 新建独立项目
- 删除冗余 requirements.txt（Python 专用，前端项目不适用）

### 关键决策
- **技术选型**：Vite 5 + React 18 + TS 5 + Tailwind 3.4（锁版本防漂移）
- **UI 定位**：暖色治愈系原创设计，不照抄原站金句/排版
- **架构决策**：纯前端直连 API（CORS 已验证全开放），无 BFF

### 踩坑与修复
1. **竞态 bug（高影响）**：共享递增计数器 `reqSeqRef` 导致非最后平台被误判过期
   - 症状：页面始终只有头条加载成功，其他 5 平台卡"加载中"
   - 根因：`seq !== reqSeqRef.current` 对并发请求全部生效
   - 修复：移除共享 seq，改用 `signal.aborted` 判断
2. **Tailwind content 配置缺失**：`bg-cream` 等 @apply 类未生成
   - 症状：body 底色丢失
   - 修复：tailwind.config.js content 加入 `'./src/**/*.css'`
3. **浮点精度陷阱**：`keepDecimals(1146.85)` 预期 `1146.9` 实际 `1146.8`
   - 根因：IEEE 754 浮点表示误差
   - 修复：先用 `Math.round(num * 10) / 10` 修浮点再 toFixed

### 已完成功能
- ✅ 6 平台热榜聚合（微博/知乎/B站/抖音/小红书/头条）
- ✅ 热度值归一化（6 种形态全覆盖，单测 15/15 pass）
- ✅ 三态渲染（加载/错误/空态），单平台故障不拖垮其他
- ✅ AbortController 竞态取消（切 tab 时旧请求 abort）
- ✅ localStorage 缓存（10 分钟 TTL，防配额烧光）
- ✅ 原创 UI（暖色治愈系、响应式）
- ✅ 类型检查通过（tsc 零错误）
- ✅ 生产构建通过（9.9KB CSS / 151KB JS）

### 构建产物
- dist/assets/index-C-e8Zgew.css (9.94 KB)
- dist/assets/index-BI90Mj32.js (151.06 KB)
- dist/index.html (0.51 KB)

### 下一步
- [ ] 配额感知降级（读取 RateLimit 头，不足时提示）
- [ ] 单测增加错误隔离场景
- [ ] 部署到 Vercel/Netlify（生产 CORS 验证）
