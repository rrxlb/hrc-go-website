import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import CasinoErrorHandler, { ComponentErrorHandler, GameErrorHandler } from '../CasinoErrorHandler';
import { useWebGLCapabilities } from '@/lib/utils/webglDetection';
import { useLoadingWithTimeout } from '@/lib/hooks/useTimeoutFallback';

// Mock dependencies
vi.mock('@/lib/utils/webglDetection', () => ({
  useWebGLCapabilities: vi.fn(() => ({
    capabilities: { hasWebGL: true, hasWebGL2: true },
    canRender3D: true,
    quality: 'high',
    isLoading: false
  }))
}));

vi.mock('@/lib/hooks/useTimeoutFallback', () => ({
  useLoadingWithTimeout: vi.fn(() => ({
    showFallback: false,
    hasTimedOut: false,
    reset: vi.fn()
  }))
}));

vi.mock('@/components/loading/FallbackExperience', () => ({
  default: ({ reason, onRetry }: any) => (
    <div data-testid="fallback-experience">
      <span>Fallback: {reason}</span>
      {onRetry && <button onClick={onRetry}>Retry</button>}
    </div>
  )
}));

vi.mock('@/components/loading/LoadingScreen', () => ({
  default: () => <div data-testid="loading-screen">Loading...</div>
}));

vi.mock('./ErrorBoundary', () => ({
  ThreeDErrorBoundary: ({ children }: any) => (
    <div data-testid="3d-error-boundary">{children}</div>
  )
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}));

const TestComponent = () => <div>Test Content</div>;

// Get references to the mocked functions
const mockUseWebGLCapabilities = vi.mocked(useWebGLCapabilities);
const mockUseLoadingWithTimeout = vi.mocked(useLoadingWithTimeout);

describe('CasinoErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Set default mock return values
    mockUseWebGLCapabilities.mockReturnValue({
      capabilities: { hasWebGL: true, hasWebGL2: true },
      canRender3D: true,
      quality: 'high',
      isLoading: false
    });
    
    mockUseLoadingWithTimeout.mockReturnValue({
      showFallback: false,
      hasTimedOut: false,
      reset: vi.fn()
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render children when WebGL is supported and loading is complete', async () => {
    render(
      <CasinoErrorHandler>
        <TestComponent />
      </CasinoErrorHandler>
    );

    // Initially should show loading
    expect(screen.getByTestId('loading-screen')).toBeInTheDocument();

    // Advance timer to complete loading
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Check if content appears
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByTestId('3d-error-boundary')).toBeInTheDocument();
  });

  it('should show loading screen while WebGL capabilities are being detected', () => {
    mockUseWebGLCapabilities.mockReturnValue({
      capabilities: null,
      canRender3D: false,
      quality: 'medium',
      isLoading: true
    });

    render(
      <CasinoErrorHandler>
        <TestComponent />
      </CasinoErrorHandler>
    );

    expect(screen.getByTestId('loading-screen')).toBeInTheDocument();
    expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
  });

  it('should show WebGL fallback when WebGL is not supported', async () => {
    mockUseWebGLCapabilities.mockReturnValue({
      capabilities: { hasWebGL: false },
      canRender3D: false,
      quality: 'low',
      isLoading: false
    });

    render(
      <CasinoErrorHandler enableWebGLDetection={true}>
        <TestComponent />
      </CasinoErrorHandler>
    );

    // Advance timer to complete loading
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByTestId('fallback-experience')).toBeInTheDocument();
      expect(screen.getByText('Fallback: webgl')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('should show performance fallback when device has limited capabilities', async () => {
    mockUseWebGLCapabilities.mockReturnValue({
      capabilities: { hasWebGL: true },
      canRender3D: false,
      quality: 'low',
      isLoading: false
    });

    render(
      <CasinoErrorHandler enableWebGLDetection={true}>
        <TestComponent />
      </CasinoErrorHandler>
    );

    // Advance timer to complete loading
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByTestId('fallback-experience')).toBeInTheDocument();
      expect(screen.getByText('Fallback: performance')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('should show timeout fallback when loading takes too long', async () => {
    mockUseLoadingWithTimeout.mockReturnValue({
      showFallback: true,
      hasTimedOut: true,
      reset: vi.fn()
    });

    mockUseWebGLCapabilities.mockReturnValue({
      capabilities: { hasWebGL: true },
      canRender3D: false,
      quality: 'medium',
      isLoading: false
    });

    render(
      <CasinoErrorHandler enableTimeoutFallback={true}>
        <TestComponent />
      </CasinoErrorHandler>
    );

    expect(screen.getByTestId('fallback-experience')).toBeInTheDocument();
    expect(screen.getByText('Fallback: timeout')).toBeInTheDocument();
  });

  it('should disable WebGL detection when enableWebGLDetection is false', async () => {
    mockUseWebGLCapabilities.mockReturnValue({
      capabilities: { hasWebGL: false },
      canRender3D: false,
      quality: 'low',
      isLoading: false
    });

    render(
      <CasinoErrorHandler enableWebGLDetection={false}>
        <TestComponent />
      </CasinoErrorHandler>
    );

    // Advance timer to complete loading
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    }, { timeout: 1000 });

    expect(screen.queryByTestId('fallback-experience')).not.toBeInTheDocument();
  });

  it('should set quality attribute on wrapper div', async () => {
    mockUseWebGLCapabilities.mockReturnValue({
      capabilities: { hasWebGL: true },
      canRender3D: true,
      quality: 'high',
      isLoading: false
    });

    render(
      <CasinoErrorHandler>
        <TestComponent />
      </CasinoErrorHandler>
    );

    // Advance timer to complete loading
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByTestId('3d-error-boundary')).toBeInTheDocument();
    }, { timeout: 1000 });

    const wrapper = screen.getByTestId('3d-error-boundary').firstChild;
    expect(wrapper).toHaveAttribute('data-webgl-quality', 'high');
  });
});

describe('ComponentErrorHandler', () => {
  it('should wrap children in error boundary with component name', () => {
    render(
      <ComponentErrorHandler componentName="TestComponent">
        <TestComponent />
      </ComponentErrorHandler>
    );

    const wrapper = screen.getByTestId('3d-error-boundary').firstChild;
    expect(wrapper).toHaveAttribute('data-component', 'TestComponent');
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should use default component name when not provided', () => {
    render(
      <ComponentErrorHandler>
        <TestComponent />
      </ComponentErrorHandler>
    );

    const wrapper = screen.getByTestId('3d-error-boundary').firstChild;
    expect(wrapper).toHaveAttribute('data-component', 'Component');
  });
});

describe('GameErrorHandler', () => {
  it('should wrap children in error boundary with game ID', () => {
    render(
      <GameErrorHandler gameId="blackjack">
        <TestComponent />
      </GameErrorHandler>
    );

    const wrapper = screen.getByTestId('3d-error-boundary').firstChild;
    expect(wrapper).toHaveAttribute('data-game-id', 'blackjack');
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});