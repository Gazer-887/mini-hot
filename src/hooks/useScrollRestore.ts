import { useEffect, useRef } from 'react'
import type { ViewKey } from './useHotboard'

// 滚动位置恢复：切视图后回到原位置（从文章返回不打回顶部）。
// 微信等 WebView 常清空 sessionStorage，故 session + localStorage 双写，10 分钟内有效。
const SS_KEY = 'minihot:scroll:ss'
const LS_KEY = 'minihot:scroll:ls'
const TTL = 10 * 60 * 1000

type ScrollMap = Record<string, number>

function read(): ScrollMap {
  for (const store of [sessionStorage, localStorage]) {
    try {
      const raw = store.getItem(store === sessionStorage ? SS_KEY : LS_KEY)
      if (raw) {
        const o = JSON.parse(raw)
        if (o && typeof o.ts === 'number' && Date.now() - o.ts < TTL && o.map) return o.map as ScrollMap
      }
    } catch {
      // 忽略
    }
  }
  return {}
}

function write(map: ScrollMap) {
  const payload = JSON.stringify({ ts: Date.now(), map })
  try {
    sessionStorage.setItem(SS_KEY, payload)
  } catch {
    // 忽略
  }
  try {
    localStorage.setItem(LS_KEY, payload)
  } catch {
    // 忽略
  }
}

/**
 * useScrollRestore(view): 在当前视图滚动时记录位置，切换视图时恢复目标视图位置。
 * - 滚动记录用 rAF 节流，双写 session/localStorage
 * - 视图切换后用 rAF 恢复一次（内容多已缓存，可落位）
 */
export function useScrollRestore(view: ViewKey) {
  const current = useRef<ViewKey>(view)
  const map = useRef<ScrollMap>(read())

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        map.current[current.current] = window.scrollY
        write(map.current)
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  useEffect(() => {
    const y = map.current[view] ?? 0
    const id = requestAnimationFrame(() => window.scrollTo(0, y))
    current.current = view
    return () => cancelAnimationFrame(id)
  }, [view])
}
