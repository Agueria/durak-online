import type { GameState, PrivatePlayer, Card, GameAction, GameResult } from './types.js';
/**
 * Tek giriş noktalı oyun durumu reducer'ı
 * Tüm oyun aksiyonları bu fonksiyon üzerinden işlenir
 */
export declare function gameReducer(gameState: GameState, players: Map<string, PrivatePlayer>, deck: Card[], action: GameAction): GameResult;
/**
 * Oyun durumunu güvenli bir şekilde klonlar
 */
export declare function cloneGameState(gameState: GameState): GameState;
/**
 * Oyuncu haritasını güvenli bir şekilde klonlar
 */
export declare function clonePlayers(players: Map<string, PrivatePlayer>): Map<string, PrivatePlayer>;
