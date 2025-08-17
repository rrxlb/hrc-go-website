'use client';

import React, { useState, useEffect } from 'react';
import { ThreeDErrorBoundary } from './ErrorBoundary';
import { useWebGLCapabilities } from '@/lib/utils/webglDetection';
import { useLoadingWithTimeout } from '@/lib/hooks/useTimeoutFallback';
import FallbackExperience from '@/components/loading/FallbackExperience';
import LoadingScreen from '@/components/loading/LoadingScreen';

interface CasinoErrorHandlerProps {
  children: React.ReactNode;
  loadingTimeout?: number;
  enableWebGLDetection?: boolean;
  enableTimeoutFallback?: boolean;
}

/**
 * Comprehensive error handling wrapper for the casino experience
 * Handles WebGL detection, loading timeouts, and error boundaries
 */
export default function CasinoErrorHandler({
  children,
  loadingTimeout = 15000,
  enableWebGLDetection = true,
  enableTimeoutFallback = true
}: CasinoErrorHandlerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [forceRetry, setForceRetry] = useState(0);
  
  const { 
    capabilities, 
    canRender3D, 
    quality, 
    isLoading: webglLoading 
  } = useWebGLCapabilities();

  const { 
    showFallback: timeoutFallback, 
    hasTimedOut,
    reset: resetTimeout 
  } = useLoadingWithTimeout(isLoading, loadingTimeout);

  // Simulate loading completion after WebGL detection
  useEffect(() => {
    if (!webglLoading && capabilities) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [webglLoading, capabilities]);

  const handleRetry = () => {
    setForceRetry(prev => prev + 1);
    resetTimeout();
    setIsLoading(true);
  };

  // Show loading screen while detecting capabilities
  if (webglLoading || (isLoading && !timeoutFallback)) {
    return <LoadingScreen onLoadingComplete={() => {}} />;
  }

  // Show timeout fallback if loading takes too long
  if (enableTimeoutFallback && timeoutFallback && !canRender3D) {
    return (
      <FallbackExperience 
        reason="timeout"
        onRetry={handleRetry}
        showRetryButton={true}
      />
    );
  }

  // Show WebGL fallback if 3D is not supported
  if (enableWebGLDetection && !canRender3D) {
    const reason = !capabilities?.hasWebGL ? 'webgl' : 'performance';
    return (
      <FallbackExperience 
        reason={reason}
        onRetry={handleRetry}
        showRetryButton={reason === 'performance'}
      />
    );
  }

  // Wrap 3D content in error boundary
  return (
    <ThreeDErrorBoundary key={forceRetry}>
      <div data-webgl-quality={quality}>
        {children}
      </div>
    </ThreeDErrorBoundary>
  );
}

/**
 * Lightweight error handler for individual components
 */
export function ComponentErrorHandler({ 
  children, 
  componentName = 'Component' 
}: { 
  children: React.ReactNode;
  componentName?: string;
}) {
  return (
    <ThreeDErrorBoundary>
      <div data-component={componentName}>
        {children}
      </div>
    </ThreeDErrorBoundary>
  );
}

/**
 * Error handler specifically for game components
 */
export function GameErrorHandler({ 
  children, 
  gameId 
}: { 
  children: React.ReactNode;
  gameId: string;
}) {
  const handleError = (error: Error) => {
    console.error(`Game component error for ${gameId}:`, error);
    
    // Track game-specific errors
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'game_component_error', {
        game_id: gameId,
        error_message: error.message
      });
    }
  };

  return (
    <ThreeDErrorBoundary>
      <div data-game-id={gameId}>
        {children}
      </div>
    </ThreeDErrorBoundary>
  );
}