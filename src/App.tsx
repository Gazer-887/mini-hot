import Header from './components/Header'
import HotBoard from './components/HotBoard'
import { useHotboard } from './hooks/useHotboard'

export default function App() {
  const hot = useHotboard()

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <Header updatedAt={hot.activeUpdatedAt} refreshing={hot.refreshing} onRefresh={hot.refresh} />
      <HotBoard hot={hot} />
    </div>
  )
}
