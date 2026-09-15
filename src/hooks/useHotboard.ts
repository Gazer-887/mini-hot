import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { HotItem, PlatformKey, PlatformState } from '../types'
import { PLATFORMS } from '../data/platforms'
import { fetchHot } from '../api/hotboard'

const ALL_KEY = 'all' as const
const FAV_KEY = 'fav' as const
export type ViewKey = PlatformKey | typeof ALL_KEY | typeof FAV_KEY

const initialStates = (): Record<PlatformKey, PlatformState> =>
  Object.fromEntries(
    PLATFORMS.map((p) => [p.key, { key: p.key, status: 'idle' as const, items: [], updatedAt: '' }]),
  ) as unknown as Record<PlatformKey, PlatformState>

/**
 * useHotboard: 管理 6 平台热榜的数据 + 加载状态。
 * - 单一当前激活视图（全部 / 某平台）
 * - 按需懒加载：切到某视图才拉数据，命中缓存不发请求（保配额）
 * - AbortController + requestId 消除竞态（防止慢请求覆盖新 tab 数据）
 */
export function useHotboard() {
  const [view, setView] = useState<ViewKey>(ALL_KEY)
  const [platforms, setPlatforms] = useState<Record<PlatformKey, PlatformState>>(initialStates)
  const abortRef = useRef<AbortController | null>(null)

  // 拉取单个平台。用 signal.aborted 判断是否应丢弃（切视图时 abortRef 会 abort 旧请求）。
  // 各平台之间互相独立，不做共享序号竞争（否则非最后一个平台会被误判为过期而丢失）。
  const loadPlatform = useCallback(async (key: PlatformKey, signal: AbortSignal, force = false) => {
    setPlatforms((prev) => ({
      ...prev,
      [key]: { ...prev[key], status: 'loading', error: undefined },
    }))
    try {
      const { items, updatedAt, stale } = await fetchHot(key, force)
      if (signal.aborted) return // 已切视图/刷新被中止 → 丢弃
      setPlatforms((prev) => ({
        ...prev,
        [key]: { key, status: 'success', items, updatedAt, stale },
      }))
    } catch (e) {
      if (signal.aborted) return
      const message = e instanceof Error ? e.message : '加载失败'
      setPlatforms((prev) => ({
        ...prev,
        [key]: { key, status: 'error', items: [], updatedAt: '', error: message },
      }))
    }
  }, [])

  // 当前视图需要拉取的平台列表（收藏视图不拉数据）
  const targetsFor = useCallback((v: ViewKey) => {
    if (v === ALL_KEY) return PLATFORMS.map((p) => p.key)
    if (v === FAV_KEY) return []
    return [v]
  }, [])

  // 切换视图 / 刷新时触发拉取
  const run = useCallback(
    (v: ViewKey, force = false) => {
      abortRef.current?.abort()
      const ctrl = new AbortController()
      abortRef.current = ctrl
      // idle 或 force 时重新拉取；否则已有数据不重拉（命中缓存由 api 层兜底）
      targetsFor(v).forEach((k) => {
        const st = platforms[k]
        if (force || st.status === 'idle' || st.status === 'error') {
          loadPlatform(k, ctrl.signal, force)
        }
      })
    },
    [platforms, loadPlatform, targetsFor],
  )

  // 挂载 + 视图变化
  useEffect(() => {
    run(view)
    return () => abortRef.current?.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view])

  // 手动刷新当前视图
  const refresh = useCallback(() => run(view, true), [view, run])

  // 切视图
  const switchView = useCallback((v: ViewKey) => setView(v), [])

  // 当前视图的条目归集
  const activeItems: HotItem[] = useMemo(() => {
    if (view === ALL_KEY) {
      // 全部：按平台顺序，仅收集已成功加载的平台
      return PLATFORMS.flatMap((p) => platforms[p.key].items.slice(0, 10)) // 全部视图每平台取前 10
    }
    if (view === FAV_KEY) return [] // 收藏视图数据用 useFavorites 独立管理
    return platforms[view].items
  }, [view, platforms])

  const activeUpdatedAt: string = useMemo(() => {
    if (view === ALL_KEY) {
      const times = PLATFORMS.map((p) => platforms[p.key].updatedAt).filter(Boolean)
      return times.length ? times[times.length - 1] : ''
    }
    if (view === FAV_KEY) return ''
    return platforms[view].updatedAt
  }, [view, platforms])

  const anyLoading = useMemo(() => {
    if (view === ALL_KEY) return PLATFORMS.some((p) => platforms[p.key].status === 'loading')
    if (view === FAV_KEY) return false
    return platforms[view].status === 'loading'
  }, [view, platforms])

  return {
    view,
    platforms,
    activeItems,
    activeUpdatedAt,
    anyLoading,
    switchView,
    refresh,
  }
}
