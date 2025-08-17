'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAccessibility, AccessibilityState, AccessibilityPreferences } from '@/lib/hooks/useAccessibility';

interface AccessibilityContextType extends AccessibilityState {
  updatePreference: <K extends keyof AccessibilityPreferences>(key: K, value: AccessibilityPreferences[K]) => void;
  toggleReduceMotion: () => void;
  toggleHighContrast: () => void;
  toggleKeyboardNavigation: () => void;
  toggleScreenReaderMode: () => void;
  toggleFocusVisible: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const accessibility = useAccessibility();

  return (
    <AccessibilityContext.Provider value={accessibility}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibilityContext() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibilityContext must be used within an AccessibilityProvider');
  }
  return context;
}

// HOC for components that need accessibility features
export function withAccessibility<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AccessibilityWrappedComponent(props: P) {
    return (
      <AccessibilityProvider>
        <Component {...props} />
      </AccessibilityProvider>
    );
  };
}