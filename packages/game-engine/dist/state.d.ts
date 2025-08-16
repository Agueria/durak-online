import type { GameState, GameSettings, PrivatePlayer, Card } from './types.js';
/**
 * Yeni oyun durumu oluşturur
 */
export declare function createGame(roomId: string, playerIds: string[], settings: GameSettings, seed?: string): {
    gameState: GameState;
    players: Map<string, PrivatePlayer>;
    deck: Card[];
};
/**
 * Oyuncuları 6 karta tamamlar
 */
export declare function drawUpToSix(players: Map<string, PrivatePlayer>, deck: Card[], drawOrder: string[]): void;
