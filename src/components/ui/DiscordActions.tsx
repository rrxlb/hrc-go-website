/**
 * Component showing both Discord server join and bot invite options
 */

'use client';

import React from 'react';
import { AnalyticsDiscordCTA } from '@/components/analytics/AnalyticsDiscordCTA';

interface DiscordActionsProps {
  position: string;
  gameContext?: string;
  showBothOptions?: boolean;
  className?: string;
}

export function DiscordActions({
  position,
  gameContext,
  showBothOptions = false,
  className = ''
}: DiscordActionsProps) {
  if (!showBothOptions) {
    // Default: Just show server join
    return (
      <AnalyticsDiscordCTA
        position={position}
        gameContext={gameContext}
        linkType="server"
        variant="primary"
        size="large"
        className={className}
      >
        Join High Roller Club
      </AnalyticsDiscordCTA>
    );
  }

  // Show both options
  return (
    <div className={`flex flex-col sm:flex-row gap-4 ${className}`}>
      <AnalyticsDiscordCTA
        position={`${position}_server`}
        gameContext={gameContext}
        linkType="server"
        variant="primary"
        size="medium"
      >
        Join Server
      </AnalyticsDiscordCTA>
      
      <AnalyticsDiscordCTA
        position={`${position}_bot`}
        gameContext={gameContext}
        linkType="bot"
        variant="secondary"
        size="medium"
      >
        Add Bot
      </AnalyticsDiscordCTA>
    </div>
  );
}

export default DiscordActions;