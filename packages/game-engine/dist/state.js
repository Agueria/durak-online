import { GAME_PHASES, INITIAL_HAND_SIZE } from '@durak/shared';
import { createDeck, findLowestTrump } from './deck.js';
import { shuffleDeck, generateSeed } from './shuffle.js';
/**
 * Yeni oyun durumu oluşturur
 */
export function createGame(roomId, playerIds, settings, seed) {
    const gameSeed = seed || generateSeed();
    const deck = shuffleDeck(createDeck(), gameSeed);
    // Koz kartını belirle (deste altından)
    const trumpCard = deck[deck.length - 1];
    const trumpSuit = trumpCard.suit;
    // Oyunculara kart dağıt
    const players = new Map();
    const dealtCards = deck.splice(0, playerIds.length * INITIAL_HAND_SIZE);
    playerIds.forEach((playerId, index) => {
        const hand = dealtCards.slice(index * INITIAL_HAND_SIZE, (index + 1) * INITIAL_HAND_SIZE);
        players.set(playerId, {
            id: playerId,
            nickname: `Player ${index + 1}`, // Bu server tarafında güncellenecek
            hand,
            handCount: hand.length,
            isConnected: true
        });
    });
    // İlk saldıranı belirle (en düşük koz sahibi)
    const firstAttacker = findFirstAttacker(players, trumpSuit);
    const attackerIndex = playerIds.indexOf(firstAttacker);
    const defenderIndex = (attackerIndex + 1) % playerIds.length;
    const gameState = {
        roomId,
        playersOrder: [...playerIds],
        turn: {
            attackerId: playerIds[attackerIndex],
            defenderId: playerIds[defenderIndex]
        },
        trumpSuit,
        deckCount: deck.length,
        discardCount: 0,
        table: [],
        phase: GAME_PHASES.ATTACKING,
        lastActionAt: Date.now(),
        settings
    };
    return { gameState, players, deck };
}
/**
 * En düşük koz sahibini bulur (ilk saldıran)
 */
function findFirstAttacker(players, trumpSuit) {
    let lowestTrumpPlayer = null;
    let lowestTrump = null;
    for (const [playerId, player] of players) {
        const playerLowestTrump = findLowestTrump(player.hand, trumpSuit);
        if (playerLowestTrump) {
            if (!lowestTrump ||
                (playerLowestTrump.rank < lowestTrump.rank)) {
                lowestTrump = playerLowestTrump;
                lowestTrumpPlayer = playerId;
            }
        }
    }
    // Hiç kimsenin kozu yoksa ilk oyuncu saldırır
    return lowestTrumpPlayer || Array.from(players.keys())[0];
}
/**
 * Oyuncuları 6 karta tamamlar
 */
export function drawUpToSix(players, deck, drawOrder) {
    for (const playerId of drawOrder) {
        const player = players.get(playerId);
        if (!player)
            continue;
        const needed = INITIAL_HAND_SIZE - player.hand.length;
        const drawn = deck.splice(0, Math.min(needed, deck.length));
        player.hand.push(...drawn);
        player.handCount = player.hand.length;
        if (deck.length === 0)
            break;
    }
}
