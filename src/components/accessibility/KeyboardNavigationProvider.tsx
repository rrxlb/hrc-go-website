'use client';

import React, { createContext, useContext, useCallback, useRef, useState, useEffect } from 'react';
import { useKeyboardNavigation } from '@/lib/hooks/useKeyboardNavigation';

interface KeyboardNavigationContextType {
  registerFocusable: (id: string, element: HTMLElement, priority?: number) => void;
  unregisterFocusable: (id: string) => void;
  focusElement: (id: string) => void;
  focusNext: () => void;
  focusPrevious: () => void;
  focusFirst: () => void;
  focusLast: () => void;
  currentFocusId: string | null;
  isKeyboardMode: boolean;
}

const KeyboardNavigationContext = createContext<KeyboardNavigationContextType | undefined>(undefined);

interface FocusableItem {
  id: string;
  element: HTMLElement;
  priority: number;
}

interface KeyboardNavigationProviderProps {
  children: React.ReactNode;
  enabled?: boolean;
}

export function KeyboardNavigationProvider({ 
  children, 
  enabled = true 
}: KeyboardNavigationProviderProps) {
  const [focusableItems, setFocusableItems] = useState<Map<string, FocusableItem>>(new Map());
  const [currentFocusId, setCurrentFocusId] = useState<string | null>(null);
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track keyboard usage
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key.startsWith('Arrow')) {
        setIsKeyboardMode(true);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardMode(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Register a focusable element
  const registerFocusable = useCallback((id: string, element: HTMLElement, priority: number = 0) => {
    setFocusableItems(prev => {
      const newMap = new Map(prev);
      newMap.set(id, { id, element, priority });
      return newMap;
    });
  }, []);

  // Unregister a focusable element
  const unregisterFocusable = useCallback((id: string) => {
    setFocusableItems(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
    
    if (currentFocusId === id) {
      setCurrentFocusId(null);
    }
  }, [currentFocusId]);

  // Get sorted focusable elements by priority
  const getSortedFocusableElements = useCallback(() => {
    return Array.from(focusableItems.values())
      .filter(item => {
        // Check if element is still in DOM and visible
        return document.contains(item.element) && 
               item.element.offsetParent !== null &&
               !item.element.hasAttribute('disabled') &&
               item.element.getAttribute('aria-hidden') !== 'true';
      })
      .sort((a, b) => b.priority - a.priority); // Higher priority first
  }, [focusableItems]);

  // Focus specific element by ID
  const focusElement = useCallback((id: string) => {
    const item = focusableItems.get(id);
    if (item && item.element) {
      item.element.focus();
      setCurrentFocusId(id);
    }
  }, [focusableItems]);

  // Focus next element
  const focusNext = useCallback(() => {
    const sortedItems = getSortedFocusableElements();
    if (sortedItems.length === 0) return;

    const currentIndex = currentFocusId 
      ? sortedItems.findIndex(item => item.id === currentFocusId)
      : -1;
    
    const nextIndex = currentIndex < sortedItems.length - 1 ? currentIndex + 1 : 0;
    const nextItem = sortedItems[nextIndex];
    
    if (nextItem) {
      nextItem.element.focus();
      setCurrentFocusId(nextItem.id);
    }
  }, [getSortedFocusableElements, currentFocusId]);

  // Focus previous element
  const focusPrevious = useCallback(() => {
    const sortedItems = getSortedFocusableElements();
    if (sortedItems.length === 0) return;

    const currentIndex = currentFocusId 
      ? sortedItems.findIndex(item => item.id === currentFocusId)
      : -1;
    
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : sortedItems.length - 1;
    const prevItem = sortedItems[prevIndex];
    
    if (prevItem) {
      prevItem.element.focus();
      setCurrentFocusId(prevItem.id);
    }
  }, [getSortedFocusableElements, currentFocusId]);

  // Focus first element
  const focusFirst = useCallback(() => {
    const sortedItems = getSortedFocusableElements();
    if (sortedItems.length > 0) {
      const firstItem = sortedItems[0];
      firstItem.element.focus();
      setCurrentFocusId(firstItem.id);
    }
  }, [getSortedFocusableElements]);

  // Focus last element
  const focusLast = useCallback(() => {
    const sortedItems = getSortedFocusableElements();
    if (sortedItems.length > 0) {
      const lastItem = sortedItems[sortedItems.length - 1];
      lastItem.element.focus();
      setCurrentFocusId(lastItem.id);
    }
  }, [getSortedFocusableElements]);

  // Handle global keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled || !isKeyboardMode) return;

    switch (e.key) {
      case 'Tab':
        e.preventDefault();
        if (e.shiftKey) {
          focusPrevious();
        } else {
          focusNext();
        }
        break;

      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        focusNext();
        break;

      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        focusPrevious();
        break;

      case 'Home':
        e.preventDefault();
        focusFirst();
        break;

      case 'End':
        e.preventDefault();
        focusLast();
        break;

      case 'Escape':
        // Allow components to handle escape
        break;
    }
  }, [enabled, isKeyboardMode, focusNext, focusPrevious, focusFirst, focusLast]);

  // Set up global keyboard listener
  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [enabled, handleKeyDown]);

  // Track focus changes
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      const focusedItem = Array.from(focusableItems.values())
        .find(item => item.element === target || item.element.contains(target));
      
      if (focusedItem) {
        setCurrentFocusId(focusedItem.id);
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    return () => document.removeEventListener('focusin', handleFocusIn);
  }, [focusableItems]);

  const contextValue: KeyboardNavigationContextType = {
    registerFocusable,
    unregisterFocusable,
    focusElement,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    currentFocusId,
    isKeyboardMode
  };

  return (
    <KeyboardNavigationContext.Provider value={contextValue}>
      <div 
        ref={containerRef}
        className={`keyboard-navigation-container ${isKeyboardMode ? 'keyboard-mode' : ''}`}
      >
        {children}
      </div>
    </KeyboardNavigationContext.Provider>
  );
}

export function useKeyboardNavigationContext() {
  const context = useContext(KeyboardNavigationContext);
  if (context === undefined) {
    throw new Error('useKeyboardNavigationContext must be used within a KeyboardNavigationProvider');
  }
  return context;
}

// Hook for registering focusable elements
export function useFocusable(id: string, priority: number = 0) {
  const { registerFocusable, unregisterFocusable, currentFocusId } = useKeyboardNavigationContext();
  const elementRef = useRef<HTMLElement>(null);
  const isFocused = currentFocusId === id;

  useEffect(() => {
    const element = elementRef.current;
    if (element) {
      registerFocusable(id, element, priority);
      return () => unregisterFocusable(id);
    }
  }, [id, priority, registerFocusable, unregisterFocusable]);

  return {
    elementRef,
    isFocused,
    tabIndex: isFocused ? 0 : -1
  };
}