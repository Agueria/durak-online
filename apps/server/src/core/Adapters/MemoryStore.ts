import type { GameState, PrivatePlayer, Card } from '@durak/game-engine';

export interface Room {
  id: string;
  name: string;
  maxPlayers: number;
  createdAt: number;
  gameState: GameState | null;
  players: Map<string, PrivatePlayer>;
  deck: Card[];
}

/**
 * Bellek tabanlı veri deposu - geliştirme için
 */
export class MemoryStore {
  private rooms = new Map<string, Room>();

  /**
   * Oda oluşturur
   */
  createRoom(room: Room): void {
    this.rooms.set(room.id, room);
  }

  /**
   * Oda getirir
   */
  getRoom(roomId: string): Room | null {
    return this.rooms.get(roomId) || null;
  }

  /**
   * Tüm odaları getirir
   */
  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  /**
   * Oda günceller
   */
  updateRoom(roomId: string, updates: Partial<Room>): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    Object.assign(room, updates);
    return true;
  }

  /**
   * Oda siler
   */
  deleteRoom(roomId: string): boolean {
    return this.rooms.delete(roomId);
  }

  /**
   * Oyuncuyu odaya ekler
   */
  addPlayerToRoom(roomId: string, player: PrivatePlayer): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    room.players.set(player.id, player);
    return true;
  }

  /**
   * Oyuncuyu odadan çıkarır
   */
  removePlayerFromRoom(roomId: string, playerId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    return room.players.delete(playerId);
  }

  /**
   * Oyun durumunu günceller
   */
  updateGameState(roomId: string, gameState: GameState): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    room.gameState = gameState;
    return true;
  }

  /**
   * Desteyi günceller
   */
  updateDeck(roomId: string, deck: Card[]): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    room.deck = [...deck];
    return true;
  }

  /**
   * Belleği temizler
   */
  clear(): void {
    this.rooms.clear();
  }
}