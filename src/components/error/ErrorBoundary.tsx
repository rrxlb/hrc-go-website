'use client';

import React, { Component, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

/**
 * Generic Error Boundary component with user-friendly error messages
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Track error for analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: false
      });
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetOnPropsChange) {
        this.resetErrorBoundary();
      }
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.resetTimeoutId = window.setTimeout(() => {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined
      });
    }, 100);
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center bg-casino-black/50 rounded-lg border border-casino-gold/20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-8 max-w-md"
          >
            <div className="text-4xl mb-4">🎰</div>
            <h3 className="text-xl font-semibold text-casino-gold mb-2">
              Oops! Something went wrong
            </h3>
            <p className="text-casino-white/70 text-sm mb-6">
              We encountered an issue loading this component. Don&apos;t worry, the casino is still open!
            </p>
            <button
              onClick={this.resetErrorBoundary}
              className="px-4 py-2 bg-casino-gold text-casino-black rounded-lg hover:bg-casino-gold/90 transition-colors text-sm font-medium"
            >
              Try Again
            </button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Specialized Error Boundary for 3D components
 */
export function ThreeDErrorBoundary({ children }: { children: ReactNode }) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('3D Component Error:', error, errorInfo);
    
    // Track 3D-specific errors
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'webgl_error', {
        error_message: error.message,
        component: '3d_scene'
      });
    }
  };

  const fallback = (
    <div className="min-h-[600px] flex items-center justify-center bg-gradient-to-br from-casino-black via-casino-dark to-black rounded-lg border border-casino-gold/20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8 max-w-lg"
      >
        <div className="text-6xl mb-6">🎲</div>
        <h3 className="text-2xl font-bold text-casino-gold mb-4">
          3D Experience Unavailable
        </h3>
        <p className="text-casino-white/80 mb-6 leading-relaxed">
          We&apos;re having trouble loading the 3D casino environment. This might be due to your device&apos;s 
          graphics capabilities or browser settings. You can still explore all our games below!
        </p>
        <div className="space-y-2 text-sm text-casino-white/60">
          <p>• Try refreshing the page</p>
          <p>• Update your browser to the latest version</p>
          <p>• Enable hardware acceleration in browser settings</p>
        </div>
      </motion.div>
    </div>
  );

  return (
    <ErrorBoundary
      fallback={fallback}
      onError={handleError}
      resetOnPropsChange={true}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Error Boundary specifically for loading states
 */
export function LoadingErrorBoundary({ children }: { children: ReactNode }) {
  const fallback = (
    <div className="min-h-[200px] flex items-center justify-center bg-casino-black/30 rounded-lg">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center p-6"
      >
        <div className="text-3xl mb-3">⚠️</div>
        <h4 className="text-lg font-semibold text-casino-gold mb-2">
          Loading Failed
        </h4>
        <p className="text-casino-white/70 text-sm">
          Unable to load this content. Please try refreshing the page.
        </p>
      </motion.div>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
}