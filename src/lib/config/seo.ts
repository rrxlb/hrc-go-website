export const seoConfig = {
  baseUrl: 'https://highrollerclub.com',
  siteName: 'High Roller Club',
  defaultTitle: 'High Roller Club - Premium AI-Powered Discord Casino Experience',
  titleTemplate: '%s | High Roller Club',
  defaultDescription: 'Experience the ultimate virtual casino with AI-powered games, 3D environments, and exclusive VIP treatment. Join the most innovative Discord casino today.',
  
  // Social media handles
  social: {
    twitter: '@HighRollerClub',
    discord: 'https://discord.gg/RK4K8tDsHB'
  },

  // Default Open Graph images
  images: {
    default: '/images/og-casino-main.jpg',
    twitter: '/images/twitter-casino-card.jpg',
    games: '/images/og-casino-games.jpg',
    tables: '/images/og-casino-tables.jpg'
  },

  // Keywords for different sections
  keywords: {
    main: [
      'discord casino', 'AI casino', 'virtual casino', 'discord bot', 'casino games',
      'blackjack', 'roulette', 'poker', 'slots', 'craps', 'horse racing',
      '3D casino', 'immersive gaming', 'VIP casino', 'high roller', 'premium gaming'
    ],
    games: [
      'casino games', 'discord gambling', 'AI-powered games', 'realistic casino',
      'virtual gambling', 'casino simulation', 'online casino', 'casino bot'
    ],
    technical: [
      '3D casino', 'WebGL casino', 'Three.js casino', 'immersive web experience',
      'virtual reality casino', 'browser casino', 'web-based casino'
    ]
  },

  // Structured data templates
  structuredData: {
    organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'High Roller Club',
      url: 'https://highrollerclub.com',
      logo: 'https://highrollerclub.com/images/logo.png',
      description: 'Premium Discord casino experience with AI-powered games and immersive 3D environments.',
      foundingDate: '2024',
      sameAs: [
        'https://discord.gg/RK4K8tDsHB',
        'https://twitter.com/HighRollerClub'
      ]
    },
    
    website: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'High Roller Club',
      url: 'https://highrollerclub.com',
      description: 'Premium AI-powered Discord casino experience with immersive 3D environments and exclusive VIP gaming.',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://highrollerclub.com/search?q={search_term_string}'
        },
        'query-input': 'required name=search_term_string'
      }
    }
  },

  // Verification codes (to be replaced with actual values)
  verification: {
    google: 'your-google-verification-code',
    bing: 'your-bing-verification-code',
    yandex: 'your-yandex-verification-code'
  }
};

export const gamesSEO = {
  blackjack: {
    title: 'AI-Powered Blackjack - High Roller Club Casino',
    description: 'Experience the most realistic Blackjack game on Discord with AI dealers, advanced strategies, and immersive 3D graphics.',
    keywords: ['blackjack', '21', 'card game', 'AI dealer', 'casino blackjack', 'discord blackjack']
  },
  roulette: {
    title: 'Immersive Roulette Experience - High Roller Club Casino',
    description: 'Spin the wheel in our stunning 3D roulette game with realistic physics and AI-powered gameplay.',
    keywords: ['roulette', 'wheel', 'casino roulette', 'european roulette', 'american roulette', '3D roulette']
  },
  poker: {
    title: 'Three Card Poker - High Roller Club Casino',
    description: 'Master the art of Three Card Poker with our AI-powered dealer and immersive casino environment.',
    keywords: ['three card poker', 'poker', 'card game', 'casino poker', 'AI poker', 'discord poker']
  },
  slots: {
    title: 'Premium Slot Machines - High Roller Club Casino',
    description: 'Try your luck on our collection of themed slot machines with stunning graphics and exciting bonus features.',
    keywords: ['slots', 'slot machines', 'casino slots', 'jackpot', 'bonus rounds', 'themed slots']
  },
  craps: {
    title: 'Realistic Craps Table - High Roller Club Casino',
    description: 'Roll the dice in our authentic craps experience with realistic physics and comprehensive betting options.',
    keywords: ['craps', 'dice game', 'casino craps', 'dice rolling', 'craps betting', 'realistic craps']
  },
  'higher-or-lower': {
    title: 'Higher or Lower Card Game - High Roller Club Casino',
    description: 'Test your intuition with our exciting Higher or Lower card game featuring AI-powered gameplay.',
    keywords: ['higher or lower', 'card prediction', 'guessing game', 'simple casino game', 'quick game']
  },
  'horse-racing': {
    title: 'Virtual Horse Racing - High Roller Club Casino',
    description: 'Bet on virtual horse races with realistic animations and AI-powered race outcomes.',
    keywords: ['horse racing', 'virtual racing', 'betting', 'race simulation', 'horse betting', 'racing game']
  }
};