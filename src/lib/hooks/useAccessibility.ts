'use client';

import { useState, useEffect, useCallback } from 'react';

export interface AccessibilityPreferences {
  reduceMotion: boolean;
  highContrast: boolean;
  keyboardNavigation: boolean;
  screenReaderMode: boolean;
  focusVisible: boolean;
}

export interface AccessibilityState extends AccessibilityPreferences {
  isKeyboardUser: boolean;
  prefersReducedMotion: boolean;
  prefersHighContrast: boolean;
}

const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  reduceMotion: false,
  highContrast: false,
  keyboardNavigation: true,
  screenReaderMode: false,
  focusVisible: true,
};

export function useAccessibility() {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(DEFAULT_PREFERENCES);
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  // Detect system preferences
  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      if (e.matches) {
        updatePreference('reduceMotion', true);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);

    // Check for high contrast preference
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    setPrefersHighContrast(contrastQuery.matches);
    
    const handleContrastChange = (e: MediaQueryListEvent) => {
      setPrefersHighContrast(e.matches);
      if (e.matches) {
        updatePreference('highContrast', true);
      }
    };
    
    contrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  // Detect keyboard usage
  useEffect(() => {
    let keyboardTimeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Tab key indicates keyboard navigation
      if (e.key === 'Tab') {
        setIsKeyboardUser(true);
        document.body.classList.add('keyboard-user');
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
      document.body.classList.remove('keyboard-user');
      
      // Clear any existing timeout
      if (keyboardTimeout) {
        clearTimeout(keyboardTimeout);
      }
      
      // Set a timeout to re-enable keyboard detection
      keyboardTimeout = setTimeout(() => {
        setIsKeyboardUser(true);
      }, 1000);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
      if (keyboardTimeout) {
        clearTimeout(keyboardTimeout);
      }
    };
  }, []);

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('accessibility-preferences');
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.warn('Failed to load accessibility preferences:', error);
    }
  }, []);

  // Save preferences to localStorage
  const updatePreference = useCallback(<K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K]
  ) => {
    setPreferences(prev => {
      const updated = { ...prev, [key]: value };
      
      try {
        localStorage.setItem('accessibility-preferences', JSON.stringify(updated));
      } catch (error) {
        console.warn('Failed to save accessibility preferences:', error);
      }
      
      return updated;
    });
  }, []);

  // Apply CSS classes based on preferences
  useEffect(() => {
    const body = document.body;
    
    // Motion preferences
    if (preferences.reduceMotion || prefersReducedMotion) {
      body.classList.add('reduce-motion');
    } else {
      body.classList.remove('reduce-motion');
    }
    
    // High contrast
    if (preferences.highContrast || prefersHighContrast) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }
    
    // Screen reader mode
    if (preferences.screenReaderMode) {
      body.classList.add('screen-reader-mode');
    } else {
      body.classList.remove('screen-reader-mode');
    }
    
    // Focus visible
    if (preferences.focusVisible) {
      body.classList.add('focus-visible');
    } else {
      body.classList.remove('focus-visible');
    }
  }, [preferences, prefersReducedMotion, prefersHighContrast]);

  const state: AccessibilityState = {
    ...preferences,
    isKeyboardUser,
    prefersReducedMotion,
    prefersHighContrast,
  };

  return {
    ...state,
    updatePreference,
    // Convenience methods
    toggleReduceMotion: () => updatePreference('reduceMotion', !preferences.reduceMotion),
    toggleHighContrast: () => updatePreference('highContrast', !preferences.highContrast),
    toggleKeyboardNavigation: () => updatePreference('keyboardNavigation', !preferences.keyboardNavigation),
    toggleScreenReaderMode: () => updatePreference('screenReaderMode', !preferences.screenReaderMode),
    toggleFocusVisible: () => updatePreference('focusVisible', !preferences.focusVisible),
  };
}