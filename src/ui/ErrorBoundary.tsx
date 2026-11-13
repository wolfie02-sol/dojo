import { Component, type ReactNode } from 'react'

/** Catches failures in the 3D scene (missing chunk, shader error…) and hands over to the HTML fallback. */
export class ErrorBoundary extends Component<{ onError: (e: unknown) => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: unknown) {
    console.error('[dojo] 3D scene failed, switching to the simple version:', error)
    this.props.onError(error)
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}
