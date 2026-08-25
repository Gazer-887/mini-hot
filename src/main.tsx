import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// React 18 StrictMode：开发期暴露真实竞态。useHotboard 已用 signal.aborted 正确处理。
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
