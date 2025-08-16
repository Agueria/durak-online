/**
 * Bellek tabanlı veri deposu - geliştirme için
 */
export class MemoryStore {
    rooms = new Map();
    /**
     * Oda oluşturur
     */
    createRoom(room) {
        this.rooms.set(room.id, room);
    }
    /**
     * Oda getirir
     */
    getRoom(roomId) {
        return this.rooms.get(roomId) || null;
    }
    /**
     * Tüm odaları getirir
     */
    getAllRooms() {
        return Array.from(this.rooms.values());
    }
    /**
     * Oda günceller
     */
    updateRoom(roomId, updates) {
        const room = this.rooms.get(roomId);
        if (!room)
            return false;
        Object.assign(room, updates);
        return true;
    }
    /**
     * Oda siler
     */
    deleteRoom(roomId) {
        return this.rooms.delete(roomId);
    }
    /**
     * Oyuncuyu odaya ekler
     */
    addPlayerToRoom(roomId, player) {
        const room = this.rooms.get(roomId);
        if (!room)
            return false;
        room.players.set(player.id, player);
        return true;
    }
    /**
     * Oyuncuyu odadan çıkarır
     */
    removePlayerFromRoom(roomId, playerId) {
        const room = this.rooms.get(roomId);
        if (!room)
            return false;
        return room.players.delete(playerId);
    }
    /**
     * Oyun durumunu günceller
     */
    updateGameState(roomId, gameState) {
        const room = this.rooms.get(roomId);
        if (!room)
            return false;
        room.gameState = gameState;
        return true;
    }
    /**
     * Desteyi günceller
     */
    updateDeck(roomId, deck) {
        const room = this.rooms.get(roomId);
        if (!room)
            return false;
        room.deck = [...deck];
        return true;
    }
    /**
     * Belleği temizler
     */
    clear() {
        this.rooms.clear();
    }
}
