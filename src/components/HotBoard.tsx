import type { useHotboard } from '../hooks/useHotboard'
import type { ViewKey } from '../hooks/useHotboard'
import { PLATFORMS, PLATFORM_MAP } from '../data/platforms'
import RankItem from './RankItem'
import HostItem from './HostItem'
import StateBox from './StateBox'
import PlatformTabs from './PlatformTabs'

type Hot = ReturnType<typeof useHotboard>

interface Props {
  hot: Hot
}

export default function HotBoard({ hot }: Props) {
  const { view, switchView } = hot

  return (
    <section>
      <PlatformTabs view={view} onChange={switchView} />

      {view === 'all' ? <AllView hot={hot} /> : <SingleView hot={hot} view={view} />}
    </section>
  )
}

// "全部"视图：按平台分组，每平台独立三态 + 前 N 条
function AllView({ hot }: { hot: Hot }) {
  const { platforms } = hot
  return (
    <div className="space-y-5">
      {PLATFORMS.map((p) => {
        const st = platforms[p.key]
        return (
          <div key={p.key} className="rounded-2xl bg-white/60 p-3 backdrop-blur-sm">
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
                    key={it.rank + it.url}
                    item={it}
                    platformName={p.name}
                    color={p.color}
                    showHeat={p.showHeat}
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
function SingleView({ hot, view }: { hot: Hot; view: ViewKey }) {
  const { platforms } = hot
  const key = view as keyof typeof PLATFORM_MAP
  const meta = PLATFORM_MAP[key]
  const st = platforms[key]

  return (
    <div className="rounded-2xl bg-white/60 p-3 backdrop-blur-sm">
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
            <RankItem key={it.rank + it.url} item={it} rank={it.rank} color={meta.color} showHeat={meta.showHeat} />
          ))}
        </div>
      )}
    </div>
  )
}
