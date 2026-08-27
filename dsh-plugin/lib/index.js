/**
 * dsh-hotboard —— 服务端入口：热榜 better-sidebar 侧边栏 Tab 插件。
 *
 * 实际 UI（侧边栏「🔥 热榜」Tab，Tab 内 iframe 嵌入 Mini_hot 热榜）在
 * lib/client.js 中通过 ctx.betterSidebar.registerTab 注入，无需后端 API。
 *
 * 安装：dsh plugin --profile desktop add file:D:/Mini_hot/dsh-plugin
 */

export const name = 'dsh-hotboard'

// 无需额外服务，仅注入客户端脚本
export const inject = []

/**
 * 插件入口：向宿主注册客户端 bundle。
 * DSH 会在浏览器上下文加载 lib/client.js 中的 __ModuleLoader__.load 块。
 */
export async function apply(ctx) {
  // 本插件无需服务端逻辑，仅注册 client bundle
  // 实际 UI 注入在 lib/client.js 中完成
  ctx.logger?.info?.('[dsh-hotboard] 热榜 better-sidebar Tab 插件已加载')
}
