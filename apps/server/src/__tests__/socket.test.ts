import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Server as HTTPServer } from 'http';
import { AddressInfo } from 'net';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import Fastify from 'fastify';
import { setupSocketServer } from '../socket/index.js';
import { Events } from '@durak/shared';

describe('Socket Integration Tests - Kapsamlı', () => {
  let httpServer: HTTPServer;
  let clientSocket1: ClientSocket;
  let clientSocket2: ClientSocket;
  let clientSocket3: ClientSocket;
  let serverUrl: string;

  beforeEach(async () => {
    // Test sunucusu kur
    const fastify = Fastify({ logger: false });
    const { io } = setupSocketServer(fastify.server);
    
    httpServer = fastify.server;
    await new Promise<void>((resolve) => {
      httpServer.listen(0, () => {
        const port = (httpServer.address() as AddressInfo).port;
        serverUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  afterEach(() => {
    if (clientSocket1) clientSocket1.disconnect();
    if (clientSocket2) clientSocket2.disconnect();
    if (clientSocket3) clientSocket3.disconnect();
    if (httpServer) httpServer.close();
  });

  describe('Bağlantı ve Session Yönetimi', () => {
    it('socket bağlantısı ve session oluşturma', async () => {
      return new Promise<void>((resolve, reject) => {
        clientSocket1 = Client(serverUrl);
        
        clientSocket1.on('connect', () => {
          expect(clientSocket1.connected).toBe(true);
          clientSocket1.emit(Events.RECONNECT, { nickname: 'TestOyuncu' });
        });

        clientSocket1.on('server:sessionCreated', (data: any) => {
          expect(data.sessionId).toBeDefined();
          expect(data.playerId).toBeDefined();
          expect(data.nickname).toBe('TestOyuncu');
          resolve();
        });

        clientSocket1.on(Events.SERVER_ERROR, (error: any) => {
          reject(new Error(`Server error: ${error.message}`));
        });

        setTimeout(() => reject(new Error('Timeout')), 5000);
      });
    });

    it('geçersiz veri ile hata yönetimi', async () => {
      return new Promise<void>((resolve, reject) => {
        clientSocket1 = Client(serverUrl);
        
        clientSocket1.on('connect', () => {
          clientSocket1.emit(Events.RECONNECT, { nickname: 'TestOyuncu' });
        });

        clientSocket1.on('server:sessionCreated', () => {
          // Geçersiz oda oluşturma verisi
          clientSocket1.emit(Events.CLIENT_CREATE_ROOM, {
            name: '', // Boş isim
            maxPlayers: 10 // Geçersiz oyuncu sayısı
          });
        });

        clientSocket1.on(Events.SERVER_ERROR, (error: any) => {
          expect(error.code).toBeDefined();
          expect(error.message).toBeDefined();
          resolve();
        });

        setTimeout(() => reject(new Error('Timeout')), 5000);
      });
    });
  });

  describe('Oda Yönetimi', () => {
    it('oda oluşturma ve katılma akışı', async () => {
      let roomId: string;
      let eventsReceived = 0;

      return new Promise<void>((resolve, reject) => {
        // İlk oyuncu
        clientSocket1 = Client(serverUrl);
        
        clientSocket1.on('connect', () => {
          clientSocket1.emit(Events.RECONNECT, { nickname: 'Oyuncu1' });
        });

        clientSocket1.on('server:sessionCreated', () => {
          clientSocket1.emit(Events.CLIENT_CREATE_ROOM, {
            name: 'Test Odası',
            maxPlayers: 3
          });
        });

        clientSocket1.on(Events.SERVER_STATE, (data: any) => {
          if (data.gameState && data.gameState.phase === 'lobby') {
            roomId = data.gameState.roomId;
            eventsReceived++;
            
            // İkinci oyuncu bağlan
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

            clientSocket2.on(Events.SERVER_STATE, (data: any) => {
              if (data.players && data.players.length === 2) {
                eventsReceived++;
                
                if (eventsReceived >= 2) {
                  expect(data.gameState.phase).toBe('lobby');
                  expect(data.players.length).toBe(2);
                  expect(data.gameState.roomId).toBe(roomId);
                  resolve();
                }
              }
            });
          }
        });

        clientSocket1.on(Events.SERVER_ERROR, (error: any) => {
          reject(new Error(`Server error: ${error.message}`));
        });

        setTimeout(() => reject(new Error('Timeout')), 10000);
      });
    });

    it('dolu odaya katılma - başarısız', async () => {
      let roomId: string;

      return new Promise<void>((resolve, reject) => {
        // İlk oyuncu - 2 kişilik oda oluştur
        clientSocket1 = Client(serverUrl);
        
        clientSocket1.on('connect', () => {
          clientSocket1.emit(Events.RECONNECT, { nickname: 'Oyuncu1' });
        });

        clientSocket1.on('server:sessionCreated', () => {
          clientSocket1.emit(Events.CLIENT_CREATE_ROOM, {
            name: 'Küçük Oda',
            maxPlayers: 2
          });
        });

        clientSocket1.on(Events.SERVER_STATE, (data: any) => {
          if (data.gameState && data.gameState.phase === 'lobby') {
            roomId = data.gameState.roomId;
            
            // İkinci oyuncu
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

            clientSocket2.on(Events.SERVER_STATE, () => {
              // Üçüncü oyuncu - dolu odaya katılmaya çalış
              clientSocket3 = Client(serverUrl);
              clientSocket3.on('connect', () => {
                clientSocket3.emit(Events.RECONNECT, { nickname: 'Oyuncu3' });
              });

              clientSocket3.on('server:sessionCreated', () => {
                clientSocket3.emit(Events.CLIENT_JOIN_ROOM, {
                  roomId,
                  nickname: 'Oyuncu3'
                });
              });

              clientSocket3.on(Events.SERVER_ERROR, (error: any) => {
                expect(error.message).toContain('dolu');
                resolve();
              });
            });
          }
        });

        setTimeout(() => reject(new Error('Timeout')), 10000);
      });
    });

    it('odadan ayrılma', async () => {
      let roomId: string;

      return new Promise<void>((resolve, reject) => {
        clientSocket1 = Client(serverUrl);
        
        clientSocket1.on('connect', () => {
          clientSocket1.emit(Events.RECONNECT, { nickname: 'Oyuncu1' });
        });

        clientSocket1.on('server:sessionCreated', () => {
          clientSocket1.emit(Events.CLIENT_CREATE_ROOM, {
            name: 'Test Odası',
            maxPlayers: 2
          });
        });

        clientSocket1.on(Events.SERVER_STATE, (data: any) => {
          if (data.gameState && data.gameState.phase === 'lobby') {
            roomId = data.gameState.roomId;
            
            // Odadan ayrıl
            clientSocket1.emit(Events.CLIENT_LEAVE_ROOM);
            
            // Ayrıldıktan sonra tekrar katılmaya çalış
            setTimeout(() => {
              clientSocket1.emit(Events.CLIENT_JOIN_ROOM, {
                roomId,
                nickname: 'Oyuncu1'
              });
            }, 100);
          } else if (data.players && data.players.length === 1) {
            // Tekrar katıldı
            expect(data.players[0].nickname).toBe('Oyuncu1');
            resolve();
          }
        });

        setTimeout(() => reject(new Error('Timeout')), 5000);
      });
    });
  });

  describe('Oyun Başlatma ve Temel Akış', () => {
    it('oyun başlatma ve ilk durum kontrolü', async () => {
      let roomId: string;
      let gameStarted = false;

      return new Promise<void>((resolve, reject) => {
        clientSocket1 = Client(serverUrl);
        
        clientSocket1.on('connect', () => {
          clientSocket1.emit(Events.RECONNECT, { nickname: 'Alice' });
        });

        clientSocket1.on('server:sessionCreated', () => {
          clientSocket1.emit(Events.CLIENT_CREATE_ROOM, {
            name: 'Oyun Odası',
            maxPlayers: 2
          });
        });

        clientSocket1.on(Events.SERVER_STATE, (data: any) => {
          if (data.gameState) {
            roomId = data.gameState.roomId;
            
            if (data.gameState.phase === 'lobby' && !gameStarted) {
              // İkinci oyuncu ekle
              clientSocket2 = Client(serverUrl);
              
              clientSocket2.on('connect', () => {
                clientSocket2.emit(Events.RECONNECT, { nickname: 'Bob' });
              });

              clientSocket2.on('server:sessionCreated', () => {
                clientSocket2.emit(Events.CLIENT_JOIN_ROOM, {
                  roomId,
                  nickname: 'Bob'
                });
              });

              clientSocket2.on(Events.SERVER_STATE, (joinData: any) => {
                if (joinData.players && joinData.players.length === 2 && !gameStarted) {
                  gameStarted = true;
                  clientSocket1.emit(Events.CLIENT_START_GAME);
                }
              });
            }
            
            if (data.gameState.phase === 'attacking' && data.privatePlayer) {
              // Oyun başladı - durum kontrolleri
              expect(data.gameState.phase).toBe('attacking');
              expect(data.privatePlayer.hand.length).toBe(6);
              expect(data.gameState.trumpSuit).toMatch(/^[SHDC]$/);
              expect(data.gameState.deckCount).toBe(24); // 36 - 12 = 24
              expect(data.gameState.playersOrder.length).toBe(2);
              expect(data.gameState.turn.attackerId).toBeDefined();
              expect(data.gameState.turn.defenderId).toBeDefined();
              expect(data.players.length).toBe(2);
              resolve();
            }
          }
        });

        clientSocket1.on(Events.SERVER_ERROR, (error: any) => {
          reject(new Error(`Server error: ${error.message}`));
        });

        setTimeout(() => reject(new Error('Timeout')), 10000);
      });
    });

    it('tek oyuncuyla oyun başlatma - başarısız', async () => {
      return new Promise<void>((resolve, reject) => {
        clientSocket1 = Client(serverUrl);
        
        clientSocket1.on('connect', () => {
          clientSocket1.emit(Events.RECONNECT, { nickname: 'YalnızOyuncu' });
        });

        clientSocket1.on('server:sessionCreated', () => {
          clientSocket1.emit(Events.CLIENT_CREATE_ROOM, {
            name: 'Yalnız Oda',
            maxPlayers: 2
          });
        });

        clientSocket1.on(Events.SERVER_STATE, (data: any) => {
          if (data.gameState && data.gameState.phase === 'lobby') {
            // Tek oyuncuyla oyun başlatmaya çalış
            clientSocket1.emit(Events.CLIENT_START_GAME);
          }
        });

        clientSocket1.on(Events.SERVER_ERROR, (error: any) => {
          expect(error.message).toContain('En az 2 oyuncu');
          resolve();
        });

        setTimeout(() => reject(new Error('Timeout')), 5000);
      });
    });
  });

  describe('Oyun Mekaniği Testleri', () => {
    let roomId: string;
    let player1Data: any;
    let player2Data: any;

    const setupGame = async (): Promise<void> => {
      return new Promise<void>((resolve, reject) => {
        let gameStarted = false;
        let player1Ready = false;
        let player2Ready = false;

        clientSocket1 = Client(serverUrl);
        clientSocket1.on('connect', () => {
          clientSocket1.emit(Events.RECONNECT, { nickname: 'Alice' });
        });

        clientSocket1.on('server:sessionCreated', () => {
          clientSocket1.emit(Events.CLIENT_CREATE_ROOM, {
            name: 'Test Oyunu',
            maxPlayers: 2
          });
        });

        clientSocket1.on(Events.SERVER_STATE, (data: any) => {
          player1Data = data;
          
          if (data.gameState) {
            roomId = data.gameState.roomId;
            
            if (data.gameState.phase === 'lobby' && !gameStarted) {
              clientSocket2 = Client(serverUrl);
              clientSocket2.on('connect', () => {
                clientSocket2.emit(Events.RECONNECT, { nickname: 'Bob' });
              });

              clientSocket2.on('server:sessionCreated', () => {
                clientSocket2.emit(Events.CLIENT_JOIN_ROOM, {
                  roomId,
                  nickname: 'Bob'
                });
              });

              clientSocket2.on(Events.SERVER_STATE, (joinData: any) => {
                player2Data = joinData;
                
                if (joinData.players && joinData.players.length === 2 && !gameStarted) {
                  gameStarted = true;
                  clientSocket1.emit(Events.CLIENT_START_GAME);
                }
                
                if (joinData.gameState && joinData.gameState.phase === 'attacking') {
                  player2Ready = true;
                  if (player1Ready && player2Ready) resolve();
                }
              });
            }
            
            if (data.gameState.phase === 'attacking') {
              player1Ready = true;
              if (player1Ready && player2Ready) resolve();
            }
          }
        });

        setTimeout(() => reject(new Error('Setup timeout')), 10000);
      });
    };

    it('geçerli saldırı yapma', async () => {
      await setupGame();

      return new Promise<void>((resolve, reject) => {
        const attackerId = player1Data.gameState.turn.attackerId;
        const isPlayer1Attacker = player1Data.privatePlayer.id === attackerId;
        
        const attackerSocket = isPlayer1Attacker ? clientSocket1 : clientSocket2;
        const attackerData = isPlayer1Attacker ? player1Data : player2Data;
        
        const attackCard = attackerData.privatePlayer.hand[0];

        attackerSocket.emit(Events.CLIENT_PLAY_ATTACK, {
          cards: [attackCard]
        });

        const checkResponse = (data: any) => {
          if (data.gameState && data.gameState.phase === 'defending') {
            expect(data.gameState.table.length).toBe(1);
            expect(data.gameState.table[0].attack.id).toBe(attackCard.id);
            resolve();
          }
        };

        clientSocket1.on(Events.SERVER_STATE, checkResponse);
        clientSocket2.on(Events.SERVER_STATE, checkResponse);

        clientSocket1.on(Events.SERVER_ERROR, (error: any) => {
          reject(new Error(`Player1 error: ${error.message}`));
        });

        clientSocket2.on(Events.SERVER_ERROR, (error: any) => {
          reject(new Error(`Player2 error: ${error.message}`));
        });

        setTimeout(() => reject(new Error('Attack timeout')), 5000);
      });
    });

    it('yanlış oyuncunun saldırısı - başarısız', async () => {
      await setupGame();

      return new Promise<void>((resolve, reject) => {
        const attackerId = player1Data.gameState.turn.attackerId;
        const isPlayer1Attacker = player1Data.privatePlayer.id === attackerId;
        
        // Yanlış oyuncu (savunan) saldırı yapmaya çalışsın
        const wrongSocket = isPlayer1Attacker ? clientSocket2 : clientSocket1;
        const wrongData = isPlayer1Attacker ? player2Data : player1Data;
        
        const attackCard = wrongData.privatePlayer.hand[0];

        wrongSocket.emit(Events.CLIENT_PLAY_ATTACK, {
          cards: [attackCard]
        });

        wrongSocket.on(Events.SERVER_ERROR, (error: any) => {
          expect(error.message).toContain('sırası sizde değil');
          resolve();
        });

        setTimeout(() => reject(new Error('Wrong attack timeout')), 5000);
      });
    });

    it('kartları alma akışı', async () => {
      await setupGame();

      return new Promise<void>((resolve, reject) => {
        const attackerId = player1Data.gameState.turn.attackerId;
        const defenderId = player1Data.gameState.turn.defenderId;
        const isPlayer1Attacker = player1Data.privatePlayer.id === attackerId;
        
        const attackerSocket = isPlayer1Attacker ? clientSocket1 : clientSocket2;
        const defenderSocket = isPlayer1Attacker ? clientSocket2 : clientSocket1;
        const attackerData = isPlayer1Attacker ? player1Data : player2Data;
        const defenderData = isPlayer1Attacker ? player2Data : player1Data;
        
        const attackCard = attackerData.privatePlayer.hand[0];
        const initialDefenderHandSize = defenderData.privatePlayer.hand.length;

        // 1. Saldırı yap
        attackerSocket.emit(Events.CLIENT_PLAY_ATTACK, {
          cards: [attackCard]
        });

        let attackDone = false;

        const handleStateChange = (data: any) => {
          if (data.gameState && data.gameState.phase === 'defending' && !attackDone) {
            attackDone = true;
            
            // 2. Kartları al
            defenderSocket.emit(Events.CLIENT_TAKE);
          } else if (data.gameState && data.gameState.phase === 'draw' && attackDone) {
            // 3. Sonucu kontrol et
            const newDefenderData = data.privatePlayer?.id === defenderId ? data : null;
            if (newDefenderData) {
              expect(newDefenderData.privatePlayer.hand.length).toBe(initialDefenderHandSize + 1);
              expect(data.gameState.table.length).toBe(0);
              resolve();
            }
          }
        };

        clientSocket1.on(Events.SERVER_STATE, handleStateChange);
        clientSocket2.on(Events.SERVER_STATE, handleStateChange);

        clientSocket1.on(Events.SERVER_ERROR, (error: any) => {
          reject(new Error(`Player1 error: ${error.message}`));
        });

        clientSocket2.on(Events.SERVER_ERROR, (error: any) => {
          reject(new Error(`Player2 error: ${error.message}`));
        });

        setTimeout(() => reject(new Error('Take cards timeout')), 10000);
      });
    });
  });

  describe('Bağlantı Kesintisi ve Reconnect', () => {
    it('bağlantı kesintisi ve yeniden bağlanma', async () => {
      let roomId: string;
      let sessionId: string;

      return new Promise<void>((resolve, reject) => {
        clientSocket1 = Client(serverUrl);
        
        clientSocket1.on('connect', () => {
          clientSocket1.emit(Events.RECONNECT, { nickname: 'TestOyuncu' });
        });

        clientSocket1.on('server:sessionCreated', (data: any) => {
          sessionId = data.sessionId;
          
          clientSocket1.emit(Events.CLIENT_CREATE_ROOM, {
            name: 'Reconnect Test',
            maxPlayers: 2
          });
        });

        clientSocket1.on(Events.SERVER_STATE, (data: any) => {
          if (data.gameState && data.gameState.phase === 'lobby') {
            roomId = data.gameState.roomId;
            
            // Bağlantıyı kes
            clientSocket1.disconnect();
            
            // Kısa süre sonra yeniden bağlan
            setTimeout(() => {
              clientSocket1 = Client(serverUrl);
              
              clientSocket1.on('connect', () => {
                clientSocket1.emit(Events.RECONNECT, { sessionId });
              });

              clientSocket1.on(Events.SERVER_STATE, (reconnectData: any) => {
                if (reconnectData.gameState && reconnectData.gameState.roomId === roomId) {
                  expect(reconnectData.gameState.phase).toBe('lobby');
                  expect(reconnectData.players.length).toBe(1);
                  resolve();
                }
              });
            }, 500);
          }
        });

        setTimeout(() => reject(new Error('Reconnect timeout')), 10000);
      });
    });
  });
});