# UI Components

This directory contains reusable UI components for the High Roller Club website.

## GameInfoPanel

A comprehensive game information panel component that displays detailed information about casino games with smooth slide-in animations.

### Features

- **Slide-in animations** using Framer Motion with spring physics
- **Dynamic content loading** based on selected game
- **Feature highlights** with animated icons and descriptions
- **Discord CTA integration** with conversion tracking
- **Responsive design** with mobile-optimized layouts
- **Keyboard navigation** (Escape to close)
- **Accessibility support** with proper ARIA labels

### Usage

```tsx
import GameInfoPanel from '@/components/ui/GameInfoPanel';
import { useGameInfoPanel } from '@/lib/hooks/useGameInfoPanel';

function MyComponent() {
  const { selectedGame, isVisible, showGameInfo, hideGameInfo } = useGameInfoPanel();

  return (
    <>
      <button onClick={() => showGameInfo(someGame)}>
        Show Game Info
      </button>
      
      <GameInfoPanel
        game={selectedGame}
        isVisible={isVisible}
        onClose={hideGameInfo}
        position="right" // 'left' | 'right' | 'bottom'
      />
    </>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `game` | `GameConfig \| null` | - | Game data to display |
| `isVisible` | `boolean` | - | Whether the panel is visible |
| `onClose` | `() => void` | - | Callback when panel is closed |
| `position` | `'left' \| 'right' \| 'bottom'` | `'right'` | Panel position |
| `className` | `string` | `''` | Additional CSS classes |

### Hook: useGameInfoPanel

A custom hook for managing game info panel state.

```tsx
const {
  selectedGame,    // Currently selected game
  isVisible,       // Panel visibility state
  showGameInfo,    // Function to show game info
  hideGameInfo,    // Function to hide panel
  toggleGameInfo,  // Function to toggle panel
} = useGameInfoPanel();
```

### Animations

The component uses Framer Motion for smooth animations:

- **Panel slide-in**: Spring physics with damping
- **Content stagger**: Sequential animation of elements
- **Feature cards**: Hover effects and micro-interactions
- **Icon animations**: Rotation on hover
- **Backdrop blur**: Smooth transition effects

### Responsive Behavior

- **Desktop**: Side panels (left/right) or bottom panel
- **Mobile**: Always uses bottom panel layout
- **Touch-friendly**: Optimized button sizes and interactions

### Accessibility

- **Keyboard navigation**: Escape key to close
- **Screen reader support**: Proper ARIA labels
- **Focus management**: Logical tab order
- **High contrast**: Casino-themed color scheme

### Testing

Comprehensive test coverage includes:

- Component rendering and visibility
- User interactions (click, keyboard)
- Animation states and transitions
- Mobile responsiveness
- Accessibility features
- Hook state management

Run tests with:
```bash
npm run test:run -- GameInfoPanel
```

## DiscordCTA

A call-to-action button component for Discord server invitations with multiple variants and animations.

### Features

- **Multiple variants**: Primary, secondary, floating, minimal
- **Size options**: Small, medium, large
- **Position presets**: Fixed positioning options
- **Hover animations**: Particle effects and scaling
- **Mobile optimization**: Responsive text and sizing

### Usage

```tsx
import DiscordCTA, { DiscordCTAPresets } from '@/components/ui/DiscordCTA';

// Basic usage
<DiscordCTA variant="primary" size="medium" />

// Using presets
<DiscordCTAPresets.FloatingPrimary />
<DiscordCTAPresets.HeroCTA />
```

## NavigationOverlay

A floating navigation overlay that doesn't break the casino immersion.

### Features

- **Floating design**: Glassmorphism effects
- **Smooth transitions**: Framer Motion animations
- **Game selection menu**: Quick access to all games
- **Responsive layout**: Mobile-friendly design

## ResponsiveNavigation

Responsive navigation component that adapts to different screen sizes.

### Features

- **Breakpoint-aware**: Different layouts for mobile/desktop
- **Touch-optimized**: Mobile-friendly interactions
- **Consistent branding**: Casino-themed styling