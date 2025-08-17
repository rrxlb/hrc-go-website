import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useStandaloneAssetLoader } from '../useAssetLoader';

// Mock performance monitor
vi.mock('@/lib/utils/performanceMonitor', () => ({
  performanceMonitor: {
    startMonitoring: vi.fn(),
    logProgress: vi.fn(),
    logError: vi.fn(),
    completeMonitoring: vi.fn(),
  },
  shouldReduceQuality: vi.fn(() => false),
}));

describe('useStandaloneAssetLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts with initial loading state', async () => {
    const { result } = renderHook(() => useStandaloneAssetLoader());
    
    // The hook starts loading immediately, so we need to check the initial state
    // The loading might have already started, so we just verify the structure
    expect(result.current.isComplete).toBe(false);
    expect(Array.isArray(result.current.loadedAssets)).toBe(true);
    expect(Array.isArray(result.current.failedAssets)).toBe(true);
    
    // Progress might have started, so just check it's a valid number
    expect(typeof result.current.progress).toBe('number');
    expect(result.current.progress).toBeGreaterThanOrEqual(0);
    expect(result.current.progress).toBeLessThanOrEqual(100);
  });

  it('progresses through loading states', async () => {
    const { result } = renderHook(() => useStandaloneAssetLoader());
    
    // Should start loading immediately
    await waitFor(() => {
      expect(result.current.progress).toBeGreaterThan(0);
    });

    // Should have a current asset
    expect(result.current.currentAsset).toBeDefined();
  });

  it('completes loading process', async () => {
    const { result } = renderHook(() => useStandaloneAssetLoader());
    
    await waitFor(() => {
      expect(result.current.isComplete).toBe(true);
      expect(result.current.progress).toBe(100);
    }, { timeout: 5000 });

    // Should have loaded assets
    expect(result.current.loadedAssets.length).toBeGreaterThan(0);
  });

  it('updates current asset during loading', async () => {
    const { result } = renderHook(() => useStandaloneAssetLoader());
    
    const initialAsset = result.current.currentAsset;
    
    await waitFor(() => {
      expect(result.current.currentAsset).toBeDefined();
    });

    // Current asset should change during loading
    await waitFor(() => {
      expect(result.current.currentAsset).not.toBe(initialAsset);
    }, { timeout: 2000 });
  });
});