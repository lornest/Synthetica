import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div style={{
            padding: '2rem',
            background: 'rgba(255,255,255,0.95)',
            borderRadius: 8,
            margin: '1rem',
            color: '#e53e3e',
          }}>
            <h3>Something went wrong</h3>
            <pre style={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                marginTop: '1rem', padding: '0.5rem 1rem',
                border: '1px solid #e53e3e', borderRadius: 4,
                background: 'white', cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        )
      )
    }
    return this.props.children
  }
}
