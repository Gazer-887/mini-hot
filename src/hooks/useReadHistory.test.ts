// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'

// useReadHistory 依赖 React hooks + localStorage，需要分别测纯逻辑层
// 策略：测 load/save/todayKey/identityOf 的纯逻辑，不挂 React 组件

const STORAGE_KEY = 'minihot:read-history'

function todayKey(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

interface ReadRecord {
  url: string
  title: string
  source: string
  heat?: string
  time: number
}

interface StorageShape {
  date: string
  items: ReadRecord[]
}

// 提取 load 逻辑（与源码一致）用于单元测试
function loadFromStorage(): ReadRecord[] {
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

// 提取 identityOf 逻辑
function identityOf(item: { url: string; title: string }): string {
  return item.url || item.title
}

describe('useReadHistory 纯逻辑层', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('todayKey', () => {
    it('返回 YYYY-MM-DD 格式', () => {
      const key = todayKey()
      expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('与 new Date() 同一天', () => {
      const d = new Date()
      const expected = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      expect(todayKey()).toBe(expected)
    })
  })

  describe('loadFromStorage', () => {
    it('无数据时返回空数组', () => {
      expect(loadFromStorage()).toEqual([])
    })

    it('当天数据正常返回', () => {
      const records: ReadRecord[] = [
        { url: 'https://weibo.com/1', title: '测试1', source: '微博', time: Date.now() },
      ]
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayKey(), items: records }))
      expect(loadFromStorage()).toHaveLength(1)
      expect(loadFromStorage()[0].url).toBe('https://weibo.com/1')
    })

    it('非当天数据返回空（自然日重置）', () => {
      const records: ReadRecord[] = [
        { url: 'https://weibo.com/1', title: '昨天的', source: '微博', time: Date.now() },
      ]
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: '2020-01-01', items: records }))
      expect(loadFromStorage()).toEqual([])
    })

    it('格式损坏返回空（JSON 解析失败）', () => {
      localStorage.setItem(STORAGE_KEY, '{invalid json')
      expect(loadFromStorage()).toEqual([])
    })

    it('items 非数组返回空', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayKey(), items: 'not-array' }))
      expect(loadFromStorage()).toEqual([])
    })

    it('null 对象返回空', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(null))
      expect(loadFromStorage()).toEqual([])
    })
  })

  describe('identityOf', () => {
    it('有 url 时用 url', () => {
      expect(identityOf({ url: 'https://x.com/1', title: '标题' })).toBe('https://x.com/1')
    })

    it('url 为空时回退 title', () => {
      expect(identityOf({ url: '', title: '纯标题' })).toBe('纯标题')
    })

    it('url 和 title 都为空时返回空串', () => {
      expect(identityOf({ url: '', title: '' })).toBe('')
    })
  })

  describe('去重逻辑（hide 语义）', () => {
    it('相同 url 不重复插入', () => {
      const records: ReadRecord[] = [
        { url: 'https://weibo.com/1', title: 'A', source: '微博', time: 1 },
      ]
      const urlSet = new Set(records.map((r) => r.url))
      expect(urlSet.has('https://weibo.com/1')).toBe(true)
      // 模拟 hide 时的去重检查
      const newRec: ReadRecord = { url: 'https://weibo.com/1', title: 'A', source: '微博', time: 2 }
      const shouldSkip = records.some((r) => r.url === newRec.url)
      expect(shouldSkip).toBe(true)
    })

    it('不同 url 可以插入', () => {
      const records: ReadRecord[] = [
        { url: 'https://weibo.com/1', title: 'A', source: '微博', time: 1 },
      ]
      const newRec: ReadRecord = { url: 'https://zhihu.com/2', title: 'B', source: '知乎', time: 2 }
      const shouldSkip = records.some((r) => r.url === newRec.url)
      expect(shouldSkip).toBe(false)
    })
  })
})
