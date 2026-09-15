import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * 全局 Error Boundary：捕获子组件渲染异常，防止白屏。
 * 默认 fallback 显示友好错误提示 + 刷新按钮。
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: undefined })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-4xl">😵</p>
          <h2 className="text-lg font-semibold text-ink">页面出了点问题</h2>
          <p className="max-w-sm text-sm text-ink/50">
            {this.state.error?.message || '发生了未知错误，请尝试刷新页面'}
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="rounded-full bg-gold px-6 py-2 text-sm font-medium text-cream transition hover:opacity-90"
          >
            刷新页面
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
