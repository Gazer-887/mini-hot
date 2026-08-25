import type { HotboardRaw, HotItem, PlatformKey } from '../types'
import { formatHeat } from '../utils/formatHeat'

const API_BASE = 'https://uapis.cn/api/v1/misc/hotboard'
const CACHE_TTL_MS = 10 * 60 * 1000 // 10 分钟缓存，防烧配额
const CACHE_PREFIX = 'minihot:'

// 缓存结构
interface CacheEntry {
  items: HotItem[]
  updatedAt: string
  fetchedAt: number
}

// 每次 fetch 默认最多展示条数（bilibili 100 条会超，统一 cap 50）
const MAX_ITEMS = 50

/** 读取缓存（未过期则命中） */
function getCache(key: PlatformKey): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + 'hot:' + key)
    if (!raw) return null
    const entry = JSON.parse(raw) as CacheEntry
    if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) return null
    return entry
  } catch {
    return null
  }
}

/** 写缓存 */
function setCache(key: PlatformKey, items: HotItem[], updatedAt: string): void {
  try {
    const entry: CacheEntry = { items, updatedAt, fetchedAt: Date.now() }
    localStorage.setItem(CACHE_PREFIX + 'hot:' + key, JSON.stringify(entry))
  } catch {
    // localStorage 满/不可用，忽略
  }
}

/** 归一化单条 */
function normalizeItem(raw: NonNullable<HotboardRaw['list'][number]>, rank: number): HotItem {
  return {
    rank,
    title: raw.title || '',
    url: raw.url || '',
    heatRaw: raw.hot_value ?? '',
    heat: formatHeat(raw.hot_value ?? ''),
    extra: raw.extra,
  }
}

/**
 * fetchHot(key): 拉取单个平台热榜，带缓存与错误识别。
 * - 命中未过期缓存 → 直接返回缓存数据
 * - 接口 429（限流）/ 非 OK → 抛错误（含 message），由 hook 转成三态
 * - 返回 { items, updatedAt }
 */
export async function fetchHot(key: PlatformKey): Promise<{ items: HotItem[]; updatedAt: string }> {
  // 1) 缓存优先，防烧配额
  const cached = getCache(key)
  if (cached) {
    return { items: cached.items, updatedAt: cached.updatedAt }
  }

  // 2) 发起请求
  const url = `${API_BASE}?type=${key}`
  const res = await fetch(url, { headers: { Accept: 'application/json' } })

  // 3) 错误识别：429 限流、其他非 OK
  if (res.status === 429) {
    throw new Error('访问太频繁，请稍后再试')
  }
  if (!res.ok) {
    throw new Error(`加载失败 (${res.status})`)
  }

  // 4) 解析 + 校验
  let data: HotboardRaw
  try {
    data = (await res.json()) as HotboardRaw
  } catch {
    throw new Error('数据解析失败')
  }
  const list = data?.list
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error('暂无数据')
  }

  // 5) 归一化 + cap
  const items: HotItem[] = list
    .slice(0, MAX_ITEMS)
    .map((it, i) => normalizeItem(it, it.index ?? i + 1))

  const updatedAt = data.update_time || new Date().toISOString()
  setCache(key, items, updatedAt)
  return { items, updatedAt }
}

/** 平台 base path：用于默认拉取全部时合并（可选） */
export function getApiUrl(key: PlatformKey): string {
  return `${API_BASE}?type=${key}`
}
