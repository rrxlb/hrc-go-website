import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import SpinningChips from '../SpinningChips';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div data-testid="motion-div" {...props}>{children}</div>,
  },
}));

describe('SpinningChips', () => {
  it('renders spinning chips animation', () => {
    render(<SpinningChips />);
    
    // Should render multiple motion divs for chips and effects
    const motionDivs = screen.getAllByTestId('motion-div');
    expect(motionDivs.length).toBeGreaterThan(5); // Chips + orbiting chips + effects
  });

  it('renders with correct container structure', () => {
    const { container } = render(<SpinningChips />);
    
    // Should have the main container with correct classes
    const mainContainer = container.querySelector('.relative.w-32.h-32.mx-auto');
    expect(mainContainer).toBeInTheDocument();
  });

  it('includes glowing and sparkle effects', () => {
    const { container } = render(<SpinningChips />);
    
    // Should have glowing effect
    const glowEffect = container.querySelector('.blur-xl');
    expect(glowEffect).toBeInTheDocument();
    
    // Should have sparkle effects
    const sparkles = container.querySelectorAll('.w-1.h-1.bg-white.rounded-full');
    expect(sparkles.length).toBeGreaterThan(0);
  });
});