"use client"

import { Component, type ReactNode, type ErrorInfo } from "react"
import { AlertTriangle, RefreshCw, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error) => void
  name?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`ErrorBoundary${this.props.name ? ` (${this.props.name})` : ""}:`, error, info.componentStack)
    this.props.onError?.(error)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="p-6 rounded-xl bg-red-500/5 border border-red-500/10 text-center">
          <div className="relative w-12 h-12 mx-auto mb-3">
            <div className="absolute inset-0 rounded-xl bg-red-500/10 animate-pulse" />
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/10">
              <XCircle className="w-6 h-6 text-red-400" />
            </div>
          </div>
          <h3 className="text-sm font-semibold text-red-300 mb-1">
            {this.props.name || "Widget"} Error
          </h3>
          <p className="text-xs text-zinc-400 mb-3 max-w-xs mx-auto">
            Something went wrong. Check the console for details.
          </p>
          <Button size="sm" variant="outline" onClick={this.handleRetry} className="border-zinc-800 hover:bg-zinc-800/50 text-xs h-8">
            <RefreshCw className="w-3 h-3 mr-1.5" /> Retry
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
