import { SUITS, RANKS, DECK_SIZE_36 } from '@durak/shared';
import type { Card, Suit } from './types.js';

/**
 * 36'lık iskambil destesi oluşturur (6-A)
 */
export function createDeck(): Card[] {
  const cards: Card[] = [];
  
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({
        id: `${suit}-${rank}`,
        suit: suit as Suit,
        rank
      });
    }
  }
  
  return cards;
}

/**
 * Verilen kartın değerini döndürür (6=6, J=11, A=14)
 */
export function getCardValue(card: Card): number {
  const values: Record<string, number> = {
    '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14
  };
  return values[card.rank];
}

/**
 * İki kartı karşılaştırır (-1: a < b, 0: a = b, 1: a > b)
 */
export function compareCards(a: Card, b: Card): number {
  const valueA = getCardValue(a);
  const valueB = getCardValue(b);
  
  if (valueA < valueB) return -1;
  if (valueA > valueB) return 1;
  return 0;
}

/**
 * Kartın koz olup olmadığını kontrol eder
 */
export function isTrump(card: Card, trumpSuit: Suit): boolean {
  return card.suit === trumpSuit;
}

/**
 * Oyuncunun elindeki en düşük kozu bulur (ilk saldıran belirleme için)
 */
export function findLowestTrump(hand: Card[], trumpSuit: Suit): Card | null {
  const trumpCards = hand.filter(card => isTrump(card, trumpSuit));
  
  if (trumpCards.length === 0) return null;
  
  return trumpCards.reduce((lowest, current) => 
    compareCards(current, lowest) < 0 ? current : lowest
  );
}