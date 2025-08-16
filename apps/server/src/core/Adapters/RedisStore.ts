import type { GameState, PrivatePlayer, Card } from '@durak/game-engine';
import type { Room } from './MemoryStore.js';

/**
 * Redis tabanlı veri deposu - TODO: İleride implement edilecek
 * Şimdilik sadece interface tanımı
 */
export class RedisStore {
  constructor(private redisUrl?: string) {
    // TODO: Redis bağlantısı kur
  }

  async createRoom(room: Room): Promise<void> {
    // TODO: Redis'e oda kaydet
    throw new Error('RedisStore henüz implement edilmedi');
  }

  async getRoom(roomId: string): Promise<Room | null> {
    // TODO: Redis'ten oda getir
    throw new Error('RedisStore henüz implement edilmedi');
  }

  async getAllRooms(): Promise<Room[]> {
    // TODO: Tüm odaları getir
    throw new Error('RedisStore henüz implement edilmedi');
  }

  async updateRoom(roomId: string, updates: Partial<Room>): Promise<boolean> {
    // TODO: Oda güncelle
    throw new Error('RedisStore henüz implement edilmedi');
  }

  async deleteRoom(roomId: string): Promise<boolean> {
    // TODO: Oda sil
    throw new Error('RedisStore henüz implement edilmedi');
  }

  async addPlayerToRoom(roomId: string, player: PrivatePlayer): Promise<boolean> {
    // TODO: Oyuncu ekle
    throw new Error('RedisStore henüz implement edilmedi');
  }

  async removePlayerFromRoom(roomId: string, playerId: string): Promise<boolean> {
    // TODO: Oyuncu çıkar
    throw new Error('RedisStore henüz implement edilmedi');
  }

  async updateGameState(roomId: string, gameState: GameState): Promise<boolean> {
    // TODO: Oyun durumu güncelle
    throw new Error('RedisStore henüz implement edilmedi');
  }

  async updateDeck(roomId: string, deck: Card[]): Promise<boolean> {
    // TODO: Deste güncelle
    throw new Error('RedisStore henüz implement edilmedi');
  }

  async clear(): Promise<void> {
    // TODO: Tüm veriyi temizle
    throw new Error('RedisStore henüz implement edilmedi');
  }
}