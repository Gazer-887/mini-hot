import { useEffect, useRef, useState } from 'react'
import { useQuote } from '../hooks/useQuote'
import { addUserQuote, getUserQuotes } from '../hooks/useUserQuotes'

// 顶部金句条：展示当前金句，点击弹出「漂流瓶」可投句
export default function QuoteBar() {
  const { quote } = useQuote()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [toast, setToast] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(''), 1800)
    return () => window.clearTimeout(t)
  }, [toast])

  const submit = () => {
    const ok = addUserQuote(draft)
    if (ok) {
      setToast('已投进漂流瓶 🫧')
      setDraft('')
    } else if (!draft.trim()) {
      setToast('写点什么再投吧～')
    } else if (draft.trim().length > 120) {
      setToast('太长啦，120 字以内')
    } else {
      setToast('这句已经在漂流瓶里啦')
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-4 flex w-full items-center gap-2 rounded-2xl bg-white/60 px-4 py-3 text-left backdrop-blur-sm transition hover:bg-white dark:bg-white/5 dark:hover:bg-white/10"
        aria-label="打开金句漂流瓶"
      >
        <span className="shrink-0 text-sm">🫧</span>
        <span
          key={quote}
          className="min-w-0 flex-1 truncate text-sm text-ink/70 dark:text-ink/80"
          style={{ animation: 'quoteFade 450ms ease' }}
          title={quote}
        >
          {quote || '今天也想对你说点温柔的话'}
        </span>
        <span className="shrink-0 text-xs text-ink/30">点我投句</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-cream p-5 shadow-2xl dark:bg-sand"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-ink dark:text-ink">金句漂流瓶</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full px-2 text-lg text-ink/40 hover:text-ink"
                aria-label="关闭"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 rounded-2xl bg-white/70 p-4 text-[15px] leading-relaxed text-ink/80 dark:bg-white/5 dark:text-ink/90">
              {quote}
            </div>

            <label className="mb-1 block text-xs text-ink/50">投一句进去，让别人也能捞到：</label>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={draft}
                maxLength={120}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                placeholder="写一句今天想说的话…"
                className="min-w-0 flex-1 rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-gold dark:bg-white/5 dark:text-ink"
              />
              <button
                type="button"
                onClick={submit}
                className="shrink-0 rounded-xl bg-gold/90 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gold"
              >
                投出
              </button>
            </div>

            <p className="mt-2 h-4 text-xs text-gold">{toast}</p>

            <p className="mt-1 text-[11px] text-ink/40">
              你已投下 {getUserQuotes().length} 句 · 上限 100，超出自动淘汰最早的
            </p>
          </div>
        </div>
      )}
    </>
  )
}
