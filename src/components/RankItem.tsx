import type { HotItem } from '../types'

interface Props {
  item: HotItem
  rank: number
  color?: string
  showHeat?: boolean
}

// 单条热榜项：排名 + 标题 + 热值 + 跳转链接
export default function RankItem({ item, rank, color, showHeat = true }: Props) {
  return (
    <a
      href={item.url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white"
    >
      {/* 排名 */}
      <span
        className="mt-0.5 w-6 shrink-0 text-center text-sm font-bold"
        style={{ color: rank <= 3 ? (color || '#e2b155') : '#c9a074' }}
      >
        {rank}
      </span>

      {/* 标题 */}
      <span className="min-w-0 flex-1 text-[15px] leading-snug text-ink group-hover:opacity-80">
        {item.title}
      </span>

      {/* 热值 */}
      {showHeat && (
        <span className="shrink-0 text-xs text-ink/40 tabular-nums">{item.heat}</span>
      )}
    </a>
  )
}
