import { describe, it, expect } from 'vitest'

// 测试 pickQuote 的纯逻辑层（时间桶→洗牌→取句），不依赖 React 组件
// 策略：提取 mulberry32 / seededShuffle / pickQuote 的核心逻辑进行测试

const BUCKET_MS = 10 * 60 * 1000

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = arr.slice()
  const rand = mulberry32(seed)
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// 模拟内置金句库（取前 5 条做测试，避免依赖完整 quotes.ts）
const TEST_QUOTES = [
  '生活将我反复捶打，肉质竟变得软嫩Q弹！',
  '世界再忙，也别忘了给自己留口饭香。',
  '把今天的小开心，摞起来就能垫高明天。',
  '今日计划：做一个安静发光的小土豆。',
  '你今天的努力，有被宇宙悄悄记下来哦。',
]

function pickQuoteFromPool(pool: string[], now: number): string {
  if (pool.length === 0) return ''
  const bucket = Math.floor(now / BUCKET_MS)
  const lap = Math.floor(bucket / pool.length)
  const pos = bucket % pool.length
  const shuffled = seededShuffle(pool, lap)
  return shuffled[pos]
}

describe('mulberry32 伪随机', () => {
  it('相同种子产生相同序列', () => {
    const r1 = mulberry32(42)
    const r2 = mulberry32(42)
    const seq1 = Array.from({ length: 10 }, () => r1())
    const seq2 = Array.from({ length: 10 }, () => r2())
    expect(seq1).toEqual(seq2)
  })

  it('不同种子产生不同序列', () => {
    const r1 = mulberry32(1)
    const r2 = mulberry32(2)
    const seq1 = Array.from({ length: 10 }, () => r1())
    const seq2 = Array.from({ length: 10 }, () => r2())
    expect(seq1).not.toEqual(seq2)
  })

  it('输出范围 [0, 1)', () => {
    const r = mulberry32(99)
    for (let i = 0; i < 100; i++) {
      const v = r()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

describe('seededShuffle 洗牌', () => {
  it('不修改原数组', () => {
    const arr = [1, 2, 3, 4, 5]
    const copy = arr.slice()
    seededShuffle(arr, 42)
    expect(arr).toEqual(copy)
  })

  it('返回等长数组，元素相同', () => {
    const arr = ['a', 'b', 'c', 'd', 'e']
    const result = seededShuffle(arr, 7)
    expect(result).toHaveLength(arr.length)
    expect(result.sort()).toEqual(arr.sort())
  })

  it('相同种子产生相同洗牌结果', () => {
    const arr = [1, 2, 3, 4, 5]
    const r1 = seededShuffle(arr, 100)
    const r2 = seededShuffle(arr, 100)
    expect(r1).toEqual(r2)
  })

  it('不同种子大概率产生不同结果', () => {
    const arr = Array.from({ length: 20 }, (_, i) => i)
    const r1 = seededShuffle(arr, 1)
    const r2 = seededShuffle(arr, 2)
    // 20! 种排列，两种种子撞车概率极低
    expect(r1).not.toEqual(r2)
  })

  it('空数组返回空', () => {
    expect(seededShuffle([], 1)).toEqual([])
  })

  it('单元素返回自身', () => {
    expect(seededShuffle(['only'], 99)).toEqual(['only'])
  })
})

describe('pickQuote 金句选取', () => {
  it('空池返回空串', () => {
    expect(pickQuoteFromPool([], Date.now())).toBe('')
  })

  it('单句池永远返回该句', () => {
    const pool = ['唯一的一句']
    for (let i = 0; i < 5; i++) {
      const now = i * BUCKET_MS + 123
      expect(pickQuoteFromPool(pool, now)).toBe('唯一的一句')
    }
  })

  it('同一时间桶内返回相同金句（刷新不闪）', () => {
    const now = Date.now()
    const q1 = pickQuoteFromPool(TEST_QUOTES, now)
    const q2 = pickQuoteFromPool(TEST_QUOTES, now)
    expect(q1).toBe(q2)
  })

  it('相邻时间桶可能返回不同金句', () => {
    const bucket1 = 1000
    const bucket2 = 1001
    const t1 = bucket1 * BUCKET_MS + 1
    const t2 = bucket2 * BUCKET_MS + 1
    const q1 = pickQuoteFromPool(TEST_QUOTES, t1)
    const q2 = pickQuoteFromPool(TEST_QUOTES, t2)
    // 不同桶的 pos 不同（除非池长=1），大概率不同
    // 用 5 句池，连续两个桶的 pos 分别是 1000%5=0 和 1001%5=1，一定不同
    expect(q1).not.toBe(q2)
  })

  it('遍历一圈后每句都出现过', () => {
    const pool = TEST_QUOTES // 5 句
    const seen = new Set<string>()
    // 遍历第一个圈（bucket 0~4），lap=0，pos 依次 0/1/2/3/4
    for (let bucket = 0; bucket < pool.length; bucket++) {
      const t = bucket * BUCKET_MS + 1
      seen.add(pickQuoteFromPool(pool, t))
    }
    // seededShuffle(seed=0) 不一定保持原序，但第一圈的 5 个 pos 会覆盖全部元素
    expect(seen.size).toBe(pool.length)
  })

  it('跨圈后顺序会变化（避免循环感）', () => {
    const pool = TEST_QUOTES
    // 第一圈 lap=0，第二圈 lap=1
    const lap0: string[] = []
    const lap1: string[] = []
    for (let pos = 0; pos < pool.length; pos++) {
      lap0.push(pickQuoteFromPool(pool, pos * BUCKET_MS + 1))
      lap1.push(pickQuoteFromPool(pool, (pos + pool.length) * BUCKET_MS + 1))
    }
    // 两圈的排列不同（seededShuffle 种子不同）
    expect(lap0).not.toEqual(lap1)
  })
})
