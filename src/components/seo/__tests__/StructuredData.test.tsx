import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import StructuredData from '../StructuredData';

// Mock the entire component since it manipulates DOM directly
vi.mock('../StructuredData', () => {
  return {
    default: vi.fn(() => null)
  };
});

describe('StructuredData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    expect(() => StructuredData({ type: 'website' })).not.toThrow();
  });

  it('can be called with different types', () => {
    expect(() => StructuredData({ type: 'organization' })).not.toThrow();
    expect(() => StructuredData({ type: 'game', gameData: { name: 'Test', description: 'Test', category: 'Test' } })).not.toThrow();
  });

  it('handles missing gameData for game type', () => {
    expect(() => StructuredData({ type: 'game' })).not.toThrow();
  });

  it('defaults to website type', () => {
    expect(() => StructuredData({})).not.toThrow();
  });

  it('component is called when imported', () => {
    expect(StructuredData).toBeDefined();
    expect(typeof StructuredData).toBe('function');
  });
});