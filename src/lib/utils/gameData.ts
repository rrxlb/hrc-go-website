import { GameConfig, GameFeature, ShowcaseConfig, InteractiveElement, AnimationSequence } from '@/lib/types';

/**
 * Validation functions for game data
 */

export const validateGameConfig = (config: GameConfig): boolean => {
  if (!config.id || typeof config.id !== 'string') return false;
  if (!config.name || typeof config.name !== 'string') return false;
  if (!config.displayName || typeof config.displayName !== 'string') return false;
  if (!config.description || typeof config.description !== 'string') return false;
  if (!config.discordCommand || typeof config.discordCommand !== 'string') return false;
  if (!Array.isArray(config.features)) return false;
  if (!validateShowcaseConfig(config.showcase)) return false;
  
  return config.features.every(validateGameFeature);
};

export const validateGameFeature = (feature: GameFeature): boolean => {
  if (!feature.title || typeof feature.title !== 'string') return false;
  if (!feature.description || typeof feature.description !== 'string') return false;
  if (!feature.icon || typeof feature.icon !== 'string') return false;
  if (typeof feature.highlight !== 'boolean') return false;
  
  return true;
};

export const validateShowcaseConfig = (showcase: ShowcaseConfig): boolean => {
  if (!showcase.tableModel || typeof showcase.tableModel !== 'string') return false;
  if (!Array.isArray(showcase.cameraPosition) || showcase.cameraPosition.length !== 3) return false;
  if (!Array.isArray(showcase.animations)) return false;
  if (!Array.isArray(showcase.interactiveElements)) return false;
  
  // Validate camera position contains numbers
  if (!showcase.cameraPosition.every(coord => typeof coord === 'number')) return false;
  
  // Validate animations array
  if (!showcase.animations.every(validateAnimationSequence)) return false;
  
  // Validate interactive elements array
  if (!showcase.interactiveElements.every(validateInteractiveElement)) return false;
  
  return true;
};

export const validateAnimationSequence = (animation: AnimationSequence): boolean => {
  if (!animation.id || typeof animation.id !== 'string') return false;
  if (!['load', 'hover', 'click', 'scroll'].includes(animation.trigger)) return false;
  if (typeof animation.duration !== 'number' || animation.duration <= 0) return false;
  if (!animation.easing || typeof animation.easing !== 'string') return false;
  
  return true;
};

export const validateInteractiveElement = (element: InteractiveElement): boolean => {
  if (!element.id || typeof element.id !== 'string') return false;
  if (!Array.isArray(element.position) || element.position.length !== 3) return false;
  if (!element.position.every(coord => typeof coord === 'number')) return false;
  if (!['navigate', 'info', 'demo'].includes(element.action)) return false;
  if (!element.target || typeof element.target !== 'string') return false;
  
  return true;
};

/**
 * Game data management utilities
 */

export const getAllGameIds = (games: GameConfig[]): string[] => {
  return games.map(game => game.id);
};

export const getGamesByCategory = (games: GameConfig[], category: 'card' | 'table' | 'machine' | 'specialty'): GameConfig[] => {
  const categoryMap: Record<string, string[]> = {
    card: ['blackjack', 'three-card-poker', 'higher-or-lower'],
    table: ['roulette', 'craps'],
    machine: ['slots'],
    specialty: ['horse-racing']
  };
  
  const gameIds = categoryMap[category] || [];
  return games.filter(game => gameIds.includes(game.id));
};

export const getHighlightedFeatures = (game: GameConfig): GameFeature[] => {
  return game.features.filter(feature => feature.highlight);
};

export const getGameFeaturesByIcon = (games: GameConfig[], iconName: string): GameFeature[] => {
  const features: GameFeature[] = [];
  games.forEach(game => {
    game.features.forEach(feature => {
      if (feature.icon === iconName) {
        features.push(feature);
      }
    });
  });
  return features;
};

export const searchGames = (games: GameConfig[], query: string): GameConfig[] => {
  const lowercaseQuery = query.toLowerCase();
  return games.filter(game => 
    game.displayName.toLowerCase().includes(lowercaseQuery) ||
    game.description.toLowerCase().includes(lowercaseQuery) ||
    game.features.some(feature => 
      feature.title.toLowerCase().includes(lowercaseQuery) ||
      feature.description.toLowerCase().includes(lowercaseQuery)
    )
  );
};

