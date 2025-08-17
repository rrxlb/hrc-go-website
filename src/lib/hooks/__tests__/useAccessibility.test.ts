import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useAccessibility } from '../useAccessibility';

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

describe('useAccessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    matchMediaMock.mockReturnValue({
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });
  });

  it('should initialize with default preferences', () => {
    const { result } = renderHook(() => useAccessibility());

    expect(result.current.reduceMotion).toBe(false);
    expect(result.current.highContrast).toBe(false);
    expect(result.current.keyboardNavigation).toBe(true);
    expect(result.current.screenReaderMode).toBe(false);
    expect(result.current.focusVisible).toBe(true);
  });

  it('should load preferences from localStorage', () => {
    const savedPreferences = {
      reduceMotion: true,
      highContrast: true,
      keyboardNavigation: false,
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedPreferences));

    const { result } = renderHook(() => useAccessibility());

    expect(result.current.reduceMotion).toBe(true);
    expect(result.current.highContrast).toBe(true);
    expect(result.current.keyboardNavigation).toBe(false);
  });

  it('should detect system reduced motion preference', () => {
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

    const { result } = renderHook(() => useAccessibility());

    expect(result.current.prefersReducedMotion).toBe(true);
  });

  it('should detect system high contrast preference', () => {
    matchMediaMock.mockImplementation(query => {
      if (query === '(prefers-contrast: high)') {
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

    const { result } = renderHook(() => useAccessibility());

    expect(result.current.prefersHighContrast).toBe(true);
  });

  it('should update preferences and save to localStorage', () => {
    const { result } = renderHook(() => useAccessibility());

    act(() => {
      result.current.updatePreference('reduceMotion', true);
    });

    expect(result.current.reduceMotion).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'accessibility-preferences',
      expect.stringContaining('"reduceMotion":true')
    );
  });

  it('should toggle reduce motion', () => {
    const { result } = renderHook(() => useAccessibility());

    act(() => {
      result.current.toggleReduceMotion();
    });

    expect(result.current.reduceMotion).toBe(true);

    act(() => {
      result.current.toggleReduceMotion();
    });

    expect(result.current.reduceMotion).toBe(false);
  });

  it('should toggle high contrast', () => {
    const { result } = renderHook(() => useAccessibility());

    act(() => {
      result.current.toggleHighContrast();
    });

    expect(result.current.highContrast).toBe(true);

    act(() => {
      result.current.toggleHighContrast();
    });

    expect(result.current.highContrast).toBe(false);
  });

  it('should toggle keyboard navigation', () => {
    const { result } = renderHook(() => useAccessibility());

    act(() => {
      result.current.toggleKeyboardNavigation();
    });

    expect(result.current.keyboardNavigation).toBe(false);

    act(() => {
      result.current.toggleKeyboardNavigation();
    });

    expect(result.current.keyboardNavigation).toBe(true);
  });

  it('should toggle screen reader mode', () => {
    const { result } = renderHook(() => useAccessibility());

    act(() => {
      result.current.toggleScreenReaderMode();
    });

    expect(result.current.screenReaderMode).toBe(true);

    act(() => {
      result.current.toggleScreenReaderMode();
    });

    expect(result.current.screenReaderMode).toBe(false);
  });

  it('should toggle focus visible', () => {
    const { result } = renderHook(() => useAccessibility());

    act(() => {
      result.current.toggleFocusVisible();
    });

    expect(result.current.focusVisible).toBe(false);

    act(() => {
      result.current.toggleFocusVisible();
    });

    expect(result.current.focusVisible).toBe(true);
  });

  it('should detect keyboard usage', () => {
    const { result } = renderHook(() => useAccessibility());

    // Simulate Tab key press
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Tab' });
      document.dispatchEvent(event);
    });

    expect(result.current.isKeyboardUser).toBe(true);

    // Simulate mouse click
    act(() => {
      const event = new MouseEvent('mousedown');
      document.dispatchEvent(event);
    });

    expect(result.current.isKeyboardUser).toBe(false);
  });

  it('should handle localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useAccessibility());

    expect(result.current.reduceMotion).toBe(false); // Should use defaults
    expect(consoleSpy).toHaveBeenCalledWith('Failed to load accessibility preferences:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should handle localStorage save errors gracefully', () => {
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('localStorage save error');
    });

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useAccessibility());

    act(() => {
      result.current.updatePreference('reduceMotion', true);
    });

    expect(result.current.reduceMotion).toBe(true); // Should still update state
    expect(consoleSpy).toHaveBeenCalledWith('Failed to save accessibility preferences:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should apply CSS classes based on preferences', () => {
    const { result } = renderHook(() => useAccessibility());

    act(() => {
      result.current.updatePreference('reduceMotion', true);
    });

    expect(document.body.classList.contains('reduce-motion')).toBe(true);

    act(() => {
      result.current.updatePreference('highContrast', true);
    });

    expect(document.body.classList.contains('high-contrast')).toBe(true);

    act(() => {
      result.current.updatePreference('screenReaderMode', true);
    });

    expect(document.body.classList.contains('screen-reader-mode')).toBe(true);

    act(() => {
      result.current.updatePreference('focusVisible', true);
    });

    expect(document.body.classList.contains('focus-visible')).toBe(true);
  });
});