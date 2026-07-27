import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-[#050505]">
          <h2 className="text-2xl font-display uppercase mb-4 text-red-500">Erro na Aplicação</h2>
          <p className="text-white/40 max-w-md text-sm mb-4">
            Ocorreu um erro inesperado. Por favor, recarregue a página.
          </p>
          {this.state.error && (
            <details className="text-left text-white/30 text-xs font-mono mb-4 max-w-lg">
              <summary className="cursor-pointer hover:text-white/50 mb-2">Detalhes do erro</summary>
              <pre className="overflow-auto max-h-40 bg-white/5 p-4 rounded">
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-orange-500 text-black text-xs uppercase tracking-widest font-bold hover:bg-orange-400 transition-colors"
          >
            Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
