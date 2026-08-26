/**
 * dsh-hotboard —— 服务端端：热榜快捷按钮插件。
 *
 * 在 DSH 桌面端侧边栏底部注册「🔥 热榜」按钮，点击打开 Mini_hot 热榜网页。
 * 纯前端触发，无需后端 API（仅通过 window.open 打开 URL）。
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
  ctx.logger?.info?.('[dsh-hotboard] 热榜快捷按钮插件已加载')
}
