import { v4 as uuidv4 } from 'uuid';
import { createGame, gameReducer, drawUpToSix, isGameOver, getNextTurn } from '@durak/game-engine';
import { GAME_PHASES } from '@durak/shared';
import { MemoryStore } from './Adapters/MemoryStore.js';
/**
 * Oda yönetimi ve oyun durumu koordinasyonu
 */
export class RoomManager {
    store;
    constructor() {
        this.store = new MemoryStore();
    }
    /**
     * Yeni oda oluşturur
     */
    createRoom(name, maxPlayers, settings) {
        const roomId = uuidv4();
        const room = {
            id: roomId,
            name,
            maxPlayers,
            createdAt: Date.now(),
            gameState: null,
            players: new Map(),
            deck: []
        };
        this.store.createRoom(room);
        return room;
    }
    /**
     * Oda getirir
     */
    getRoom(roomId) {
        return this.store.getRoom(roomId);
    }
    /**
     * Tüm odaları lobby için özetler
     */
    getRoomSummaries() {
        return this.store.getAllRooms().map(room => ({
            id: room.id,
            name: room.name,
            playerCount: room.players.size,
            maxPlayers: room.maxPlayers,
            phase: room.gameState?.phase || GAME_PHASES.LOBBY,
            createdAt: room.createdAt
        }));
    }
    /**
     * Oyuncuyu odaya ekler
     */
    joinRoom(roomId, session) {
        const room = this.getRoom(roomId);
        if (!room) {
            return { success: false, error: 'Oda bulunamadı' };
        }
        if (room.players.size >= room.maxPlayers) {
            return { success: false, error: 'Oda dolu' };
        }
        if (room.gameState && room.gameState.phase !== GAME_PHASES.LOBBY) {
            // Reconnect kontrolü
            const existingPlayer = room.players.get(session.playerId);
            if (!existingPlayer) {
                return { success: false, error: 'Oyun başlamış' };
            }
        }
        // Oyuncuyu ekle veya güncelle
        const player = room.players.get(session.playerId) || {
            id: session.playerId,
            nickname: session.nickname,
            hand: [],
            handCount: 0,
            isConnected: true
        };
        player.isConnected = true;
        player.nickname = session.nickname;
        this.store.addPlayerToRoom(roomId, player);
        session.roomId = roomId;
        return { success: true };
    }
    /**
     * Oyuncuyu odadan çıkarır
     */
    leaveRoom(roomId, playerId) {
        const room = this.getRoom(roomId);
        if (!room) {
            return { success: false };
        }
        // Oyun başlamışsa sadece disconnect yap
        if (room.gameState && room.gameState.phase !== GAME_PHASES.LOBBY) {
            const player = room.players.get(playerId);
            if (player) {
                player.isConnected = false;
            }
        }
        else {
            // Lobby'deyse tamamen çıkar
            this.store.removePlayerFromRoom(roomId, playerId);
        }
        // Oda boşsa sil
        if (room.players.size === 0) {
            this.store.deleteRoom(roomId);
        }
        return { success: true };
    }
    /**
     * Oyunu başlatır
     */
    startGame(roomId, starterId) {
        const room = this.getRoom(roomId);
        if (!room) {
            return { success: false, error: 'Oda bulunamadı' };
        }
        if (room.gameState && room.gameState.phase !== GAME_PHASES.LOBBY) {
            return { success: false, error: 'Oyun zaten başlamış' };
        }
        if (room.players.size < 2) {
            return { success: false, error: 'En az 2 oyuncu gerekli' };
        }
        // Oyunu başlat
        const playerIds = Array.from(room.players.keys());
        const settings = {
            allowReinforceFromOthers: false,
            useJokers: false,
            deckSize: '36'
        };
        const { gameState, players, deck } = createGame(roomId, playerIds, settings);
        // Oyuncu nickname'lerini güncelle
        for (const [playerId, gamePlayer] of players) {
            const roomPlayer = room.players.get(playerId);
            if (roomPlayer) {
                gamePlayer.nickname = roomPlayer.nickname;
                room.players.set(playerId, gamePlayer);
            }
        }
        room.gameState = gameState;
        room.deck = deck;
        return { success: true };
    }
    /**
     * Oyun aksiyonu işler
     */
    processGameAction(roomId, action) {
        const room = this.getRoom(roomId);
        if (!room || !room.gameState) {
            return { success: false, error: 'Oyun bulunamadı' };
        }
        const result = gameReducer(room.gameState, room.players, room.deck, action);
        if (result.success && result.newState) {
            room.gameState = result.newState;
            this.store.updateGameState(roomId, result.newState);
            this.store.updateDeck(roomId, room.deck);
            // Çekme fazındaysa otomatik işle
            if (result.newState.phase === GAME_PHASES.DRAW) {
                setTimeout(() => {
                    this.processDrawPhase(roomId);
                }, 1000);
            }
        }
        return {
            success: result.success,
            error: result.error
        };
    }
    /**
     * Çekme fazını otomatik işler
     */
    processDrawPhase(roomId) {
        const room = this.getRoom(roomId);
        if (!room || !room.gameState || room.gameState.phase !== GAME_PHASES.DRAW) {
            return;
        }
        // Çekme sırası: saldıran -> savunan
        const drawOrder = [room.gameState.turn.attackerId, room.gameState.turn.defenderId];
        drawUpToSix(room.players, room.deck, drawOrder);
        room.gameState.deckCount = room.deck.length;
        // Oyun bitti mi kontrol et
        if (isGameOver(room.gameState, room.players)) {
            room.gameState.phase = GAME_PHASES.FINISHED;
            // Kazananları ve kaybedeni belirle
            const playersWithCards = Array.from(room.players.entries())
                .filter(([_, player]) => player.hand.length > 0);
            if (playersWithCards.length === 1) {
                const loserId = playersWithCards[0][0];
                room.gameState.loserId = loserId; // Durak
                room.gameState.winnerIds = Array.from(room.players.keys())
                    .filter(id => id !== loserId);
            }
        }
        else {
            // Sıradaki turu belirle
            room.gameState.turn = getNextTurn(room.gameState, room.players, false);
            room.gameState.phase = GAME_PHASES.ATTACKING;
        }
        room.gameState.lastActionAt = Date.now();
        this.store.updateGameState(roomId, room.gameState);
        this.store.updateDeck(roomId, room.deck);
    }
    /**
     * Oyuncu için server state oluşturur
     */
    getServerState(roomId, playerId) {
        const room = this.getRoom(roomId);
        if (!room || !room.gameState) {
            return null;
        }
        const privatePlayer = room.players.get(playerId);
        const players = Array.from(room.players.values()).map(p => ({
            id: p.id,
            nickname: p.nickname,
            handCount: p.handCount,
            isConnected: p.isConnected
        }));
        return {
            gameState: room.gameState,
            privatePlayer,
            players
        };
    }
    /**
     * Oyuncunun bağlantı durumunu günceller
     */
    updatePlayerConnection(roomId, playerId, isConnected) {
        const room = this.getRoom(roomId);
        if (!room)
            return;
        const player = room.players.get(playerId);
        if (player) {
            player.isConnected = isConnected;
        }
    }
}
