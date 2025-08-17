import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as THREE from 'three';

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

// Import after mocking
import {
  ANIMATION_CONFIGS,
  createParticleEffect,
  triggerSoundEffect,
  SOUND_EFFECTS
} from '../gameAnimations';

// Mock Three.js
vi.mock('three', () => ({
  Vector3: vi.fn(() => ({
    x: 0,
    y: 0,
    z: 0,
    copy: vi.fn()
  })),
  Mesh: vi.fn(() => ({
    position: { x: 0, y: 0, z: 0, copy: vi.fn() },
    rotation: { x: 0, y: 0, z: 0, set: vi.fn() },
    material: { dispose: vi.fn() },
    geometry: { dispose: vi.fn() }
  })),
  Group: vi.fn(() => ({
    rotation: { y: 0 }
  })),
  SphereGeometry: vi.fn(),
  MeshBasicMaterial: vi.fn(() => ({
    dispose: vi.fn()
  }))
}));

describe('gameAnimations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ANIMATION_CONFIGS', () => {
    it('contains all required game configurations', () => {
      expect(ANIMATION_CONFIGS).toHaveProperty('blackjack');
      expect(ANIMATION_CONFIGS).toHaveProperty('roulette');
      expect(ANIMATION_CONFIGS).toHaveProperty('slots');
      expect(ANIMATION_CONFIGS).toHaveProperty('craps');
    });

    it('has proper blackjack configuration', () => {
      const config = ANIMATION_CONFIGS.blackjack.cardDeal;
      expect(config).toHaveProperty('duration');
      expect(config).toHaveProperty('stagger');
      expect(config).toHaveProperty('ease');
      expect(config).toHaveProperty('cardFlipDelay');
    });

    it('has proper roulette configuration', () => {
      const config = ANIMATION_CONFIGS.roulette.wheelSpin;
      expect(config).toHaveProperty('duration');
      expect(config).toHaveProperty('rotations');
      expect(config).toHaveProperty('ease');
      expect(config).toHaveProperty('ballDuration');
      expect(config).toHaveProperty('ballEase');
    });
  });

  // Test utility functions that don't require complex mocking

  describe('createParticleEffect', () => {
    it('creates particle meshes', () => {
      const position = new THREE.Vector3(0, 0, 0);
      const count = 10;

      const particles = createParticleEffect(position, count);

      expect(particles).toHaveLength(count);
      expect(vi.mocked(THREE.Mesh)).toHaveBeenCalledTimes(count);
    });

    it('uses default count when not specified', () => {
      const position = new THREE.Vector3(0, 0, 0);

      const particles = createParticleEffect(position);

      expect(particles).toHaveLength(20); // Default count
    });
  });

  describe('triggerSoundEffect', () => {
    it('logs sound effect name', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      triggerSoundEffect('cardDeal');

      expect(consoleSpy).toHaveBeenCalledWith('Playing sound effect: card_deal.mp3');
      
      consoleSpy.mockRestore();
    });
  });

  describe('SOUND_EFFECTS', () => {
    it('contains all required sound effects', () => {
      expect(SOUND_EFFECTS).toHaveProperty('cardDeal');
      expect(SOUND_EFFECTS).toHaveProperty('rouletteSpin');
      expect(SOUND_EFFECTS).toHaveProperty('slotSpin');
      expect(SOUND_EFFECTS).toHaveProperty('diceRoll');
      expect(SOUND_EFFECTS).toHaveProperty('chipPlace');
      expect(SOUND_EFFECTS).toHaveProperty('win');
    });

    it('has proper file extensions', () => {
      Object.values(SOUND_EFFECTS).forEach(filename => {
        expect(filename).toMatch(/\.mp3$/);
      });
    });
  });
});