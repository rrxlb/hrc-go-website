'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTimeoutFallbackOptions {
  timeout: number;
  onTimeout?: () => void;
  enabled?: boolean;
}

/**
 * Hook that provides timeout fallback functionality for loading states
 */
export function useTimeoutFallback({
  timeout,
  onTimeout,
  enabled = true
}: UseTimeoutFallbackOptions) {
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startTimeout = () => {
    if (!enabled) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setHasTimedOut(true);
      onTimeout?.();
    }, timeout);
  };

  const clearTimeoutHandler = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const reset = () => {
    setHasTimedOut(false);
    clearTimeoutHandler();
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    hasTimedOut,
    startTimeout,
    clearTimeout: clearTimeoutHandler,
    reset
  };
}

/**
 * Hook for loading states with automatic timeout fallback
 */
export function useLoadingWithTimeout(
  isLoading: boolean,
  timeout: number = 10000
) {
  const [showFallback, setShowFallback] = useState(false);

  const { hasTimedOut, startTimeout, clearTimeout: clearTimeoutHandler, reset } = useTimeoutFallback({
    timeout,
    onTimeout: () => {
      console.warn(`Loading timed out after ${timeout}ms`);
      setShowFallback(true);
      
      // Track timeout for analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'loading_timeout', {
          timeout_duration: timeout
        });
      }
    }
  });

  useEffect(() => {
    if (isLoading && !hasTimedOut) {
      startTimeout();
    } else {
      clearTimeoutHandler();
    }
  }, [isLoading, hasTimedOut, startTimeout, clearTimeoutHandler]);

  useEffect(() => {
    if (!isLoading) {
      setShowFallback(false);
      reset();
    }
  }, [isLoading, reset]);

  return {
    showFallback: showFallback || hasTimedOut,
    hasTimedOut,
    reset: () => {
      setShowFallback(false);
      reset();
    }
  };
}

/**
 * Hook for asset loading with progressive timeout fallbacks
 */
export function useAssetLoadingTimeout() {
  const [loadingStage, setLoadingStage] = useState<'initial' | 'extended' | 'fallback'>('initial');
  const [totalLoadingTime, setTotalLoadingTime] = useState(0);

  const { hasTimedOut: initialTimeout, startTimeout: startInitialTimeout } = useTimeoutFallback({
    timeout: 5000, // 5 seconds for initial loading
    onTimeout: () => {
      setLoadingStage('extended');
      setTotalLoadingTime(5000);
    }
  });

  const { hasTimedOut: extendedTimeout, startTimeout: startExtendedTimeout } = useTimeoutFallback({
    timeout: 10000, // Additional 10 seconds for extended loading
    onTimeout: () => {
      setLoadingStage('fallback');
      setTotalLoadingTime(15000);
      
      // Track extended loading time
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'extended_loading', {
          loading_time: 15000,
          stage: 'fallback'
        });
      }
    }
  });

  const startLoading = useCallback(() => {
    setLoadingStage('initial');
    setTotalLoadingTime(0);
    startInitialTimeout();
  }, [startInitialTimeout]);

  useEffect(() => {
    if (loadingStage === 'extended') {
      startExtendedTimeout();
    }
  }, [loadingStage, startExtendedTimeout]);

  const reset = useCallback(() => {
    setLoadingStage('initial');
    setTotalLoadingTime(0);
  }, []);

  return {
    loadingStage,
    totalLoadingTime,
    startLoading,
    reset,
    shouldShowFallback: loadingStage === 'fallback'
  };
}