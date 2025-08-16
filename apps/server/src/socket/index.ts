import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { Events } from '@durak/shared';
import { SessionManager } from '../core/SessionManager.js';
import { RoomManager } from '../core/RoomManager.js';
import { setupLobbyHandlers } from './handlers/lobby.js';
import { setupRoomHandlers } from './handlers/room.js';
import { setupGameplayHandlers } from './handlers/gameplay.js';
import { env } from '../env.js';

import type { Socket } from 'socket.io';

export interface AppSocket extends Socket {
  sessionManager?: SessionManager;
}

/**
 * Socket.IO sunucusunu kurar ve event handler'ları bağlar
 */
export function setupSocketServer(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CLIENT_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  const sessionManager = new SessionManager();
  const roomManager = new RoomManager();

  // Periyodik temizlik
  setInterval(() => {
    sessionManager.cleanupExpiredSessions();
  }, 30000); // 30 saniyede bir

  io.on(Events.CONNECTION, (socket: AppSocket) => {
    console.log(`Socket bağlandı: ${socket.id}`);
    
    // SessionManager'ı socket'e ekle (handler'larda kullanım için)
    socket.sessionManager = sessionManager;

    // Bağlantı kurulduğunda session oluştur veya yeniden bağla
    handleConnection(socket, sessionManager, roomManager);

    // Event handler'ları kur
    setupLobbyHandlers(socket, sessionManager, roomManager);
    setupRoomHandlers(socket, sessionManager, roomManager);
    setupGameplayHandlers(socket, sessionManager, roomManager);

    // Bağlantı koptuğunda
    socket.on(Events.DISCONNECT, () => {
      handleDisconnection(socket, sessionManager, roomManager);
    });

    // Reconnect event'i
    socket.on(Events.RECONNECT, (data) => {
      handleReconnection(socket, sessionManager, roomManager, data);
    });
  });

  return { io, sessionManager, roomManager };
}

/**
 * Yeni bağlantı işlemi
 */
function handleConnection(
  socket: AppSocket,
  sessionManager: SessionManager,
  roomManager: RoomManager
) {
  // İlk bağlantıda geçici session oluştur
  // Gerçek session client'tan gelen verilerle kurulacak
  
  socket.emit('server:connected', {
    socketId: socket.id,
    timestamp: Date.now()
  });
}

/**
 * Bağlantı kopması işlemi
 */
function handleDisconnection(
  socket: AppSocket,
  sessionManager: SessionManager,
  roomManager: RoomManager
) {
  console.log(`Socket bağlantısı koptu: ${socket.id}`);
  
  const session = sessionManager.disconnectSocket(socket.id);
  
  if (session && session.roomId) {
    // Oyuncunun bağlantı durumunu güncelle
    roomManager.updatePlayerConnection(session.roomId, session.playerId, false);
    
    // Odadaki diğer oyunculara bildir
    socket.to(session.roomId).emit('server:playerDisconnected', {
      playerId: session.playerId,
      nickname: session.nickname
    });
  }
}

/**
 * Yeniden bağlanma işlemi
 */
function handleReconnection(
  socket: AppSocket,
  sessionManager: SessionManager,
  roomManager: RoomManager,
  data: { sessionId?: string; nickname?: string }
) {
  let session;

  if (data.sessionId) {
    // Mevcut session'ı yeniden bağla
    session = sessionManager.reconnectSession(data.sessionId, socket.id);
  }

  if (!session && data.nickname) {
    // Yeni session oluştur
    session = sessionManager.createSession(socket.id, data.nickname);
  }

  if (!session) {
    socket.emit(Events.SERVER_ERROR, {
      code: 'RECONNECT_FAILED',
      message: 'Yeniden bağlanma başarısız'
    });
    return;
  }

  // Session bilgilerini gönder
  socket.emit('server:sessionCreated', {
    sessionId: session.id,
    playerId: session.playerId,
    nickname: session.nickname
  });

  // Eğer bir odadaysa, oda durumunu gönder
  if (session.roomId) {
    socket.join(session.roomId);
    
    // Bağlantı durumunu güncelle
    roomManager.updatePlayerConnection(session.roomId, session.playerId, true);
    
    // Oyun durumunu gönder
    const serverState = roomManager.getServerState(session.roomId, session.playerId);
    if (serverState) {
      socket.emit(Events.SERVER_STATE, serverState);
    }

    // Diğer oyunculara bildir
    socket.to(session.roomId).emit('server:playerReconnected', {
      playerId: session.playerId,
      nickname: session.nickname
    });
  }
}