import type { Card, GameState, GameSettings, Suit, Rank } from '@durak/shared';

export interface PrivatePlayer {
  id: string;
  nickname: string;
  hand: Card[];
  handCount: number;
  isConnected: boolean;
}

export interface GameAction {
  type: 'PLAY_ATTACK' | 'PLAY_DEFENSE' | 'PASS' | 'TAKE' | 'END_TURN';
  playerId: string;
  payload?: any;
}

export interface AttackAction extends GameAction {
  type: 'PLAY_ATTACK';
  payload: {
    cards: Card[];
  };
}

export interface DefenseAction extends GameAction {
  type: 'PLAY_DEFENSE';
  payload: {
    attackIndex: number;
    card: Card;
  };
}

export interface GameResult {
  success: boolean;
  newState?: GameState;
  error?: string;
}

export interface DeckInfo {
  cards: Card[];
  trumpCard: Card;
  trumpSuit: Suit;
}

// Oyun kuralları için yardımcı tipler
export interface AttackValidation {
  isValid: boolean;
  reason?: string;
}

export interface DefenseValidation {
  isValid: boolean;
  reason?: string;
}

export { Card, GameState, GameSettings, Suit, Rank };