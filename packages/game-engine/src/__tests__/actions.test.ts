import { describe, it, expect, beforeEach } from 'vitest';
import { 
  playAttack, 
  playDefense, 
  takeCards, 
  endTurnResolve 
} from '../actions.js';
import { createGame } from '../state.js';
import { GAME_PHASES } from '@durak/shared';
import type { GameState, PrivatePlayer, Card, GameSettings } from '../types.js';

describe('Oyun Aksiyonları - Detaylı Testler', () => {
  let gameState: GameState;
  let players: Map<string, PrivatePlayer>;
  let deck: Card[];
  
  const defaultSettings: GameSettings = {
    allowReinforceFromOthers: false,
    useJokers: false,
    deckSize: '36'
  };

  beforeEach(() => {
    // Her test için temiz oyun durumu
    const gameSetup = createGame('test-room', ['player1', 'player2'], defaultSettings, 'test-seed');
    gameState = gameSetup.gameState;
    players = gameSetup.players;
    deck = gameSetup.deck;
    
    // Oyuncuların nickname'lerini ayarla
    players.get('player1')!.nickname = 'Alice';
    players.get('player2')!.nickname = 'Bob';
  });

  describe('playAttack', () => {
    it('geçerli ilk saldırı', () => {
      const attacker = players.get(gameState.turn.attackerId)!;
      const attackCard = attacker.hand[0];
      
      const result = playAttack(gameState, players, {
        type: 'PLAY_ATTACK',
        playerId: gameState.turn.attackerId,
        payload: { cards: [attackCard] }
      });

      expect(result.success).toBe(true);
      expect(result.newState?.phase).toBe(GAME_PHASES.DEFENDING);
      expect(result.newState?.table).toHaveLength(1);
      expect(result.newState?.table[0].attack).toEqual(attackCard);
      expect(attacker.hand).not.toContain(attackCard);
    });

    it('çoklu aynı değer kartlarla saldırı', () => {
      const attacker = players.get(gameState.turn.attackerId)!;
      
      // Aynı değerde kartlar bul veya oluştur
      const rank = attacker.hand[0].rank;
      const sameRankCards = attacker.hand.filter(card => card.rank === rank).slice(0, 2);
      
      if (sameRankCards.length < 2) {
        // Test için aynı değerde ikinci kart ekle
        const secondCard: Card = { 
          id: 'TEST-' + rank, 
          suit: 'H', 
          rank: rank 
        };
        attacker.hand.push(secondCard);
        sameRankCards.push(secondCard);
      }

      const result = playAttack(gameState, players, {
        type: 'PLAY_ATTACK',
        playerId: gameState.turn.attackerId,
        payload: { cards: sameRankCards }
      });

      expect(result.success).toBe(true);
      expect(result.newState?.table).toHaveLength(2);
    });

    it('yanlış oyuncu saldırısı - başarısız', () => {
      const defender = players.get(gameState.turn.defenderId)!;
      const attackCard = defender.hand[0];

      const result = playAttack(gameState, players, {
        type: 'PLAY_ATTACK',
        playerId: gameState.turn.defenderId,
        payload: { cards: [attackCard] }
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('sırası sizde değil');
    });

    it('yanlış fazda saldırı - başarısız', () => {
      gameState.phase = GAME_PHASES.DEFENDING;
      const attacker = players.get(gameState.turn.attackerId)!;
      const attackCard = attacker.hand[0];

      const result = playAttack(gameState, players, {
        type: 'PLAY_ATTACK',
        playerId: gameState.turn.attackerId,
        payload: { cards: [attackCard] }
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('fazında değil');
    });

    it('sahip olmadığı kartla saldırı - başarısız', () => {
      const fakeCard: Card = { id: 'FAKE', suit: 'S', rank: '6' };

      const result = playAttack(gameState, players, {
        type: 'PLAY_ATTACK',
        playerId: gameState.turn.attackerId,
        payload: { cards: [fakeCard] }
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Sahip olmadığınız');
    });

    it('farklı değerde kartlarla saldırı - başarısız', () => {
      const attacker = players.get(gameState.turn.attackerId)!;
      const cards = attacker.hand.slice(0, 2);
      
      // Farklı değerde kartlar olduğundan emin ol
      if (cards[0].rank === cards[1].rank) {
        cards[1] = { id: 'DIFF', suit: 'H', rank: cards[0].rank === '6' ? '7' : '6' };
        attacker.hand.push(cards[1]);
      }

      const result = playAttack(gameState, players, {
        type: 'PLAY_ATTACK',
        playerId: gameState.turn.attackerId,
        payload: { cards: cards }
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('aynı değerde');
    });

    it('savunanın el kartı sayısını aşan saldırı - başarısız', () => {
      const attacker = players.get(gameState.turn.attackerId)!;
      const defender = players.get(gameState.turn.defenderId)!;
      
      // Savunanın elini azalt
      defender.hand = defender.hand.slice(0, 1);
      defender.handCount = 1;
      
      // 2 kart ile saldır (savunanın 1 kartı var)
      const rank = attacker.hand[0].rank;
      const cards = [
        attacker.hand[0],
        { id: 'EXTRA', suit: 'H', rank: rank }
      ];
      attacker.hand.push(cards[1]);

      const result = playAttack(gameState, players, {
        type: 'PLAY_ATTACK',
        playerId: gameState.turn.attackerId,
        payload: { cards: cards }
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('aşamazsınız');
    });
  });

  describe('playDefense', () => {
    beforeEach(() => {
      // Her savunma testinden önce bir saldırı yap
      const attacker = players.get(gameState.turn.attackerId)!;
      const attackCard = attacker.hand[0];
      
      playAttack(gameState, players, {
        type: 'PLAY_ATTACK',
        playerId: gameState.turn.attackerId,
        payload: { cards: [attackCard] }
      });
    });

    it('geçerli savunma - aynı renk yüksek kart', () => {
      const defender = players.get(gameState.turn.defenderId)!;
      const attackCard = gameState.table[0].attack;
      
      // Aynı renkte daha yüksek kart bul veya oluştur
      let defenseCard = defender.hand.find(card => 
        card.suit === attackCard.suit && 
        card.rank > attackCard.rank
      );
      
      if (!defenseCard) {
        defenseCard = { 
          id: 'DEF', 
          suit: attackCard.suit, 
          rank: 'A' 
        };
        defender.hand.push(defenseCard);
      }

      const result = playDefense(gameState, players, {
        type: 'PLAY_DEFENSE',
        playerId: gameState.turn.defenderId,
        payload: { attackIndex: 0, card: defenseCard }
      });

      expect(result.success).toBe(true);
      expect(result.newState?.table[0].defense).toEqual(defenseCard);
      expect(result.newState?.phase).toBe(GAME_PHASES.ATTACKING); // Tüm saldırılar savunuldu
    });

    it('geçerli savunma - koz ile', () => {
      const defender = players.get(gameState.turn.defenderId)!;
      const attackCard = gameState.table[0].attack;
      
      // Koz kart bul veya oluştur (saldırı kartı koz değilse)
      let trumpCard = defender.hand.find(card => 
        card.suit === gameState.trumpSuit && 
        card.suit !== attackCard.suit
      );
      
      if (!trumpCard) {
        trumpCard = { 
          id: 'TRUMP', 
          suit: gameState.trumpSuit, 
          rank: '6' 
        };
        defender.hand.push(trumpCard);
      }

      const result = playDefense(gameState, players, {
        type: 'PLAY_DEFENSE',
        playerId: gameState.turn.defenderId,
        payload: { attackIndex: 0, card: trumpCard }
      });

      expect(result.success).toBe(true);
      expect(result.newState?.table[0].defense).toEqual(trumpCard);
    });

    it('yanlış oyuncu savunması - başarısız', () => {
      const attacker = players.get(gameState.turn.attackerId)!;
      const defenseCard = attacker.hand[0];

      const result = playDefense(gameState, players, {
        type: 'PLAY_DEFENSE',
        playerId: gameState.turn.attackerId,
        payload: { attackIndex: 0, card: defenseCard }
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('sırası sizde değil');
    });

    it('geçersiz saldırı indeksi - başarısız', () => {
      const defender = players.get(gameState.turn.defenderId)!;
      const defenseCard = defender.hand[0];

      const result = playDefense(gameState, players, {
        type: 'PLAY_DEFENSE',
        playerId: gameState.turn.defenderId,
        payload: { attackIndex: 5, card: defenseCard }
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Geçersiz saldırı indeksi');
    });

    it('zaten savunulmuş saldırıya savunma - başarısız', () => {
      const defender = players.get(gameState.turn.defenderId)!;
      
      // İlk savunmayı yap
      const firstDefense = { id: 'DEF1', suit: gameState.trumpSuit, rank: '6' };
      defender.hand.push(firstDefense);
      
      playDefense(gameState, players, {
        type: 'PLAY_DEFENSE',
        playerId: gameState.turn.defenderId,
        payload: { attackIndex: 0, card: firstDefense }
      });

      // Aynı saldırıya tekrar savunma dene
      const secondDefense = { id: 'DEF2', suit: gameState.trumpSuit, rank: '7' };
      defender.hand.push(secondDefense);

      const result = playDefense(gameState, players, {
        type: 'PLAY_DEFENSE',
        playerId: gameState.turn.defenderId,
        payload: { attackIndex: 0, card: secondDefense }
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('zaten savunulmuş');
    });

    it('geçersiz savunma kartı - başarısız', () => {
      const defender = players.get(gameState.turn.defenderId)!;
      const attackCard = gameState.table[0].attack;
      
      // Geçersiz savunma kartı (düşük kart, farklı renk, koz değil)
      const invalidCard: Card = { 
        id: 'INVALID', 
        suit: attackCard.suit === 'S' ? 'D' : 'S', 
        rank: '6' 
      };
      defender.hand.push(invalidCard);

      const result = playDefense(gameState, players, {
        type: 'PLAY_DEFENSE',
        playerId: gameState.turn.defenderId,
        payload: { attackIndex: 0, card: invalidCard }
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('takeCards', () => {
    beforeEach(() => {
      // Savunma fazına geç
      const attacker = players.get(gameState.turn.attackerId)!;
      const attackCard = attacker.hand[0];
      
      playAttack(gameState, players, {
        type: 'PLAY_ATTACK',
        playerId: gameState.turn.attackerId,
        payload: { cards: [attackCard] }
      });
    });

    it('kartları alma - başarılı', () => {
      const defender = players.get(gameState.turn.defenderId)!;
      const initialHandSize = defender.hand.length;
      const tableCards = gameState.table.length;

      const result = takeCards(gameState, players, gameState.turn.defenderId);

      expect(result.success).toBe(true);
      expect(result.newState?.phase).toBe(GAME_PHASES.DRAW);
      expect(result.newState?.table).toHaveLength(0);
      expect(defender.hand.length).toBe(initialHandSize + tableCards);
    });

    it('yanlış oyuncu kartları alma - başarısız', () => {
      const result = takeCards(gameState, players, gameState.turn.attackerId);

      expect(result.success).toBe(false);
      expect(result.error).toContain('sırası sizde değil');
    });

    it('yanlış fazda kartları alma - başarısız', () => {
      gameState.phase = GAME_PHASES.ATTACKING;

      const result = takeCards(gameState, players, gameState.turn.defenderId);

      expect(result.success).toBe(false);
      expect(result.error).toContain('fazında değil');
    });
  });

  describe('endTurnResolve', () => {
    beforeEach(() => {
      // Tam savunulmuş bir tur oluştur
      const attacker = players.get(gameState.turn.attackerId)!;
      const defender = players.get(gameState.turn.defenderId)!;
      
      // Saldırı
      const attackCard = attacker.hand[0];
      playAttack(gameState, players, {
        type: 'PLAY_ATTACK',
        playerId: gameState.turn.attackerId,
        payload: { cards: [attackCard] }
      });

      // Savunma
      const defenseCard: Card = { 
        id: 'DEF', 
        suit: gameState.trumpSuit, 
        rank: 'A' 
      };
      defender.hand.push(defenseCard);
      
      playDefense(gameState, players, {
        type: 'PLAY_DEFENSE',
        playerId: gameState.turn.defenderId,
        payload: { attackIndex: 0, card: defenseCard }
      });
    });

    it('turu bitirme - başarılı', () => {
      const initialDiscardCount = gameState.discardCount;

      const result = endTurnResolve(gameState, players, deck);

      expect(result.success).toBe(true);
      expect(result.newState?.phase).toBe(GAME_PHASES.DRAW);
      expect(result.newState?.table).toHaveLength(0);
      expect(result.newState?.discardCount).toBe(initialDiscardCount + 2); // attack + defense
    });

    it('savunulmamış saldırı ile tur bitirme - başarısız', () => {
      // Yeni savunulmamış saldırı ekle
      const attacker = players.get(gameState.turn.attackerId)!;
      const newAttackCard = attacker.hand[0];
      
      gameState.table.push({ attack: newAttackCard });
      gameState.phase = GAME_PHASES.ATTACKING;

      const result = endTurnResolve(gameState, players, deck);

      expect(result.success).toBe(false);
      expect(result.error).toContain('savunulmamış');
    });

    it('yanlış fazda tur bitirme - başarısız', () => {
      gameState.phase = GAME_PHASES.DEFENDING;

      const result = endTurnResolve(gameState, players, deck);

      expect(result.success).toBe(false);
      expect(result.error).toContain('fazında değil');
    });
  });

  describe('Oyun Akışı Entegrasyonu', () => {
    it('tam bir saldırı-savunma-çözümleme döngüsü', () => {
      const attacker = players.get(gameState.turn.attackerId)!;
      const defender = players.get(gameState.turn.defenderId)!;
      
      const initialAttackerHandSize = attacker.hand.length;
      const initialDefenderHandSize = defender.hand.length;

      // 1. Saldırı
      const attackCard = attacker.hand[0];
      const attackResult = playAttack(gameState, players, {
        type: 'PLAY_ATTACK',
        playerId: gameState.turn.attackerId,
        payload: { cards: [attackCard] }
      });

      expect(attackResult.success).toBe(true);
      expect(gameState.phase).toBe(GAME_PHASES.DEFENDING);

      // 2. Savunma
      const defenseCard: Card = { 
        id: 'DEF', 
        suit: gameState.trumpSuit, 
        rank: 'A' 
      };
      defender.hand.push(defenseCard);

      const defenseResult = playDefense(gameState, players, {
        type: 'PLAY_DEFENSE',
        playerId: gameState.turn.defenderId,
        payload: { attackIndex: 0, card: defenseCard }
      });

      expect(defenseResult.success).toBe(true);
      expect(gameState.phase).toBe(GAME_PHASES.ATTACKING);

      // 3. Tur bitirme
      const endResult = endTurnResolve(gameState, players, deck);

      expect(endResult.success).toBe(true);
      expect(gameState.phase).toBe(GAME_PHASES.DRAW);
      expect(gameState.table).toHaveLength(0);

      // Kart sayıları kontrol
      expect(attacker.hand.length).toBe(initialAttackerHandSize - 1);
      expect(defender.hand.length).toBe(initialDefenderHandSize); // +1 eklenen -1 oynanan
    });

    it('saldırı-kartları alma döngüsü', () => {
      const attacker = players.get(gameState.turn.attackerId)!;
      const defender = players.get(gameState.turn.defenderId)!;
      
      const initialDefenderHandSize = defender.hand.length;

      // 1. Saldırı
      const attackCard = attacker.hand[0];
      playAttack(gameState, players, {
        type: 'PLAY_ATTACK',
        playerId: gameState.turn.attackerId,
        payload: { cards: [attackCard] }
      });

      // 2. Kartları alma
      const takeResult = takeCards(gameState, players, gameState.turn.defenderId);

      expect(takeResult.success).toBe(true);
      expect(gameState.phase).toBe(GAME_PHASES.DRAW);
      expect(gameState.table).toHaveLength(0);
      expect(defender.hand.length).toBe(initialDefenderHandSize + 1); // Saldırı kartını aldı
    });
  });
});