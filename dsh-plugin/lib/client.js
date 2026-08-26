// dsh-hotboard client —— 在 DSH 桌面端侧边栏底部（sidebar.footer.action）注册「🔥 热榜」按钮。
// 点击后 window.open 打开 Mini_hot 热榜网页。
// 结构复刻自 dsh-community-market（能正常注入 UI 的已知样例）。

// 热榜地址：开发用 localhost，Netlify 部署后改为在线 URL
// 注意：Netlify 部署后改这里 + ~/.dsh/skills/hotboard/SKILL.md 的地址
const HOTBOARD_URL = 'http://localhost:5173'

window.__ModuleLoader__.load({
  id: 'dsh-hotboard',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports

    // 宿主提供的 React 与 UI 原语（slot 组件必须用它们渲染）
    const react = require('react')
    const reactJsxRuntime = require('react/jsx-runtime')
    const primitives = require('@deepseek-ai/dsh-client-ui-primitives')

    const { Tooltip, Button, IconGlobeOutline14 } = primitives

    /** 热榜启动器按钮：宽侧边栏显示文字+图标，收起时只显图标 */
    function HotboardLauncher({ wide, t }) {
      const handleClick = () => {
        const win = window.open(HOTBOARD_URL, '_blank', 'noopener,noreferrer')
        if (!win) {
          console.warn('[dsh-hotboard] 弹窗被拦截，请在地址栏允许弹出窗口')
        }
      }

      return reactJsxRuntime.jsx(Tooltip, {
        label: t('tooltip'),
        delayMs: 400,
        disabled: !!wide,
        children: reactJsxRuntime.jsx(Button, {
          variant: 'ghost',
          'aria-label': t('tab'),
          icon: reactJsxRuntime.jsx(IconGlobeOutline14, { size: wide ? 16 : 18 }),
          onClick: handleClick,
          children: wide ? t('tab') : null,
        }),
      })
    }

    const inject = ['slots', 'locale']
    const NS = 'hotboard'

    function apply(ctx) {
      // 注册中英文本地化
      ctx.effect(
        () =>
          ctx.locale.register(NS, {
            zh: {
              tab: '🔥 热榜',
              tooltip: '打开今日热榜（微博·知乎·B站·抖音·小红书·头条等10大平台）',
            },
            en: {
              tab: '🔥 Hot',
              tooltip: "Open today's hot board (Weibo, Zhihu, Bilibili, etc.)",
            },
          }),
        'hotboard: locale',
      )

      // 注入 sidebar.footer.action slot（社区市场 order=10，本插件 order=20 排在其后）
      ctx.effect(
        () =>
          ctx.slots.inject('sidebar.footer.action', () =>
            ctx.slots.register(
              {
                name: 'sidebar.footer.action',
                id: 'hotboard',
                order: 20,
                label: () => ctx.locale.bind(NS)('tab'),
                locale: NS,
              },
              HotboardLauncher,
            ),
          ),
        'hotboard: sidebar button',
      )

      ctx.logger?.info?.('[dsh-hotboard] 热榜按钮已注入 sidebar.footer.action')
    }

    exports.apply = apply
    exports.inject = inject
    return module.exports
  },
})
