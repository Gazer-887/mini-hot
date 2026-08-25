import type { PlatformKey, PlatformMeta } from '../types'

// 6 平台元信息：驱动差异化渲染（是否显示热值、单位后缀、主题色）
export const PLATFORMS: PlatformMeta[] = [
  { key: 'weibo', name: '微博', listName: '热搜榜', color: '#e2b155', unit: '万', showHeat: true },
  { key: 'zhihu', name: '知乎', listName: '热榜', color: '#0066ff', unit: '万', showHeat: true },
  { key: 'bilibili', name: 'B站', listName: '热搜', color: '#fb7299', unit: '万', showHeat: true },
  { key: 'douyin', name: '抖音', listName: '热点榜', color: '#fe2c55', unit: '万', showHeat: true },
  { key: 'xiaohongshu', name: '小红书', listName: '热搜榜', color: '#ff2442', unit: '万', showHeat: true },
  { key: 'toutiao', name: '今日头条', listName: '热榜', color: '#fe2c55', unit: '', showHeat: false },
]

// 便捷映射
export const PLATFORM_MAP: Record<PlatformKey, PlatformMeta> = Object.fromEntries(
  PLATFORMS.map((p) => [p.key, p]),
) as Record<PlatformKey, PlatformMeta>
