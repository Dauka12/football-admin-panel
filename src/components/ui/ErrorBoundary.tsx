import React from 'react';
import { useTranslation } from 'react-i18next';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <ErrorDisplay error={this.state.error} />
      );
    }

    return this.props.children;
  }
}

const ErrorDisplay = ({ error }: { error: Error | null }) => {
  const { t } = useTranslation();
  
  return (
    <div className="p-6 rounded-lg bg-red-900/20 border border-red-500 text-white max-w-4xl mx-auto my-8">
      <h2 className="text-xl font-bold mb-4 text-red-400">{t('error.title', 'Something went wrong')}</h2>
      
      <p className="mb-4 text-gray-300">{t('error.message', 'An error has occurred while rendering this component.')}</p>
      
      <div className="p-4 rounded bg-red-900/30 font-mono text-sm overflow-auto">
        <p className="text-red-300 mb-2">{error?.name}: {error?.message}</p>
        <details>
          <summary className="text-gray-400 cursor-pointer">{t('error.showDetails', 'Show stack trace')}</summary>
          <pre className="mt-2 text-xs text-gray-400 whitespace-pre-wrap">{error?.stack}</pre>
        </details>
      </div>
      
      <div className="mt-6">
        <button 
          onClick={() => window.location.reload()}
          className="bg-gold text-darkest-bg px-4 py-2 rounded hover:bg-gold/90 transition-colors duration-200"
        >
          {t('error.refresh', 'Refresh Page')}
        </button>
      </div>
    </div>
  );
};

// Hook to use error boundary in function components
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

export default ErrorBoundary;
