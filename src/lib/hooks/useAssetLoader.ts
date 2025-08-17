'use client';

import { useState, useEffect, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { TextureLoader, LoadingManager } from 'three';
import { performanceMonitor, shouldReduceQuality } from '@/lib/utils/performanceMonitor';
import { performanceAssetLoader, createLoadingStrategy, createNetworkAwareAsset } from '@/lib/utils/performanceAssetLoader';

interface AssetItem {
  id: string;
  type: 'texture' | 'model' | 'audio';
  url: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
}

interface LoadingState {
  progress: number;
  isComplete: boolean;
  currentAsset?: string;
  loadedAssets: string[];
  failedAssets: string[];
}

// Define critical assets that need to be loaded first
const CRITICAL_ASSETS: AssetItem[] = [
  {
    id: 'casino-floor-texture',
    type: 'texture',
    url: '/textures/casino-floor.jpg',
    priority: 'high',
    description: 'Casino Floor'
  },
  {
    id: 'table-felt-texture',
    type: 'texture', 
    url: '/textures/table-felt.jpg',
    priority: 'high',
    description: 'Table Materials'
  },
  {
    id: 'chip-texture',
    type: 'texture',
    url: '/textures/poker-chip.jpg', 
    priority: 'high',
    description: 'Game Assets'
  },
  {
    id: 'card-texture',
    type: 'texture',
    url: '/textures/playing-card.jpg',
    priority: 'medium',
    description: 'Card Textures'
  },
  {
    id: 'roulette-texture',
    type: 'texture',
    url: '/textures/roulette-wheel.jpg',
    priority: 'medium', 
    description: 'Roulette Assets'
  },
  {
    id: 'slot-texture',
    type: 'texture',
    url: '/textures/slot-machine.jpg',
    priority: 'low',
    description: 'Slot Machine'
  },
];

export function useAssetLoader() {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    progress: 0,
    isComplete: false,
    currentAsset: undefined,
    loadedAssets: [],
    failedAssets: [],
  });

  const { gl } = useThree();

  const updateProgress = useCallback((loaded: number, total: number, currentItem?: string) => {
    const progress = total > 0 ? (loaded / total) * 100 : 0;
    
    setLoadingState(prev => ({
      ...prev,
      progress,
      currentAsset: currentItem,
      isComplete: progress >= 100,
    }));
  }, []);

  const loadAssets = useCallback(async () => {
    performanceMonitor.startMonitoring();
    
    const reduceQuality = shouldReduceQuality();
    const assetsToLoad = reduceQuality 
      ? CRITICAL_ASSETS.filter(asset => asset.priority === 'high')
      : CRITICAL_ASSETS;

    // Convert legacy assets to network-aware format
    const networkAwareAssets = assetsToLoad.map(asset => {
      const strategy = createLoadingStrategy(asset.priority, {
        loadCondition: () => true,
        maxRetries: asset.priority === 'high' ? 5 : 3,
        timeout: asset.priority === 'high' ? 15000 : 10000
      });

      // Create quality variants based on asset type
      const alternatives = {
        slow: asset.url.replace('.jpg', '_low.jpg').replace('.png', '_low.png'),
        medium: asset.url.replace('.jpg', '_med.jpg').replace('.png', '_med.png'),
        fast: asset.url
      };

      return createNetworkAwareAsset(
        asset.id,
        asset.url,
        asset.type,
        asset.priority === 'high' ? 512 * 1024 : 256 * 1024, // Estimated size
        strategy,
        alternatives
      );
    });

    // Add assets to performance loader
    networkAwareAssets.forEach(asset => {
      performanceAssetLoader.addAsset(asset);
    });

    // Set up progress callback
    performanceAssetLoader.addProgressCallback((progress) => {
      setLoadingState(prev => ({
        ...prev,
        progress: progress.loaded / progress.total * 100,
        currentAsset: progress.currentAsset,
        isComplete: progress.loaded >= progress.total
      }));
      
      performanceMonitor.logProgress(
        progress.loaded / progress.total * 100,
        progress.currentAsset
      );
    });

    try {
      // Load assets using performance-aware loader
      const loadedAssets = await performanceAssetLoader.loadAssets();
      
      // Update state with loaded assets
      setLoadingState(prev => ({
        ...prev,
        loadedAssets: Array.from(loadedAssets.keys()),
        isComplete: true
      }));

      performanceMonitor.completeMonitoring(networkAwareAssets.length);
      
    } catch (error) {
      console.error('Asset loading failed:', error);
      performanceMonitor.logError('asset-loading-failed');
      
      setLoadingState(prev => ({
        ...prev,
        failedAssets: [...prev.failedAssets, 'asset-loading-failed'],
        isComplete: true
      }));
    }
  }, [updateProgress]);

  const getAssetDescription = (url: string): string => {
    const asset = CRITICAL_ASSETS.find(a => a.url === url);
    return asset?.description || 'Loading assets';
  };

  // Start loading when hook is initialized
  useEffect(() => {
    // Add a small delay to ensure Three.js context is ready
    const timeoutId = setTimeout(() => {
      loadAssets();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [loadAssets]);

  return loadingState;
}

// Standalone version for use outside Three.js context
export function useStandaloneAssetLoader() {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    progress: 0,
    isComplete: false,
    currentAsset: undefined,
    loadedAssets: [],
    failedAssets: [],
  });

  const simulateLoading = useCallback(async () => {
    const totalSteps = CRITICAL_ASSETS.length;
    
    for (let i = 0; i < totalSteps; i++) {
      const asset = CRITICAL_ASSETS[i];
      const progress = ((i + 1) / totalSteps) * 100;
      
      setLoadingState(prev => ({
        ...prev,
        progress,
        currentAsset: asset.description,
        loadedAssets: [...prev.loadedAssets, asset.id],
      }));
      
      // Simulate loading time based on priority
      const delay = asset.priority === 'high' ? 300 : asset.priority === 'medium' ? 200 : 150;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    // Mark as complete
    setTimeout(() => {
      setLoadingState(prev => ({ ...prev, isComplete: true }));
    }, 200);
  }, []);

  useEffect(() => {
    simulateLoading();
  }, [simulateLoading]);

  return loadingState;
}