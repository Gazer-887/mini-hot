import { useCallback, useEffect, useState } from 'react'

const THEME_KEY = 'minihot:theme'

// 主题清单：暖阳（默认浅色）/ 薄荷 / 樱粉 / 墨夜 / 深空
// - 浅色主题（warm/mint/sakura）不加 .dark class，靠 CSS 变量切换底色与强调色
// - 深色主题（dark/midnight）加 .dark class 以激活组件里的 dark: 变体
export type Theme = 'warm' | 'mint' | 'sakura' | 'dark' | 'midnight'

export interface ThemeMeta {
  key: Theme
  label: string
  swatch: string // 选择器上的色点
  dark: boolean
}

export const THEMES: ThemeMeta[] = [
  { key: 'warm', label: '暖阳', swatch: '#e2b155', dark: false },
  { key: 'mint', label: '薄荷', swatch: '#4c9e3f', dark: false },
  { key: 'sakura', label: '樱粉', swatch: '#e88aa6', dark: false },
  { key: 'dark', label: '墨夜', swatch: '#2a2018', dark: true },
  { key: 'midnight', label: '深空', swatch: '#1b2a4a', dark: true },
]

const VALID = new Set<string>(THEMES.map((t) => t.key))

function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved && VALID.has(saved)) return saved as Theme
  } catch {
    // 忽略
  }
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'warm'
}

function apply(theme: Theme) {
  const root = document.documentElement
  const meta = THEMES.find((t) => t.key === theme)!
  root.setAttribute('data-theme', theme)
  root.classList.toggle('dark', meta.dark)
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // 忽略
  }
}

/**
 * useTheme: 多主题切换。
 * - 初始跟随 localStorage，否则跟随系统（深色→墨夜）
 * - 切换时给 <html> 设置 data-theme + 按需 .dark class
 * - 记忆到 localStorage；FOUC 由 index.html 内联脚本在首屏前处理
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    apply(theme)
  }, [theme])

  const set = useCallback((t: Theme) => setTheme(t), [])

  return { theme, set, themes: THEMES }
}
