import { SUITS, RANKS } from '@durak/shared';
/**
 * 36'lık iskambil destesi oluşturur (6-A)
 */
export function createDeck() {
    const cards = [];
    for (const suit of SUITS) {
        for (const rank of RANKS) {
            cards.push({
                id: `${suit}-${rank}`,
                suit: suit,
                rank
            });
        }
    }
    return cards;
}
/**
 * Verilen kartın değerini döndürür (6=6, J=11, A=14)
 */
export function getCardValue(card) {
    const values = {
        '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
        'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };
    return values[card.rank];
}
/**
 * İki kartı karşılaştırır (-1: a < b, 0: a = b, 1: a > b)
 */
export function compareCards(a, b) {
    const valueA = getCardValue(a);
    const valueB = getCardValue(b);
    if (valueA < valueB)
        return -1;
    if (valueA > valueB)
        return 1;
    return 0;
}
/**
 * Kartın koz olup olmadığını kontrol eder
 */
export function isTrump(card, trumpSuit) {
    return card.suit === trumpSuit;
}
/**
 * Oyuncunun elindeki en düşük kozu bulur (ilk saldıran belirleme için)
 */
export function findLowestTrump(hand, trumpSuit) {
    const trumpCards = hand.filter(card => isTrump(card, trumpSuit));
    if (trumpCards.length === 0)
        return null;
    return trumpCards.reduce((lowest, current) => compareCards(current, lowest) < 0 ? current : lowest);
}
