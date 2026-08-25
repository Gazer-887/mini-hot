import type { HotboardRaw, HotItem, PlatformKey, QuotaInfo } from '../types'
import { formatHeat } from '../utils/formatHeat'

const API_BASE = 'https://uapis.cn/api/v1/misc/hotboard'
const CACHE_TTL_MS = 10 * 60 * 1000 // 10 分钟缓存，防烧配额
const CACHE_PREFIX = 'minihot:'
const MAX_ITEMS = 50
const MAX_RETRY = 2
const RETRY_DELAY_MS = [1000, 2000]

// 缓存结构
interface CacheEntry {
  items: HotItem[]
  updatedAt: string
  fetchedAt: number
}

// 配额/限流全局状态（由最近一次请求的响应头刷新；用于 UI 顶部提示）
let quotaInfo: QuotaInfo = { status: 'unknown' }

export function getQuotaInfo(): QuotaInfo {
  return quotaInfo
}

function parseQuota(res: Response): void {
  try {
    quotaInfo = {
      status: res.status === 429 ? 'limited' : 'ok',
      rateLimit: res.headers.get('ratelimit') ?? undefined,
      remaining:
        res.headers.get('ratelimit-remaining') ??
        res.headers.get('uapi-credits-remaining') ??
        undefined,
      stopOnEmpty: res.headers.get('uapi-stop-on-empty') ?? undefined,
      debit: res.headers.get('uapi-debit-status') ?? undefined,
    }
  } catch {
    quotaInfo = { status: 'ok' }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

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

/** 单次请求 + 指数退避（429 / 网络错误），获取归一化后的 CacheEntry */
async function doFetch(key: PlatformKey, attempt: number): Promise<CacheEntry> {
  const url = `${API_BASE}?type=${key}`

  let res: Response
  try {
    res = await fetch(url, { headers: { Accept: 'application/json' } })
  } catch {
    // 网络异常（断网/超时/DNS）：退避重试
    if (attempt < MAX_RETRY) {
      await sleep(RETRY_DELAY_MS[attempt])
      return doFetch(key, attempt + 1)
    }
    throw new Error('网络异常，请检查网络后重试')
  }

  parseQuota(res)

  if (res.status === 429) {
    // 限流：退避重试，超限抛错（由 hook 转成错误态）
    if (attempt < MAX_RETRY) {
      await sleep(RETRY_DELAY_MS[attempt])
      return doFetch(key, attempt + 1)
    }
    throw new Error('访问太频繁，请稍后再试')
  }
  if (!res.ok) {
    throw new Error(`加载失败 (${res.status})`)
  }

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

  const items: HotItem[] = list
    .slice(0, MAX_ITEMS)
    .map((it, i) => normalizeItem(it, it.index ?? i + 1))

  const updatedAt = data.update_time || new Date().toISOString()
  return { items, updatedAt, fetchedAt: Date.now() }
}

/**
 * fetchHot(key, force): 拉取单个平台热榜，带缓存与错误识别。
 * - force=true 绕过缓存（手动刷新强制请求）
 * - 命中未过期缓存（force=false）→ 直接返回缓存数据
 * - 429 / 网络错误 → 指数退避重试
 * - 返回 { items, updatedAt }
 */
export async function fetchHot(
  key: PlatformKey,
  force = false,
): Promise<{ items: HotItem[]; updatedAt: string }> {
  if (!force) {
    const cached = getCache(key)
    if (cached) {
      return { items: cached.items, updatedAt: cached.updatedAt }
    }
  }

  const entry = await doFetch(key, 0)
  setCache(key, entry.items, entry.updatedAt)
  return { items: entry.items, updatedAt: entry.updatedAt }
}

/** 平台 base path：仅工具用途 */
export function getApiUrl(key: PlatformKey): string {
  return `${API_BASE}?type=${key}`
}
