import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { 
  useTimeoutFallback, 
  useLoadingWithTimeout, 
  useAssetLoadingTimeout 
} from '../useTimeoutFallback';

describe('useTimeoutFallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not timeout initially', () => {
    const { result } = renderHook(() => 
      useTimeoutFallback({ timeout: 1000 })
    );

    expect(result.current.hasTimedOut).toBe(false);
  });

  it('should timeout after specified duration', () => {
    const onTimeout = vi.fn();
    const { result } = renderHook(() => 
      useTimeoutFallback({ timeout: 1000, onTimeout })
    );

    act(() => {
      result.current.startTimeout();
    });

    expect(result.current.hasTimedOut).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.hasTimedOut).toBe(true);
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  it('should clear timeout when clearTimeout is called', () => {
    const onTimeout = vi.fn();
    const { result } = renderHook(() => 
      useTimeoutFallback({ timeout: 1000, onTimeout })
    );

    act(() => {
      result.current.startTimeout();
    });

    act(() => {
      result.current.clearTimeout();
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.hasTimedOut).toBe(false);
    expect(onTimeout).not.toHaveBeenCalled();
  });

  it('should reset timeout state', () => {
    const { result } = renderHook(() => 
      useTimeoutFallback({ timeout: 1000 })
    );

    act(() => {
      result.current.startTimeout();
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.hasTimedOut).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.hasTimedOut).toBe(false);
  });

  it('should not start timeout when disabled', () => {
    const onTimeout = vi.fn();
    const { result } = renderHook(() => 
      useTimeoutFallback({ timeout: 1000, onTimeout, enabled: false })
    );

    act(() => {
      result.current.startTimeout();
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.hasTimedOut).toBe(false);
    expect(onTimeout).not.toHaveBeenCalled();
  });
});

describe('useLoadingWithTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should show fallback when loading times out', () => {
    const { result, rerender } = renderHook(
      ({ isLoading }) => useLoadingWithTimeout(isLoading, 1000),
      { initialProps: { isLoading: true } }
    );

    expect(result.current.showFallback).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.showFallback).toBe(true);
    expect(result.current.hasTimedOut).toBe(true);
  });

  it('should not show fallback when loading completes before timeout', () => {
    const { result, rerender } = renderHook(
      ({ isLoading }) => useLoadingWithTimeout(isLoading, 1000),
      { initialProps: { isLoading: true } }
    );

    act(() => {
      vi.advanceTimersByTime(500);
    });

    rerender({ isLoading: false });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.showFallback).toBe(false);
    expect(result.current.hasTimedOut).toBe(false);
  });

  it('should reset fallback state when loading stops', () => {
    const { result, rerender } = renderHook(
      ({ isLoading }) => useLoadingWithTimeout(isLoading, 1000),
      { initialProps: { isLoading: true } }
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.showFallback).toBe(true);

    rerender({ isLoading: false });

    expect(result.current.showFallback).toBe(false);
  });
});

describe('useAssetLoadingTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should progress through loading stages', () => {
    const { result } = renderHook(() => useAssetLoadingTimeout());

    expect(result.current.loadingStage).toBe('initial');

    act(() => {
      result.current.startLoading();
    });

    expect(result.current.loadingStage).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.loadingStage).toBe('extended');
    expect(result.current.totalLoadingTime).toBe(5000);

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(result.current.loadingStage).toBe('fallback');
    expect(result.current.totalLoadingTime).toBe(15000);
    expect(result.current.shouldShowFallback).toBe(true);
  });

  it('should reset loading state', () => {
    const { result } = renderHook(() => useAssetLoadingTimeout());

    act(() => {
      result.current.startLoading();
    });

    // First timeout - should move to extended
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.loadingStage).toBe('extended');

    // Second timeout - should move to fallback
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(result.current.loadingStage).toBe('fallback');

    act(() => {
      result.current.reset();
    });

    expect(result.current.loadingStage).toBe('initial');
    expect(result.current.totalLoadingTime).toBe(0);
    expect(result.current.shouldShowFallback).toBe(false);
  });
});