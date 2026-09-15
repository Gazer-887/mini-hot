import { useMemo } from 'react'
import type { useHotboard } from '../hooks/useHotboard'
import type { ViewKey } from '../hooks/useHotboard'
import type { FavoriteItem } from '../hooks/useFavorites'
import type { HotItem, PlatformKey, PlatformMeta } from '../types'
import { PLATFORMS, PLATFORM_MAP } from '../data/platforms'
import { useReadHistory, identityOf } from '../hooks/useReadHistory'
import { useFlip } from '../hooks/useFlip'
import HotItemCard from './HotItemCard'
import FavoritesView from './FavoritesView'
import StateBox from './StateBox'
import PlatformTabs from './PlatformTabs'

type Hot = ReturnType<typeof useHotboard>

interface Props {
  hot: Hot
  favorites: FavoriteItem[]
  onToggleFav: (platformKey: PlatformKey, platformName: string, item: HotItem) => void
  isFav: (platformKey: PlatformKey, item: HotItem) => boolean
}

export default function HotBoard({ hot, favorites, onToggleFav, isFav }: Props) {
  const { view, switchView } = hot
  const read = useReadHistory()
  const readCount = read.records.length
  const showReadEgg = readCount >= 40

  return (
    <section>
      <PlatformTabs view={view} onChange={switchView} />

      {view === 'all' && (
        <AllView
          hot={hot}
          read={read}
          showReadEgg={showReadEgg}
          onToggleFav={onToggleFav}
          isFav={isFav}
        />
      )}
      {view === 'fav' && <FavoritesView favorites={favorites} onToggleFav={onToggleFav} />}
      {view !== 'all' && view !== 'fav' && (
        <SingleView
          hot={hot}
          view={view}
          read={read}
          showReadEgg={showReadEgg}
          onToggleFav={onToggleFav}
          isFav={isFav}
        />
      )}
    </section>
  )
}

/** 过滤已读并重新编号 1..N（已读消失后，后面的自动补位） */
function visibleUnread(items: HotItem[], hidden: Set<string>, limit: number): HotItem[] {
  return items
    .filter((it) => !hidden.has(identityOf(it)))
    .slice(0, limit)
    .map((it, i) => ({ ...it, rank: i + 1 }))
}

// "全部"视图：按平台分组，每平台独立三态 + 前 N 条（已读过滤后补位）
function AllView({
  hot,
  read,
  showReadEgg,
  onToggleFav,
  isFav,
}: {
  hot: Hot
  read: ReturnType<typeof useReadHistory>
  showReadEgg: boolean
  onToggleFav: Props['onToggleFav']
  isFav: Props['isFav']
}) {
  const { platforms } = hot
  return (
    <div className="space-y-5">
      {PLATFORMS.map((p) => (
        <PlatformGroup
          key={p.key}
          meta={p}
          items={platforms[p.key].items}
          status={platforms[p.key].status}
          error={platforms[p.key].error}
          stale={platforms[p.key].stale}
          hidden={read.hidden}
          onRead={(it) => read.hide({ url: identityOf(it), title: it.title, source: p.name, heat: it.heat, time: Date.now() })}
          onToggleFav={onToggleFav}
          isFav={isFav}
          showReadEgg={showReadEgg}
          readCount={read.records.length}
        />
      ))}
    </div>
  )
}

