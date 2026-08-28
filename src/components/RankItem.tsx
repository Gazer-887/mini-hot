import type { HotItem } from '../types'

interface Props {
  item: HotItem
  rank: number
  color?: string
  showHeat?: boolean
  platformKey?: string
  isFav?: boolean
  onToggleFav?: () => void
  onRead?: () => void
}

// 单条热榜项：排名 + 标题 + 热值 + 跳转 + 收藏
export default function RankItem({
  item,
  rank,
  color,
  showHeat = true,
  platformKey,
  isFav = false,
  onToggleFav,
  onRead,
}: Props) {
  return (
    <div className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white dark:hover:bg-white/10">
      <a
        href={item.url || '#'}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onRead}
        className="flex min-w-0 flex-1 items-center gap-3"
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

      {/* 收藏按钮 */}
      {platformKey && onToggleFav && (
        <button
          type="button"
          onClick={onToggleFav}
          aria-label={isFav ? '取消收藏' : '收藏'}
          className="shrink-0 text-base transition hover:scale-110"
        >
          <span className={isFav ? 'text-gold' : 'text-ink/25 hover:text-gold'}>
            {isFav ? '★' : '☆'}
          </span>
        </button>
      )}
    </div>
  )
}
