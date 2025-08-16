import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { io as Client } from 'socket.io-client';
import Fastify from 'fastify';
import { setupSocketServer } from '../socket/index.js';
import { Events } from '@durak/shared';
describe('Socket Integration Tests', () => {
    let httpServer;
    let clientSocket1;
    let clientSocket2;
    let serverUrl;
    beforeEach(async () => {
        // Test sunucusu kur
        const fastify = Fastify();
        const { io } = setupSocketServer(fastify.server);
        httpServer = fastify.server;
        await new Promise((resolve) => {
            httpServer.listen(0, () => {
                const port = httpServer.address().port;
                serverUrl = `http://localhost:${port}`;
                resolve();
            });
        });
    });
    afterEach(() => {
        if (clientSocket1)
            clientSocket1.disconnect();
        if (clientSocket2)
            clientSocket2.disconnect();
        if (httpServer)
            httpServer.close();
    });
    it('iki oyuncu oda oluşturma ve katılma akışı', async () => {
        let roomId;
        let eventsReceived = 0;
        // İlk oyuncu
        clientSocket1 = Client(serverUrl);
        clientSocket1.on('connect', () => {
            // Session oluştur
            clientSocket1.emit(Events.RECONNECT, { nickname: 'Oyuncu1' });
        });
        clientSocket1.on('server:sessionCreated', () => {
            // Oda oluştur
            clientSocket1.emit(Events.CLIENT_CREATE_ROOM, {
                name: 'Test Odası',
                maxPlayers: 2
            });
        });
        return new Promise((resolve, reject) => {
            clientSocket1.on(Events.SERVER_STATE, (data) => {
                if (data.gameState && data.gameState.phase === 'lobby') {
                    roomId = data.gameState.roomId;
                    eventsReceived++;
                    // İkinci oyuncu bağlan
                    clientSocket2 = Client(serverUrl);
                    clientSocket2.on('connect', () => {
                        clientSocket2.emit(Events.RECONNECT, { nickname: 'Oyuncu2' });
                    });
                    clientSocket2.on('server:sessionCreated', () => {
                        // Odaya katıl
                        clientSocket2.emit(Events.CLIENT_JOIN_ROOM, {
                            roomId,
                            nickname: 'Oyuncu2'
                        });
                    });
                    clientSocket2.on(Events.SERVER_STATE, (data) => {
                        if (data.players && data.players.length === 2) {
                            eventsReceived++;
                            if (eventsReceived >= 2) {
                                expect(data.gameState.phase).toBe('lobby');
                                expect(data.players.length).toBe(2);
                                resolve();
                            }
                        }
                    });
                }
            });
            clientSocket1.on(Events.SERVER_ERROR, (error) => {
                reject(new Error(`Server error: ${error.message}`));
            });
        });
    });
    it('oyun başlatma ve temel saldırı akışı', async () => {
        let roomId;
        let gameStarted = false;
        // İlk oyuncu
        clientSocket1 = Client(serverUrl);
        clientSocket1.on('connect', () => {
            clientSocket1.emit(Events.RECONNECT, { nickname: 'Oyuncu1' });
        });
        clientSocket1.on('server:sessionCreated', () => {
            clientSocket1.emit(Events.CLIENT_CREATE_ROOM, {
                name: 'Test Oyun',
                maxPlayers: 2
            });
        });
        return new Promise((resolve, reject) => {
            clientSocket1.on(Events.SERVER_STATE, (data) => {
                if (data.gameState) {
                    roomId = data.gameState.roomId;
                    if (data.gameState.phase === 'lobby' && !gameStarted) {
                        // İkinci oyuncu ekle
                        clientSocket2 = Client(serverUrl);
                        clientSocket2.on('connect', () => {
                            clientSocket2.emit(Events.RECONNECT, { nickname: 'Oyuncu2' });
                        });
                        clientSocket2.on('server:sessionCreated', () => {
                            clientSocket2.emit(Events.CLIENT_JOIN_ROOM, {
                                roomId,
                                nickname: 'Oyuncu2'
                            });
                        });
                        clientSocket2.on(Events.SERVER_STATE, (joinData) => {
                            if (joinData.players && joinData.players.length === 2 && !gameStarted) {
                                gameStarted = true;
                                // Oyunu başlat
                                clientSocket1.emit(Events.CLIENT_START_GAME);
                            }
                        });
                    }
                    if (data.gameState.phase === 'attacking' && data.privatePlayer) {
                        // Oyun başladı, saldırı yapılabilir
                        expect(data.gameState.phase).toBe('attacking');
                        expect(data.privatePlayer.hand.length).toBe(6);
                        expect(data.gameState.trumpSuit).toMatch(/^[SHDC]$/);
                        resolve();
                    }
                }
            });
            clientSocket1.on(Events.SERVER_ERROR, (error) => {
                reject(new Error(`Server error: ${error.message}`));
            });
        });
    });
});
