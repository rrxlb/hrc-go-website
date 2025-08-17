// Simple validation script to check game data
// Run with: node scripts/validate-games.js

const GAMES = [
  {
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
      },
      {
        title: 'Side Bets',
        description: 'Perfect Pairs and 21+3 side betting options',
        icon: 'chips',
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
  },
  {
    id: 'three-card-poker',
    name: 'three-card-poker',
    displayName: 'Three Card Poker',
    description: 'Fast-paced poker variant with ante and play betting',
    features: [
      {
        title: 'Quick Rounds',
        description: 'Fast 3-card poker action',
        icon: 'lightning',
        highlight: true
      },
      {
        title: 'Pair Plus',
        description: 'Optional side bet for bonus payouts',
        icon: 'star',
        highlight: false
      }
    ],
    showcase: {
      tableModel: '/models/poker-table.glb',
      cameraPosition: [0, 1.5, 2],
      animations: [],
      interactiveElements: []
    },
    discordCommand: '/poker'
  },
  {
    id: 'roulette',
    name: 'roulette',
    displayName: 'Roulette',
    description: 'European roulette with realistic wheel physics',
    features: [
      {
        title: 'Realistic Physics',
        description: 'Authentic wheel spinning simulation',
        icon: 'wheel',
        highlight: true
      },
      {
        title: 'Multiple Bets',
        description: 'Inside and outside betting options',
        icon: 'target',
        highlight: false
      }
    ],
    showcase: {
      tableModel: '/models/roulette-table.glb',
      cameraPosition: [0, 2, 3],
      animations: [],
      interactiveElements: []
    },
    discordCommand: '/roulette'
  },
  {
    id: 'slots',
    name: 'slots',
    displayName: 'Slot Machines',
    description: 'Various themed slot machines with progressive jackpots',
    features: [
      {
        title: 'Multiple Themes',
        description: 'Different slot machine themes and styles',
        icon: 'palette',
        highlight: true
      },
      {
        title: 'Progressive Jackpots',
        description: 'Growing jackpots across the server',
        icon: 'trophy',
        highlight: true
      }
    ],
    showcase: {
      tableModel: '/models/slot-machine.glb',
      cameraPosition: [0, 1.5, 2],
      animations: [],
      interactiveElements: []
    },
    discordCommand: '/slots'
  },
  {
    id: 'craps',
    name: 'craps',
    displayName: 'Craps',
    description: 'Exciting dice game with realistic physics',
    features: [
      {
        title: 'Dice Physics',
        description: 'Realistic dice rolling simulation',
        icon: 'dice',
        highlight: true
      },
      {
        title: 'Multiple Bets',
        description: 'Pass line, odds, and proposition bets',
        icon: 'grid',
        highlight: false
      }
    ],
    showcase: {
      tableModel: '/models/craps-table.glb',
      cameraPosition: [0, 2, 4],
      animations: [],
      interactiveElements: []
    },
    discordCommand: '/craps'
  },
  {
    id: 'higher-or-lower',
    name: 'higher-or-lower',
    displayName: 'Higher or Lower',
    description: 'Simple card prediction game with multiplier rewards',
    features: [
      {
        title: 'Multiplier Chains',
        description: 'Build winning streaks for bigger payouts',
        icon: 'trending-up',
        highlight: true
      },
      {
        title: 'Risk Management',
        description: 'Cash out anytime to secure winnings',
        icon: 'shield',
        highlight: false
      }
    ],
    showcase: {
      tableModel: '/models/card-table.glb',
      cameraPosition: [0, 1.5, 2],
      animations: [],
      interactiveElements: []
    },
    discordCommand: '/higher-lower'
  },
  {
    id: 'horse-racing',
    name: 'horse-racing',
    displayName: 'Horse Racing',
    description: 'Virtual horse racing with live commentary',
    features: [
      {
        title: 'Live Commentary',
        description: 'AI-generated race commentary',
        icon: 'microphone',
        highlight: true
      },
      {
        title: 'Multiple Bets',
        description: 'Win, place, show, and exotic betting',
        icon: 'horse',
        highlight: false
      }
    ],
    showcase: {
      tableModel: '/models/racing-booth.glb',
      cameraPosition: [0, 1.5, 2],
      animations: [],
      interactiveElements: []
    },
    discordCommand: '/horse-race'
  }
];

// Simple validation functions
const validateGameConfig = (config) => {
  if (!config.id || typeof config.id !== 'string') return false;
  if (!config.name || typeof config.name !== 'string') return false;
  if (!config.displayName || typeof config.displayName !== 'string') return false;
  if (!config.description || typeof config.description !== 'string') return false;
  if (!config.discordCommand || typeof config.discordCommand !== 'string') return false;
  if (!Array.isArray(config.features)) return false;
  if (!config.showcase || !config.showcase.tableModel) return false;
  if (!Array.isArray(config.showcase.cameraPosition) || config.showcase.cameraPosition.length !== 3) return false;
  
  return config.features.every(feature => 
    feature.title && feature.description && feature.icon && typeof feature.highlight === 'boolean'
  );
};

// Run validation
console.log('🎰 High Roller Club - Game Data Validation');
console.log('==========================================');

const requiredGames = [
  'blackjack',
  'three-card-poker', 
  'roulette',
  'slots',
  'craps',
  'higher-or-lower',
  'horse-racing'
];

let allValid = true;
const errors = [];

// Validate each game
GAMES.forEach((game, index) => {
  if (!validateGameConfig(game)) {
    allValid = false;
    errors.push(`Game at index ${index} (${game.id || 'unknown'}) failed validation`);
  }
});

// Check for required games
const gameIds = GAMES.map(g => g.id);
const missingGames = requiredGames.filter(id => !gameIds.includes(id));
if (missingGames.length > 0) {
  allValid = false;
  errors.push(`Missing required games: ${missingGames.join(', ')}`);
}

// Check for duplicates
const duplicateIds = gameIds.filter((id, index) => gameIds.indexOf(id) !== index);
if (duplicateIds.length > 0) {
  allValid = false;
  errors.push(`Duplicate game IDs: ${duplicateIds.join(', ')}`);
}

// Results
console.log(`\n✅ Data Validation: ${allValid ? 'PASSED' : 'FAILED'}`);

if (!allValid) {
  console.log('❌ Validation Errors:');
  errors.forEach(error => console.log(`   - ${error}`));
} else {
  console.log('\n📊 Game Statistics:');
  console.log(`   - Total Games: ${GAMES.length}`);
  console.log(`   - All Required Games Present: ✅`);
  
  console.log('\n💬 Discord Commands:');
  GAMES.forEach(game => console.log(`   - ${game.discordCommand} (${game.displayName})`));
  
  console.log('\n🎮 Game Features Summary:');
  GAMES.forEach(game => {
    const highlightedFeatures = game.features.filter(f => f.highlight).length;
    console.log(`   - ${game.displayName}: ${game.features.length} features (${highlightedFeatures} highlighted)`);
  });
}

console.log('\n🎉 Validation Complete!');
process.exit(allValid ? 0 : 1);