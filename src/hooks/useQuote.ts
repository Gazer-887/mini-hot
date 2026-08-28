import { useEffect, useState } from 'react'
import { QUOTES } from '../data/quotes'
import { getUserQuotes } from './useUserQuotes'

const BUCKET_MS = 10 * 60 * 1000 // 10 分钟时间桶

// 确定性伪随机（mulberry32），用圈数作种子，保证同一窗口内洗牌稳定、刷新不闪
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

// 用种子做 Fisher-Yates 洗牌（返回新数组，不修改入参）
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = arr.slice()
  const rand = mulberry32(seed)
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** 当前时间桶对应的金句：内置库与用户投句均匀混合后，按「圈数→位置」取一句 */
function pickQuote(now: number): string {
  const pool = [...QUOTES, ...getUserQuotes()]
  if (pool.length === 0) return ''
  const bucket = Math.floor(now / BUCKET_MS)
  const lap = Math.floor(bucket / pool.length) // 第几圈
  const pos = bucket % pool.length // 桶内位置
  const shuffled = seededShuffle(pool, lap) // 每圈换种子重洗，避免「又从头来」
  return shuffled[pos]
}

/**
 * useQuote: 顶部金句条的数据源。
 * - 每 10 分钟换一句，刷新不闪（仅依赖时间桶）
 * - 用户投句进入漂流瓶后，下一时间桶起均匀混入轮换
 * - 返回当前句 + 是否已「变化」（供组件做淡入淡出）
 */
export function useQuote() {
  const [quote, setQuote] = useState<string>(() => pickQuote(Date.now()))

  useEffect(() => {
    let alive = true
    const tick = () => {
      if (!alive) return
      setQuote(pickQuote(Date.now()))
    }
    // 对齐到下一个 10 分钟边界，再每 10 分钟触发
    const msToNext = BUCKET_MS - (Date.now() % BUCKET_MS)
    const t1 = window.setTimeout(tick, msToNext)
    const t2 = window.setInterval(tick, BUCKET_MS)
    return () => {
      alive = false
      window.clearTimeout(t1)
      window.clearInterval(t2)
    }
  }, [])

  return { quote }
}