export const getGameStats = (games: GameConfig[]) => {
  const totalGames = games.length;
  const totalFeatures = games.reduce((sum, game) => sum + game.features.length, 0);
  const highlightedFeatures = games.reduce((sum, game) => 
    sum + game.features.filter(f => f.highlight).length, 0
  );
  
  const featureIcons = new Set<string>();
  games.forEach(game => {
    game.features.forEach(feature => {
      featureIcons.add(feature.icon);
    });
  });
  
  return {
    totalGames,
    totalFeatures,
    highlightedFeatures,
    uniqueIcons: featureIcons.size,
    averageFeaturesPerGame: Math.round((totalFeatures / totalGames) * 100) / 100
  };
};

/**
 * Discord command utilities
 */

export const getAllDiscordCommands = (games: GameConfig[]): string[] => {
  return games.map(game => game.discordCommand);
};

export const getGameByDiscordCommand = (games: GameConfig[], command: string): GameConfig | undefined => {
  return games.find(game => game.discordCommand === command);
};

export const formatDiscordCommandList = (games: GameConfig[]): string => {
  return games.map(game => `${game.discordCommand} - ${game.displayName}`).join('\n');
};

/**
 * Showcase configuration utilities
 */

export const getOptimalCameraDistance = (cameraPosition: [number, number, number]): number => {
  const [x, y, z] = cameraPosition;
  return Math.sqrt(x * x + y * y + z * z);
};

export const getCameraPositionsByDistance = (games: GameConfig[]): GameConfig[] => {
  return [...games].sort((a, b) => {
    const distanceA = getOptimalCameraDistance(a.showcase.cameraPosition);
    const distanceB = getOptimalCameraDistance(b.showcase.cameraPosition);
    return distanceA - distanceB;
  });
};

export const getGamesWithAnimations = (games: GameConfig[]): GameConfig[] => {
  return games.filter(game => game.showcase.animations.length > 0);
};

export const getGamesWithInteractiveElements = (games: GameConfig[]): GameConfig[] => {
  return games.filter(game => game.showcase.interactiveElements.length > 0);
};

/**
 * Data integrity and health checks
 */

export const validateAllGames = (games: GameConfig[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  games.forEach((game, index) => {
    if (!validateGameConfig(game)) {
      errors.push(`Game at index ${index} (${game.id || 'unknown'}) failed validation`);
    }
  });
  
  // Check for duplicate IDs
  const ids = games.map(g => g.id);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length > 0) {
    errors.push(`Duplicate game IDs found: ${duplicateIds.join(', ')}`);
  }
  
  // Check for duplicate names
  const names = games.map(g => g.name);
  const duplicateNames = names.filter((name, index) => names.indexOf(name) !== index);
  if (duplicateNames.length > 0) {
    errors.push(`Duplicate game names found: ${duplicateNames.join(', ')}`);
  }
  
  // Check for duplicate Discord commands
  const commands = games.map(g => g.discordCommand);
  const duplicateCommands = commands.filter((cmd, index) => commands.indexOf(cmd) !== index);
  if (duplicateCommands.length > 0) {
    errors.push(`Duplicate Discord commands found: ${duplicateCommands.join(', ')}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

export const getGameDataHealth = (games: GameConfig[]) => {
  const validation = validateAllGames(games);
  const stats = getGameStats(games);
  
  return {
    isHealthy: validation.valid,
    errors: validation.errors,
    stats,
    recommendations: generateRecommendations(games, stats)
  };
};

const generateRecommendations = (games: GameConfig[], stats: any): string[] => {
  const recommendations: string[] = [];
  
  if (stats.averageFeaturesPerGame < 2) {
    recommendations.push('Consider adding more features to games with fewer than 2 features');
  }
  
  if (stats.highlightedFeatures === 0) {
    recommendations.push('Consider highlighting key features for better user engagement');
  }
  
  const gamesWithoutAnimations = games.filter(g => g.showcase.animations.length === 0);
  if (gamesWithoutAnimations.length > 0) {
    recommendations.push(`${gamesWithoutAnimations.length} games are missing showcase animations`);
  }
  
  const gamesWithoutInteractions = games.filter(g => g.showcase.interactiveElements.length === 0);
  if (gamesWithoutInteractions.length > 0) {
    recommendations.push(`${gamesWithoutInteractions.length} games are missing interactive elements`);
  }
  
  return recommendations;
};