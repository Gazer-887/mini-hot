import { useLayoutEffect, useRef } from 'react'

/**
 * useFlip: 列表因「已读隐藏」重排时，对位移的条目做 FLIP 补间（Web Animations API），
 * 新进入的条目（如第 11 名补位）从下方轻轻滑入。
 *
 * 用法：把要动画的容器 ref 挂到列表外层，子元素带 `data-flip-key`，依赖变化时传入 dep。
 * 注意：用「相对列表容器」的 top 而非视口 top，避免页面滚动污染位移差。
 */
export function useFlip(dep: unknown) {
  const ref = useRef<HTMLDivElement>(null)
  const prevPos = useRef<Map<string, number>>(new Map())
  const firstRun = useRef(true)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const listTop = el.getBoundingClientRect().top
    const nodes = Array.from(el.querySelectorAll<HTMLElement>('[data-flip-key]'))
    const next = new Map<string, number>()
    for (const n of nodes) {
      const key = n.dataset.flipKey as string
      const top = n.getBoundingClientRect().top - listTop
      next.set(key, top)
      if (firstRun.current || reduce) continue
      const prev = prevPos.current.get(key)
      if (prev == null) {
        // 新进入（如第 11 名补位）：从下方轻轻滑入
        n.animate(
          [
            { transform: 'translateY(12px)', opacity: 0.4 },
            { transform: 'translateY(0)', opacity: 1 },
          ],
          { duration: 360, easing: 'cubic-bezier(0.33, 1, 0.68, 1)' },
        )
      } else if (prev !== top) {
        // 已存在条目：从旧位置滑到新位置
        const dy = prev - top
        n.animate(
          [
            { transform: `translateY(${dy}px)` },
            { transform: 'translateY(0)' },
          ],
          { duration: 360, easing: 'cubic-bezier(0.33, 1, 0.68, 1)' },
        )
      }
    }
    firstRun.current = false
    prevPos.current = next
  }, [dep])

  return ref
}
