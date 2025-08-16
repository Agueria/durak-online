import { describe, it, expect } from 'vitest';
import { 
  canDefend, 
  canAttackAppend, 
  isPlayerAttacker, 
  isPlayerDefender,
  areAllAttacksDefended,
  isGameOver,
  getNextTurn
} from '../rules.js';
import type { Card, GameState } from '../types.js';
import { GAME_PHASES } from '@durak/shared';

describe('Oyun Kuralları - Kapsamlı Testler', () => {
  // Test kartları
  const spade6: Card = { id: 'S-6', suit: 'S', rank: '6' };
  const spade7: Card = { id: 'S-7', suit: 'S', rank: '7' };
  const spade8: Card = { id: 'S-8', suit: 'S', rank: '8' };
  const spadeA: Card = { id: 'S-A', suit: 'S', rank: 'A' };
  
  const heart6: Card = { id: 'H-6', suit: 'H', rank: '6' };
  const heart7: Card = { id: 'H-7', suit: 'H', rank: '7' };
  const heartJ: Card = { id: 'H-J', suit: 'H', rank: 'J' };
  const heartA: Card = { id: 'H-A', suit: 'H', rank: 'A' };
  
  const diamond6: Card = { id: 'D-6', suit: 'D', rank: '6' };
  const diamond10: Card = { id: 'D-10', suit: 'D', rank: '10' };
  
  const club6: Card = { id: 'C-6', suit: 'C', rank: '6' };
  const clubK: Card = { id: 'C-K', suit: 'C', rank: 'K' };
  
  const trumpSuit = 'H'; // Kupa koz

  describe('canDefend - Detaylı Savunma Testleri', () => {
    it('aynı renkten daha yüksek kart ile savunma', () => {
      const result = canDefend(spade6, spade7, trumpSuit);
      expect(result.isValid).toBe(true);
    });

    it('aynı renkten çok daha yüksek kart ile savunma', () => {
      const result = canDefend(spade6, spadeA, trumpSuit);
      expect(result.isValid).toBe(true);
    });

    it('aynı renkten daha düşük kart ile savunma - başarısız', () => {
      const result = canDefend(spade7, spade6, trumpSuit);
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('yüksek');
    });

    it('aynı renkten eşit kart ile savunma - başarısız', () => {
      const result = canDefend(spade6, spade6, trumpSuit);
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('yüksek');
    });

    it('koz olmayan saldırıya düşük koz ile savunma', () => {
      const result = canDefend(spade6, heart6, trumpSuit);
      expect(result.isValid).toBe(true);
    });

    it('koz olmayan saldırıya yüksek koz ile savunma', () => {
      const result = canDefend(spadeA, heart6, trumpSuit);
      expect(result.isValid).toBe(true);
    });

    it('koz saldırısına koz olmayan ile savunma - başarısız', () => {
      const result = canDefend(heart6, spade6, trumpSuit);
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('koz');
    });

    it('düşük koz saldırısına yüksek koz ile savunma', () => {
      const result = canDefend(heart6, heartJ, trumpSuit);
      expect(result.isValid).toBe(true);
    });

    it('yüksek koz saldırısına düşük koz ile savunma - başarısız', () => {
      const result = canDefend(heartA, heart6, trumpSuit);
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('yüksek koz');
    });

    it('eşit koz ile savunma - başarısız', () => {
      const result = canDefend(heart6, heart6, trumpSuit);
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('yüksek koz');
    });

    it('farklı renk, koz olmayan ile savunma - başarısız', () => {
      const result = canDefend(spade6, diamond6, trumpSuit);
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('aynı renk veya koz');
    });

    it('farklı renk, yüksek kart ile savunma - başarısız', () => {
      const result = canDefend(spade6, diamond10, trumpSuit);
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('aynı renk veya koz');
    });
  });

  describe('canAttackAppend - Detaylı Saldırı Testleri', () => {
    it('ilk saldırı - tek kart', () => {
      const result = canAttackAppend([], [spade6], 6);
      expect(result.isValid).toBe(true);
    });

    it('ilk saldırı - çoklu aynı değer kartlar', () => {
      const result = canAttackAppend([], [spade6, heart6, diamond6], 6);
      expect(result.isValid).toBe(true);
    });

    it('ilk saldırı - çoklu farklı değer kartlar - başarısız', () => {
      const result = canAttackAppend([], [spade6, spade7], 6);
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('aynı değerde');
    });

    it('mevcut saldırıya aynı değerde kart ekleme', () => {
      const existing = [spade6];
      const newCards = [heart6, diamond6];
      const result = canAttackAppend(existing, newCards, 6);
      expect(result.isValid).toBe(true);
    });

    it('mevcut saldırıya farklı değerde kart ekleme - başarısız', () => {
      const existing = [spade6];
      const newCards = [spade7];
      const result = canAttackAppend(existing, newCards, 6);
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('aynı değerde');
    });

    it('savunanın el kartı sayısını aşma - başarısız', () => {
      const existing = [spade6, heart6];
      const newCards = [diamond6];
      const result = canAttackAppend(existing, newCards, 2);
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('aşamazsınız');
    });

    it('savunanın el kartı sayısına eşit saldırı - geçerli', () => {
      const existing = [spade6];
      const newCards = [heart6];
      const result = canAttackAppend(existing, newCards, 2);
      expect(result.isValid).toBe(true);
    });

    it('boş kart listesi ile saldırı - başarısız', () => {
      const result = canAttackAppend([], [], 6);
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('En az bir kart');
    });

    it('çok fazla kart ile ilk saldırı - başarısız', () => {
      const manyCards = [spade6, heart6, diamond6, club6];
      const result = canAttackAppend([], manyCards, 3);
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('aşamazsınız');
    });
  });

  describe('Oyuncu Rol Kontrolleri', () => {
    const mockGameState: GameState = {
      roomId: 'test-room',
      playersOrder: ['player1', 'player2'],
      turn: {
        attackerId: 'player1',
        defenderId: 'player2'
      },
      trumpSuit: 'H',
      deckCount: 20,
      discardCount: 0,
      table: [],
      phase: GAME_PHASES.ATTACKING,
      lastActionAt: Date.now(),
      settings: {
        allowReinforceFromOthers: false,
        useJokers: false,
        deckSize: '36'
      }
    };

    it('saldıran oyuncu kontrolü - doğru', () => {
      expect(isPlayerAttacker(mockGameState, 'player1')).toBe(true);
    });

    it('saldıran oyuncu kontrolü - yanlış', () => {
      expect(isPlayerAttacker(mockGameState, 'player2')).toBe(false);
    });

    it('savunan oyuncu kontrolü - doğru', () => {
      expect(isPlayerDefender(mockGameState, 'player2')).toBe(true);
    });

    it('savunan oyuncu kontrolü - yanlış', () => {
      expect(isPlayerDefender(mockGameState, 'player1')).toBe(false);
    });

    it('bilinmeyen oyuncu kontrolü', () => {
      expect(isPlayerAttacker(mockGameState, 'player3')).toBe(false);
      expect(isPlayerDefender(mockGameState, 'player3')).toBe(false);
    });
  });

  describe('Masa Durumu Kontrolleri', () => {
    it('boş masa - tüm saldırılar savunulmuş sayılmaz', () => {
      const gameState: GameState = {
        roomId: 'test',
        playersOrder: ['p1', 'p2'],
        turn: { attackerId: 'p1', defenderId: 'p2' },
        trumpSuit: 'H',
        deckCount: 20,
        discardCount: 0,
        table: [],
        phase: GAME_PHASES.ATTACKING,
        lastActionAt: Date.now(),
        settings: { allowReinforceFromOthers: false, useJokers: false, deckSize: '36' }
      };
      
      expect(areAllAttacksDefended(gameState)).toBe(true); // Boş masa = tüm saldırılar savunulmuş
    });

    it('kısmen savunulmuş masa', () => {
      const gameState: GameState = {
        roomId: 'test',
        playersOrder: ['p1', 'p2'],
        turn: { attackerId: 'p1', defenderId: 'p2' },
        trumpSuit: 'H',
        deckCount: 20,
        discardCount: 0,
        table: [
          { attack: spade6, defense: spade7 },
          { attack: heart6 } // Savunulmamış
        ],
        phase: GAME_PHASES.DEFENDING,
        lastActionAt: Date.now(),
        settings: { allowReinforceFromOthers: false, useJokers: false, deckSize: '36' }
      };
      
      expect(areAllAttacksDefended(gameState)).toBe(false);
    });

    it('tamamen savunulmuş masa', () => {
      const gameState: GameState = {
        roomId: 'test',
        playersOrder: ['p1', 'p2'],
        turn: { attackerId: 'p1', defenderId: 'p2' },
        trumpSuit: 'H',
        deckCount: 20,
        discardCount: 0,
        table: [
          { attack: spade6, defense: spade7 },
          { attack: heart6, defense: heartJ }
        ],
        phase: GAME_PHASES.DEFENDING,
        lastActionAt: Date.now(),
        settings: { allowReinforceFromOthers: false, useJokers: false, deckSize: '36' }
      };
      
      expect(areAllAttacksDefended(gameState)).toBe(true);
    });
  });

  describe('Oyun Bitiş Kontrolleri', () => {
    it('deste var, oyuncular var - oyun devam', () => {
      const gameState: GameState = {
        roomId: 'test',
        playersOrder: ['p1', 'p2'],
        turn: { attackerId: 'p1', defenderId: 'p2' },
        trumpSuit: 'H',
        deckCount: 10,
        discardCount: 0,
        table: [],
        phase: GAME_PHASES.ATTACKING,
        lastActionAt: Date.now(),
        settings: { allowReinforceFromOthers: false, useJokers: false, deckSize: '36' }
      };

      const players = new Map([
        ['p1', { id: 'p1', nickname: 'Player1', hand: [spade6, spade7], handCount: 2, isConnected: true }],
        ['p2', { id: 'p2', nickname: 'Player2', hand: [heart6, heart7], handCount: 2, isConnected: true }]
      ]);

      expect(isGameOver(gameState, players)).toBe(false);
    });

    it('deste bitti, bir oyuncunun eli boş - oyun bitti', () => {
      const gameState: GameState = {
        roomId: 'test',
        playersOrder: ['p1', 'p2'],
        turn: { attackerId: 'p1', defenderId: 'p2' },
        trumpSuit: 'H',
        deckCount: 0,
        discardCount: 30,
        table: [],
        phase: GAME_PHASES.ATTACKING,
        lastActionAt: Date.now(),
        settings: { allowReinforceFromOthers: false, useJokers: false, deckSize: '36' }
      };

      const players = new Map([
        ['p1', { id: 'p1', nickname: 'Player1', hand: [], handCount: 0, isConnected: true }],
        ['p2', { id: 'p2', nickname: 'Player2', hand: [heart6, heart7], handCount: 2, isConnected: true }]
      ]);

      expect(isGameOver(gameState, players)).toBe(true);
    });

    it('deste bitti, tüm oyuncuların eli boş - oyun bitti', () => {
      const gameState: GameState = {
        roomId: 'test',
        playersOrder: ['p1', 'p2'],
        turn: { attackerId: 'p1', defenderId: 'p2' },
        trumpSuit: 'H',
        deckCount: 0,
        discardCount: 36,
        table: [],
        phase: GAME_PHASES.ATTACKING,
        lastActionAt: Date.now(),
        settings: { allowReinforceFromOthers: false, useJokers: false, deckSize: '36' }
      };

      const players = new Map([
        ['p1', { id: 'p1', nickname: 'Player1', hand: [], handCount: 0, isConnected: true }],
        ['p2', { id: 'p2', nickname: 'Player2', hand: [], handCount: 0, isConnected: true }]
      ]);

      expect(isGameOver(gameState, players)).toBe(true);
    });
  });

  describe('Sıradaki Tur Belirleme', () => {
    const gameState: GameState = {
      roomId: 'test',
      playersOrder: ['p1', 'p2', 'p3'],
      turn: { attackerId: 'p1', defenderId: 'p2' },
      trumpSuit: 'H',
      deckCount: 10,
      discardCount: 0,
      table: [],
      phase: GAME_PHASES.ATTACKING,
      lastActionAt: Date.now(),
      settings: { allowReinforceFromOthers: false, useJokers: false, deckSize: '36' }
    };

    const players = new Map([
      ['p1', { id: 'p1', nickname: 'Player1', hand: [spade6], handCount: 1, isConnected: true }],
      ['p2', { id: 'p2', nickname: 'Player2', hand: [heart6], handCount: 1, isConnected: true }],
      ['p3', { id: 'p3', nickname: 'Player3', hand: [diamond6], handCount: 1, isConnected: true }]
    ]);

    it('savunan başarılı - o saldırır', () => {
      const nextTurn = getNextTurn(gameState, players, false);
      expect(nextTurn.attackerId).toBe('p2'); // Eski savunan
      expect(nextTurn.defenderId).toBe('p3'); // Sıradaki
    });

    it('savunan kartları aldı - sıradaki saldırır', () => {
      const nextTurn = getNextTurn(gameState, players, true);
      expect(nextTurn.attackerId).toBe('p3'); // Sıradaki
      expect(nextTurn.defenderId).toBe('p1'); // Ondan sonraki
    });

    it('eli boş olan oyuncular atlanır', () => {
      const playersWithEmpty = new Map([
        ['p1', { id: 'p1', nickname: 'Player1', hand: [], handCount: 0, isConnected: true }],
        ['p2', { id: 'p2', nickname: 'Player2', hand: [heart6], handCount: 1, isConnected: true }],
        ['p3', { id: 'p3', nickname: 'Player3', hand: [diamond6], handCount: 1, isConnected: true }]
      ]);

      const nextTurn = getNextTurn(gameState, playersWithEmpty, false);
      expect(nextTurn.attackerId).toBe('p2');
      expect(nextTurn.defenderId).toBe('p3');
    });
  });
});