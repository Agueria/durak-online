import type { Card } from './types.js';
/**
 * Seeded rastgele sayı üreteci ile deste karıştırma
 * Anti-cheat için deterministik karıştırma sağlar
 */
export declare function shuffleDeck(cards: Card[], seed: string): Card[];
/**
 * Rastgele seed üretir
 */
export declare function generateSeed(): string;
