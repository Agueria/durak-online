import { GAME_PHASES, INITIAL_HAND_SIZE } from '@durak/shared';
import { createDeck, findLowestTrump } from './deck.js';
import { shuffleDeck, generateSeed } from './shuffle.js';
import type { GameState, GameSettings, PrivatePlayer, Card, DeckInfo } from './types.js';

/**
 * Yeni oyun durumu oluşturur
 */
export function createGame(
  roomId: string,
  playerIds: string[],
  settings: GameSettings,
  seed?: string
): { gameState: GameState; players: Map<string, PrivatePlayer>; deck: Card[] } {
  const gameSeed = seed || generateSeed();
  const deck = shuffleDeck(createDeck(), gameSeed);
  
  // Koz kartını belirle (deste altından)
  const trumpCard = deck[deck.length - 1];
  const trumpSuit = trumpCard.suit;
  
  // Oyunculara kart dağıt
  const players = new Map<string, PrivatePlayer>();
  const dealtCards = deck.splice(0, playerIds.length * INITIAL_HAND_SIZE);
  
  playerIds.forEach((playerId, index) => {
    const hand = dealtCards.slice(
      index * INITIAL_HAND_SIZE, 
      (index + 1) * INITIAL_HAND_SIZE
    );
    
    players.set(playerId, {
      id: playerId,
      nickname: `Player ${index + 1}`, // Bu server tarafında güncellenecek
      hand,
      handCount: hand.length,
      isConnected: true
    });
  });
  
  // İlk saldıranı belirle (en düşük koz sahibi)
  const firstAttacker = findFirstAttacker(players, trumpSuit);
  const attackerIndex = playerIds.indexOf(firstAttacker);
  const defenderIndex = (attackerIndex + 1) % playerIds.length;
  
  const gameState: GameState = {
    roomId,
    playersOrder: [...playerIds],
    turn: {
      attackerId: playerIds[attackerIndex],
      defenderId: playerIds[defenderIndex]
    },
    trumpSuit,
    deckCount: deck.length,
    discardCount: 0,
    table: [],
    phase: GAME_PHASES.ATTACKING,
    lastActionAt: Date.now(),
    settings
  };
  
  return { gameState, players, deck };
}

/**
 * En düşük koz sahibini bulur (ilk saldıran)
 */
function findFirstAttacker(
  players: Map<string, PrivatePlayer>, 
  trumpSuit: string
): string {
  let lowestTrumpPlayer: string | null = null;
  let lowestTrump: Card | null = null;
  
  for (const [playerId, player] of players) {
    const playerLowestTrump = findLowestTrump(player.hand, trumpSuit as any);
    
    if (playerLowestTrump) {
      if (!lowestTrump || 
          (playerLowestTrump.rank < lowestTrump.rank)) {
        lowestTrump = playerLowestTrump;
        lowestTrumpPlayer = playerId;
      }
    }
  }
  
  // Hiç kimsenin kozu yoksa ilk oyuncu saldırır
  return lowestTrumpPlayer || Array.from(players.keys())[0];
}

/**
 * Oyuncuları 6 karta tamamlar
 */
export function drawUpToSix(
  players: Map<string, PrivatePlayer>,
  deck: Card[],
  drawOrder: string[]
): void {
  for (const playerId of drawOrder) {
    const player = players.get(playerId);
    if (!player) continue;
    
    const needed = INITIAL_HAND_SIZE - player.hand.length;
    const drawn = deck.splice(0, Math.min(needed, deck.length));
    
    player.hand.push(...drawn);
    player.handCount = player.hand.length;
    
    if (deck.length === 0) break;
  }
}