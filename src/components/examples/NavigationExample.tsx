'use client';

import { useState } from 'react';
import { Vector3 } from 'three';
import CasinoScene from '@/components/casino/CasinoScene';
import NavigationOverlay from '@/components/ui/NavigationOverlay';
import ResponsiveNavigation from '@/components/ui/ResponsiveNavigation';
import { DiscordCTAPresets } from '@/components/ui/DiscordCTA';
import { useNavigation } from '@/lib/hooks/useNavigation';
import { GAMES } from '@/lib/data/games';

export default function NavigationExample() {
  const navigation = useNavigation();
  const [cameraPosition, setCameraPosition] = useState<Vector3>(new Vector3(0, 1.6, 3));
  const [cameraTarget, setCameraTarget] = useState<Vector3>(new Vector3(0, 0, 0));

  const handleGameSelect = (gameId: string) => {
    navigation.selectGame(gameId);
    
    // Get the selected game's camera position
    const game = GAMES.find(g => g.id === gameId);
    if (game) {
      const [x, y, z] = game.showcase.cameraPosition;
      setCameraPosition(new Vector3(x, y, z));
      setCameraTarget(new Vector3(0, 0, 0));
      console.log(`Navigating to ${game.displayName} at position [${x}, ${y}, ${z}]`);
    }
  };

  const handleDiscordClick = () => {
    console.log('Discord CTA clicked from navigation');
    // Track conversion event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'discord_cta_click', {
        event_category: 'engagement',
        event_label: 'navigation_overlay',
        value: 1
      });
    }
  };

  const handleCameraChange = (position: Vector3, target: Vector3) => {
    setCameraPosition(position);
    setCameraTarget(target);
  };

  return (
    <div className="min-h-screen bg-casino-dark relative">
      {/* 3D Casino Scene with Camera Integration */}
      <div className="absolute inset-0 z-0">
        <CasinoScene 
          onCameraChange={handleCameraChange}
          showNavigation={false} // We're using our custom navigation
        />
      </div>

      {/* Navigation Overlay System */}
      <NavigationOverlay 
        onGameSelect={handleGameSelect}
        onDiscordClick={handleDiscordClick}
      />

      {/* Alternative: Responsive Navigation (uncomment to use instead) */}
      {/* 
      <ResponsiveNavigation
        games={navigation.games}
        selectedGame={navigation.selectedGame}
        onGameSelect={handleGameSelect}
        onDiscordClick={handleDiscordClick}
        isMenuOpen={navigation.isMenuOpen}
        onToggleMenu={navigation.toggleMenu}
      />
      */}

      {/* Multiple Discord CTA Placements */}
      <DiscordCTAPresets.FloatingPrimary 
        onClick={handleDiscordClick}
        position="bottom-right"
      />

      <DiscordCTAPresets.FloatingSecondary 
        onClick={handleDiscordClick}
        position="bottom-left"
      />

      {/* Debug Info (remove in production) */}
      <div className="absolute top-4 left-4 bg-black/70 text-white p-3 rounded-lg text-xs max-w-xs pointer-events-none z-40">
        <p><strong>Selected Game:</strong> {navigation.selectedGame?.displayName || 'None'}</p>
        <p><strong>Menu Open:</strong> {navigation.isMenuOpen ? 'Yes' : 'No'}</p>
        <p><strong>Camera Position:</strong> [{cameraPosition.x.toFixed(1)}, {cameraPosition.y.toFixed(1)}, {cameraPosition.z.toFixed(1)}]</p>
        <p><strong>Camera Target:</strong> [{cameraTarget.x.toFixed(1)}, {cameraTarget.y.toFixed(1)}, {cameraTarget.z.toFixed(1)}]</p>
      </div>

      {/* Welcome Message */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <div className="text-center max-w-2xl mx-auto p-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-casino-gold-gradient bg-clip-text text-transparent animate-glow">
            High Roller Club
          </h1>
          <p className="text-lg md:text-xl text-casino-white/80 mb-6">
            Navigate through our premium casino experience
          </p>
          <p className="text-sm text-casino-white/60">
            Use the navigation menu to explore different games
          </p>
        </div>
      </div>
    </div>
  );
}