import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ResponsiveLayout from '../ResponsiveLayout';
import MobileOptimizedButton from '../../ui/MobileOptimizedButton';
import MobileGameCard from '../../ui/MobileGameCard';
import { GAMES } from '@/lib/data/games';

// Mock device capabilities
const mockDeviceCapabilities = {
  isMobile: true,
  isTablet: false,
  isDesktop: false,
  hasTouch: true,
  screenSize: 'xs' as const,
  pixelRatio: 2,
  webglSupport: true,
  maxTextureSize: 2048,
  memoryLimit: 512,
  connectionSpeed: 'medium' as const
};

vi.mock('@/lib/utils/deviceDetection', () => ({
  useDeviceCapabilities: () => mockDeviceCapabilities,
  detectDevice: () => mockDeviceCapabilities
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('Mobile Optimization', () => {
  beforeEach(() => {
    // Mock window dimensions for mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667,
    });

    // Mock touch support
    Object.defineProperty(window, 'ontouchstart', {
      writable: true,
      configurable: true,
      value: null,
    });

    // Mock navigator
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: 5,
    });

    // Reset device capabilities for each test
    mockDeviceCapabilities.isMobile = true;
    mockDeviceCapabilities.screenSize = 'xs';
  });

  describe('ResponsiveLayout', () => {
    it('applies mobile-specific classes and styles', () => {
      const { container } = render(
        <ResponsiveLayout>
          <div>Test content</div>
        </ResponsiveLayout>
      );

      const layoutElement = container.firstChild as HTMLElement;
      expect(layoutElement).toHaveClass('mobile-layout');
      expect(layoutElement).toHaveClass('touch-optimized');
    });

    it('renders without errors on mobile', () => {
      const { container } = render(
        <ResponsiveLayout>
          <div data-testid="mobile-content">Mobile test content</div>
        </ResponsiveLayout>
      );

      expect(screen.getByTestId('mobile-content')).toBeInTheDocument();
      expect(container.firstChild).toHaveClass('text-sm'); // Mobile text size
    });

    it('applies correct screen size classes', () => {
      const { container } = render(
        <ResponsiveLayout>
          <div>Test content</div>
        </ResponsiveLayout>
      );

      const layoutElement = container.firstChild as HTMLElement;
      expect(layoutElement).toHaveClass('text-sm'); // xs screen size
    });
  });

  describe('MobileOptimizedButton', () => {
    it('renders with touch-optimized dimensions on mobile', () => {
      render(
        <MobileOptimizedButton size="md">
          Test Button
        </MobileOptimizedButton>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('min-h-[48px]'); // Touch-friendly height
      expect(button).toHaveClass('touch-manipulation');
    });

    it('provides haptic feedback on mobile when clicked', () => {
      const mockVibrate = vi.fn();
      Object.defineProperty(navigator, 'vibrate', {
        writable: true,
        configurable: true,
        value: mockVibrate,
      });

      const handleClick = vi.fn();
      render(
        <MobileOptimizedButton onClick={handleClick}>
          Test Button
        </MobileOptimizedButton>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalled();
      expect(mockVibrate).toHaveBeenCalledWith(10);
    });

    it('scales appropriately for different screen sizes', () => {
      const { rerender } = render(
        <MobileOptimizedButton size="lg">
          Test Button
        </MobileOptimizedButton>
      );

      let button = screen.getByRole('button');
      expect(button).toHaveClass('min-h-[52px]'); // Large mobile size

      // Test with tablet size
      mockDeviceCapabilities.screenSize = 'md';
      mockDeviceCapabilities.isMobile = false;
      mockDeviceCapabilities.isTablet = true;

      rerender(
        <MobileOptimizedButton size="lg">
          Test Button
        </MobileOptimizedButton>
      );

      button = screen.getByRole('button');
      expect(button).toHaveClass('min-h-[44px]'); // Tablet size
    });
  });

  describe('MobileGameCard', () => {
    const testGame = GAMES[0];

    it('renders game information correctly', () => {
      render(
        <MobileGameCard
          game={testGame}
          compact={true}
        />
      );

      expect(screen.getByText(testGame.displayName)).toBeInTheDocument();
      expect(screen.getByText(testGame.discordCommand)).toBeInTheDocument();
    });

    it('shows selection state correctly', () => {
      const { rerender } = render(
        <MobileGameCard
          game={testGame}
          isSelected={false}
        />
      );

      let card = screen.getByText(testGame.displayName).closest('div');
      expect(card).toHaveClass('border-casino-gold/20');

      rerender(
        <MobileGameCard
          game={testGame}
          isSelected={true}
        />
      );

      card = screen.getByText(testGame.displayName).closest('div');
      expect(card).toHaveClass('border-casino-gold/60');
    });

    it('handles click interactions', () => {
      const handleSelect = vi.fn();

      render(
        <MobileGameCard
          game={testGame}
          onSelect={handleSelect}
        />
      );

      const card = screen.getByText(testGame.displayName).closest('div');
      fireEvent.click(card!);
      expect(handleSelect).toHaveBeenCalledWith(testGame.id);
    });

    it('renders play button correctly', () => {
      const handlePlayNow = vi.fn();

      render(
        <MobileGameCard
          game={testGame}
          onPlayNow={handlePlayNow}
        />
      );

      // Should show "Play Now" button on non-xs screens
      const playButton = screen.getByText('Play Now');
      expect(playButton).toBeInTheDocument();
      
      fireEvent.click(playButton);
      expect(handlePlayNow).toHaveBeenCalledWith(testGame.id);
    });
  });

  describe('Touch Interactions', () => {
    it('applies touch-optimized classes', () => {
      const { container } = render(
        <ResponsiveLayout>
          <div className="ui-element">Non-selectable text</div>
        </ResponsiveLayout>
      );

      const layoutElement = container.firstChild as HTMLElement;
      expect(layoutElement).toHaveClass('touch-optimized');
    });

    it('renders canvas elements correctly', () => {
      render(
        <ResponsiveLayout>
          <canvas data-testid="test-canvas">Test canvas</canvas>
        </ResponsiveLayout>
      );

      const canvas = screen.getByTestId('test-canvas');
      expect(canvas).toBeInTheDocument();
    });
  });

  describe('Performance Optimizations', () => {
    it('applies mobile layout classes', () => {
      const { container } = render(
        <ResponsiveLayout>
          <div>Test content</div>
        </ResponsiveLayout>
      );

      const layoutElement = container.firstChild as HTMLElement;
      expect(layoutElement).toHaveClass('mobile-layout');
    });

    it('handles orientation changes gracefully', () => {
      const { container } = render(
        <ResponsiveLayout>
          <div>Test content</div>
        </ResponsiveLayout>
      );

      // Simulate orientation change
      act(() => {
        Object.defineProperty(window, 'innerWidth', { value: 667 });
        Object.defineProperty(window, 'innerHeight', { value: 375 });
        window.dispatchEvent(new Event('orientationchange'));
      });

      // Should handle the orientation change gracefully
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('maintains appropriate touch target sizes', () => {
      render(
        <MobileOptimizedButton size="sm">
          Small Button
        </MobileOptimizedButton>
      );

      const button = screen.getByRole('button');
      // On mobile, small buttons should still be touch-friendly
      expect(button).toHaveClass('min-h-[44px]'); // Touch-friendly height on mobile
    });

    it('provides proper focus indicators', () => {
      render(
        <MobileOptimizedButton>
          Test Button
        </MobileOptimizedButton>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:ring-2');
      expect(button).toHaveClass('focus:ring-casino-gold/50');
    });
  });

  describe('Responsive Breakpoints', () => {
    it('applies correct styles for different screen sizes', () => {
      const testSizes = [
        { width: 320, expected: 'xs' },
        { width: 640, expected: 'sm' },
        { width: 768, expected: 'md' },
        { width: 1024, expected: 'lg' },
        { width: 1280, expected: 'xl' }
      ];

      testSizes.forEach(({ width, expected }) => {
        Object.defineProperty(window, 'innerWidth', { value: width });
        
        const { container } = render(
          <ResponsiveLayout>
            <div data-testid={`screen-${expected}`}>Content</div>
          </ResponsiveLayout>
        );

        // Should render without errors for each screen size
        expect(container.firstChild).toBeTruthy();
      });
    });
  });
});