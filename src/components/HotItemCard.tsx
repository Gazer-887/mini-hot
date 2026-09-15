import type { HotItem } from '../types'
import { useIsWebView } from '../hooks/useIsWebView'

interface BaseProps {
  item: HotItem
  color?: string
  showHeat?: boolean
  platformKey?: string
  isFav?: boolean
  onToggleFav?: () => void
  onRead?: () => void
}

/** "全部"视图：平台徽标 + 标题/热值 */
interface HostVariant extends BaseProps {
  variant: 'host'
  platformName: string
}

/** 单平台视图：排名 + 标题/热值 */
interface RankVariant extends BaseProps {
  variant: 'rank'
  rank: number
}

type Props = HostVariant | RankVariant

// 合并后的热榜单条卡片：variant='host' 显示平台徽标，variant='rank' 显示排名
export default function HotItemCard(props: Props) {
  const { item, color, showHeat = true, platformKey, isFav = false, onToggleFav, onRead } = props
  const isWebView = useIsWebView()

  const handleClick = (e: React.MouseEvent) => {
    onRead?.()
    if (isWebView && item.url) {
      e.preventDefault()
      window.open(item.url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white dark:hover:bg-white/10">
      <a
        href={item.url || '#'}
        target={isWebView ? undefined : '_blank'}
        rel="noopener noreferrer"
        onClick={handleClick}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        {/* 平台徽标（host 变体）或排名（rank 变体） */}
        {props.variant === 'host' ? (
          <span
            className="w-12 shrink-0 rounded-md px-1.5 py-0.5 text-center text-[11px] font-semibold text-white"
            style={{ backgroundColor: color || '#e2b155' }}
          >
            {props.platformName}
          </span>
        ) : (
          <span
            className="mt-0.5 w-6 shrink-0 text-center text-sm font-bold"
            style={{ color: props.rank <= 3 ? (color || '#e2b155') : '#c9a074' }}
          >
            {props.rank}
          </span>
        )}

        {/* 标题 */}
        <span className="min-w-0 flex-1 text-[15px] leading-snug text-ink group-hover:opacity-80">
          {item.title}
        </span>

        {/* 热值 */}
        {showHeat ? (
          <span className="shrink-0 text-xs text-ink/40 tabular-nums">{item.heat}</span>
        ) : (
          props.variant === 'host' && <span className="shrink-0 text-xs text-ink/40">热</span>
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
