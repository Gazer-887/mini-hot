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
    ...PLATFORMS.map((p) => ({ key: p.key as ViewKey, label: p.name })),
  ]

  return (
    <nav className="mb-4 flex flex-wrap gap-2">
      {tabs.map((t) => {
        const active = t.key === view
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              active ? 'bg-ink text-cream' : 'bg-white/70 text-ink/70 hover:bg-white'
            }`}
          >
            {t.label}
          </button>
        )
      })}
    </nav>
  )
}
