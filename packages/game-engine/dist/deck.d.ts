import type { Card, Suit } from './types.js';
/**
 * 36'lık iskambil destesi oluşturur (6-A)
 */
export declare function createDeck(): Card[];
/**
 * Verilen kartın değerini döndürür (6=6, J=11, A=14)
 */
export declare function getCardValue(card: Card): number;
/**
 * İki kartı karşılaştırır (-1: a < b, 0: a = b, 1: a > b)
 */
export declare function compareCards(a: Card, b: Card): number;
/**
 * Kartın koz olup olmadığını kontrol eder
 */
export declare function isTrump(card: Card, trumpSuit: Suit): boolean;
/**
 * Oyuncunun elindeki en düşük kozu bulur (ilk saldıran belirleme için)
 */
export declare function findLowestTrump(hand: Card[], trumpSuit: Suit): Card | null;
