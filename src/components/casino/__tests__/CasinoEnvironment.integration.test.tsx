import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import CasinoEnvironment from '../CasinoEnvironment';

// Mock Three.js and React Three Fiber
vi.mock('@react-three/fiber', async () => {
  const actual = await vi.importActual('@react-three/fiber');
  return {
    ...actual,
    Canvas: ({ children, ...props }: any) => (
      <div data-testid="canvas" {...props}>
        {children}
      </div>
    ),
    useFrame: vi.fn(),
    useThree: () => ({
      camera: {
        position: { x: 0, y: 1.6, z: 3 },
        lookAt: vi.fn(),
        updateProjectionMatrix: vi.fn()
      },
      gl: {
        domElement: document.createElement('canvas')
      },
      scene: {}
    })
  };
});

// Mock GameTablesLayout component
vi.mock('../GameTablesLayout', () => ({
  default: ({ onTableHover, onTableClick }: any) => (
    <div data-testid="game-tables-layout">
      <button 
        data-testid="blackjack-table"
        onMouseEnter={() => onTableHover?.('blackjack', true)}
        onMouseLeave={() => onTableHover?.('blackjack', false)}
        onClick={() => onTableClick?.('blackjack')}
      >
        Blackjack Table
      </button>
      <button 
        data-testid="roulette-table"
        onMouseEnter={() => onTableHover?.('roulette', true)}
        onMouseLeave={() => onTableHover?.('roulette', false)}
        onClick={() => onTableClick?.('roulette')}
      >
        Roulette Table
      </button>
    </div>
  )
}));

