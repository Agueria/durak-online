import type { Card, GameState, Suit, AttackValidation, DefenseValidation } from './types.js';
/**
 * Saldırı kartının savunma kartı ile kapatılıp kapatılamayacağını kontrol eder
 * Kural: Aynı renkten daha yüksek kart veya koz ile savunulur
 */
export declare function canDefend(attackCard: Card, defenseCard: Card, trumpSuit: Suit): DefenseValidation;
/**
 * Saldırıya kart eklenip eklenemeyeceğini kontrol eder
 * Kural: Aynı değerde (rank) kartlar eklenebilir
 */
export declare function canAttackAppend(existingCards: Card[], newCards: Card[], defenderHandSize: number): AttackValidation;
/**
 * Oyuncunun sıradaki saldıran olup olmadığını kontrol eder
 */
export declare function isPlayerAttacker(gameState: GameState, playerId: string): boolean;
/**
 * Oyuncunun sıradaki savunan olup olmadığını kontrol eder
 */
export declare function isPlayerDefender(gameState: GameState, playerId: string): boolean;
/**
 * Masadaki tüm saldırıların kapatılıp kapatılmadığını kontrol eder
 */
export declare function areAllAttacksDefended(gameState: GameState): boolean;
/**
 * Oyunun bitip bitmediğini kontrol eder
 */
export declare function isGameOver(gameState: GameState, players: Map<string, {
    hand: Card[];
}>): boolean;
/**
 * Sıradaki saldıran ve savunanı belirler
 */
export declare function getNextTurn(gameState: GameState, players: Map<string, {
    hand: Card[];
}>, defenderTookCards: boolean): {
    attackerId: string;
    defenderId: string;
};
