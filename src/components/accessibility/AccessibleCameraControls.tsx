'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { useAccessibilityContext } from './AccessibilityProvider';
import { useFocusable } from './KeyboardNavigationProvider';

interface AccessibleCameraControlsProps {
  onNavigateToGame?: (gameId: string) => void;
  onNavigateToPosition?: (position: string) => void;
  onCameraMove?: (direction: 'forward' | 'backward' | 'left' | 'right' | 'up' | 'down') => void;
  onCameraRotate?: (direction: 'left' | 'right' | 'up' | 'down') => void;
  enabled?: boolean;
  className?: string;
}

export default function AccessibleCameraControls({
  onNavigateToGame,
  onNavigateToPosition,
  onCameraMove,
  onCameraRotate,
  enabled = true,
  className = ''
}: AccessibleCameraControlsProps) {
  const accessibility = useAccessibilityContext();
  const { elementRef, isFocused } = useFocusable('camera-controls', 50);
  const instructionsRef = useRef<HTMLDivElement>(null);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled || !accessibility.keyboardNavigation) return;

    // Only handle keys when the camera controls are focused or no specific element is focused
    const activeElement = document.activeElement;
    const isControlsFocused = elementRef.current?.contains(activeElement as Node);
    
    if (!isControlsFocused && activeElement && activeElement !== document.body) {
      return; // Let other components handle their own keyboard events
    }

    let handled = false;

    switch (event.key) {
      // Camera Movement (WASD + QE for up/down)
      case 'w':
      case 'W':
        event.preventDefault();
        onCameraMove?.('forward');
        handled = true;
        break;
      case 's':
      case 'S':
        event.preventDefault();
        onCameraMove?.('backward');
        handled = true;
        break;
      case 'a':
      case 'A':
        event.preventDefault();
        onCameraMove?.('left');
        handled = true;
        break;
      case 'd':
      case 'D':
        event.preventDefault();
        onCameraMove?.('right');
        handled = true;
        break;
      case 'q':
      case 'Q':
        event.preventDefault();
        onCameraMove?.('down');
        handled = true;
        break;
      case 'e':
      case 'E':
        event.preventDefault();
        onCameraMove?.('up');
        handled = true;
        break;

      // Camera Rotation (Arrow Keys)
      case 'ArrowLeft':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          onCameraRotate?.('left');
          handled = true;
        }
        break;
      case 'ArrowRight':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          onCameraRotate?.('right');
          handled = true;
        }
        break;
      case 'ArrowUp':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          onCameraRotate?.('up');
          handled = true;
        }
        break;
      case 'ArrowDown':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          onCameraRotate?.('down');
          handled = true;
        }
        break;

      // Quick Navigation (Number Keys)
      case '1':
        event.preventDefault();
        onNavigateToPosition?.('default');
        handled = true;
        break;
      case '2':
        event.preventDefault();
        onNavigateToPosition?.('overview');
        handled = true;
        break;
      case '3':
        event.preventDefault();
        onNavigateToGame?.('blackjack');
        handled = true;
        break;
      case '4':
        event.preventDefault();
        onNavigateToGame?.('roulette');
        handled = true;
        break;
      case '5':
        event.preventDefault();
        onNavigateToGame?.('slots');
        handled = true;
        break;
      case '6':
        event.preventDefault();
        onNavigateToGame?.('poker');
        handled = true;
        break;
      case '7':
        event.preventDefault();
        onNavigateToGame?.('craps');
        handled = true;
        break;
      case '8':
        event.preventDefault();
        onNavigateToGame?.('higher-or-lower');
        handled = true;
        break;
      case '9':
        event.preventDefault();
        onNavigateToGame?.('horse-racing');
        handled = true;
        break;

      // Help Toggle
      case 'h':
      case 'H':
      case '?':
        if (!event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          toggleInstructions();
          handled = true;
        }
        break;
    }

    if (handled && accessibility.screenReaderMode) {
      // Announce the action to screen readers
      announceAction(event.key);
    }
  }, [enabled, accessibility.keyboardNavigation, accessibility.screenReaderMode, onCameraMove, onCameraRotate, onNavigateToGame, onNavigateToPosition]);

  // Toggle instructions visibility
  const toggleInstructions = useCallback(() => {
    if (instructionsRef.current) {
      const isHidden = instructionsRef.current.getAttribute('aria-hidden') === 'true';
      instructionsRef.current.setAttribute('aria-hidden', (!isHidden).toString());
      instructionsRef.current.style.display = isHidden ? 'block' : 'none';
    }
  }, []);

  // Announce actions to screen readers
  const announceAction = useCallback((key: string) => {
    const announcements: Record<string, string> = {
      'w': 'Moving camera forward',
      's': 'Moving camera backward',
      'a': 'Moving camera left',
      'd': 'Moving camera right',
      'q': 'Moving camera down',
      'e': 'Moving camera up',
      'ArrowLeft': 'Rotating camera left',
      'ArrowRight': 'Rotating camera right',
      'ArrowUp': 'Rotating camera up',
      'ArrowDown': 'Rotating camera down',
      '1': 'Navigating to default position',
      '2': 'Navigating to overview position',
      '3': 'Navigating to Blackjack table',
      '4': 'Navigating to Roulette table',
      '5': 'Navigating to Slots',
      '6': 'Navigating to Poker table',
      '7': 'Navigating to Craps table',
      '8': 'Navigating to Higher or Lower',
      '9': 'Navigating to Horse Racing'
    };

    const message = announcements[key];
    if (message) {
      // Create a temporary element for screen reader announcement
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }
  }, []);

  // Set up keyboard event listeners
  useEffect(() => {
    if (enabled && accessibility.keyboardNavigation) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [enabled, accessibility.keyboardNavigation, handleKeyDown]);

  // Auto-focus when keyboard navigation is enabled
  useEffect(() => {
    if (enabled && accessibility.keyboardNavigation && accessibility.isKeyboardUser && elementRef.current) {
      elementRef.current.focus();
    }
  }, [enabled, accessibility.keyboardNavigation, accessibility.isKeyboardUser]);

  if (!enabled || !accessibility.keyboardNavigation) {
    return null;
  }

  return (
    <div 
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={`fixed bottom-4 left-4 z-40 ${className}`}
      tabIndex={0}
      role="application"
      aria-label="3D Casino Camera Controls"
      aria-describedby="camera-controls-instructions"
    >
      {/* Control Instructions */}
      <div
        ref={instructionsRef}
        id="camera-controls-instructions"
        className="
          bg-casino-black/95 backdrop-blur-md border border-casino-gold/30 
          rounded-lg p-4 mb-2 max-w-sm text-sm text-casino-white
          shadow-2xl
        "
        style={{ display: accessibility.screenReaderMode ? 'block' : 'none' }}
        aria-hidden={!accessibility.screenReaderMode}
      >
        <h3 className="text-casino-gold font-bold mb-2">Camera Controls</h3>
        
        <div className="space-y-2">
          <div>
            <strong className="text-casino-gold">Movement:</strong>
            <ul className="ml-4 text-xs">
              <li>W - Move forward</li>
              <li>S - Move backward</li>
              <li>A - Move left</li>
              <li>D - Move right</li>
              <li>Q - Move down</li>
              <li>E - Move up</li>
            </ul>
          </div>
          
          <div>
            <strong className="text-casino-gold">Rotation:</strong>
            <ul className="ml-4 text-xs">
              <li>Ctrl + Arrow Keys - Rotate camera</li>
            </ul>
          </div>
          
          <div>
            <strong className="text-casino-gold">Quick Navigation:</strong>
            <ul className="ml-4 text-xs">
              <li>1 - Default position</li>
              <li>2 - Overview</li>
              <li>3 - Blackjack</li>
              <li>4 - Roulette</li>
              <li>5 - Slots</li>
              <li>6 - Poker</li>
              <li>7 - Craps</li>
              <li>8 - Higher or Lower</li>
              <li>9 - Horse Racing</li>
            </ul>
          </div>
          
          <div>
            <strong className="text-casino-gold">Help:</strong>
            <ul className="ml-4 text-xs">
              <li>H or ? - Toggle this help</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Control Status Indicator */}
      <div className="
        bg-casino-black/80 backdrop-blur-sm border border-casino-gold/30 
        rounded-full px-3 py-2 flex items-center gap-2 text-xs text-casino-white
      ">
        <div className={`w-2 h-2 rounded-full ${isFocused ? 'bg-casino-gold animate-pulse' : 'bg-casino-white/30'}`} />
        <span>Camera Controls {isFocused ? 'Active' : 'Available'}</span>
        <button
          onClick={toggleInstructions}
          className="text-casino-gold hover:text-casino-white transition-colors"
          aria-label="Toggle camera control instructions"
        >
          ?
        </button>
      </div>

      {/* Screen Reader Instructions */}
      <div className="sr-only">
        <p>
          3D Casino camera controls are active. Use WASD keys to move, Ctrl+Arrow keys to rotate, 
          and number keys 1-9 for quick navigation to different areas. Press H for help.
        </p>
      </div>
    </div>
  );
}