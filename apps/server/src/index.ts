import Fastify from 'fastify';
import { setupSocketServer } from './socket/index.js';
import { env } from './env.js';

/**
 * Ana server uygulaması
 */
async function startServer() {
  const fastify = Fastify({
    logger: env.NODE_ENV === 'development'
  });

  // CORS ayarları
  await fastify.register(import('@fastify/cors'), {
    origin: env.CLIENT_ORIGIN,
    credentials: true
  });

  // Health check endpoint
  fastify.get('/health', async () => {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      env: env.NODE_ENV
    };
  });

  // API bilgileri
  fastify.get('/api/info', async () => {
    return {
      name: 'Durak Online Server',
      version: '1.0.0',
      description: 'Çevrim içi Durak kart oyunu sunucusu'
    };
  });

  // Socket.IO sunucusunu kur
  const { io } = setupSocketServer(fastify.server);

  // Graceful shutdown
  const gracefulShutdown = async (signal: string) => {
    console.log(`${signal} sinyali alındı, sunucu kapatılıyor...`);
    
    try {
      io.close();
      await fastify.close();
      console.log('Sunucu başarıyla kapatıldı');
      process.exit(0);
    } catch (error) {
      console.error('Sunucu kapatılırken hata:', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Sunucuyu başlat
  try {
    await fastify.listen({ 
      port: env.PORT, 
      host: '0.0.0.0' // Deployment için gerekli
    });
    
    console.log(`🚀 Server çalışıyor:`);
    console.log(`   HTTP: http://localhost:${env.PORT}`);
    console.log(`   WebSocket: ws://localhost:${env.PORT}`);
    console.log(`   Environment: ${env.NODE_ENV}`);
    console.log(`   Client Origin: ${env.CLIENT_ORIGIN}`);
    
  } catch (error) {
    console.error('Sunucu başlatılamadı:', error);
    process.exit(1);
  }
}

// Hata yakalama
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Sunucuyu başlat
startServer();