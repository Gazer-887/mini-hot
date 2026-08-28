// 平台标识
export type PlatformKey =
  | 'weibo'
  | 'zhihu'
  | 'bilibili'
  | 'douyin'
  | 'xiaohongshu'
  | 'toutiao'
  | 'juejin'
  | 'v2ex'
  | 'csdn'
  | 'hackernews'

// 平台元信息（由 data/platforms.ts 提供）
export interface PlatformMeta {
  key: PlatformKey
  name: string          // 中文名，如「微博」
  listName: string      // 榜单名，如「热搜榜」
  color: string         // 主题色（hex）
  unit: string          // 热值单位后缀，如「万」「播放」（用于差异化显示）
  showHeat: boolean     // 是否显示热值（toutiao 为空则显示 --）
  source?: 'uapis' | 'hackernews' // 数据源；默认 uapis
  note?: string        // 诚实脚注：该平台榜单的真实差异说明（如刷新慢/无热值）
}

// 单条热榜（归一化后）
export interface HotItem {
  rank: number          // 排名（接口 index，连续 1..N）
  title: string         // 标题
  url: string           // 跳转链接
  heatRaw: string       // 原始热值字符串（可能为空/带单位）
  heat: string          // 格式化后的热值展示，如「1146.8万」「--」
  extra?: Record<string, unknown> // 平台附加数据（douyin 封面/观看数等），不强约束
}

// 单个平台的拉取状态（三态 + 数据；idle=未加载/待首次拉取）
export interface PlatformState {
  key: PlatformKey
  status: 'idle' | 'loading' | 'success' | 'error'
  items: HotItem[]
  updatedAt: string     // 数据时间（接口 update_time 或本地拉取时间）
  error?: string
}

// 接口原始返回（uapis.cn hotboard）
export interface HotboardRaw {
  type: string
  update_time: string
  list: Array<{
    index: number
    title: string
    url: string
    hot_value: string
    extra?: Record<string, unknown>
  }>
}

// 配额/限流状态（api 层解析响应头，用于配额感知降级提示）
export interface QuotaInfo {
  status: 'ok' | 'limited' | 'unknown'
  rateLimit?: string
  remaining?: string
  stopOnEmpty?: string
  debit?: string
}

// HackerNews（Algolia 前端接口）原始返回
export interface HackerNewsResp {
  hits: Array<{
    title: string
    url?: string
    points?: number
    objectID: string
  }>
}
