import type { HotItem } from '../types'

interface Props {
  item: HotItem
  platformName: string
  color?: string
  showHeat?: boolean
  platformKey?: string
  isFav?: boolean
  onToggleFav?: () => void
}

// "全部"视图里的单条：平台徽标 + 标题/热值 + 收藏
export default function HostItem({
  item,
  platformName,
  color,
  showHeat = true,
  platformKey,
  isFav = false,
  onToggleFav,
}: Props) {
  return (
    <div className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white dark:hover:bg-white/10">
      <a
        href={item.url || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        {/* 平台徽标 */}
        <span
          className="w-12 shrink-0 rounded-md px-1.5 py-0.5 text-center text-[11px] font-semibold text-white"
          style={{ backgroundColor: color || '#e2b155' }}
        >
          {platformName}
        </span>
        <span className="min-w-0 flex-1 text-[15px] leading-snug text-ink group-hover:opacity-80">
          {item.title}
        </span>
        {showHeat && <span className="shrink-0 text-xs text-ink/40 tabular-nums">{item.heat}</span>}
        {!showHeat && <span className="shrink-0 text-xs text-ink/40">热</span>}
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
