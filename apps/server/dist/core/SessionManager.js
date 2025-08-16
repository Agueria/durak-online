import { v4 as uuidv4 } from 'uuid';
import { RECONNECT_TIMEOUT } from '@durak/shared';
/**
 * Oyuncu oturumlarını yönetir - reconnect desteği sağlar
 */
export class SessionManager {
    sessions = new Map();
    socketToSession = new Map();
    /**
     * Yeni oturum oluşturur
     */
    createSession(socketId, nickname) {
        const sessionId = uuidv4();
        const playerId = uuidv4();
        const session = {
            id: sessionId,
            playerId,
            roomId: null,
            nickname,
            socketId,
            lastSeen: Date.now(),
            isConnected: true
        };
        this.sessions.set(sessionId, session);
        this.socketToSession.set(socketId, sessionId);
        return session;
    }
    /**
     * Mevcut oturumu yeniden bağlar
     */
    reconnectSession(sessionId, socketId) {
        const session = this.sessions.get(sessionId);
        if (!session)
            return null;
        // Timeout kontrolü
        const now = Date.now();
        if (now - session.lastSeen > RECONNECT_TIMEOUT) {
            this.sessions.delete(sessionId);
            return null;
        }
        // Eski socket bağlantısını temizle
        if (session.socketId) {
            this.socketToSession.delete(session.socketId);
        }
        // Yeni bağlantıyı kur
        session.socketId = socketId;
        session.isConnected = true;
        session.lastSeen = now;
        this.socketToSession.set(socketId, sessionId);
        return session;
    }
    /**
     * Socket ID'den oturum bulur
     */
    getSessionBySocket(socketId) {
        const sessionId = this.socketToSession.get(socketId);
        return sessionId ? this.sessions.get(sessionId) || null : null;
    }
    /**
     * Session ID'den oturum bulur
     */
    getSession(sessionId) {
        return this.sessions.get(sessionId) || null;
    }
    /**
     * Oyuncu ID'den oturum bulur
     */
    getSessionByPlayerId(playerId) {
        for (const session of this.sessions.values()) {
            if (session.playerId === playerId) {
                return session;
            }
        }
        return null;
    }
    /**
     * Socket bağlantısını keser
     */
    disconnectSocket(socketId) {
        const session = this.getSessionBySocket(socketId);
        if (session) {
            session.isConnected = false;
            session.socketId = null;
            session.lastSeen = Date.now();
            this.socketToSession.delete(socketId);
        }
        return session;
    }
    /**
     * Oturumu tamamen siler
     */
    deleteSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            if (session.socketId) {
                this.socketToSession.delete(session.socketId);
            }
            this.sessions.delete(sessionId);
        }
    }
    /**
     * Süresi dolmuş oturumları temizler
     */
    cleanupExpiredSessions() {
        const now = Date.now();
        for (const [sessionId, session] of this.sessions) {
            if (!session.isConnected && now - session.lastSeen > RECONNECT_TIMEOUT) {
                this.deleteSession(sessionId);
            }
        }
    }
    /**
     * Odadaki tüm oturumları getirir
     */
    getSessionsInRoom(roomId) {
        return Array.from(this.sessions.values())
            .filter(session => session.roomId === roomId);
    }
}
