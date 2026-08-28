import { getQuotaInfo } from '../api/hotboard'
import type { Theme, ThemeMeta } from '../hooks/useTheme'

interface Props {
  updatedAt: string
  refreshing: boolean
  onRefresh: () => void
  theme: Theme
  themes: ThemeMeta[]
  onSetTheme: (t: Theme) => void
}

// 顶部标题 + 更新时间 + 主题切换 + 刷新
export default function Header({ updatedAt, refreshing, onRefresh, theme, themes, onSetTheme }: Props) {
  const timeText = updatedAt ? `更新于 ${formatTime(updatedAt)}` : ''
  const quota = getQuotaInfo()
  return (
    <header className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">迷你今日热榜</h1>
          <p className="mt-1 text-sm text-ink/50">聚合微博 · 知乎 · B站 · 抖音 · 小红书 · 头条 · 掘金 · V2EX · CSDN · HN</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-ink/10 bg-white/70 p-1 dark:border-white/10 dark:bg-white/5">
            {themes.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => onSetTheme(t.key)}
                aria-label={`切换到${t.label}主题`}
                aria-pressed={theme === t.key}
                title={t.label}
                className={`h-5 w-5 rounded-full border transition ${
                  theme === t.key ? 'border-gold ring-2 ring-gold/40' : 'border-ink/15 hover:scale-110'
                }`}
                style={{ backgroundColor: t.swatch }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="rounded-full bg-gold/90 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshing ? '刷新中…' : '刷新'}
          </button>
        </div>
      </div>
      {timeText && <p className="mt-2 text-xs text-ink/40">{timeText}</p>}
      {quota.status === 'limited' && (
        <p className="mt-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400">
          ⚠️ 接口访问受限（配额/限流），已过缓存，稍后刷新再看
        </p>
      )}
    </header>
  )
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    return `${hh}:${mm}`
  } catch {
    return iso
  }
}
