# Game Data System

This directory contains the game data models and configuration for the High Roller Club website.

## Overview

The game data system provides a comprehensive configuration for all seven casino games offered by the Discord bot:

1. **Blackjack** - Classic 21 card game with AI-powered strategy hints
2. **Three Card Poker** - Fast-paced poker variant with ante and play betting
3. **Roulette** - European roulette with realistic wheel physics
4. **Slot Machines** - Various themed slot machines with progressive jackpots
5. **Craps** - Exciting dice game with realistic physics
6. **Higher or Lower** - Simple card prediction game with multiplier rewards
7. **Horse Racing** - Virtual horse racing with live commentary

## Files

### `games.ts`
Main game configuration file containing:
- `GAMES` - Array of all game configurations
- `getGameById()` - Find game by ID
- `getGameByName()` - Find game by name
- `getRandomGame()` - Get random game
- `getFeaturedGames()` - Get games with highlighted features
- `getGameCount()` - Get total number of games
- `isValidGameId()` - Validate game ID

## Data Structure

Each game follows the `GameConfig` interface:

```typescript
interface GameConfig {
  id: string;                    // Unique identifier
  name: string;                  // Internal name
  displayName: string;           // User-facing name
  description: string;           // Game description
  features: GameFeature[];       // Array of game features
  showcase: ShowcaseConfig;      // 3D showcase configuration
  discordCommand: string;        // Discord bot command
}
```

### Game Features

Each game has multiple features with the following structure:

```typescript
interface GameFeature {
  title: string;                 // Feature name
  description: string;           // Feature description
  icon: string;                  // Icon identifier
  highlight: boolean;            // Whether to highlight this feature
}
```

### Showcase Configuration

3D showcase settings for each game:

```typescript
interface ShowcaseConfig {
  tableModel: string;                    // Path to 3D model
  cameraPosition: [number, number, number]; // Camera position [x, y, z]
  animations: AnimationSequence[];       // Showcase animations
  interactiveElements: InteractiveElement[]; // Interactive hotspots
}
```

## Usage Examples

### Basic Usage

```typescript
import { GAMES, getGameById } from '@/lib/data/games';

// Get all games
const allGames = GAMES;

// Get specific game
const blackjack = getGameById('blackjack');

// Get featured games
const featured = getFeaturedGames();
```

### With Utilities

```typescript
import { getGamesByCategory, searchGames } from '@/lib/utils/gameData';

// Get games by category
const cardGames = getGamesByCategory(GAMES, 'card');
const tableGames = getGamesByCategory(GAMES, 'table');

// Search games
const aiGames = searchGames(GAMES, 'AI');
```

## Validation

The game data includes comprehensive validation:

```typescript
import { validateAllGames, getGameDataHealth } from '@/lib/utils/gameData';

// Validate all games
const validation = validateAllGames(GAMES);
console.log(validation.valid); // true/false
console.log(validation.errors); // Array of error messages

// Get health report
const health = getGameDataHealth(GAMES);
console.log(health.isHealthy); // true/false
console.log(health.recommendations); // Array of recommendations
```

## Discord Commands

Each game has an associated Discord command:

- `/blackjack` - Blackjack
- `/poker` - Three Card Poker
- `/roulette` - Roulette
- `/slots` - Slot Machines
- `/craps` - Craps
- `/higher-lower` - Higher or Lower
- `/horse-race` - Horse Racing

## 3D Models

Each game references a 3D model for the showcase:

- `/models/blackjack-table.glb`
- `/models/poker-table.glb`
- `/models/roulette-table.glb`
- `/models/slot-machine.glb`
- `/models/craps-table.glb`
- `/models/card-table.glb`
- `/models/racing-booth.glb`

## Camera Positions

Optimal camera positions for each game table:

- **Blackjack**: [0, 1.5, 2] - Close table view
- **Three Card Poker**: [0, 1.5, 2] - Close table view
- **Roulette**: [0, 2, 3] - Elevated view of wheel
- **Slots**: [0, 1.5, 2] - Machine front view
- **Craps**: [0, 2, 4] - Wide table view
- **Higher or Lower**: [0, 1.5, 2] - Card table view
- **Horse Racing**: [0, 1.5, 2] - Betting booth view

## Validation Script

Run the validation script to check data integrity:

```bash
node scripts/validate-games.js
```

This will verify:
- All required games are present
- No duplicate IDs, names, or commands
- All data structures are valid
- Feature configurations are complete