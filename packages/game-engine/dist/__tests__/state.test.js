import { describe, it, expect } from 'vitest';
import { createGame, drawUpToSix } from '../state.js';
import { GAME_PHASES } from '@durak/shared';
describe('Oyun Durumu', () => {
    const defaultSettings = {
        allowReinforceFromOthers: false,
        useJokers: false,
        deckSize: '36'
    };
    describe('createGame', () => {
        it('2 oyunculu oyun oluşturma', () => {
            const playerIds = ['player1', 'player2'];
            const { gameState, players, deck } = createGame('room1', playerIds, defaultSettings, 'test-seed');
            expect(gameState.roomId).toBe('room1');
            expect(gameState.playersOrder).toEqual(playerIds);
            expect(gameState.phase).toBe(GAME_PHASES.ATTACKING);
            expect(gameState.deckCount).toBe(24); // 36 - (2 * 6) = 24
            expect(players.size).toBe(2);
            // Her oyuncunun 6 kartı olmalı
            for (const player of players.values()) {
                expect(player.hand.length).toBe(6);
                expect(player.handCount).toBe(6);
            }
        });
        it('koz belirleme', () => {
            const playerIds = ['player1', 'player2'];
            const { gameState } = createGame('room1', playerIds, defaultSettings, 'test-seed');
            expect(['S', 'H', 'D', 'C']).toContain(gameState.trumpSuit);
        });
        it('deterministik seed ile aynı sonuç', () => {
            const playerIds = ['player1', 'player2'];
            const seed = 'deterministic-seed';
            const game1 = createGame('room1', playerIds, defaultSettings, seed);
            const game2 = createGame('room1', playerIds, defaultSettings, seed);
            expect(game1.gameState.trumpSuit).toBe(game2.gameState.trumpSuit);
            expect(game1.gameState.turn.attackerId).toBe(game2.gameState.turn.attackerId);
        });
    });
    describe('drawUpToSix', () => {
        it('oyuncuları 6 karta tamamlama', () => {
            const playerIds = ['player1', 'player2'];
            const { players, deck } = createGame('room1', playerIds, defaultSettings);
            // Bir oyuncunun kartlarını azalt
            const player1 = players.get('player1');
            player1.hand = player1.hand.slice(0, 3); // 3 kart kalsın
            player1.handCount = 3;
            const initialDeckSize = deck.length;
            drawUpToSix(players, deck, ['player1']);
            expect(player1.hand.length).toBe(6);
            expect(player1.handCount).toBe(6);
            expect(deck.length).toBe(initialDeckSize - 3);
        });
        it('deste bittiğinde çekme durması', () => {
            const playerIds = ['player1', 'player2'];
            const { players, deck } = createGame('room1', playerIds, defaultSettings);
            // Desteyi boşalt
            deck.length = 0;
            const player1 = players.get('player1');
            player1.hand = player1.hand.slice(0, 3);
            player1.handCount = 3;
            drawUpToSix(players, deck, ['player1']);
            expect(player1.hand.length).toBe(3); // Değişmemeli
        });
    });
});
