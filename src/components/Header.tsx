interface Props {
  updatedAt: string
  refreshing: boolean
  onRefresh: () => void
}

// 顶部标题 + 更新时间 + 刷新按钮
export default function Header({ updatedAt, refreshing, onRefresh }: Props) {
  const timeText = updatedAt ? `更新于 ${formatTime(updatedAt)}` : '正在加载…'
  return (
    <header className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">迷你今日热榜</h1>
          <p className="mt-1 text-sm text-ink/50">聚合微博 · 知乎 · B站 · 抖音 · 小红书 · 头条</p>
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
      <p className="mt-2 text-xs text-ink/40">{timeText}</p>
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
