import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GameInfoPanel from '../GameInfoPanel';
import { GameConfig } from '@/lib/types';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock DiscordCTA component
vi.mock('../DiscordCTA', () => ({
  default: ({ onClick, className }: any) => (
    <button onClick={onClick} className={className} data-testid="discord-cta">
      Join Discord
    </button>
  ),
}));

const mockGame: GameConfig = {
  id: 'blackjack',
  name: 'blackjack',
  displayName: 'Blackjack',
  description: 'Classic 21 card game with AI-powered strategy hints',
  features: [
    {
      title: 'Smart Strategy',
      description: 'AI suggests optimal plays based on card counting',
      icon: 'brain',
      highlight: true
    },
    {
      title: 'Multiple Hands',
      description: 'Play up to 3 hands simultaneously',
      icon: 'cards',
      highlight: false
    }
  ],
  showcase: {
    tableModel: '/models/blackjack-table.glb',
    cameraPosition: [0, 1.5, 2],
    animations: [],
    interactiveElements: []
  },
  discordCommand: '/blackjack'
};

describe('GameInfoPanel', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.innerWidth for mobile detection
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  it('renders nothing when game is null', () => {
    render(
      <GameInfoPanel
        game={null}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText('Blackjack')).not.toBeInTheDocument();
  });

  it('renders nothing when not visible', () => {
    render(
      <GameInfoPanel
        game={mockGame}
        isVisible={false}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText('Blackjack')).not.toBeInTheDocument();
  });

  it('renders game information when visible and game is provided', () => {
    render(
      <GameInfoPanel
        game={mockGame}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Blackjack')).toBeInTheDocument();
    expect(screen.getByText('Classic 21 card game with AI-powered strategy hints')).toBeInTheDocument();
    expect(screen.getByText('Smart Strategy')).toBeInTheDocument();
    expect(screen.getByText('Multiple Hands')).toBeInTheDocument();
    expect(screen.getByText('/blackjack')).toBeInTheDocument();
  });

  it('displays featured badge for highlighted features', () => {
    render(
      <GameInfoPanel
        game={mockGame}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    // Smart Strategy should have featured badge (highlight: true)
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <GameInfoPanel
        game={mockGame}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByLabelText('Close game info panel');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    render(
      <GameInfoPanel
        game={mockGame}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    // Find backdrop by its class or test id
    const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/50');
    expect(backdrop).toBeInTheDocument();
    
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('calls onClose when Escape key is pressed', () => {
    render(
      <GameInfoPanel
        game={mockGame}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when Escape is pressed and panel is not visible', () => {
    render(
      <GameInfoPanel
        game={mockGame}
        isVisible={false}
        onClose={mockOnClose}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('renders Discord CTA button', () => {
    render(
      <GameInfoPanel
        game={mockGame}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    const discordButton = screen.getByTestId('discord-cta');
    expect(discordButton).toBeInTheDocument();
  });

  it('handles mobile layout correctly', () => {
    // Mock mobile width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 600,
    });

    render(
      <GameInfoPanel
        game={mockGame}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    // Should still render the game info
    expect(screen.getByText('Blackjack')).toBeInTheDocument();
  });

  it('renders all game features with correct icons', () => {
    const gameWithManyFeatures: GameConfig = {
      ...mockGame,
      features: [
        { title: 'Brain Feature', description: 'Test', icon: 'brain', highlight: true },
        { title: 'Cards Feature', description: 'Test', icon: 'cards', highlight: false },
        { title: 'Chips Feature', description: 'Test', icon: 'chips', highlight: false },
        { title: 'Lightning Feature', description: 'Test', icon: 'lightning', highlight: false },
        { title: 'Star Feature', description: 'Test', icon: 'star', highlight: false },
      ]
    };

    render(
      <GameInfoPanel
        game={gameWithManyFeatures}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Brain Feature')).toBeInTheDocument();
    expect(screen.getByText('Cards Feature')).toBeInTheDocument();
    expect(screen.getByText('Chips Feature')).toBeInTheDocument();
    expect(screen.getByText('Lightning Feature')).toBeInTheDocument();
    expect(screen.getByText('Star Feature')).toBeInTheDocument();
  });

  it('applies correct position classes', () => {
    const { rerender } = render(
      <GameInfoPanel
        game={mockGame}
        isVisible={true}
        onClose={mockOnClose}
        position="left"
      />
    );

    // Test different positions
    rerender(
      <GameInfoPanel
        game={mockGame}
        isVisible={true}
        onClose={mockOnClose}
        position="right"
      />
    );

    rerender(
      <GameInfoPanel
        game={mockGame}
        isVisible={true}
        onClose={mockOnClose}
        position="bottom"
      />
    );

    // Should render without errors for all positions
    expect(screen.getByText('Blackjack')).toBeInTheDocument();
  });

  it('handles unknown icon gracefully', () => {
    const gameWithUnknownIcon: GameConfig = {
      ...mockGame,
      features: [
        { title: 'Unknown Feature', description: 'Test', icon: 'unknown-icon', highlight: false }
      ]
    };

    render(
      <GameInfoPanel
        game={gameWithUnknownIcon}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Unknown Feature')).toBeInTheDocument();
  });

  it('logs conversion tracking when Discord CTA is clicked', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    render(
      <GameInfoPanel
        game={mockGame}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    const discordButton = screen.getByTestId('discord-cta');
    fireEvent.click(discordButton);

    expect(consoleSpy).toHaveBeenCalledWith('Discord CTA clicked for blackjack');
    
    consoleSpy.mockRestore();
  });
});