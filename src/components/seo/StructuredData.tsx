'use client';

import { useEffect } from 'react';

interface StructuredDataProps {
  type?: 'website' | 'game' | 'organization';
  gameData?: {
    name: string;
    description: string;
    category: string;
  };
}

export default function StructuredData({ type = 'website', gameData }: StructuredDataProps) {
  useEffect(() => {
    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    let structuredData;

    switch (type) {
      case 'website':
        structuredData = {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "High Roller Club",
          "alternateName": "High Roller Club Discord Casino",
          "url": "https://highrollerclub.com",
          "description": "Premium AI-powered Discord casino experience with immersive 3D environments and exclusive VIP gaming.",
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://highrollerclub.com/search?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          },
          "publisher": {
            "@type": "Organization",
            "@id": "https://highrollerclub.com/#organization"
          },
          "mainEntity": {
            "@type": "SoftwareApplication",
            "name": "High Roller Club Casino Bot",
            "applicationCategory": "GameApplication",
            "operatingSystem": "Discord",
            "description": "AI-powered casino bot for Discord with realistic gaming experiences",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "1250",
              "bestRating": "5",
              "worstRating": "1"
            }
          }
        };
        break;

      case 'organization':
        structuredData = {
          "@context": "https://schema.org",
          "@type": "Organization",
          "@id": "https://highrollerclub.com/#organization",
          "name": "High Roller Club",
          "url": "https://highrollerclub.com",
          "logo": {
            "@type": "ImageObject",
            "url": "https://highrollerclub.com/images/logo.png",
            "width": 512,
            "height": 512
          },
          "description": "Premium Discord casino experience with AI-powered games and immersive 3D environments.",
          "foundingDate": "2024",
          "sameAs": [
            "https://discord.gg/RK4K8tDsHB",
            "https://twitter.com/HighRollerClub"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "availableLanguage": "English"
          }
        };
        break;

      case 'game':
        if (gameData) {
          structuredData = {
            "@context": "https://schema.org",
            "@type": "Game",
            "name": gameData.name,
            "description": gameData.description,
            "genre": gameData.category,
            "gamePlatform": "Discord",
            "applicationCategory": "GameApplication",
            "operatingSystem": "Discord",
            "isPartOf": {
              "@type": "SoftwareApplication",
              "name": "High Roller Club Casino Bot"
            },
            "publisher": {
              "@type": "Organization",
              "@id": "https://highrollerclub.com/#organization"
            }
          };
        }
        break;
    }

    if (structuredData) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    return () => {
      const scriptToRemove = document.querySelector('script[type="application/ld+json"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [type, gameData]);

  return null;
}