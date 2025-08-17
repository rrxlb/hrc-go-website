import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import LoadingProgress from '../LoadingProgress';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('LoadingProgress', () => {
  it('renders progress bar with correct percentage', () => {
    render(<LoadingProgress progress={75} />);
    
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('displays current asset being loaded', () => {
    render(<LoadingProgress progress={50} currentAsset="Casino Floor" />);
    
    expect(screen.getByText('Loading Casino Floor...')).toBeInTheDocument();
  });

  it('shows loading stages with correct states', () => {
    render(<LoadingProgress progress={60} />);
    
    // Should show completed stages
    expect(screen.getByText('3D Models')).toBeInTheDocument();
    expect(screen.getByText('Textures')).toBeInTheDocument();
    expect(screen.getByText('Animations')).toBeInTheDocument();
    expect(screen.getByText('Ready')).toBeInTheDocument();
  });

  it('handles zero progress', () => {
    render(<LoadingProgress progress={0} />);
    
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('handles complete progress', () => {
    render(<LoadingProgress progress={100} />);
    
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('renders without current asset', () => {
    render(<LoadingProgress progress={25} />);
    
    // Should not show loading text when no current asset
    expect(screen.queryByText(/Loading .../)).not.toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
  });
});