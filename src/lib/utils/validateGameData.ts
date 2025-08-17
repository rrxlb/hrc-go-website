import { GAMES } from '@/lib/data/games';
import { validateAllGames, getGameDataHealth, getAllGameIds, getAllDiscordCommands } from './gameData';

/**
 * Validation script to verify game data integrity
 * This can be imported and run to check if all game data is properly configured
 */

export const runGameDataValidation = () => {
  console.log('🎰 High Roller Club - Game Data Validation');
  console.log('==========================================');
  
  // Basic validation
  const validation = validateAllGames(GAMES);
  console.log(`\n✅ Data Validation: ${validation.valid ? 'PASSED' : 'FAILED'}`);
  
  if (!validation.valid) {
    console.log('❌ Validation Errors:');
    validation.errors.forEach(error => console.log(`   - ${error}`));
    return false;
  }
  
  // Health check
  const health = getGameDataHealth(GAMES);
  console.log(`\n🏥 Data Health: ${health.isHealthy ? 'HEALTHY' : 'NEEDS ATTENTION'}`);
  
  // Statistics
  console.log('\n📊 Game Statistics:');
  console.log(`   - Total Games: ${health.stats.totalGames}`);
  console.log(`   - Total Features: ${health.stats.totalFeatures}`);
  console.log(`   - Highlighted Features: ${health.stats.highlightedFeatures}`);
  console.log(`   - Unique Icons: ${health.stats.uniqueIcons}`);
  console.log(`   - Avg Features per Game: ${health.stats.averageFeaturesPerGame}`);
  
  // Game coverage
  console.log('\n🎮 Game Coverage:');
  const gameIds = getAllGameIds(GAMES);
  const requiredGames = [
    'blackjack',
    'three-card-poker', 
    'roulette',
    'slots',
    'craps',
    'higher-or-lower',
    'horse-racing'
  ];
  
  const missingGames = requiredGames.filter(id => !gameIds.includes(id));
  if (missingGames.length === 0) {
    console.log('   ✅ All 7 required games are present');
  } else {
    console.log(`   ❌ Missing games: ${missingGames.join(', ')}`);
  }
  
  // Discord commands
  console.log('\n💬 Discord Commands:');
  const commands = getAllDiscordCommands(GAMES);
  commands.forEach(cmd => console.log(`   - ${cmd}`));
  
  // Recommendations
  if (health.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    health.recommendations.forEach(rec => console.log(`   - ${rec}`));
  }
  
  console.log('\n🎉 Validation Complete!');
  return validation.valid && health.isHealthy;
};

// Export individual validation functions for use in components
export const validateGameDataQuick = () => {
  const validation = validateAllGames(GAMES);
  return {
    isValid: validation.valid,
    gameCount: GAMES.length,
    errors: validation.errors
  };
};