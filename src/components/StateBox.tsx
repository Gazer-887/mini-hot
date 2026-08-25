// 统一的 加载 / 错误 / 空 三态组件
export default function StateBox({
  type,
  message,
}: {
  type: 'loading' | 'error' | 'empty'
  message?: string
}) {
  if (type === 'loading') {
    return (
      <div className="flex items-center justify-center py-16 text-ink/40 dark:text-ink/60">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-ink/20 border-t-ink/60 dark:border-ink/40 dark:border-t-ink/80" />
        <span className="ml-3 text-sm">正在加载热榜…</span>
      </div>
    )
  }
  if (type === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-ink/50 dark:text-ink/60">
        <p className="text-sm">{message || '加载失败，请稍后重试'}</p>
      </div>
    )
  }
  return (
    <div className="flex items-center justify-center py-16 text-ink/40 dark:text-ink/60">
      <p className="text-sm">暂无数据</p>
    </div>
  )
}
