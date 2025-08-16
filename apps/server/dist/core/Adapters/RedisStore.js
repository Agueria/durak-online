/**
 * Redis tabanlı veri deposu - TODO: İleride implement edilecek
 * Şimdilik sadece interface tanımı
 */
export class RedisStore {
    redisUrl;
    constructor(redisUrl) {
        this.redisUrl = redisUrl;
        // TODO: Redis bağlantısı kur
    }
    async createRoom(room) {
        // TODO: Redis'e oda kaydet
        throw new Error('RedisStore henüz implement edilmedi');
    }
    async getRoom(roomId) {
        // TODO: Redis'ten oda getir
        throw new Error('RedisStore henüz implement edilmedi');
    }
    async getAllRooms() {
        // TODO: Tüm odaları getir
        throw new Error('RedisStore henüz implement edilmedi');
    }
    async updateRoom(roomId, updates) {
        // TODO: Oda güncelle
        throw new Error('RedisStore henüz implement edilmedi');
    }
    async deleteRoom(roomId) {
        // TODO: Oda sil
        throw new Error('RedisStore henüz implement edilmedi');
    }
    async addPlayerToRoom(roomId, player) {
        // TODO: Oyuncu ekle
        throw new Error('RedisStore henüz implement edilmedi');
    }
    async removePlayerFromRoom(roomId, playerId) {
        // TODO: Oyuncu çıkar
        throw new Error('RedisStore henüz implement edilmedi');
    }
    async updateGameState(roomId, gameState) {
        // TODO: Oyun durumu güncelle
        throw new Error('RedisStore henüz implement edilmedi');
    }
    async updateDeck(roomId, deck) {
        // TODO: Deste güncelle
        throw new Error('RedisStore henüz implement edilmedi');
    }
    async clear() {
        // TODO: Tüm veriyi temizle
        throw new Error('RedisStore henüz implement edilmedi');
    }
}
