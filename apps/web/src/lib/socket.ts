import { io, Socket } from 'socket.io-client';
import { Events } from '@durak/shared';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

class SocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private sessionId: string | null = null;

  connect(nickname?: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      forceNew: true
    });

    this.setupEventListeners();
    
    // Session kurma
    if (nickname) {
      this.initializeSession(nickname);
    }

    return this.socket;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket bağlandı:', this.socket?.id);
      this.reconnectAttempts = 0;
      
      // Eğer session varsa yeniden bağlan
      if (this.sessionId) {
        this.socket?.emit(Events.RECONNECT, { 
          sessionId: this.sessionId 
        });
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket bağlantısı koptu:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket bağlantı hatası:', error);
      this.handleReconnect();
    });

    this.socket.on('server:connected', (data) => {
      console.log('Server bağlantısı kuruldu:', data);
    });

    this.socket.on('server:sessionCreated', (data) => {
      console.log('Session oluşturuldu:', data);
      this.sessionId = data.sessionId;
      
      // Session ID'yi localStorage'a kaydet
      if (typeof window !== 'undefined') {
        localStorage.setItem('durak_session_id', data.sessionId);
      }
    });

    this.socket.on(Events.SERVER_ERROR, (error) => {
      console.error('Server hatası:', error);
    });
  }

  private initializeSession(nickname: string) {
    if (!this.socket) return;

    // Önceki session'ı kontrol et
    const savedSessionId = typeof window !== 'undefined' 
      ? localStorage.getItem('durak_session_id') 
      : null;

    this.socket.emit(Events.RECONNECT, {
      sessionId: savedSessionId,
      nickname
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Maksimum yeniden bağlanma denemesi aşıldı');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
    
    console.log(`${delay}ms sonra yeniden bağlanma denemesi (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.socket?.connect();
    }, delay);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Event emit helper'ları
  emit(event: string, data?: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket bağlı değil, event gönderilemedi:', event);
    }
  }

  // Event listener helper'ları
  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void) {
    this.socket?.off(event, callback);
  }

  // Session bilgileri
  getSessionId(): string | null {
    return this.sessionId;
  }

  clearSession() {
    this.sessionId = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('durak_session_id');
    }
  }
}

// Singleton instance
export const socketManager = new SocketManager();
export default socketManager;