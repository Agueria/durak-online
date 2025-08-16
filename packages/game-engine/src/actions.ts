import { GAME_PHASES } from '@durak/shared';
import { canDefend, canAttackAppend, areAllAttacksDefended, getNextTurn, isGameOver } from './rules.js';
import { drawUpToSix } from './state.js';
import type { GameState, PrivatePlayer, Card, GameResult, AttackAction, DefenseAction } from './types.js';

/**
 * Saldırı kartı oyna
 */
export function playAttack(
  gameState: GameState,
  players: Map<string, PrivatePlayer>,
  action: AttackAction
): GameResult {
  const { playerId, payload } = action;
  const { cards } = payload;
  
  // Faz kontrolü
  if (gameState.phase !== GAME_PHASES.ATTACKING) {
    return { success: false, error: 'Saldırı fazında değil' };
  }
  
  // Oyuncu kontrolü
  if (gameState.turn.attackerId !== playerId) {
    return { success: false, error: 'Saldırı sırası sizde değil' };
  }
  
  const player = players.get(playerId);
  if (!player) {
    return { success: false, error: 'Oyuncu bulunamadı' };
  }
  
  // Kart sahipliği kontrolü
  const playerCardIds = new Set(player.hand.map(c => c.id));
  if (!cards.every(card => playerCardIds.has(card.id))) {
    return { success: false, error: 'Sahip olmadığınız kart' };
  }
  
  // Saldırı kuralları kontrolü
  const defender = players.get(gameState.turn.defenderId);
  if (!defender) {
    return { success: false, error: 'Savunan oyuncu bulunamadı' };
  }
  
  const existingAttacks = gameState.table.map(pair => pair.attack);
  const validation = canAttackAppend(existingAttacks, cards, defender.hand.length);
  
  if (!validation.isValid) {
    return { success: false, error: validation.reason };
  }
  
  // Kartları oyuncunun elinden çıkar
  cards.forEach(card => {
    const index = player.hand.findIndex(c => c.id === card.id);
    if (index !== -1) {
      player.hand.splice(index, 1);
    }
  });
  player.handCount = player.hand.length;
  
  // Masaya ekle
  cards.forEach(card => {
    gameState.table.push({ attack: card });
  });
  
  // Faz değiştir
  gameState.phase = GAME_PHASES.DEFENDING;
  gameState.lastActionAt = Date.now();
  
  return { success: true, newState: gameState };
}

/**
 * Savunma kartı oyna
 */
export function playDefense(
  gameState: GameState,
  players: Map<string, PrivatePlayer>,
  action: DefenseAction
): GameResult {
  const { playerId, payload } = action;
  const { attackIndex, card } = payload;
  
  // Faz kontrolü
  if (gameState.phase !== GAME_PHASES.DEFENDING) {
    return { success: false, error: 'Savunma fazında değil' };
  }
  
  // Oyuncu kontrolü
  if (gameState.turn.defenderId !== playerId) {
    return { success: false, error: 'Savunma sırası sizde değil' };
  }
  
  const player = players.get(playerId);
  if (!player) {
    return { success: false, error: 'Oyuncu bulunamadı' };
  }
  
  // Kart sahipliği kontrolü
  const playerCard = player.hand.find(c => c.id === card.id);
  if (!playerCard) {
    return { success: false, error: 'Sahip olmadığınız kart' };
  }
  
  // Saldırı indeksi kontrolü
  if (attackIndex < 0 || attackIndex >= gameState.table.length) {
    return { success: false, error: 'Geçersiz saldırı indeksi' };
  }
  
  const tablePair = gameState.table[attackIndex];
  if (tablePair.defense) {
    return { success: false, error: 'Bu saldırı zaten savunulmuş' };
  }
  
  // Savunma kuralları kontrolü
  const validation = canDefend(tablePair.attack, card, gameState.trumpSuit);
  if (!validation.isValid) {
    return { success: false, error: validation.reason };
  }
  
  // Kartı oyuncunun elinden çıkar
  const cardIndex = player.hand.findIndex(c => c.id === card.id);
  player.hand.splice(cardIndex, 1);
  player.handCount = player.hand.length;
  
  // Savunmayı masaya ekle
  tablePair.defense = card;
  
  // Tüm saldırılar savunulduysa saldırı fazına geç
  if (areAllAttacksDefended(gameState)) {
    gameState.phase = GAME_PHASES.ATTACKING;
  }
  
  gameState.lastActionAt = Date.now();
  
  return { success: true, newState: gameState };
}

/**
 * Savunan kartları alır (pas geçer)
 */
export function takeCards(
  gameState: GameState,
  players: Map<string, PrivatePlayer>,
  playerId: string
): GameResult {
  // Faz kontrolü
  if (gameState.phase !== GAME_PHASES.DEFENDING) {
    return { success: false, error: 'Savunma fazında değil' };
  }
  
  // Oyuncu kontrolü
  if (gameState.turn.defenderId !== playerId) {
    return { success: false, error: 'Savunma sırası sizde değil' };
  }
  
  const player = players.get(playerId);
  if (!player) {
    return { success: false, error: 'Oyuncu bulunamadı' };
  }
  
  // Masadaki tüm kartları oyuncunun eline ekle
  gameState.table.forEach(pair => {
    player.hand.push(pair.attack);
    if (pair.defense) {
      player.hand.push(pair.defense);
    }
  });
  player.handCount = player.hand.length;
  
  // Masayı temizle
  gameState.table = [];
  
  // Çekme fazına geç
  gameState.phase = GAME_PHASES.DRAW;
  gameState.lastActionAt = Date.now();
  
  return { success: true, newState: gameState };
}

/**
 * Turu bitirir ve çözümler
 */
export function endTurnResolve(
  gameState: GameState,
  players: Map<string, PrivatePlayer>,
  deck: Card[]
): GameResult {
  // Faz kontrolü
  if (gameState.phase !== GAME_PHASES.ATTACKING) {
    return { success: false, error: 'Saldırı fazında değil' };
  }
  
  // Tüm saldırılar savunulmuş olmalı
  if (!areAllAttacksDefended(gameState)) {
    return { success: false, error: 'Tüm saldırılar savunulmamış' };
  }
  
  // Masadaki kartları iskartaya at
  gameState.discardCount += gameState.table.length * 2; // attack + defense
  gameState.table = [];
  
  // Çekme fazına geç
  gameState.phase = GAME_PHASES.DRAW;
  gameState.lastActionAt = Date.now();
  
  return { success: true, newState: gameState };
}

