import { render } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import { describe, it, expect, vi } from 'vitest';
import { 
  BlackjackCardDealing, 
  RouletteWheelSpin, 
  SlotReelSpin, 
  CrapsDiceRoll 
} from '../GameAnimations';

// Mock GSAP
vi.mock('gsap', () => ({
  gsap: {
    timeline: vi.fn(() => ({
      to: vi.fn().mockReturnThis(),
      add: vi.fn().mockReturnThis()
    })),
    to: vi.fn()
  }
}));

// Mock Three.js
vi.mock('three', () => ({
  BoxGeometry: vi.fn(),
  MeshStandardMaterial: vi.fn(),
  Mesh: vi.fn(() => ({
    position: { set: vi.fn(), copy: vi.fn() },
    rotation: { set: vi.fn() },
    clear: vi.fn(),
    add: vi.fn()
  })),
  Group: vi.fn(() => ({
    clear: vi.fn(),
    add: vi.fn()
  })),
  SphereGeometry: vi.fn(),
  PlaneGeometry: vi.fn()
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Canvas>
    <ambientLight />
    {children}
  </Canvas>
);

describe('GameAnimations', () => {
  describe('BlackjackCardDealing', () => {
    it('renders without crashing', () => {
      render(
        <TestWrapper>
          <BlackjackCardDealing isActive={false} />
        </TestWrapper>
      );
    });

    it('renders with animation active', () => {
      const onComplete = vi.fn();
      render(
        <TestWrapper>
          <BlackjackCardDealing isActive={true} onComplete={onComplete} />
        </TestWrapper>
      );
      
      // Component should render without errors
      expect(document.querySelector('canvas')).toBeInTheDocument();
    });
  });

  describe('RouletteWheelSpin', () => {
    it('renders without crashing', () => {
      render(
        <TestWrapper>
          <RouletteWheelSpin isActive={false} />
        </TestWrapper>
      );
    });

    it('renders with animation active', () => {
      render(
        <TestWrapper>
          <RouletteWheelSpin isActive={true} />
        </TestWrapper>
      );
      
      // Component should render without errors
      expect(document.querySelector('canvas')).toBeInTheDocument();
    });
  });

  describe('SlotReelSpin', () => {
    it('renders without crashing', () => {
      render(
        <TestWrapper>
          <SlotReelSpin isActive={false} />
        </TestWrapper>
      );
    });

    it('renders with animation active', () => {
      render(
        <TestWrapper>
          <SlotReelSpin isActive={true} />
        </TestWrapper>
      );
      
      // Component should render without errors
      expect(document.querySelector('canvas')).toBeInTheDocument();
    });
  });

  describe('CrapsDiceRoll', () => {
    it('renders without crashing', () => {
      render(
        <TestWrapper>
          <CrapsDiceRoll isActive={false} />
        </TestWrapper>
      );
    });

    it('renders with animation active', () => {
      render(
        <TestWrapper>
          <CrapsDiceRoll isActive={true} />
        </TestWrapper>
      );
      
      // Component should render without errors
      expect(document.querySelector('canvas')).toBeInTheDocument();
    });
  });
});