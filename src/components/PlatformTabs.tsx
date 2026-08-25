import type { ViewKey } from '../hooks/useHotboard'
import { PLATFORMS } from '../data/platforms'

interface Props {
  view: ViewKey
  onChange: (v: ViewKey) => void
}

const ALL_LABEL = '全部'

// 平台切换 Tab（全部 + 6 平台）
export default function PlatformTabs({ view, onChange }: Props) {
  const tabs: { key: ViewKey; label: string }[] = [
    { key: 'all', label: ALL_LABEL },
    { key: 'fav', label: '收藏' },
    ...PLATFORMS.map((p) => ({ key: p.key as ViewKey, label: p.name })),
  ]

  return (
    <nav className="mb-4 flex gap-2 overflow-x-auto pb-1">
      {tabs.map((t) => {
        const active = t.key === view
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
              active
                ? 'bg-ink text-cream dark:bg-gold dark:text-cream'
                : 'bg-white/70 text-ink/70 hover:bg-white dark:bg-white/5 dark:hover:bg-white/10'
            }`}
          >
            {t.label}
          </button>
        )
      })}
    </nav>
  )
}
