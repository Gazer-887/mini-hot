import { useCallback, useMemo, useState } from 'react'

export interface ReadRecord {
  /** 条目唯一标识：url（为空时回退标题），隐藏/过滤共用 */
  url: string
  title: string
  /** 平台中文名：微博 / 知乎 / B站 … */
  source: string
  heat?: string
  /** 浏览时刻（Date.now()） */
  time: number
}

const STORAGE_KEY = 'minihot:read-history'

interface StorageShape {
  date: string
  items: ReadRecord[]
}

function todayKey(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function load(): ReadRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as StorageShape
    if (!parsed || parsed.date !== todayKey() || !Array.isArray(parsed.items)) return []
    return parsed.items
  } catch {
    return []
  }
}

function save(items: ReadRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayKey(), items }))
  } catch {
    // 隐私模式 / 存储满：静默降级，本次会话内仍可隐藏
  }
}

/**
 * useReadHistory: 「已读即隐藏」的单一数据源。
 * - 点击热点 → hide()：写入记录，该条从榜上消失（卡片按唯一标识过滤）
 * - 自然日 00:00 自动重置：读取时发现存储日期 ≠ 今天，即视为空
 * - 仅存本机（无后端，跨设备不同步）
 */
export function useReadHistory() {
  const [records, setRecords] = useState<ReadRecord[]>(load)

  const hidden = useMemo(() => new Set(records.map((r) => r.url)), [records])

  const hide = useCallback((rec: ReadRecord) => {
    setRecords((prev) => {
      if (prev.some((r) => r.url === rec.url)) return prev
      const next = [rec, ...prev]
      save(next)
      return next
    })
  }, [])

  return { hidden, records, hide }
}

/** 条目唯一标识：优先 url，缺失时回退标题 */
export function identityOf(item: { url: string; title: string }): string {
  return item.url || item.title
}
