/**
 * Discord configuration for High Roller Club
 */

export const DISCORD_CONFIG = {
  // Main server invite link for users to join the community
  SERVER_INVITE: process.env.NEXT_PUBLIC_DISCORD_SERVER_INVITE || 'https://discord.gg/RK4K8tDsHB',
  
  // Bot authorization link for users to add the bot to their own servers
  BOT_INVITE: process.env.NEXT_PUBLIC_DISCORD_BOT_INVITE || 'https://discord.com/oauth2/authorize?client_id=1396564026233983108&permissions=274878253072&integration_type=0&scope=applications.commands+bot',
  
  // Bot client ID
  CLIENT_ID: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '1396564026233983108',
  
  // Bot permissions (as decimal)
  PERMISSIONS: '274878253072',
  
  // Server information
  SERVER: {
    name: 'High Roller Club',
    description: 'Premium AI-Powered Discord Casino Experience'
  }
} as const;

/**
 * Get the appropriate Discord link based on context
 */
export function getDiscordLink(type: 'server' | 'bot' = 'server'): string {
  return type === 'bot' ? DISCORD_CONFIG.BOT_INVITE : DISCORD_CONFIG.SERVER_INVITE;
}

/**
 * Analytics-friendly Discord link tracking
 */
export function getDiscordLinkWithTracking(
  type: 'server' | 'bot' = 'server',
  source?: string,
  campaign?: string
): string {
  const baseUrl = getDiscordLink(type);
  
  // For server invites, we can add UTM parameters if needed
  if (type === 'server' && (source || campaign)) {
    const url = new URL(baseUrl);
    if (source) url.searchParams.set('utm_source', source);
    if (campaign) url.searchParams.set('utm_campaign', campaign);
    return url.toString();
  }
  
  return baseUrl;
}