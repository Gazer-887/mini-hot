import type { FavoriteItem } from '../hooks/useFavorites'
import type { HotItem, PlatformKey } from '../types'
import StateBox from './StateBox'
import { PLATFORM_MAP } from '../data/platforms'

interface Props {
  favorites: FavoriteItem[]
  onToggleFav: (platformKey: PlatformKey, platformName: string, item: HotItem) => void
}

// "收藏"视图：展示本地收藏的热榜项，可取消收藏
export default function FavoritesView({ favorites, onToggleFav }: Props) {
  if (favorites.length === 0) {
    return (
      <div className="rounded-2xl bg-white/60 p-3 backdrop-blur-sm dark:bg-white/5">
        <StateBox type="empty" />
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white/60 p-3 backdrop-blur-sm dark:bg-white/5">
      <h2 className="mb-2 flex items-center gap-2 px-1 text-sm font-semibold text-ink/70">
        <span className="h-2.5 w-2.5 rounded-full bg-gold" />
        我的收藏 · {favorites.length} 条
      </h2>
      <div className="divide-y divide-ink/5">
        {favorites.map((f) => (
          <div
            key={`${f.platformKey}-${f.url}`}
            className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white dark:hover:bg-white/10"
          >
            <span
              className="w-12 shrink-0 rounded-md px-1.5 py-0.5 text-center text-[11px] font-semibold text-white"
              style={{ backgroundColor: PLATFORM_MAP[f.platformKey]?.color || '#e2b155' }}
            >
              {f.platformName}
            </span>
            <a
              href={f.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0 flex-1 text-[15px] leading-snug text-ink group-hover:opacity-80"
            >
              {f.title}
            </a>
            <span className="shrink-0 text-xs text-ink/40 tabular-nums">{f.heat}</span>
            <button
              type="button"
              onClick={() =>
                onToggleFav(f.platformKey, f.platformName, {
                  rank: f.rank,
                  title: f.title,
                  url: f.url,
                  heatRaw: '',
                  heat: f.heat,
                })
              }
              aria-label="取消收藏"
              className="shrink-0 text-sm text-gold transition hover:scale-110 hover:text-wood dark:hover:text-gold"
            >
              ★
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
