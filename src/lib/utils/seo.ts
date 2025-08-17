import { Metadata } from 'next';

interface SEOConfig {
  title: string;
  description: string;
  path?: string;
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article' | 'game';
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
}

export function generateMetadata({
  title,
  description,
  path = '',
  image = '/images/og-casino-main.jpg',
  imageAlt = 'High Roller Club - Premium Discord Casino Experience',
  type = 'website',
  publishedTime,
  modifiedTime,
  tags = []
}: SEOConfig): Metadata {
  const baseUrl = 'https://highrollerclub.com';
  const url = `${baseUrl}${path}`;
  
  const metadata: Metadata = {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'High Roller Club',
      type: type === 'game' ? 'website' : type,
      locale: 'en_US',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: imageAlt,
          type: 'image/jpeg'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      site: '@HighRollerClub',
      creator: '@HighRollerClub',
      title,
      description,
      images: [image]
    },
    alternates: {
      canonical: url
    }
  };

  // Add article-specific metadata
  if (type === 'article' && (publishedTime || modifiedTime)) {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: 'article',
      publishedTime,
      modifiedTime,
      tags
    };
  }

  return metadata;
}

export function generateGameMetadata(game: {
  id: string;
  name: string;
  description: string;
  displayName: string;
}): Metadata {
  return generateMetadata({
    title: `${game.displayName} - High Roller Club Casino`,
    description: `Experience ${game.name} like never before with AI-powered gameplay and immersive 3D graphics. ${game.description}`,
    path: `/games/${game.id}`,
    image: `/images/og-${game.id}.jpg`,
    imageAlt: `${game.displayName} - High Roller Club Casino Game`,
    type: 'game',
    tags: [game.name.toLowerCase(), 'casino', 'discord', 'ai-powered']
  });
}

export const casinoKeywords = [
  'discord casino', 'AI casino', 'virtual casino', 'discord bot', 'casino games',
  'blackjack', 'roulette', 'poker', 'slots', 'craps', 'horse racing',
  '3D casino', 'immersive gaming', 'VIP casino', 'high roller', 'premium gaming',
  'discord gambling', 'casino simulation', 'realistic casino', 'exclusive club'
];

export const socialImages = {
  main: '/images/og-casino-main.jpg',
  tables: '/images/og-casino-tables.jpg',
  games: '/images/og-casino-games.jpg',
  vip: '/images/og-casino-vip.jpg',
  twitter: '/images/twitter-casino-card.jpg'
};