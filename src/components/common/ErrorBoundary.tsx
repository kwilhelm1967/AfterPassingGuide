import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-vault-dark flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-card-bg border border-border-subtle rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-text-primary mb-2">
                  Something went wrong
                </h2>
                <p className="text-sm text-text-secondary mb-4">
                  An unexpected error occurred. Your data is safe and stored locally.
                </p>
                {this.state.error && (
                  <details className="mb-4">
                    <summary className="text-xs text-text-muted cursor-pointer mb-2">
                      Error details
                    </summary>
                    <pre className="text-xs text-text-muted bg-slate-800/50 p-2 rounded overflow-auto">
                      {this.state.error.toString()}
                    </pre>
                  </details>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={this.handleReset}
                    className="px-4 py-2 bg-accent-gold hover:bg-accent-gold/90 text-vault-dark rounded-lg font-medium text-sm transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-text-primary rounded-lg font-medium text-sm transition-colors"
                  >
                    Reload App
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

