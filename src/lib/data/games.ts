import { GameConfig } from '@/lib/types';

// Re-export GameConfig for components that need it
export type { GameConfig };

export const GAMES: GameConfig[] = [
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

export const getGameById = (id: string): GameConfig | undefined => {
  return GAMES.find(game => game.id === id);
};

export const getGameByName = (name: string): GameConfig | undefined => {
  return GAMES.find(game => game.name === name);
};

export const getRandomGame = (): GameConfig => {
  return GAMES[Math.floor(Math.random() * GAMES.length)];
};

export const getFeaturedGames = (): GameConfig[] => {
  return GAMES.filter(game => 
    game.features.some(feature => feature.highlight)
  );
};

export const getGameCount = (): number => {
  return GAMES.length;
};

export const isValidGameId = (id: string): boolean => {
  return GAMES.some(game => game.id === id);
};