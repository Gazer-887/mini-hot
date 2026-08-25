import { useCallback, useEffect, useState } from 'react'

const THEME_KEY = 'minihot:theme'
type Theme = 'light' | 'dark'

function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'dark' || saved === 'light') return saved
  } catch {
    // localStorage 不可用，忽略
  }
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

/**
 * useTheme: 深色/浅色主题切换。
 * - 初始跟随 localStorage，否则跟随系统
 * - 切换时给 <html> 加/去 'dark' class（配合 tailwind darkMode: 'class'）
 * - 记忆到 localStorage
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      // 忽略
    }
  }, [theme])

  const toggle = useCallback(() => setTheme((t) => (t === 'light' ? 'dark' : 'light')), [])

  return { theme, toggle }
}
