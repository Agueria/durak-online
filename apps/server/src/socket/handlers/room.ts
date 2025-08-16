import { JoinRoomSchema, Events } from '@durak/shared';
import type { SessionManager } from '../../core/SessionManager.js';
import type { RoomManager } from '../../core/RoomManager.js';
import type { AppSocket } from '../index.js';

/**
 * Oda yönetimi ile ilgili socket event handler'ları
 */
export function setupRoomHandlers(
  socket: AppSocket,
  sessionManager: SessionManager,
  roomManager: RoomManager
) {

  /**
   * Odaya katılma
   */
  socket.on(Events.CLIENT_JOIN_ROOM, (data) => {
    try {
      const session = sessionManager.getSessionBySocket(socket.id);
      if (!session) {
        socket.emit(Events.SERVER_ERROR, {
          code: 'NO_SESSION',
          message: 'Oturum bulunamadı'
        });
        return;
      }

      const parsed = JoinRoomSchema.parse(data);
      
      // Nickname güncelle
      session.nickname = parsed.nickname;

      const joinResult = roomManager.joinRoom(parsed.roomId, session);
      
      if (!joinResult.success) {
        socket.emit(Events.SERVER_ERROR, {
          code: 'JOIN_FAILED',
          message: joinResult.error || 'Odaya katılım başarısız'
        });
        return;
      }

      // Socket'i odaya ekle
      socket.join(parsed.roomId);

      // Oda durumunu tüm oyunculara gönder
      broadcastRoomState(socket, roomManager, parsed.roomId);

    } catch (error) {
      socket.emit(Events.SERVER_ERROR, {
        code: 'INVALID_DATA',
        message: 'Geçersiz veri formatı'
      });
    }
  });

  /**
   * Odadan ayrılma
   */
  socket.on(Events.CLIENT_LEAVE_ROOM, () => {
    const session = sessionManager.getSessionBySocket(socket.id);
    if (!session || !session.roomId) return;

    const roomId = session.roomId;
    
    roomManager.leaveRoom(roomId, session.playerId);
    session.roomId = null;
    
    socket.leave(roomId);
    
    // Kalan oyunculara durumu bildir
    broadcastRoomState(socket, roomManager, roomId);
  });

  /**
   * Oyunu başlatma
   */
  socket.on(Events.CLIENT_START_GAME, () => {
    const session = sessionManager.getSessionBySocket(socket.id);
    if (!session || !session.roomId) {
      socket.emit(Events.SERVER_ERROR, {
        code: 'NO_ROOM',
        message: 'Odada değilsiniz'
      });
      return;
    }

    const startResult = roomManager.startGame(session.roomId, session.playerId);
    
    if (!startResult.success) {
      socket.emit(Events.SERVER_ERROR, {
        code: 'START_FAILED',
        message: startResult.error || 'Oyun başlatılamadı'
      });
      return;
    }

    // Tüm oyunculara oyun durumunu gönder
    broadcastRoomState(socket, roomManager, session.roomId);
  });

  /**
   * Sohbet mesajı
   */
  socket.on(Events.CLIENT_CHAT, (data) => {
    try {
      const session = sessionManager.getSessionBySocket(socket.id);
      if (!session || !session.roomId) return;

      // Basit sohbet - şimdilik sadece broadcast
      socket.to(session.roomId).emit('server:chat', {
        playerId: session.playerId,
        nickname: session.nickname,
        message: data.text,
        timestamp: Date.now()
      });

    } catch (error) {
      // Sohbet hatalarını sessizce yoksay
    }
  });
}

/**
 * Odadaki tüm oyunculara güncel durumu gönderir
 */
function broadcastRoomState(
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