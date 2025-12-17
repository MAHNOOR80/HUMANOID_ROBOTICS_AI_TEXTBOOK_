import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('RAG Query Widget Error:', error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Render fallback UI
      return this.props.fallback || (
        <div style={{
          padding: '1rem',
          border: '1px solid #ccc',
          borderRadius: '4px',
          backgroundColor: '#f8f8f8',
          color: '#666'
        }}>
          <h4>Query Widget Error</h4>
          <p>The question and answer widget encountered an error and couldn't load.</p>
          <p style={{ fontSize: '0.8em', marginTop: '0.5rem' }}>
            This error has been logged. The rest of the page will continue to function normally.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;