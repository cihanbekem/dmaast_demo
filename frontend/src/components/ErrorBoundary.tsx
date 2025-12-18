import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
          <div className="bg-card border border-border rounded-lg p-6 max-w-2xl">
            <h1 className="text-2xl font-bold text-destructive mb-4">Bir hata oluştu</h1>
            <p className="text-muted-foreground mb-4">
              {this.state.error?.message || 'Beklenmeyen bir hata oluştu'}
            </p>
            <details className="mb-4">
              <summary className="cursor-pointer text-sm text-muted-foreground mb-2">
                Hata Detayları
              </summary>
              <pre className="bg-background p-4 rounded text-xs overflow-auto max-h-64">
                {this.state.error?.stack}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

