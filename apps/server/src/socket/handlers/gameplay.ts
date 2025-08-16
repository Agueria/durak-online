import { PlayAttackSchema, PlayDefenseSchema, Events } from '@durak/shared';
import { isPlayerAttacker, isPlayerDefender } from '@durak/game-engine';
import type { SessionManager } from '../../core/SessionManager.js';
import type { RoomManager } from '../../core/RoomManager.js';
import type { AppSocket } from '../index.js';

/**
 * Oyun mekaniği ile ilgili socket event handler'ları
 */
export function setupGameplayHandlers(
  socket: AppSocket,
  sessionManager: SessionManager,
  roomManager: RoomManager
) {

  /**
   * Saldırı kartı oynama
   */
  socket.on(Events.CLIENT_PLAY_ATTACK, (data) => {
    try {
      const session = sessionManager.getSessionBySocket(socket.id);
      if (!session || !session.roomId) {
        socket.emit(Events.SERVER_ERROR, {
          code: 'NO_ROOM',
          message: 'Odada değilsiniz'
        });
        return;
      }

      const parsed = PlayAttackSchema.parse(data);
      
      // Oyuncu saldırabilir mi kontrol et
      const room = roomManager.getRoom(session.roomId);
      if (!room || !room.gameState) {
        socket.emit(Events.SERVER_ERROR, {
          code: 'NO_GAME',
          message: 'Aktif oyun yok'
        });
        return;
      }

      if (!isPlayerAttacker(room.gameState, session.playerId)) {
        socket.emit(Events.SERVER_ERROR, {
          code: 'NOT_ATTACKER',
          message: 'Saldırı sırası sizde değil'
        });
        return;
      }

      // Aksiyonu işle
      const result = roomManager.processGameAction(session.roomId, {
        type: 'PLAY_ATTACK',
        playerId: session.playerId,
        payload: { cards: parsed.cards }
      });

      if (!result.success) {
        socket.emit(Events.SERVER_ERROR, {
          code: 'ATTACK_FAILED',
          message: result.error || 'Saldırı başarısız'
        });
        return;
      }

      // Tüm oyunculara güncel durumu gönder
      broadcastGameState(socket, roomManager, session.roomId);

    } catch (error) {
      socket.emit(Events.SERVER_ERROR, {
        code: 'INVALID_DATA',
        message: 'Geçersiz veri formatı'
      });
    }
  });

  /**
   * Savunma kartı oynama
   */
  socket.on(Events.CLIENT_PLAY_DEFENSE, (data) => {
    try {
      const session = sessionManager.getSessionBySocket(socket.id);
      if (!session || !session.roomId) {
        socket.emit(Events.SERVER_ERROR, {
          code: 'NO_ROOM',
          message: 'Odada değilsiniz'
        });
        return;
      }

      const parsed = PlayDefenseSchema.parse(data);
      
      // Oyuncu savunabilir mi kontrol et
      const room = roomManager.getRoom(session.roomId);
      if (!room || !room.gameState) {
        socket.emit(Events.SERVER_ERROR, {
          code: 'NO_GAME',
          message: 'Aktif oyun yok'
        });
        return;
      }

      if (!isPlayerDefender(room.gameState, session.playerId)) {
        socket.emit(Events.SERVER_ERROR, {
          code: 'NOT_DEFENDER',
          message: 'Savunma sırası sizde değil'
        });
        return;
      }

      // Aksiyonu işle
      const result = roomManager.processGameAction(session.roomId, {
        type: 'PLAY_DEFENSE',
        playerId: session.playerId,
        payload: { 
          attackIndex: parsed.attackIndex, 
          card: parsed.card 
        }
      });

      if (!result.success) {
        socket.emit(Events.SERVER_ERROR, {
          code: 'DEFENSE_FAILED',
          message: result.error || 'Savunma başarısız'
        });
        return;
      }

      // Tüm oyunculara güncel durumu gönder
      broadcastGameState(socket, roomManager, session.roomId);

    } catch (error) {
      socket.emit(Events.SERVER_ERROR, {
        code: 'INVALID_DATA',
        message: 'Geçersiz veri formatı'
      });
    }
  });

  /**
   * Kartları alma (pas geçme)
   */
  socket.on(Events.CLIENT_TAKE, () => {
    const session = sessionManager.getSessionBySocket(socket.id);
    if (!session || !session.roomId) {
      socket.emit(Events.SERVER_ERROR, {
        code: 'NO_ROOM',
        message: 'Odada değilsiniz'
      });
      return;
    }

    const room = roomManager.getRoom(session.roomId);
    if (!room || !room.gameState) {
      socket.emit(Events.SERVER_ERROR, {
        code: 'NO_GAME',
        message: 'Aktif oyun yok'
      });
      return;
    }

    if (!isPlayerDefender(room.gameState, session.playerId)) {
      socket.emit(Events.SERVER_ERROR, {
        code: 'NOT_DEFENDER',
        message: 'Savunma sırası sizde değil'
      });
      return;
    }

    // Kartları al aksiyonu
    const result = roomManager.processGameAction(session.roomId, {
      type: 'TAKE',
      playerId: session.playerId
    });

    if (!result.success) {
      socket.emit(Events.SERVER_ERROR, {
        code: 'TAKE_FAILED',
        message: result.error || 'Kartları alma başarısız'
      });
      return;
    }

    // Tüm oyunculara güncel durumu gönder
    broadcastGameState(socket, roomManager, session.roomId);
  });

  /**
   * Turu bitirme
   */
  socket.on(Events.CLIENT_END_TURN, () => {
    const session = sessionManager.getSessionBySocket(socket.id);
    if (!session || !session.roomId) {
      socket.emit(Events.SERVER_ERROR, {
        code: 'NO_ROOM',
        message: 'Odada değilsiniz'
      });
      return;
    }

    const room = roomManager.getRoom(session.roomId);
    if (!room || !room.gameState) {
      socket.emit(Events.SERVER_ERROR, {
        code: 'NO_GAME',
        message: 'Aktif oyun yok'
      });
      return;
    }

    if (!isPlayerAttacker(room.gameState, session.playerId)) {
      socket.emit(Events.SERVER_ERROR, {
        code: 'NOT_ATTACKER',
        message: 'Tur bitirme hakkınız yok'
      });
      return;
    }

    // Turu bitir
    const result = roomManager.processGameAction(session.roomId, {
      type: 'END_TURN',
      playerId: session.playerId
    });

    if (!result.success) {
      socket.emit(Events.SERVER_ERROR, {
        code: 'END_TURN_FAILED',
        message: result.error || 'Tur bitirilemedi'
      });
      return;
    }

    // Tüm oyunculara güncel durumu gönder
    broadcastGameState(socket, roomManager, session.roomId);
  });

  /**
   * Pas geçme
   */
  socket.on(Events.CLIENT_PASS, () => {
    const session = sessionManager.getSessionBySocket(socket.id);
    if (!session || !session.roomId) return;

    // Şimdilik basit pas - sadece bilgilendirme
    socket.to(session.roomId).emit('server:playerPassed', {
      playerId: session.playerId,
      nickname: session.nickname
    });
  });
}

/**
 * Odadaki tüm oyunculara oyun durumunu gönderir
 */
function broadcastGameState(
  socket: AppSocket,
  roomManager: RoomManager,
  roomId: string
) {
  const room = roomManager.getRoom(roomId);
  if (!room) return;

  // Her oyuncuya kendi özel durumunu gönder
  for (const playerId of room.players.keys()) {
    const serverState = roomManager.getServerState(roomId, playerId);
    if (serverState) {
      // Oyuncunun socket'ini bul ve gönder
      socket.to(roomId).emit(Events.SERVER_STATE, serverState);
    }
  }

  // Kendi durumunu da gönder
  const session = socket.sessionManager?.getSessionBySocket(socket.id);
  if (session) {
    const serverState = roomManager.getServerState(roomId, session.playerId);
    if (serverState) {
      socket.emit(Events.SERVER_STATE, serverState);
    }
  }
}