function PlatformGroup({
  meta,
  items,
  status,
  error,
  stale,
  hidden,
  onRead,
  onToggleFav,
  isFav,
  showReadEgg,
  readCount,
}: {
  meta: PlatformMeta
  items: HotItem[]
  status: 'idle' | 'loading' | 'success' | 'error'
  error?: string
  stale?: boolean
  hidden: Set<string>
  onRead: (item: HotItem) => void
  onToggleFav: Props['onToggleFav']
  isFav: Props['isFav']
  showReadEgg: boolean
  readCount: number
}) {
  const visible = useMemo(() => visibleUnread(items, hidden, 10), [items, hidden])
  const flipRef = useFlip(visible)

  return (
    <div className="rounded-2xl bg-white/60 p-3 backdrop-blur-sm dark:bg-white/5">
      <h2 className="mb-2 flex items-center gap-2 px-1 text-sm font-semibold text-ink/70 dark:text-ink/80">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
        {meta.name} · {meta.listName}
      </h2>
      {meta.note && (
        <p className="mb-1 px-1 text-xs text-ink/35 dark:text-ink/40">{meta.note}</p>
      )}
      {stale && (
        <p className="mb-1 px-1 text-xs text-gold/70">⚠ 数据来自缓存，可能不是最新</p>
      )}

      {status === 'loading' && <StateBox type="loading" />}
      {status === 'error' && <StateBox type="error" message={error} />}
      {status === 'success' && items.length === 0 && <StateBox type="empty" />}
      {status === 'success' && items.length > 0 && visible.length === 0 && (
        <p className="py-8 text-center text-sm text-ink/40">今日这个榜看完啦，明天再来～</p>
      )}
      {status === 'success' && visible.length > 0 && (
        <div ref={flipRef} className="divide-y divide-ink/5">
          {visible.map((it) => (
            <div key={identityOf(it)} data-flip-key={identityOf(it)}>
              <HotItemCard
                variant="host"
                item={it}
                platformName={meta.name}
                color={meta.color}
                showHeat={meta.showHeat}
                platformKey={meta.key}
                isFav={isFav(meta.key, it)}
                onToggleFav={() => onToggleFav(meta.key, meta.name, it)}
                onRead={() => onRead(it)}
              />
            </div>
          ))}
          {showReadEgg && (
            <p className="py-2 text-center text-xs text-ink/35">今日已看 {readCount} 条，我也是有底线哒～</p>
          )}
        </div>
      )}
    </div>
  )
}

// 单平台视图
function SingleView({
  hot,
  view,
  read,
  showReadEgg,
  onToggleFav,
  isFav,
}: {
  hot: Hot
  view: ViewKey
  read: ReturnType<typeof useReadHistory>
  showReadEgg: boolean
  onToggleFav: Props['onToggleFav']
  isFav: Props['isFav']
}) {
  const { platforms } = hot
  const key = view as PlatformKey
  const meta = PLATFORM_MAP[key]
  const st = platforms[key]
  const visible = useMemo(() => visibleUnread(st.items, read.hidden, 50), [st.items, read.hidden])
  const flipRef = useFlip(visible)

  return (
    <div className="rounded-2xl bg-white/60 p-3 backdrop-blur-sm dark:bg-white/5">
      <h2 className="mb-2 flex items-center gap-2 px-1 text-sm font-semibold text-ink/70 dark:text-ink/80">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
        {meta.name} · {meta.listName}
      </h2>
      {meta.note && (
        <p className="mb-1 px-1 text-xs text-ink/35 dark:text-ink/40">{meta.note}</p>
      )}
      {st.stale && (
        <p className="mb-1 px-1 text-xs text-gold/70">⚠ 数据来自缓存，可能不是最新</p>
      )}
      {st.status === 'loading' && <StateBox type="loading" />}
      {st.status === 'error' && <StateBox type="error" message={st.error} />}
      {st.status === 'success' && st.items.length === 0 && <StateBox type="empty" />}
      {st.status === 'success' && st.items.length > 0 && visible.length === 0 && (
        <p className="py-8 text-center text-sm text-ink/40">今日这个榜看完啦，明天再来～</p>
      )}
      {st.status === 'success' && visible.length > 0 && (
        <div ref={flipRef} className="divide-y divide-ink/5">
          {visible.map((it) => (
            <div key={identityOf(it)} data-flip-key={identityOf(it)}>
              <HotItemCard
                variant="rank"
                item={it}
                rank={it.rank}
                color={meta.color}
                showHeat={meta.showHeat}
                platformKey={meta.key}
                isFav={isFav(meta.key, it)}
                onToggleFav={() => onToggleFav(meta.key, meta.name, it)}
                onRead={() => read.hide({ url: identityOf(it), title: it.title, source: meta.name, heat: it.heat, time: Date.now() })}
              />
            </div>
          ))}
          {showReadEgg && (
            <p className="py-2 text-center text-xs text-ink/35">今日已看 {read.records.length} 条，我也是有底线哒～</p>
          )}
        </div>
      )}
    </div>
  )
}
