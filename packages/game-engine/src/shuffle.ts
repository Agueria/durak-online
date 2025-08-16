import seedrandom from 'seedrandom';
import type { Card } from './types.js';

/**
 * Seeded rastgele sayı üreteci ile deste karıştırma
 * Anti-cheat için deterministik karıştırma sağlar
 */
export function shuffleDeck(cards: Card[], seed: string): Card[] {
  const rng = seedrandom(seed);
  const shuffled = [...cards];
  
  // Fisher-Yates shuffle algoritması
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Rastgele seed üretir
 */
export function generateSeed(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}