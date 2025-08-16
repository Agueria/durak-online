import { getCardValue, isTrump, compareCards } from './deck.js';
import type { Card, GameState, Suit, AttackValidation, DefenseValidation } from './types.js';

/**
 * Saldırı kartının savunma kartı ile kapatılıp kapatılamayacağını kontrol eder
 * Kural: Aynı renkten daha yüksek kart veya koz ile savunulur
 */
export function canDefend(
  attackCard: Card, 
  defenseCard: Card, 
  trumpSuit: Suit
): DefenseValidation {
  const attackIsTrump = isTrump(attackCard, trumpSuit);
  const defenseIsTrump = isTrump(defenseCard, trumpSuit);
  
  // Koz vs koz: daha yüksek koz gerekli
  if (attackIsTrump && defenseIsTrump) {
    if (compareCards(defenseCard, attackCard) > 0) {
      return { isValid: true };
    }
    return { isValid: false, reason: 'Daha yüksek koz gerekli' };
  }
  
  // Koz olmayan saldırıya koz ile savunma
  if (!attackIsTrump && defenseIsTrump) {
    return { isValid: true };
  }
  
  // Koz saldırısına koz olmayan ile savunma - geçersiz
  if (attackIsTrump && !defenseIsTrump) {
    return { isValid: false, reason: 'Koza karşı koz gerekli' };
  }
  
  // Aynı renk, daha yüksek kart
  if (attackCard.suit === defenseCard.suit) {
    if (compareCards(defenseCard, attackCard) > 0) {
      return { isValid: true };
    }
    return { isValid: false, reason: 'Daha yüksek kart gerekli' };
  }
  
  return { isValid: false, reason: 'Aynı renk veya koz gerekli' };
}

/**
 * Saldırıya kart eklenip eklenemeyeceğini kontrol eder
 * Kural: Aynı değerde (rank) kartlar eklenebilir
 */
export function canAttackAppend(
  existingCards: Card[], 
  newCards: Card[], 
  defenderHandSize: number
): AttackValidation {
  if (newCards.length === 0) {
    return { isValid: false, reason: 'En az bir kart seçmelisiniz' };
  }
  
  // Tüm yeni kartlar aynı değerde olmalı
  const firstRank = newCards[0].rank;
  if (!newCards.every(card => card.rank === firstRank)) {
    return { isValid: false, reason: 'Tüm kartlar aynı değerde olmalı' };
  }
  
  // Masada kart varsa, aynı değerde olmalı
  if (existingCards.length > 0) {
    const tableRanks = new Set(existingCards.map(card => card.rank));
    if (!tableRanks.has(firstRank)) {
      return { isValid: false, reason: 'Masadaki kartlarla aynı değerde olmalı' };
    }
  }
  
  // Toplam saldırı kartı sayısı savunanın el kartı sayısını aşamaz
  const totalAttackCards = existingCards.length + newCards.length;
  if (totalAttackCards > defenderHandSize) {
    return { isValid: false, reason: 'Savunanın el kartı sayısını aşamazsınız' };
  }
  
  return { isValid: true };
}

/**
 * Oyuncunun sıradaki saldıran olup olmadığını kontrol eder
 */
export function isPlayerAttacker(gameState: GameState, playerId: string): boolean {
  return gameState.turn.attackerId === playerId;
}

/**
 * Oyuncunun sıradaki savunan olup olmadığını kontrol eder
 */
export function isPlayerDefender(gameState: GameState, playerId: string): boolean {
  return gameState.turn.defenderId === playerId;
}

/**
 * Masadaki tüm saldırıların kapatılıp kapatılmadığını kontrol eder
 */
export function areAllAttacksDefended(gameState: GameState): boolean {
  return gameState.table.every(pair => pair.defense !== undefined);
}

/**
 * Oyunun bitip bitmediğini kontrol eder
 */
export function isGameOver(gameState: GameState, players: Map<string, { hand: Card[] }>): boolean {
  // Deste bitti ve birden fazla oyuncunun eli boş
  if (gameState.deckCount === 0) {
    const playersWithCards = Array.from(players.values()).filter(p => p.hand.length > 0);
    return playersWithCards.length <= 1;
  }
  
  return false;
}

/**
 * Sıradaki saldıran ve savunanı belirler
 */
export function getNextTurn(
  gameState: GameState, 
  players: Map<string, { hand: Card[] }>,
  defenderTookCards: boolean
): { attackerId: string; defenderId: string } {
  const { playersOrder } = gameState;
  const currentDefenderIndex = playersOrder.indexOf(gameState.turn.defenderId);
  
  let nextAttackerIndex: number;
  
  if (defenderTookCards) {
    // Savunan kartları aldıysa, sıradaki oyuncu saldırır
    nextAttackerIndex = (currentDefenderIndex + 1) % playersOrder.length;
  } else {
    // Savunan başarılıysa, o saldırır
    nextAttackerIndex = currentDefenderIndex;
  }
  
  // Eli boş olan oyuncuları atla
  while (true) {
    const attackerId = playersOrder[nextAttackerIndex];
    const attacker = players.get(attackerId);
    
    if (attacker && attacker.hand.length > 0) {
      // Sıradaki savunanı bul
      let defenderIndex = (nextAttackerIndex + 1) % playersOrder.length;
      
      while (true) {
        const defenderId = playersOrder[defenderIndex];
        const defender = players.get(defenderId);
        
        if (defender && defender.hand.length > 0) {
          return { attackerId, defenderId };
        }
        
        defenderIndex = (defenderIndex + 1) % playersOrder.length;
        
        // Sonsuz döngü koruması
        if (defenderIndex === nextAttackerIndex) {
          break;
        }
      }
    }
    
    nextAttackerIndex = (nextAttackerIndex + 1) % playersOrder.length;
    
    // Sonsuz döngü koruması
    if (nextAttackerIndex === currentDefenderIndex) {
      break;
    }
  }
  
  // Fallback - mevcut durumu koru
  return gameState.turn;
}