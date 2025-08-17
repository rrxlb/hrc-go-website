import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the device detection hook before importing the component
vi.mock('../../../lib/utils/deviceDetection');

import ResponsiveLayout, { ResponsiveContainer, ResponsiveGrid } from '../ResponsiveLayout';
import { useDeviceCapabilities } from '../../../lib/utils/deviceDetection';

const mockUseDeviceCapabilities = vi.mocked(useDeviceCapabilities);

describe('ResponsiveLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set default mock return value
    mockUseDeviceCapabilities.mockReturnValue({
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      hasTouch: false,
      screenSize: 'lg',
      pixelRatio: 1,
      webglSupport: true,
      maxTextureSize: 2048,
      memoryLimit: 4096,
      connectionSpeed: 'fast'
    });
  });

  it('renders children correctly', () => {
    render(
      <ResponsiveLayout>
        <div data-testid="test-content">Test Content</div>
      </ResponsiveLayout>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('applies desktop layout classes by default', () => {
    const { container } = render(
      <ResponsiveLayout>
        <div>Content</div>
      </ResponsiveLayout>
    );

    const layoutDiv = container.firstChild as HTMLElement;
    expect(layoutDiv).toHaveClass('desktop-layout');
    expect(layoutDiv).not.toHaveClass('mobile-layout');
    expect(layoutDiv).not.toHaveClass('tablet-layout');
  });

  it('applies mobile-specific classes when on mobile', () => {
    mockUseDeviceCapabilities.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      hasTouch: true,
      screenSize: 'sm',
      pixelRatio: 2,
      webglSupport: true,
      maxTextureSize: 1024,
      memoryLimit: 1024,
      connectionSpeed: 'medium'
    });

    const { container } = render(
      <ResponsiveLayout>
        <div>Content</div>
      </ResponsiveLayout>
    );

    const layoutDiv = container.firstChild as HTMLElement;
    expect(layoutDiv).toHaveClass('mobile-layout');
    expect(layoutDiv).toHaveClass('touch-optimized');
    expect(layoutDiv).toHaveClass('text-sm');
  });

  it('applies tablet-specific classes when on tablet', () => {
    mockUseDeviceCapabilities.mockReturnValue({
      isMobile: false,
      isTablet: true,
      isDesktop: false,
      hasTouch: true,
      screenSize: 'md',
      pixelRatio: 2,
      webglSupport: true,
      maxTextureSize: 2048,
      memoryLimit: 2048,
      connectionSpeed: 'fast'
    });

    const { container } = render(
      <ResponsiveLayout>
        <div>Content</div>
      </ResponsiveLayout>
    );

    const layoutDiv = container.firstChild as HTMLElement;
    expect(layoutDiv).toHaveClass('tablet-layout');
    expect(layoutDiv).toHaveClass('touch-optimized');
  });
});

describe('ResponsiveContainer', () => {
  beforeEach(() => {
    mockUseDeviceCapabilities.mockReturnValue({
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      hasTouch: false,
      screenSize: 'lg',
      pixelRatio: 1,
      webglSupport: true,
      maxTextureSize: 2048,
      memoryLimit: 4096,
      connectionSpeed: 'fast'
    });
  });

  it('renders with default max-width', () => {
    const { container } = render(
      <ResponsiveContainer>
        <div>Content</div>
      </ResponsiveContainer>
    );

    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv).toHaveClass('max-w-7xl');
    expect(containerDiv).toHaveClass('mx-auto');
  });

  it('accepts custom max-width', () => {
    const { container } = render(
      <ResponsiveContainer maxWidth="max-w-4xl">
        <div>Content</div>
      </ResponsiveContainer>
    );

    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv).toHaveClass('max-w-4xl');
  });

  it('applies responsive padding classes', () => {
    const { container } = render(
      <ResponsiveContainer>
        <div>Content</div>
      </ResponsiveContainer>
    );

    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv).toHaveClass('responsive-p-4');
    expect(containerDiv).toHaveClass('sm:responsive-p-6');
    expect(containerDiv).toHaveClass('lg:responsive-p-8');
  });
});

describe('ResponsiveGrid', () => {
  beforeEach(() => {
    mockUseDeviceCapabilities.mockReturnValue({
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      hasTouch: false,
      screenSize: 'lg',
      pixelRatio: 1,
      webglSupport: true,
      maxTextureSize: 2048,
      memoryLimit: 4096,
      connectionSpeed: 'fast'
    });
  });

  it('renders with default grid classes', () => {
    const { container } = render(
      <ResponsiveGrid>
        <div>Item 1</div>
        <div>Item 2</div>
      </ResponsiveGrid>
    );

    const gridDiv = container.firstChild as HTMLElement;
    expect(gridDiv).toHaveClass('grid');
    expect(gridDiv).toHaveClass('grid-cols-1');
    expect(gridDiv).toHaveClass('gap-4');
  });

  it('applies custom column configuration', () => {
    const { container } = render(
      <ResponsiveGrid columns={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }}>
        <div>Item 1</div>
        <div>Item 2</div>
      </ResponsiveGrid>
    );

    const gridDiv = container.firstChild as HTMLElement;
    expect(gridDiv).toHaveClass('grid-cols-1');
    expect(gridDiv).toHaveClass('sm:grid-cols-2');
    expect(gridDiv).toHaveClass('md:grid-cols-3');
    expect(gridDiv).toHaveClass('lg:grid-cols-4');
    expect(gridDiv).toHaveClass('xl:grid-cols-5');
  });

  it('handles partial column configuration', () => {
    const { container } = render(
      <ResponsiveGrid columns={{ xs: 1, lg: 3 }}>
        <div>Item 1</div>
        <div>Item 2</div>
      </ResponsiveGrid>
    );

    const gridDiv = container.firstChild as HTMLElement;
    expect(gridDiv).toHaveClass('grid-cols-1');
    expect(gridDiv).toHaveClass('lg:grid-cols-3');
    expect(gridDiv).not.toHaveClass('sm:grid-cols-2');
  });
});