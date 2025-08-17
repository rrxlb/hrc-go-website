'use client';

import { useEffect, useCallback, useRef, useState } from 'react';

export interface KeyboardNavigationOptions {
  enabled?: boolean;
  trapFocus?: boolean;
  autoFocus?: boolean;
  onEscape?: () => void;
  onEnter?: () => void;
  onArrowKeys?: (direction: 'up' | 'down' | 'left' | 'right') => void;
}

export interface FocusableElement extends HTMLElement {
  tabIndex: number;
}

export function useKeyboardNavigation(options: KeyboardNavigationOptions = {}) {
  const {
    enabled = true,
    trapFocus = false,
    autoFocus = false,
    onEscape,
    onEnter,
    onArrowKeys
  } = options;

  const containerRef = useRef<HTMLElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [focusableElements, setFocusableElements] = useState<FocusableElement[]>([]);

  // Selector for focusable elements
  const FOCUSABLE_SELECTOR = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[role="button"]:not([disabled])',
    '[role="link"]:not([disabled])',
    '[role="menuitem"]:not([disabled])',
    '[role="tab"]:not([disabled])',
    'summary'
  ].join(', ');

  // Get all focusable elements within container
  const getFocusableElements = useCallback((): FocusableElement[] => {
    if (!containerRef.current) return [];
    
    const elements = Array.from(
      containerRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
    ) as FocusableElement[];
    
    return elements.filter(el => {
      // Check if element is visible and not hidden
      const style = window.getComputedStyle(el);
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0' &&
        el.offsetWidth > 0 &&
        el.offsetHeight > 0
      );
    });
  }, []);

  // Update focusable elements list
  const updateFocusableElements = useCallback(() => {
    const elements = getFocusableElements();
    setFocusableElements(elements);
    
    // If current focused index is out of bounds, reset it
    if (focusedIndex >= elements.length) {
      setFocusedIndex(elements.length > 0 ? 0 : -1);
    }
  }, [getFocusableElements, focusedIndex]);

  // Focus element by index
  const focusElementByIndex = useCallback((index: number) => {
    if (index < 0 || index >= focusableElements.length) return;
    
    const element = focusableElements[index];
    if (element) {
      element.focus();
      setFocusedIndex(index);
    }
  }, [focusableElements]);

  // Move focus to next element
  const focusNext = useCallback(() => {
    const nextIndex = focusedIndex < focusableElements.length - 1 ? focusedIndex + 1 : 0;
    focusElementByIndex(nextIndex);
  }, [focusedIndex, focusableElements.length, focusElementByIndex]);

  // Move focus to previous element
  const focusPrevious = useCallback(() => {
    const prevIndex = focusedIndex > 0 ? focusedIndex - 1 : focusableElements.length - 1;
    focusElementByIndex(prevIndex);
  }, [focusedIndex, focusableElements.length, focusElementByIndex]);

  // Focus first element
  const focusFirst = useCallback(() => {
    focusElementByIndex(0);
  }, [focusElementByIndex]);

  // Focus last element
  const focusLast = useCallback(() => {
    focusElementByIndex(focusableElements.length - 1);
  }, [focusElementByIndex, focusableElements.length]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled || !containerRef.current) return;

    switch (event.key) {
      case 'Tab':
        if (trapFocus) {
          event.preventDefault();
          if (event.shiftKey) {
            focusPrevious();
          } else {
            focusNext();
          }
        }
        break;

      case 'ArrowDown':
        event.preventDefault();
        if (onArrowKeys) {
          onArrowKeys('down');
        } else {
          focusNext();
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (onArrowKeys) {
          onArrowKeys('up');
        } else {
          focusPrevious();
        }
        break;

      case 'ArrowRight':
        if (onArrowKeys) {
          event.preventDefault();
          onArrowKeys('right');
        }
        break;

      case 'ArrowLeft':
        if (onArrowKeys) {
          event.preventDefault();
          onArrowKeys('left');
        }
        break;

      case 'Home':
        event.preventDefault();
        focusFirst();
        break;

      case 'End':
        event.preventDefault();
        focusLast();
        break;

      case 'Escape':
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
        break;

      case 'Enter':
      case ' ':
        if (onEnter && document.activeElement === containerRef.current) {
          event.preventDefault();
          onEnter();
        }
        break;
    }
  }, [
    enabled,
    trapFocus,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    onArrowKeys,
    onEscape,
    onEnter
  ]);

  // Handle focus events to track current focused element
  const handleFocus = useCallback((event: FocusEvent) => {
    if (!enabled || !containerRef.current) return;
    
    const target = event.target as HTMLElement;
    const index = focusableElements.indexOf(target as FocusableElement);
    
    if (index !== -1) {
      setFocusedIndex(index);
    }
  }, [enabled, focusableElements]);

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    // Update focusable elements initially and on mutations
    updateFocusableElements();

    // Set up mutation observer to track DOM changes
    const observer = new MutationObserver(updateFocusableElements);
    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled', 'tabindex', 'hidden', 'aria-hidden']
    });

    // Add event listeners
    container.addEventListener('keydown', handleKeyDown);
    container.addEventListener('focus', handleFocus, true);

    // Auto focus first element if requested
    if (autoFocus && focusableElements.length > 0) {
      setTimeout(() => focusFirst(), 0);
    }

    return () => {
      observer.disconnect();
      container.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('focus', handleFocus, true);
    };
  }, [enabled, autoFocus, handleKeyDown, handleFocus, updateFocusableElements, focusFirst, focusableElements.length]);

  return {
    containerRef,
    focusedIndex,
    focusableElements,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    focusElementByIndex,
    updateFocusableElements
  };
}