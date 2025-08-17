import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useKeyboardNavigation } from '../useKeyboardNavigation';
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
import { it } from 'node:test';
import { it } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

// Mock DOM methods
const mockFocus = vi.fn();
const mockQuerySelectorAll = vi.fn();

// Create mock elements
const createMockElement = (id: string, disabled = false, hidden = false) => ({
  id,
  focus: mockFocus,
  disabled,
  hidden,
  offsetWidth: hidden ? 0 : 100,
  offsetHeight: hidden ? 0 : 50,
  getAttribute: vi.fn((attr) => {
    if (attr === 'disabled') return disabled ? 'true' : null;
    if (attr === 'aria-hidden') return hidden ? 'true' : null;
    return null;
  }),
  style: {
    display: hidden ? 'none' : 'block',
    visibility: 'visible',
    opacity: '1'
  }
});

describe('useKeyboardNavigation', () => {
  let mockContainer: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockContainer = {
      querySelectorAll: mockQuerySelectorAll,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    // Mock MutationObserver
    global.MutationObserver = vi.fn().mockImplementation((callback) => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
    }));

    // Mock getComputedStyle
    global.getComputedStyle = vi.fn().mockReturnValue({
      display: 'block',
      visibility: 'visible',
      opacity: '1'
    });
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useKeyboardNavigation());

    expect(result.current.focusedIndex).toBe(-1);
    expect(result.current.focusableElements).toEqual([]);
  });

  it('should find focusable elements', () => {
    const mockElements = [
      createMockElement('button1'),
      createMockElement('button2'),
      createMockElement('button3', true), // disabled
      createMockElement('button4', false, true), // hidden
    ];

    mockQuerySelectorAll.mockReturnValue(mockElements);

    const { result } = renderHook(() => useKeyboardNavigation());

    // Mock the container ref
    act(() => {
      if (result.current.containerRef.current) {
        result.current.containerRef.current = mockContainer;
      }
    });

    act(() => {
      result.current.updateFocusableElements();
    });

    // Should only include visible, enabled elements
    expect(result.current.focusableElements).toHaveLength(1);
    expect(result.current.focusableElements[0].id).toBe('button1');
  });

  it('should focus next element', () => {
    const mockElements = [
      createMockElement('button1'),
      createMockElement('button2'),
    ];

    const { result } = renderHook(() => useKeyboardNavigation());

    // Set up focusable elements
    act(() => {
      result.current.focusableElements = mockElements as any;
      result.current.focusedIndex = 0;
    });

    act(() => {
      result.current.focusNext();
    });

    expect(mockFocus).toHaveBeenCalledWith();
    expect(result.current.focusedIndex).toBe(1);
  });

  it('should wrap to first element when focusing next from last', () => {
    const mockElements = [
      createMockElement('button1'),
      createMockElement('button2'),
    ];

    const { result } = renderHook(() => useKeyboardNavigation());

    // Set up focusable elements at last index
    act(() => {
      result.current.focusableElements = mockElements as any;
      result.current.focusedIndex = 1;
    });

    act(() => {
      result.current.focusNext();
    });

    expect(result.current.focusedIndex).toBe(0);
  });

  it('should focus previous element', () => {
    const mockElements = [
      createMockElement('button1'),
      createMockElement('button2'),
    ];

    const { result } = renderHook(() => useKeyboardNavigation());

    // Set up focusable elements
    act(() => {
      result.current.focusableElements = mockElements as any;
      result.current.focusedIndex = 1;
    });

    act(() => {
      result.current.focusPrevious();
    });

    expect(result.current.focusedIndex).toBe(0);
  });

  it('should wrap to last element when focusing previous from first', () => {
    const mockElements = [
      createMockElement('button1'),
      createMockElement('button2'),
    ];

    const { result } = renderHook(() => useKeyboardNavigation());

    // Set up focusable elements at first index
    act(() => {
      result.current.focusableElements = mockElements as any;
      result.current.focusedIndex = 0;
    });

    act(() => {
      result.current.focusPrevious();
    });

    expect(result.current.focusedIndex).toBe(1);
  });

  it('should focus first element', () => {
    const mockElements = [
      createMockElement('button1'),
      createMockElement('button2'),
    ];

    const { result } = renderHook(() => useKeyboardNavigation());

    act(() => {
      result.current.focusableElements = mockElements as any;
    });

    act(() => {
      result.current.focusFirst();
    });

    expect(result.current.focusedIndex).toBe(0);
  });

  it('should focus last element', () => {
    const mockElements = [
      createMockElement('button1'),
      createMockElement('button2'),
    ];

    const { result } = renderHook(() => useKeyboardNavigation());

    act(() => {
      result.current.focusableElements = mockElements as any;
    });

    act(() => {
      result.current.focusLast();
    });

    expect(result.current.focusedIndex).toBe(1);
  });

  it('should handle keyboard events when enabled', () => {
    const mockElements = [
      createMockElement('button1'),
      createMockElement('button2'),
    ];

    const { result } = renderHook(() => useKeyboardNavigation({ enabled: true }));

    act(() => {
      result.current.focusableElements = mockElements as any;
      result.current.focusedIndex = 0;
    });

    // Mock container ref
    act(() => {
      if (result.current.containerRef.current) {
        result.current.containerRef.current = mockContainer;
      }
    });

    // Simulate Tab key press
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Tab' });
      mockContainer.addEventListener.mock.calls[0][1](event);
    });

    expect(result.current.focusedIndex).toBe(1);
  });

  it('should handle Shift+Tab for reverse navigation', () => {
    const mockElements = [
      createMockElement('button1'),
      createMockElement('button2'),
    ];

    const { result } = renderHook(() => useKeyboardNavigation({ enabled: true, trapFocus: true }));

    act(() => {
      result.current.focusableElements = mockElements as any;
      result.current.focusedIndex = 1;
    });

    // Mock container ref
    act(() => {
      if (result.current.containerRef.current) {
        result.current.containerRef.current = mockContainer;
      }
    });

    // Simulate Shift+Tab key press
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true });
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
      mockContainer.addEventListener.mock.calls[0][1](event);
    });

    expect(result.current.focusedIndex).toBe(0);
  });

  it('should handle arrow key navigation', () => {
    const mockElements = [
      createMockElement('button1'),
      createMockElement('button2'),
    ];

    const { result } = renderHook(() => useKeyboardNavigation({ enabled: true }));

    act(() => {
      result.current.focusableElements = mockElements as any;
      result.current.focusedIndex = 0;
    });

    // Mock container ref
    act(() => {
      if (result.current.containerRef.current) {
        result.current.containerRef.current = mockContainer;
      }
    });

    // Simulate ArrowDown key press
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
      mockContainer.addEventListener.mock.calls[0][1](event);
    });

    expect(result.current.focusedIndex).toBe(1);
  });

  it('should call onEscape when Escape key is pressed', () => {
    const onEscape = vi.fn();
    const { result } = renderHook(() => useKeyboardNavigation({ onEscape }));

    // Mock container ref
    act(() => {
      if (result.current.containerRef.current) {
        result.current.containerRef.current = mockContainer;
      }
    });

    // Simulate Escape key press
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
      mockContainer.addEventListener.mock.calls[0][1](event);
    });

    expect(onEscape).toHaveBeenCalled();
  });

  it('should call onArrowKeys when arrow keys are pressed', () => {
    const onArrowKeys = vi.fn();
    const { result } = renderHook(() => useKeyboardNavigation({ onArrowKeys }));

    // Mock container ref
    act(() => {
      if (result.current.containerRef.current) {
        result.current.containerRef.current = mockContainer;
      }
    });

    // Simulate ArrowRight key press
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
      mockContainer.addEventListener.mock.calls[0][1](event);
    });

    expect(onArrowKeys).toHaveBeenCalledWith('right');
  });

  it('should not handle events when disabled', () => {
    const { result } = renderHook(() => useKeyboardNavigation({ enabled: false }));

    // Mock container ref
    act(() => {
      if (result.current.containerRef.current) {
        result.current.containerRef.current = mockContainer;
      }
    });

    // Should not add event listeners when disabled
    expect(mockContainer.addEventListener).not.toHaveBeenCalled();
  });

  it('should auto focus first element when autoFocus is true', () => {
    const mockElements = [createMockElement('button1')];
    mockQuerySelectorAll.mockReturnValue(mockElements);

    const { result } = renderHook(() => useKeyboardNavigation({ autoFocus: true }));

    act(() => {
      if (result.current.containerRef.current) {
        result.current.containerRef.current = mockContainer;
      }
    });

    // Should focus first element after a timeout
    setTimeout(() => {
      expect(mockFocus).toHaveBeenCalled();
    }, 10);
  });
});