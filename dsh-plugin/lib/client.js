/**
 * dsh-hotboard —— 客户端侧：热榜快捷按钮。
 *
 * 通过 window.__ModuleLoader__.load 注册到 DSH 浏览器上下文，
 * 注入到 sidebar.footer.action slot（社区市场同款位置），
 * 排在 order=20，紧邻自动化按钮。
 *
 * 点击后调用 window.open() 打开热榜网页。
 * 支持环境变量 HOTBOARD_URL 覆盖默认地址。
 */

// 热榜 URL：开发阶段用 localhost，生产部署后改为 Netlify 地址
const HOTBOARD_URL = 'http://localhost:5173'

window.__ModuleLoader__.load({
  id: 'dsh-hotboard',
  factory: () => {
    var module = { exports: {} }
    var exports = module.exports

    // 懒加载宿主提供的 React 和 primitives
    function getReact() {
      return window.__ModuleLoader__?.get?.('react') || window.react
    }
    function getPrimitives() {
      return (
        window.__ModuleLoader__?.get?.('primitives') ||
        window.__dshPrimitives ||
        {}
      )
    }

    function HotboardBtn({ wide, t }) {
      const react = getReact()
      const { jsx, jsx as Fragment, useEffect, useState } = react || {}
      const primitives = getPrimitives()
      const { Tooltip, Button, IconGlobeOutline14 } = primitives || {}

      const handleClick = () => {
        const win = window.open(HOTBOARD_URL, '_blank', 'noopener,noreferrer')
        if (!win) {
          console.warn('[dsh-hotboard] 弹窗被拦截，请在地址栏允许弹出窗口')
        }
      }

      // 无 primitives 时的 fallback：用原生 div
      if (!jsx) {
        const el = document.createElement('button')
        el.setAttribute('aria-label', t ? t('tab') : '🔥 热榜')
        el.setAttribute('title', t ? t('tooltip') : '打开今日热榜')
        el.textContent = '🔥'
        el.style.cssText =
          'background:transparent;border:none;cursor:pointer;font-size:16px;padding:4px 8px;border-radius:6px;color:inherit;'
        el.addEventListener('click', handleClick)
        return el
      }

      // 正常路径：使用宿主 primitives
      return jsx(
        Tooltip,
        {
          label: t ? t('tooltip') : '打开今日热榜',
          delayMs: 400,
          disabled: !!wide,
          children: jsx(Button, {
            variant: 'ghost',
            'aria-label': t ? t('tab') : '🔥 热榜',
            icon: jsx(IconGlobeOutline14, { size: wide ? 16 : 18 }),
            onClick: handleClick,
            children: wide ? (t ? t('tab') : '🔥 热榜') : null,
          }),
        },
        'hotboard-btn',
      )
    }

    const inject = ['slots', 'locale']

    function apply(ctx) {
      const NS = 'hotboard'

      // 注册 locale 字典
      ctx.effect(
        () =>
          ctx.locale.register(NS, {
            zh: {
              tab: '🔥 热榜',
              tooltip:
                '打开今日热榜（微博·知乎·B站·抖音·小红书·头条等10大平台）',
            },
            en: {
              tab: '🔥 Hot',
              tooltip: "Open today's hot board (Weibo, Zhihu, Bilibili, etc.)",
            },
          }),
        'hotboard: locale',
      )

      // 注入到 sidebar.footer.action slot
      // order=20 排在社区市场（order=10）之后，紧邻自动化按钮
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
              HotboardBtn,
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
