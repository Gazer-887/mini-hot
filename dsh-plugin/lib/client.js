// dsh-hotboard client —— 注册一个 better-sidebar 侧边栏 Tab「🔥 热榜」。
// Tab 内用 <iframe> 嵌入 Mini_hot 热榜页面，用户点侧边栏 Tab 即看热榜。
// 结构复刻自 dsh-better-sidebar 的 builtinTabs（能正常注册 Tab 的已知样例）。
//
// 关键：通过 ctx.betterSidebar.registerTab 注册，inject=['betterSidebar']。

// 热榜地址：开发用 localhost，Netlify 部署后改为在线 URL
// 注意：Netlify 部署后改这里 + ~/.dsh/skills/hotboard/SKILL.md 的地址
const HOTBOARD_URL = 'http://localhost:5173'

window.__ModuleLoader__.load({
  id: 'dsh-hotboard',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports

    // 宿主提供的 React（better-sidebar 的 client bundle 已打包 react）
    const React = require('react')
    const createElement = React.createElement

    /**
     * 热榜 Tab 组件：在侧边栏 Tab 内用 iframe 嵌热榜页面。
     * 接收 better-sidebar 的 TabComponentProps：{ ctx, store, scope, tab, visible }
     */
    function HotboardTab({ scope }) {
      // 全高 iframe，边框透明，填满 Tab 容器
      return createElement(
        'iframe',
        {
          src: HOTBOARD_URL,
          title: '迷你今日热榜',
          style: {
            width: '100%',
            height: '100%',
            border: 'none',
            background: 'transparent',
          },
          allow: 'clipboard-read; clipboard-write',
        },
        null,
      )
    }

    const inject = ['betterSidebar']

    function apply(ctx) {
      // 注册更好侧边栏 Tab
      ctx.effect(
        () =>
          ctx.betterSidebar.registerTab({
            id: 'hotboard',
            title: () => '🔥 热榜',
            icon: (size) =>
              createElement(
                'span',
                { style: { fontSize: size, lineHeight: 1, display: 'inline-flex', width: size, height: size, alignItems: 'center', justifyContent: 'center' } },
                '🔥',
              ),
            order: 60,
            single: true,
            component: (props) => createElement(HotboardTab, props),
          }),
        'hotboard: better-sidebar tab',
      )

      ctx.logger?.info?.('[dsh-hotboard] 热榜 Tab 已注册到 better-sidebar')
    }

    exports.apply = apply
    exports.inject = inject
    return module.exports
  },
})