// Mock GameInfoDisplay component
vi.mock('../GameInfoDisplay', () => ({
  default: ({ selectedGameId, onClose }: any) => (
    selectedGameId ? (
      <div data-testid="game-info-display">
        <div data-testid="selected-game">{selectedGameId}</div>
        <button data-testid="close-info" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null
  )
}));

describe('CasinoEnvironment Integration Tests', () => {
  const mockOnTableHover = vi.fn();
  const mockOnTableClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderCasinoEnvironment = (props = {}) => {
    return render(
      <Canvas>
        <CasinoEnvironment
          onTableHover={mockOnTableHover}
          onTableClick={mockOnTableClick}
          {...props}
        />
      </Canvas>
    );
  };

  describe('Environment Rendering', () => {
    it('should render casino environment with game tables', () => {
      renderCasinoEnvironment();
      
      expect(screen.getByTestId('game-tables-layout')).toBeInTheDocument();
      expect(screen.getByTestId('blackjack-table')).toBeInTheDocument();
      expect(screen.getByTestId('roulette-table')).toBeInTheDocument();
    });

    it('should not show game info display initially', () => {
      renderCasinoEnvironment();
      
      expect(screen.queryByTestId('game-info-display')).not.toBeInTheDocument();
    });
  });

  describe('Table Interactions', () => {
    it('should handle table hover events', async () => {
      renderCasinoEnvironment();
      
      const blackjackTable = screen.getByTestId('blackjack-table');
      
      fireEvent.mouseEnter(blackjackTable);
      expect(mockOnTableHover).toHaveBeenCalledWith('blackjack', true);
      
      fireEvent.mouseLeave(blackjackTable);
      expect(mockOnTableHover).toHaveBeenCalledWith('blackjack', false);
    });

    it('should handle table click events', async () => {
      renderCasinoEnvironment();
      
      const rouletteTable = screen.getByTestId('roulette-table');
      fireEvent.click(rouletteTable);
      
      expect(mockOnTableClick).toHaveBeenCalledWith('roulette');
    });

    it('should show game info when table is clicked', async () => {
      renderCasinoEnvironment();
      
      const blackjackTable = screen.getByTestId('blackjack-table');
      fireEvent.click(blackjackTable);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-info-display')).toBeInTheDocument();
        expect(screen.getByTestId('selected-game')).toHaveTextContent('blackjack');
      });
    });

    it('should close game info when close button is clicked', async () => {
      renderCasinoEnvironment();
      
      // Click table to show info
      const blackjackTable = screen.getByTestId('blackjack-table');
      fireEvent.click(blackjackTable);
      
      await waitFor(() => {
        expect(screen.getByTestId('game-info-display')).toBeInTheDocument();
      });
      
      // Click close button
      const closeButton = screen.getByTestId('close-info');
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByTestId('game-info-display')).not.toBeInTheDocument();
      });
    });

    it('should switch between different game infos', async () => {
      renderCasinoEnvironment();
      
      // Click blackjack table
      const blackjackTable = screen.getByTestId('blackjack-table');
      fireEvent.click(blackjackTable);
      
      await waitFor(() => {
        expect(screen.getByTestId('selected-game')).toHaveTextContent('blackjack');
      });
      
      // Click roulette table
      const rouletteTable = screen.getByTestId('roulette-table');
      fireEvent.click(rouletteTable);
      
      await waitFor(() => {
        expect(screen.getByTestId('selected-game')).toHaveTextContent('roulette');
      });
    });
  });

  describe('Event Propagation', () => {
    it('should call parent hover callback when provided', () => {
      renderCasinoEnvironment();
      
      const blackjackTable = screen.getByTestId('blackjack-table');
      fireEvent.mouseEnter(blackjackTable);
      
      expect(mockOnTableHover).toHaveBeenCalledWith('blackjack', true);
    });

    it('should call parent click callback when provided', () => {
      renderCasinoEnvironment();
      
      const rouletteTable = screen.getByTestId('roulette-table');
      fireEvent.click(rouletteTable);
      
      expect(mockOnTableClick).toHaveBeenCalledWith('roulette');
    });

    it('should work without parent callbacks', () => {
      render(
        <Canvas>
          <CasinoEnvironment />
        </Canvas>
      );
      
      const blackjackTable = screen.getByTestId('blackjack-table');
      
      // Should not throw errors
      expect(() => {
        fireEvent.mouseEnter(blackjackTable);
        fireEvent.click(blackjackTable);
      }).not.toThrow();
    });
  });

  describe('State Management', () => {
    it('should maintain selected game state correctly', async () => {
      renderCasinoEnvironment();
      
      // Initially no game selected
      expect(screen.queryByTestId('game-info-display')).not.toBeInTheDocument();
      
      // Select blackjack
      fireEvent.click(screen.getByTestId('blackjack-table'));
      await waitFor(() => {
        expect(screen.getByTestId('selected-game')).toHaveTextContent('blackjack');
      });
      
      // Select roulette
      fireEvent.click(screen.getByTestId('roulette-table'));
      await waitFor(() => {
        expect(screen.getByTestId('selected-game')).toHaveTextContent('roulette');
      });
      
      // Close info
      fireEvent.click(screen.getByTestId('close-info'));
      await waitFor(() => {
        expect(screen.queryByTestId('game-info-display')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible table buttons', () => {
      renderCasinoEnvironment();
      
      const blackjackTable = screen.getByTestId('blackjack-table');
      const rouletteTable = screen.getByTestId('roulette-table');
      
      expect(blackjackTable).toBeInTheDocument();
      expect(rouletteTable).toBeInTheDocument();
      
      // Tables should be focusable
      expect(blackjackTable.tagName).toBe('BUTTON');
      expect(rouletteTable.tagName).toBe('BUTTON');
    });

    it('should have accessible close button in game info', async () => {
      renderCasinoEnvironment();
      
      fireEvent.click(screen.getByTestId('blackjack-table'));
      
      await waitFor(() => {
        const closeButton = screen.getByTestId('close-info');
        expect(closeButton).toBeInTheDocument();
        expect(closeButton.tagName).toBe('BUTTON');
      });
    });
  });
});