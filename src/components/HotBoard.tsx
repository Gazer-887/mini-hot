import type { useHotboard } from '../hooks/useHotboard'
import type { ViewKey } from '../hooks/useHotboard'
import type { FavoriteItem } from '../hooks/useFavorites'
import type { HotItem, PlatformKey } from '../types'
import { PLATFORMS, PLATFORM_MAP } from '../data/platforms'
import RankItem from './RankItem'
import HostItem from './HostItem'
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

  return (
    <section>
      <PlatformTabs view={view} onChange={switchView} />

      {view === 'all' && <AllView hot={hot} onToggleFav={onToggleFav} isFav={isFav} />}
      {view === 'fav' && <FavoritesView favorites={favorites} onToggleFav={onToggleFav} />}
      {view !== 'all' && view !== 'fav' && (
        <SingleView hot={hot} view={view} onToggleFav={onToggleFav} isFav={isFav} />
      )}
    </section>
  )
}

// "全部"视图：按平台分组，每平台独立三态 + 前 N 条
function AllView({
  hot,
  onToggleFav,
  isFav,
}: {
  hot: Hot
  onToggleFav: Props['onToggleFav']
  isFav: Props['isFav']
}) {
  const { platforms } = hot
  return (
    <div className="space-y-5">
      {PLATFORMS.map((p) => {
        const st = platforms[p.key]
        return (
          <div key={p.key} className="rounded-2xl bg-white/60 p-3 backdrop-blur-sm dark:bg-white/5">
            <h2 className="mb-2 flex items-center gap-2 px-1 text-sm font-semibold text-ink/70">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
              {p.name} · {p.listName}
            </h2>

            {st.status === 'loading' && <StateBox type="loading" />}
            {st.status === 'error' && <StateBox type="error" message={st.error} />}
            {st.status === 'success' && st.items.length === 0 && <StateBox type="empty" />}
            {st.status === 'success' && st.items.length > 0 && (
              <div className="divide-y divide-ink/5">
                {st.items.map((it) => (
                  <HostItem
                    key={`${it.rank}-${it.url}`}
                    item={it}
                    platformKey={p.key}
                    platformName={p.name}
                    color={p.color}
                    showHeat={p.showHeat}
                    isFav={isFav(p.key, it)}
                    onToggleFav={() => onToggleFav(p.key, p.name, it)}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// 单平台视图
function SingleView({
  hot,
  view,
  onToggleFav,
  isFav,
}: {
  hot: Hot
  view: ViewKey
  onToggleFav: Props['onToggleFav']
  isFav: Props['isFav']
}) {
  const { platforms } = hot
  const key = view as PlatformKey
  const meta = PLATFORM_MAP[key]
  const st = platforms[key]

  return (
    <div className="rounded-2xl bg-white/60 p-3 backdrop-blur-sm dark:bg-white/5">
      <h2 className="mb-2 flex items-center gap-2 px-1 text-sm font-semibold text-ink/70">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
        {meta.name} · {meta.listName}
      </h2>
      {st.status === 'loading' && <StateBox type="loading" />}
      {st.status === 'error' && <StateBox type="error" message={st.error} />}
      {st.status === 'success' && st.items.length === 0 && <StateBox type="empty" />}
      {st.status === 'success' && st.items.length > 0 && (
        <div className="divide-y divide-ink/5">
          {st.items.map((it) => (
            <RankItem
              key={`${it.rank}-${it.url}`}
              item={it}
              rank={it.rank}
              color={meta.color}
              showHeat={meta.showHeat}
              platformKey={meta.key}
              isFav={isFav(meta.key, it)}
              onToggleFav={() => onToggleFav(meta.key, meta.name, it)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
