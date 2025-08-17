import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import LoadingScreen from '../LoadingScreen';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock the asset loader hook
vi.mock('@/lib/hooks/useAssetLoader', () => ({
  useAssetLoader: vi.fn(() => ({
    progress: 50,
    isComplete: false,
    currentAsset: 'Casino Floor',
  })),
  useStandaloneAssetLoader: vi.fn(() => ({
    progress: 50,
    isComplete: false,
    currentAsset: 'Casino Floor',
    loadedAssets: [],
    failedAssets: [],
  })),
}));

describe('LoadingScreen', () => {
  const mockOnLoadingComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading screen with title and progress', () => {
    render(<LoadingScreen onLoadingComplete={mockOnLoadingComplete} />);
    
    expect(screen.getByText('High Roller Club')).toBeInTheDocument();
    expect(screen.getByText('Preparing your exclusive casino experience...')).toBeInTheDocument();
    expect(screen.getByText('Loading Casino Floor...')).toBeInTheDocument();
  });

  it('shows loading tips', () => {
    render(<LoadingScreen onLoadingComplete={mockOnLoadingComplete} />);
    
    expect(screen.getByText('💎 Loading premium 3D casino environment')).toBeInTheDocument();
    expect(screen.getByText('🎰 Preparing interactive game tables')).toBeInTheDocument();
  });

  it('calls onLoadingComplete when loading is finished', async () => {
    const { useStandaloneAssetLoader } = await import('@/lib/hooks/useAssetLoader');
    
    // Mock completed loading
    vi.mocked(useStandaloneAssetLoader).mockReturnValue({
      progress: 100,
      isComplete: true,
      currentAsset: undefined,
      loadedAssets: [],
      failedAssets: [],
    });

    render(<LoadingScreen onLoadingComplete={mockOnLoadingComplete} minLoadingTime={100} />);
    
    await waitFor(() => {
      expect(mockOnLoadingComplete).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('respects minimum loading time', async () => {
    const { useStandaloneAssetLoader } = await import('@/lib/hooks/useAssetLoader');
    
    // Mock immediate completion
    vi.mocked(useStandaloneAssetLoader).mockReturnValue({
      progress: 100,
      isComplete: true,
      currentAsset: undefined,
      loadedAssets: [],
      failedAssets: [],
    });

    const startTime = Date.now();
    render(<LoadingScreen onLoadingComplete={mockOnLoadingComplete} minLoadingTime={500} />);
    
    await waitFor(() => {
      expect(mockOnLoadingComplete).toHaveBeenCalled();
      const elapsedTime = Date.now() - startTime;
      expect(elapsedTime).toBeGreaterThanOrEqual(400); // Allow some tolerance
    }, { timeout: 1000 });
  });
});