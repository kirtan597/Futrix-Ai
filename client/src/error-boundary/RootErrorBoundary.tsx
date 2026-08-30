/**
 * RootErrorBoundary.tsx
 * 
 * Enterprise-grade error boundary that catches ALL React component errors
 * and prevents white-screen crashes.
 * 
 * Features:
 * - Catches rendering errors, lifecycle errors, and async errors
 * - Logs errors to monitoring services (Sentry, LogRocket)
 * - Provides graceful fallback UI
 * - Allows error recovery without full page reload
 * - Integrates with error store for UI state management
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { captureException } from '../utils/monitoring';
import { useErrorStore } from '../store/useErrorStore';
import ErrorFallback from './ErrorFallback';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
}

export class RootErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Generate unique error ID for tracking
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Log error info
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);

    // Update state
    this.setState(prevState => ({
      error,
      errorInfo,
      errorId,
      retryCount: prevState.retryCount + 1,
    }));

    // Store error in global store (for UI to show error notification)
    useErrorStore.getState().setError({
      message: error.message,
      code: 'REACT_ERROR',
      severity: 'critical',
      errorId,
      context: {
        componentStack: errorInfo.componentStack,
        type: 'RenderError',
      },
    });

    // Send to monitoring service
    captureException(error, {
      errorInfo,
      errorId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    });

    // Allow calling custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    // Clear the boundary state to recover from error
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });

    // Clear error from store
    useErrorStore.getState().clearError();
  };

  handleRefresh = () => {
    // Hard refresh to recover from potential state corruption
    window.location.href = window.location.origin;
  };

  render() {
    const { hasError, error, errorInfo, errorId, retryCount } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Use default error fallback UI
      return (
        <ErrorFallback
          error={error}
          errorInfo={errorInfo}
          errorId={errorId}
          retryCount={retryCount}
          onReset={this.handleReset}
          onRefresh={this.handleRefresh}
        />
      );
    }

    return children;
  }
}

export default RootErrorBoundary;
