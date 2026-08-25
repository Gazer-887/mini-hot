import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchHot } from './hotboard'
import type { HotboardRaw } from '../types'

function sampleRaw(): HotboardRaw {
  return {
    type: 'weibo',
    update_time: '2026-08-25T10:00:00.000Z',
    list: [
      { index: 1, title: 'A', url: 'http://a', hot_value: '11468191' },
      { index: 2, title: 'B', url: 'http://b', hot_value: '920.8w' },
    ],
  }
}

// 内存版 localStorage（node 环境无 localStorage，需 mock）
const store = new Map<string, string>()

function mockStorage(): void {
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => store.set(k, String(v)),
      removeItem: (k: string) => store.delete(k),
      clear: () => store.clear(),
    },
    configurable: true,
    writable: true,
  })
}

beforeEach(() => {
  store.clear()
  vi.restoreAllMocks()
})

describe('fetchHot 缓存 + 强制刷新', () => {
  it('缓存命中（force=false）不触发 fetch', async () => {
    mockStorage()
    // 每次调用返回新 Response（避免 body 被消费后复用）
    globalThis.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve(new Response(JSON.stringify(sampleRaw()), { status: 200 })),
    )
    await fetchHot('weibo')
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)

    // 二次调用命中缓存，不再发起请求
    const again = await fetchHot('weibo')
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
    expect(again.items[0].heat).toBe('1146.8万')
  })

  it('force=true 绕过缓存强制请求', async () => {
    mockStorage()
    globalThis.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve(new Response(JSON.stringify(sampleRaw()), { status: 200 })),
    )
    await fetchHot('weibo') // 写入缓存
    await fetchHot('weibo', true) // 强制刷新，绕过缓存
    expect(globalThis.fetch).toHaveBeenCalledTimes(2)
  })
})

describe('fetchHot 错误隔离与退避', () => {
  it('429 退避后重试成功', async () => {
    mockStorage()
    vi.useFakeTimers()
    globalThis.fetch = vi
      .fn()
      .mockImplementationOnce(() => Promise.resolve(new Response(null, { status: 429 })))
      .mockImplementationOnce(() =>
        Promise.resolve(new Response(JSON.stringify(sampleRaw()), { status: 200 })),
      )

    const p = fetchHot('weibo', true)
    await vi.advanceTimersByTimeAsync(1000) // 首次退避 1s
    const res = await p
    expect(globalThis.fetch).toHaveBeenCalledTimes(2)
    expect(res.items.length).toBe(2)
    vi.useRealTimers()
  })

  it('429 超过重试上限抛「访问太频繁」', async () => {
    mockStorage()
    vi.useFakeTimers()
    globalThis.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve(new Response(null, { status: 429 })),
    )

    const p = fetchHot('weibo', true)
    // 提前绑定 rejects，避免 reject 后无 handler 报 unhandled
    const assertion = expect(p).rejects.toThrow('访问太频繁')
    await vi.advanceTimersByTimeAsync(3000) // 1s + 2s 两次退避
    await assertion
    expect(globalThis.fetch).toHaveBeenCalledTimes(3) // 初次 + 2 次重试
    vi.useRealTimers()
  })

  it('非 OK 状态抛带状态码的错误', async () => {
    mockStorage()
    globalThis.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve(new Response(null, { status: 500 })),
    )
    await expect(fetchHot('weibo', true)).rejects.toThrow('加载失败 (500)')
  })
})

describe('fetchHot HackerNews(Algolia) 分派', () => {
  it('points 归一化 + 无 url 回退 item?id=', async () => {
    mockStorage()
    globalThis.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            hits: [
              { title: 'A', url: 'http://a', points: 1562, objectID: '1' },
              { title: 'B', url: '', points: 0, objectID: '2' },
            ],
          }),
          { status: 200 },
        ),
      ),
    )
    const res = await fetchHot('hackernews', true)
    expect(res.items[0].heat).toBe('1562')
    expect(res.items[1].heat).toBe('--')
    expect(res.items[1].url).toBe('https://news.ycombinator.com/item?id=2')
  })
})
