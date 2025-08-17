import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AccessibilityControls from '../AccessibilityControls';
import { AccessibilityProvider } from '../AccessibilityProvider';
import { KeyboardNavigationProvider } from '../KeyboardNavigationProvider';

import { vi } from 'vitest';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock matchMedia
const matchMediaMock = vi.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: matchMediaMock,
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AccessibilityProvider>
    <KeyboardNavigationProvider>
      {children}
    </KeyboardNavigationProvider>
  </AccessibilityProvider>
);

describe('AccessibilityControls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should render accessibility toggle button', () => {
    render(
      <TestWrapper>
        <AccessibilityControls />
      </TestWrapper>
    );

    const toggleButton = screen.getByRole('button', { name: /accessibility controls/i });
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('should open controls panel when toggle button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <AccessibilityControls />
      </TestWrapper>
    );

    const toggleButton = screen.getByRole('button', { name: /accessibility controls/i });
    
    await user.click(toggleButton);

    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Accessibility Settings')).toBeInTheDocument();
  });

  it('should display all accessibility controls', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <AccessibilityControls />
      </TestWrapper>
    );

    const toggleButton = screen.getByRole('button', { name: /accessibility controls/i });
    await user.click(toggleButton);

    // Check for all control options
    expect(screen.getByText('Reduce Motion')).toBeInTheDocument();
    expect(screen.getByText('High Contrast')).toBeInTheDocument();
    expect(screen.getByText('Keyboard Navigation')).toBeInTheDocument();
    expect(screen.getByText('Screen Reader Mode')).toBeInTheDocument();
    expect(screen.getByText('Focus Indicators')).toBeInTheDocument();
  });

  it('should toggle reduce motion setting', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <AccessibilityControls />
      </TestWrapper>
    );

    const toggleButton = screen.getByRole('button', { name: /accessibility controls/i });
    await user.click(toggleButton);

    const reduceMotionSwitch = screen.getByRole('switch', { name: /reduce motion/i });
    expect(reduceMotionSwitch).toHaveAttribute('aria-checked', 'false');

    await user.click(reduceMotionSwitch);

    expect(reduceMotionSwitch).toHaveAttribute('aria-checked', 'true');
  });

  it('should toggle high contrast setting', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <AccessibilityControls />
      </TestWrapper>
    );

    const toggleButton = screen.getByRole('button', { name: /accessibility controls/i });
    await user.click(toggleButton);

    const highContrastSwitch = screen.getByRole('switch', { name: /high contrast/i });
    expect(highContrastSwitch).toHaveAttribute('aria-checked', 'false');

    await user.click(highContrastSwitch);

    expect(highContrastSwitch).toHaveAttribute('aria-checked', 'true');
  });

  it('should toggle keyboard navigation setting', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <AccessibilityControls />
      </TestWrapper>
    );

    const toggleButton = screen.getByRole('button', { name: /accessibility controls/i });
    await user.click(toggleButton);

    const keyboardNavSwitch = screen.getByRole('switch', { name: /keyboard navigation/i });
    expect(keyboardNavSwitch).toHaveAttribute('aria-checked', 'true'); // Default is true

    await user.click(keyboardNavSwitch);

    expect(keyboardNavSwitch).toHaveAttribute('aria-checked', 'false');
  });

  it('should show system setting indicator for disabled controls', async () => {
    // Mock system preference for reduced motion
    matchMediaMock.mockImplementation(query => {
      if (query === '(prefers-reduced-motion: reduce)') {
        return {
          matches: true,
          media: query,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
        };
      }
      return {
        matches: false,
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };
    });

    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <AccessibilityControls />
      </TestWrapper>
    );

    const toggleButton = screen.getByRole('button', { name: /accessibility controls/i });
    await user.click(toggleButton);

    expect(screen.getByText('(System Setting)')).toBeInTheDocument();
  });

  it('should close panel when Escape key is pressed', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <AccessibilityControls />
      </TestWrapper>
    );

    const toggleButton = screen.getByRole('button', { name: /accessibility controls/i });
    await user.click(toggleButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should have proper ARIA attributes', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <AccessibilityControls />
      </TestWrapper>
    );

    const toggleButton = screen.getByRole('button', { name: /accessibility controls/i });
    expect(toggleButton).toHaveAttribute('aria-controls', 'accessibility-panel');
    
    await user.click(toggleButton);

    const panel = screen.getByRole('dialog');
    expect(panel).toHaveAttribute('aria-labelledby', 'accessibility-title');
    expect(panel).toHaveAttribute('aria-describedby', 'accessibility-description');
  });

  it('should show status indicators', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <AccessibilityControls />
      </TestWrapper>
    );

    const toggleButton = screen.getByRole('button', { name: /accessibility controls/i });
    await user.click(toggleButton);

    expect(screen.getByText('Keyboard User')).toBeInTheDocument();
    expect(screen.getByText('System: Reduced Motion')).toBeInTheDocument();
    expect(screen.getByText('System: High Contrast')).toBeInTheDocument();
  });

  it('should render in different positions', () => {
    const { rerender } = render(
      <TestWrapper>
        <AccessibilityControls position="top-right" />
      </TestWrapper>
    );

    let container = screen.getByRole('button', { name: /accessibility controls/i }).parentElement;
    expect(container).toHaveClass('top-4', 'right-4');

    rerender(
      <TestWrapper>
        <AccessibilityControls position="bottom-left" />
      </TestWrapper>
    );

    container = screen.getByRole('button', { name: /accessibility controls/i }).parentElement;
    expect(container).toHaveClass('bottom-4', 'left-4');
  });

  it('should handle keyboard navigation within the panel', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <AccessibilityControls />
      </TestWrapper>
    );

    const toggleButton = screen.getByRole('button', { name: /accessibility controls/i });
    await user.click(toggleButton);

    // Tab through the switches
    const switches = screen.getAllByRole('switch');
    
    await user.tab();
    expect(switches[0]).toHaveFocus();

    await user.tab();
    expect(switches[1]).toHaveFocus();
  });

  it('should save preferences to localStorage', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <AccessibilityControls />
      </TestWrapper>
    );

    const toggleButton = screen.getByRole('button', { name: /accessibility controls/i });
    await user.click(toggleButton);

    const reduceMotionSwitch = screen.getByRole('switch', { name: /reduce motion/i });
    await user.click(reduceMotionSwitch);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'accessibility-preferences',
      expect.stringContaining('"reduceMotion":true')
    );
  });
});