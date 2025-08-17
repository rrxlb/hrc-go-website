/**
 * Enhanced Discord CTA component with conversion tracking
 */

'use client';

import React, { useState } from 'react';
import { useConversionTracking } from '@/lib/hooks/useConversionTracking';
import { useUserJourneyTracking } from '@/lib/hooks/useUserJourneyTracking';
import DiscordCTA from '@/components/ui/DiscordCTA';
import { getDiscordLinkWithTracking } from '@/lib/config/discord';

interface AnalyticsDiscordCTAProps {
  position: string;
  gameContext?: string;
  variant?: 'primary' | 'secondary' | 'floating';
  size?: 'small' | 'medium' | 'large';
  children?: React.ReactNode;
  className?: string;
  href?: string;
  linkType?: 'server' | 'bot';
}

export function AnalyticsDiscordCTA({
  position,
  gameContext,
  variant = 'primary',
  size = 'medium',
  children,
  className,
  href,
  linkType = 'server'
}: AnalyticsDiscordCTAProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [clickCount, setClickCount] = useState(0);

    const conversionTracking = useConversionTracking({
        source: position,
        gameContext
    });

    const userJourneyTracking = useUserJourneyTracking();

    // Get the appropriate Discord link
    const discordHref = href || getDiscordLinkWithTracking(linkType, position, 'website');

    const handleMouseEnter = () => {
        setIsHovered(true);

        // Track CTA hover as engagement
        userJourneyTracking.trackEngagement('cta_hover', Date.now());

        // Track conversion funnel progression
        conversionTracking.trackConversionFunnel('consideration', {
            ctaPosition: position,
            gameContext,
            interactionType: 'hover'
        });
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    const handleClick = () => {
        const newClickCount = clickCount + 1;
        setClickCount(newClickCount);

        // Track the conversion click
        conversionTracking.trackDiscordCTAClick(position, {
            gameContext,
            variant,
            size,
            clickCount: newClickCount,
            wasHovered: isHovered,
            timestamp: Date.now()
        });

        // Track conversion attempt in user journey
        userJourneyTracking.trackConversionAttempt('discord_cta', position);

        // Track external link click
        conversionTracking.trackExternalLinkClick(discordHref, position);

        // Track conversion funnel completion
        conversionTracking.trackConversionFunnel('conversion', {
            ctaPosition: position,
            gameContext,
            finalAction: 'discord_click'
        });

        // Allow default link behavior to continue
    };

    const handleFocus = () => {
        // Track keyboard navigation engagement
        userJourneyTracking.trackEngagement('cta_focus', Date.now());
    };

    return (
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleFocus}
            data-analytics-position={position}
            data-analytics-game-context={gameContext}
        >
            <DiscordCTA
                variant={variant}
                size={size}
                className={className}
                onClick={handleClick}
            />
        </div>
    );
}