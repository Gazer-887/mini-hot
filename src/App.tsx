import Header from './components/Header'
import HotBoard from './components/HotBoard'
import { useHotboard } from './hooks/useHotboard'
import { useTheme } from './hooks/useTheme'
import { useFavorites } from './hooks/useFavorites'

export default function App() {
  const hot = useHotboard()
  const { theme, toggle } = useTheme()
  const fav = useFavorites()

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <Header
        updatedAt={hot.activeUpdatedAt}
        refreshing={hot.anyLoading}
        onRefresh={hot.refresh}
        theme={theme}
        onToggleTheme={toggle}
      />
      <HotBoard hot={hot} favorites={fav.favorites} onToggleFav={fav.toggle} isFav={fav.isFavorite} />
    </div>
  )
}
