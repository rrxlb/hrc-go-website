'use client';

import React from 'react';
import { GAMES, getGameById, getFeaturedGames } from '@/lib/data/games';
import { 
  getGamesByCategory, 
  getHighlightedFeatures, 
  searchGames, 
  getGameStats
} from '@/lib/utils/gameData';
import { validateGameDataQuick } from '@/lib/utils/validateGameData';

/**
 * Example component demonstrating how to use the game data models and utilities
 * This is for demonstration purposes and shows the functionality of the game data system
 */
export const GameDataExample: React.FC = () => {
  // Basic game data access
  const allGames = GAMES;
  const blackjackGame = getGameById('blackjack');
  const featuredGames = getFeaturedGames();
  
  // Category filtering
  const cardGames = getGamesByCategory(GAMES, 'card');
  const tableGames = getGamesByCategory(GAMES, 'table');
  
  // Feature analysis
  const blackjackFeatures = blackjackGame ? getHighlightedFeatures(blackjackGame) : [];
  
  // Search functionality
  const aiGames = searchGames(GAMES, 'AI');
  
  // Statistics
  const stats = getGameStats(GAMES);
  
  // Validation
  const validation = validateGameDataQuick();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Game Data System Demo</h1>
      
      {/* Validation Status */}
      <div className="mb-6 p-4 rounded-lg bg-gray-100">
        <h2 className="text-xl font-semibold mb-2">Data Validation</h2>
        <p className={`font-medium ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
          Status: {validation.isValid ? '✅ Valid' : '❌ Invalid'}
        </p>
        <p>Total Games: {validation.gameCount}</p>
        {validation.errors.length > 0 && (
          <div className="mt-2">
            <p className="text-red-600">Errors:</p>
            <ul className="list-disc list-inside">
              {validation.errors.map((error, index) => (
                <li key={index} className="text-red-600">{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="mb-6 p-4 rounded-lg bg-blue-50">
        <h2 className="text-xl font-semibold mb-2">Game Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="font-medium">Total Games</p>
            <p className="text-2xl font-bold text-blue-600">{stats.totalGames}</p>
          </div>
          <div>
            <p className="font-medium">Total Features</p>
            <p className="text-2xl font-bold text-blue-600">{stats.totalFeatures}</p>
          </div>
          <div>
            <p className="font-medium">Highlighted</p>
            <p className="text-2xl font-bold text-blue-600">{stats.highlightedFeatures}</p>
          </div>
          <div>
            <p className="font-medium">Avg Features</p>
            <p className="text-2xl font-bold text-blue-600">{stats.averageFeaturesPerGame}</p>
          </div>
        </div>
      </div>

      {/* Featured Games */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Featured Games ({featuredGames.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredGames.map(game => (
            <div key={game.id} className="p-4 border rounded-lg">
              <h3 className="font-semibold">{game.displayName}</h3>
              <p className="text-sm text-gray-600 mb-2">{game.description}</p>
              <p className="text-xs text-blue-600">{game.discordCommand}</p>
              <div className="mt-2">
                <p className="text-xs font-medium">Highlighted Features:</p>
                {getHighlightedFeatures(game).map(feature => (
                  <span key={feature.title} className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mr-1 mt-1">
                    {feature.title}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Games by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Card Games ({cardGames.length})</h3>
            <ul className="space-y-1">
              {cardGames.map(game => (
                <li key={game.id} className="text-sm">
                  {game.displayName} - {game.discordCommand}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Table Games ({tableGames.length})</h3>
            <ul className="space-y-1">
              {tableGames.map(game => (
                <li key={game.id} className="text-sm">
                  {game.displayName} - {game.discordCommand}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">AI-Powered Games ({aiGames.length})</h2>
        <div className="space-y-2">
          {aiGames.map(game => (
            <div key={game.id} className="p-3 border rounded-lg">
              <h3 className="font-medium">{game.displayName}</h3>
              <p className="text-sm text-gray-600">{game.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Blackjack Example */}
      {blackjackGame && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Blackjack Game Details</h2>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold">{blackjackGame.displayName}</h3>
            <p className="text-gray-600 mb-3">{blackjackGame.description}</p>
            <div className="mb-3">
              <p className="font-medium">Discord Command: <code className="bg-gray-100 px-2 py-1 rounded">{blackjackGame.discordCommand}</code></p>
            </div>
            <div className="mb-3">
              <p className="font-medium">Camera Position: [{blackjackGame.showcase.cameraPosition.join(', ')}]</p>
              <p className="font-medium">Table Model: {blackjackGame.showcase.tableModel}</p>
            </div>
            <div>
              <p className="font-medium mb-2">Features:</p>
              <div className="space-y-2">
                {blackjackGame.features.map(feature => (
                  <div key={feature.title} className={`p-2 rounded ${feature.highlight ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{feature.title}</span>
                      {feature.highlight && <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">Highlighted</span>}
                    </div>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                    <p className="text-xs text-gray-500">Icon: {feature.icon}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Games List */}
      <div>
        <h2 className="text-xl font-semibold mb-3">All Games ({allGames.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allGames.map(game => (
            <div key={game.id} className="p-4 border rounded-lg">
              <h3 className="font-semibold">{game.displayName}</h3>
              <p className="text-sm text-gray-600 mb-2">{game.description}</p>
              <p className="text-xs text-blue-600 mb-2">{game.discordCommand}</p>
              <p className="text-xs text-gray-500">
                {game.features.length} features ({game.features.filter(f => f.highlight).length} highlighted)
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};