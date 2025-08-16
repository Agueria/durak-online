import type { GameState, PrivatePlayer, Card, GameResult, AttackAction, DefenseAction } from './types.js';
/**
 * Saldırı kartı oyna
 */
export declare function playAttack(gameState: GameState, players: Map<string, PrivatePlayer>, action: AttackAction): GameResult;
/**
 * Savunma kartı oyna
 */
export declare function playDefense(gameState: GameState, players: Map<string, PrivatePlayer>, action: DefenseAction): GameResult;
/**
 * Savunan kartları alır (pas geçer)
 */
export declare function takeCards(gameState: GameState, players: Map<string, PrivatePlayer>, playerId: string): GameResult;
/**
 * Turu bitirir ve çözümler
 */
export declare function endTurnResolve(gameState: GameState, players: Map<string, PrivatePlayer>, deck: Card[]): GameResult;
