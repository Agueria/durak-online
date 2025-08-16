import { describe, it, expect } from 'vitest';
import { 
  createDeck, 
  getCardValue, 
  compareCards, 
  isTrump, 
  findLowestTrump 
} from '../deck.js';
import { shuffleDeck, generateSeed } from '../shuffle.js';
import type { Card } from '../types.js';

describe('Deste ve Kart İşlemleri', () => {
  describe('createDeck', () => {
    it('36 kartlık deste oluşturur', () => {
      const deck = createDeck();
      expect(deck).toHaveLength(36);
    });

    it('her renkte 9 kart olur', () => {
      const deck = createDeck();
      const suits = ['S', 'H', 'D', 'C'];
      
      suits.forEach(suit => {
        const suitCards = deck.filter(card => card.suit === suit);
        expect(suitCards).toHaveLength(9);
      });
    });

    it('her değerde 4 kart olur', () => {
      const deck = createDeck();
      const ranks = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
      
      ranks.forEach(rank => {
        const rankCards = deck.filter(card => card.rank === rank);
        expect(rankCards).toHaveLength(4);
      });
    });

    it('tüm kartlar benzersiz ID\'ye sahip', () => {
      const deck = createDeck();
      const ids = deck.map(card => card.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(36);
    });

    it('kart ID formatı doğru', () => {
      const deck = createDeck();
      deck.forEach(card => {
        expect(card.id).toMatch(/^[SHDC]-[6789JQKA]|10$/);
      });
    });
  });

  describe('getCardValue', () => {
    it('sayı kartlarının değerleri doğru', () => {
      expect(getCardValue({ id: '6-S', suit: 'S', rank: '6' })).toBe(6);
      expect(getCardValue({ id: '7-S', suit: 'S', rank: '7' })).toBe(7);
      expect(getCardValue({ id: '8-S', suit: 'S', rank: '8' })).toBe(8);
      expect(getCardValue({ id: '9-S', suit: 'S', rank: '9' })).toBe(9);
      expect(getCardValue({ id: '10-S', suit: 'S', rank: '10' })).toBe(10);
    });

    it('resim kartlarının değerleri doğru', () => {
      expect(getCardValue({ id: 'J-S', suit: 'S', rank: 'J' })).toBe(11);
      expect(getCardValue({ id: 'Q-S', suit: 'S', rank: 'Q' })).toBe(12);
      expect(getCardValue({ id: 'K-S', suit: 'S', rank: 'K' })).toBe(13);
      expect(getCardValue({ id: 'A-S', suit: 'S', rank: 'A' })).toBe(14);
    });
  });

  describe('compareCards', () => {
    const card6: Card = { id: 'S-6', suit: 'S', rank: '6' };
    const card7: Card = { id: 'S-7', suit: 'S', rank: '7' };
    const cardA: Card = { id: 'S-A', suit: 'S', rank: 'A' };
    const cardJ: Card = { id: 'H-J', suit: 'H', rank: 'J' };

    it('düşük kart < yüksek kart', () => {
      expect(compareCards(card6, card7)).toBe(-1);
      expect(compareCards(card6, cardA)).toBe(-1);
    });

    it('yüksek kart > düşük kart', () => {
      expect(compareCards(card7, card6)).toBe(1);
      expect(compareCards(cardA, card6)).toBe(1);
    });

    it('eşit kartlar', () => {
      expect(compareCards(card6, card6)).toBe(0);
      expect(compareCards(cardJ, { id: 'S-J', suit: 'S', rank: 'J' })).toBe(0);
    });

    it('farklı renk aynı değer', () => {
      const spade7: Card = { id: 'S-7', suit: 'S', rank: '7' };
      const heart7: Card = { id: 'H-7', suit: 'H', rank: '7' };
      expect(compareCards(spade7, heart7)).toBe(0);
    });
  });

  describe('isTrump', () => {
    const spadeCard: Card = { id: 'S-6', suit: 'S', rank: '6' };
    const heartCard: Card = { id: 'H-6', suit: 'H', rank: '6' };

    it('koz rengi doğru tespit edilir', () => {
      expect(isTrump(heartCard, 'H')).toBe(true);
      expect(isTrump(spadeCard, 'S')).toBe(true);
    });

    it('koz olmayan renk doğru tespit edilir', () => {
      expect(isTrump(spadeCard, 'H')).toBe(false);
      expect(isTrump(heartCard, 'S')).toBe(false);
    });
  });

  describe('findLowestTrump', () => {
    const hand: Card[] = [
      { id: 'S-A', suit: 'S', rank: 'A' },
      { id: 'H-6', suit: 'H', rank: '6' },
      { id: 'H-K', suit: 'H', rank: 'K' },
      { id: 'D-7', suit: 'D', rank: '7' },
      { id: 'H-7', suit: 'H', rank: '7' }
    ];

    it('en düşük kozu bulur', () => {
      const lowestTrump = findLowestTrump(hand, 'H');
      expect(lowestTrump).toEqual({ id: 'H-6', suit: 'H', rank: '6' });
    });

    it('koz yoksa null döner', () => {
      const noTrumpHand: Card[] = [
        { id: 'S-A', suit: 'S', rank: 'A' },
        { id: 'D-7', suit: 'D', rank: '7' },
        { id: 'C-K', suit: 'C', rank: 'K' }
      ];
      
      const lowestTrump = findLowestTrump(noTrumpHand, 'H');
      expect(lowestTrump).toBeNull();
    });

    it('tek koz varsa onu döner', () => {
      const singleTrumpHand: Card[] = [
        { id: 'S-A', suit: 'S', rank: 'A' },
        { id: 'H-K', suit: 'H', rank: 'K' },
        { id: 'D-7', suit: 'D', rank: '7' }
      ];
      
      const lowestTrump = findLowestTrump(singleTrumpHand, 'H');
      expect(lowestTrump).toEqual({ id: 'H-K', suit: 'H', rank: 'K' });
    });

    it('boş el için null döner', () => {
      const lowestTrump = findLowestTrump([], 'H');
      expect(lowestTrump).toBeNull();
    });
  });
});

describe('Deste Karıştırma', () => {
  describe('shuffleDeck', () => {
    it('aynı seed ile aynı sonuç verir', () => {
      const deck1 = createDeck();
      const deck2 = createDeck();
      const seed = 'test-seed-123';
      
      const shuffled1 = shuffleDeck(deck1, seed);
      const shuffled2 = shuffleDeck(deck2, seed);
      
      expect(shuffled1).toEqual(shuffled2);
    });

    it('farklı seed ile farklı sonuç verir', () => {
      const deck1 = createDeck();
      const deck2 = createDeck();
      
      const shuffled1 = shuffleDeck(deck1, 'seed1');
      const shuffled2 = shuffleDeck(deck2, 'seed2');
      
      expect(shuffled1).not.toEqual(shuffled2);
    });

    it('orijinal desteyi değiştirmez', () => {
      const originalDeck = createDeck();
      const originalCopy = [...originalDeck];
      
      shuffleDeck(originalDeck, 'test-seed');
      
      expect(originalDeck).toEqual(originalCopy);
    });

    it('tüm kartları korur', () => {
      const deck = createDeck();
      const shuffled = shuffleDeck(deck, 'test-seed');
      
      expect(shuffled).toHaveLength(36);
      
      // Tüm orijinal kartlar hala mevcut
      deck.forEach(originalCard => {
        const found = shuffled.find(card => card.id === originalCard.id);
        expect(found).toBeDefined();
      });
    });

    it('gerçekten karıştırır (sıra değişir)', () => {
      const deck = createDeck();
      const shuffled = shuffleDeck(deck, 'random-seed-456');
      
      // En az bir kartın pozisyonu değişmiş olmalı
      let positionChanged = false;
      for (let i = 0; i < deck.length; i++) {
        if (deck[i].id !== shuffled[i].id) {
          positionChanged = true;
          break;
        }
      }
      
      expect(positionChanged).toBe(true);
    });

    it('boş deste ile çalışır', () => {
      const emptyDeck: Card[] = [];
      const shuffled = shuffleDeck(emptyDeck, 'test');
      expect(shuffled).toEqual([]);
    });

    it('tek kartlı deste ile çalışır', () => {
      const singleCard: Card[] = [{ id: 'S-A', suit: 'S', rank: 'A' }];
      const shuffled = shuffleDeck(singleCard, 'test');
      expect(shuffled).toEqual(singleCard);
    });
  });

  describe('generateSeed', () => {
    it('string döner', () => {
      const seed = generateSeed();
      expect(typeof seed).toBe('string');
    });

    it('boş olmayan string döner', () => {
      const seed = generateSeed();
      expect(seed.length).toBeGreaterThan(0);
    });

    it('her çağrıda farklı seed üretir', () => {
      const seed1 = generateSeed();
      const seed2 = generateSeed();
      expect(seed1).not.toBe(seed2);
    });

    it('yeterince uzun seed üretir', () => {
      const seed = generateSeed();
      expect(seed.length).toBeGreaterThanOrEqual(10);
    });
  });
});