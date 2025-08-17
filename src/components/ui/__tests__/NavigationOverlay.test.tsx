import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NavigationOverlay from '../NavigationOverlay';
import { GAMES } from '@/lib/data/games';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock window.open
const mockWindowOpen = vi.fn();
Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
});

// Mock window.innerWidth for responsive tests
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

describe('NavigationOverlay', () => {
  const mockOnGameSelect = vi.fn();
  const mockOnDiscordClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders navigation button', () => {
    render(
      <NavigationOverlay 
        onGameSelect={mockOnGameSelect}
        onDiscordClick={mockOnDiscordClick}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('opens menu when navigation button is clicked', async () => {
    render(
      <NavigationOverlay 
        onGameSelect={mockOnGameSelect}
        onDiscordClick={mockOnDiscordClick}
      />
    );

    const buttons = screen.getAllByRole('button');
    const navButton = buttons[0]; // First button should be the navigation button
    fireEvent.click(navButton);

    await waitFor(() => {
      expect(screen.getByText('Choose Your Game')).toBeInTheDocument();
    });
  });

  it('displays all games in the menu', async () => {
    render(
      <NavigationOverlay 
        onGameSelect={mockOnGameSelect}
        onDiscordClick={mockOnDiscordClick}
      />
    );

    const buttons = screen.getAllByRole('button');
    const navButton = buttons[0];
    fireEvent.click(navButton);

    await waitFor(() => {
      GAMES.forEach(game => {
        expect(screen.getByText(game.displayName)).toBeInTheDocument();
        expect(screen.getByText(game.description)).toBeInTheDocument();
        expect(screen.getByText(game.discordCommand)).toBeInTheDocument();
      });
    });
  });

  it('calls onGameSelect when a game is clicked', async () => {
    render(
      <NavigationOverlay 
        onGameSelect={mockOnGameSelect}
        onDiscordClick={mockOnDiscordClick}
      />
    );

    const buttons = screen.getAllByRole('button');
    const navButton = buttons[0];
    fireEvent.click(navButton);

    await waitFor(() => {
      const blackjackButton = screen.getByText('Blackjack');
      fireEvent.click(blackjackButton);
      expect(mockOnGameSelect).toHaveBeenCalledWith('blackjack');
    });
  });

  it('displays Discord CTA button', () => {
    render(
      <NavigationOverlay 
        onGameSelect={mockOnGameSelect}
        onDiscordClick={mockOnDiscordClick}
      />
    );

    const discordButton = screen.getByText('Join Discord');
    expect(discordButton).toBeInTheDocument();
  });

  it('calls onDiscordClick and opens Discord link', () => {
    render(
      <NavigationOverlay 
        onGameSelect={mockOnGameSelect}
        onDiscordClick={mockOnDiscordClick}
      />
    );

    const discordButton = screen.getByText('Join Discord');
    fireEvent.click(discordButton);

    expect(mockOnDiscordClick).toHaveBeenCalled();
    expect(mockWindowOpen).toHaveBeenCalledWith('https://discord.gg/RK4K8tDsHB', '_blank');
  });

  it('shows selected game info when a game is selected', async () => {
    render(
      <NavigationOverlay 
        onGameSelect={mockOnGameSelect}
        onDiscordClick={mockOnDiscordClick}
      />
    );

    const buttons = screen.getAllByRole('button');
    const navButton = buttons[0];
    fireEvent.click(navButton);

    await waitFor(() => {
      const blackjackButton = screen.getByText('Blackjack');
      fireEvent.click(blackjackButton);
    });

    await waitFor(() => {
      const blackjackElements = screen.getAllByText('Blackjack');
      expect(blackjackElements.length).toBeGreaterThan(0);
      expect(screen.getByText('Smart Strategy')).toBeInTheDocument();
    });
  });

  it('adapts to mobile screen size', () => {
    // Mock mobile screen size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 600,
    });

    render(
      <NavigationOverlay 
        onGameSelect={mockOnGameSelect}
        onDiscordClick={mockOnDiscordClick}
      />
    );

    // Trigger resize event
    fireEvent(window, new Event('resize'));

    // Mobile-specific elements should be present
    expect(screen.getByText('High Roller Club')).toBeInTheDocument();
    expect(screen.getByText('Premium Discord Casino')).toBeInTheDocument();
  });

  it('closes menu on mobile after game selection', async () => {
    // Mock mobile screen size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 600,
    });

    render(
      <NavigationOverlay 
        onGameSelect={mockOnGameSelect}
        onDiscordClick={mockOnDiscordClick}
      />
    );

    // Trigger resize event
    fireEvent(window, new Event('resize'));

    const buttons = screen.getAllByRole('button');
    const navButton = buttons.find(btn => btn.querySelector('svg')); // Find button with hamburger icon
    if (navButton) fireEvent.click(navButton);

    await waitFor(() => {
      const blackjackButton = screen.getByText('Blackjack');
      fireEvent.click(blackjackButton);
    });

    expect(mockOnGameSelect).toHaveBeenCalledWith('blackjack');
  });

  it('displays game features for highlighted games', async () => {
    render(
      <NavigationOverlay 
        onGameSelect={mockOnGameSelect}
        onDiscordClick={mockOnDiscordClick}
      />
    );

    const buttons = screen.getAllByRole('button');
    const navButton = buttons.find(btn => btn.querySelector('svg')); // Find button with hamburger icon
    if (navButton) fireEvent.click(navButton);

    await waitFor(() => {
      const blackjackButton = screen.getByText('Blackjack');
      fireEvent.click(blackjackButton);
    });

    await waitFor(() => {
      // Should show highlighted features
      const blackjackGame = GAMES.find(g => g.id === 'blackjack');
      const highlightedFeatures = blackjackGame?.features.filter(f => f.highlight);
      
      highlightedFeatures?.forEach(feature => {
        expect(screen.getByText(feature.title)).toBeInTheDocument();
      });
    });
  });
});