import { useCallback, useEffect, useState } from 'react'
import type { HotItem, PlatformKey } from '../types'

export interface FavoriteItem {
  platformKey: PlatformKey
  platformName: string
  rank: number
  title: string
  url: string
  heat: string
  savedAt: number
}

const FAV_KEY = 'minihot:favorites'

function load(): FavoriteItem[] {
  try {
    const raw = localStorage.getItem(FAV_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw) as FavoriteItem[]
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

/**
 * useFavorites: 书签/收藏管理。
 * - 存 localStorage（minihot:favorites）
 * - toggle(platformKey, platformName, item)：收藏/取消
 * - isFavorite(platformKey, item)：判断是否已收藏（按 platform + url 判重）
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(load)

  useEffect(() => {
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(favorites))
    } catch {
      // 忽略
    }
  }, [favorites])

  const toggle = useCallback((platformKey: PlatformKey, platformName: string, item: HotItem) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.platformKey === platformKey && f.url === item.url)
      if (exists) {
        return prev.filter((f) => !(f.platformKey === platformKey && f.url === item.url))
      }
      const fav: FavoriteItem = {
        platformKey,
        platformName,
        rank: item.rank,
        title: item.title,
        url: item.url,
        heat: item.heat,
        savedAt: Date.now(),
      }
      return [fav, ...prev]
    })
  }, [])

  const remove = useCallback((platformKey: PlatformKey, url: string) => {
    setFavorites((prev) => prev.filter((f) => !(f.platformKey === platformKey && f.url === url)))
  }, [])

  const isFavorite = useCallback(
    (platformKey: PlatformKey, item: HotItem) =>
      favorites.some((f) => f.platformKey === platformKey && f.url === item.url),
    [favorites],
  )

  return { favorites, toggle, remove, isFavorite }
}
