# 🃏 Durak Online

**Türkçe açıklama aşağıdadır**

## English Version

Online, multiplayer web implementation of the classic Russian card game Durak. Developed with TypeScript, React, Socket.IO and modern web technologies.

## 🎮 About the Game

Durak is one of Russia's most popular card games. Players try to get rid of all their cards, and the last remaining player becomes the "Durak" (fool).

### Basic Rules
- **Deck**: 36 cards (6, 7, 8, 9, 10, J, Q, K, A)
- **Players**: 2-6 people
- **Start**: Each player is dealt 6 cards
- **Trump**: The suit of the bottom card becomes trump
- **Goal**: Be the first player to get rid of all your cards

### Gameplay
1. **Attack**: Attacking player plays cards of the same rank
2. **Defense**: Defending player defends with higher cards or trump
3. **Turn End**: Successful defense discards cards, unsuccessful defense takes them
4. **Draw Cards**: At turn end, players draw up to 6 cards

## 🏗️ Architecture

### Monorepo Structure
```
durak-online/
├── apps/
│   ├── web/          # React + Vite frontend
│   └── server/       # Node.js + Fastify + Socket.IO backend
├── packages/
│   ├── game-engine/  # Pure TypeScript game engine
│   └── shared/       # Shared types and schemas
```

### Technology Stack
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Zustand
- **Backend**: Node.js, Fastify, Socket.IO, TypeScript
- **Game Engine**: Pure TypeScript, deterministic randomness
- **Validation**: Zod schemas
- **Testing**: Vitest (unit), Playwright (e2e)
- **Package Manager**: pnpm

## 🚀 Setup and Running

### Requirements
- Node.js 20+
- pnpm

### Quick Start
```bash
# Clone repository
git clone <repo-url>
cd durak-online

# Install dependencies
pnpm install

# Start development servers
pnpm dev
```

This command starts both web (http://localhost:5173) and server (http://localhost:3001) applications.

### Running Separately
```bash
# Server only
pnpm -C apps/server dev

# Web only
pnpm -C apps/web dev
```

### Production Build
```bash
# Build all applications
pnpm build

# Start server
pnpm -C apps/server start
```

## 🧪 Testing

### Unit Tests
```bash
# Run all tests
pnpm test

# Game engine tests only
pnpm -C packages/game-engine test

# Server tests only
pnpm -C apps/server test
```

### E2E Tests
```bash
# Playwright tests
pnpm -C apps/web test:e2e
```

## 🎯 Features

### ✅ Available Features
- [x] Real-time multiplayer gameplay
- [x] Room creation and joining
- [x] Basic Durak rules
- [x] Attack and defense mechanics
- [x] Trump system
- [x] Automatic card drawing
- [x] Player connection status tracking
- [x] Session management and reconnect
- [x] Responsive design
- [x] Anti-cheat (seeded shuffle)

### 🔄 In Development
- [ ] Side card addition (3+ players)
- [ ] Chat system
- [ ] Game history
- [ ] Scoreboard
- [ ] Sound effects

### 📋 TODO
- [ ] Redis adapter (persistent data)
- [ ] 52-card deck option
- [ ] Joker support
- [ ] Turn timer
- [ ] Custom room settings
- [ ] Mobile app (React Native)

## 🔧 Development

### Code Quality
```bash
# Linting
pnpm lint

# Formatting
pnpm format
```

### Environment Variables

#### Server (.env)
```bash
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
REDIS_URL=redis://localhost:6379  # Optional
NODE_ENV=development
```

#### Web (.env)
```bash
VITE_SERVER_URL=http://localhost:3001
```

## 📡 API and Socket Events

### Client -> Server
- `client:createRoom` - Create room
- `client:joinRoom` - Join room
- `client:startGame` - Start game
- `client:playAttack` - Play attack card
- `client:playDefense` - Play defense card
- `client:take` - Take cards
- `client:endTurn` - End turn

### Server -> Client
- `server:state` - Game state
- `server:error` - Error message
- `server:lobbyRooms` - Room list

## 🚢 Deployment

### Vercel (Web)
```bash
# With Vercel CLI
vercel --prod

# Or use GitHub integration
```

### Render/Fly.io (Server)
```bash
# Dockerfile available
docker build -t durak-server .
docker run -p 3001:3001 durak-server
```

### Environment Variables (Production)
- `PORT`: Server port
- `CLIENT_ORIGIN`: Frontend URL
- `REDIS_URL`: Redis connection string (optional)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Rules
- Use TypeScript strict mode
- Follow ESLint rules
- Write tests
- Make commit messages descriptive

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

## 🎉 Acknowledgments

- Russian card game tradition for Durak rules
- Socket.IO team for real-time communication
- React and TypeScript communities

---

**Have Fun Playing! 🃏**

---

## Türkçe Versiyon

Klasik Rus kart oyunu Durak'ın çevrim içi, çok oyunculu web implementasyonu. TypeScript, React, Socket.IO ve modern web teknolojileri ile geliştirilmiştir.

## 🎮 Oyun Hakkında

Durak, Rusya'nın en popüler kart oyunlarından biridir. Oyuncular ellerindeki kartları bitirmeye çalışır, son kalan oyuncu "Durak" (aptal) olur.

### Temel Kurallar
- **Deste**: 36 kart (6, 7, 8, 9, 10, J, Q, K, A)
- **Oyuncu Sayısı**: 2-6 kişi
- **Başlangıç**: Her oyuncuya 6 kart dağıtılır
- **Koz**: Deste altındaki kartın rengi koz olur
- **Amaç**: Elindeki tüm kartları bitiren ilk oyuncu olmak

### Oynanış
1. **Saldırı**: Saldıran oyuncu aynı değerde kartlar atar
2. **Savunma**: Savunan oyuncu daha yüksek kart veya koz ile savunur
3. **Tur Sonu**: Başarılı savunmada kartlar iskartaya, başarısızda savunan alır
4. **Kart Çekme**: Tur sonunda oyuncular 6 karta tamamlanır

## 🏗️ Mimari

### Monorepo Yapısı
```
durak-online/
├── apps/
│   ├── web/          # React + Vite frontend
│   └── server/       # Node.js + Fastify + Socket.IO backend
├── packages/
│   ├── game-engine/  # Saf TypeScript oyun motoru
│   └── shared/       # Paylaşılan tipler ve şemalar
```

### Teknoloji Stack
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Zustand
- **Backend**: Node.js, Fastify, Socket.IO, TypeScript
- **Oyun Motoru**: Saf TypeScript, deterministik rastgelelik
- **Validasyon**: Zod şemaları
- **Test**: Vitest (unit), Playwright (e2e)
- **Paket Yöneticisi**: pnpm

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 20+
- pnpm

### Hızlı Başlangıç
```bash
# Depoyu klonla
git clone <repo-url>
cd durak-online

# Bağımlılıkları yükle
pnpm install

# Geliştirme sunucularını başlat
pnpm dev
```

Bu komut hem web (http://localhost:5173) hem de server (http://localhost:3001) uygulamalarını başlatır.

### Ayrı Ayrı Çalıştırma
```bash
# Sadece server
pnpm -C apps/server dev

# Sadece web
pnpm -C apps/web dev
```

### Production Build
```bash
# Tüm uygulamaları build et
pnpm build

# Server'ı başlat
pnpm -C apps/server start
```

## 🧪 Test

### Unit Testler
```bash
# Tüm testleri çalıştır
pnpm test

# Sadece game-engine testleri
pnpm -C packages/game-engine test

# Sadece server testleri  
pnpm -C apps/server test
```

### E2E Testler
```bash
# Playwright testleri
pnpm -C apps/web test:e2e
```

## 🎯 Özellikler

### ✅ Mevcut Özellikler
- [x] Gerçek zamanlı çok oyunculu oyun
- [x] Oda oluşturma ve katılma
- [x] Temel Durak kuralları
- [x] Saldırı ve savunma mekaniği
- [x] Koz sistemi
- [x] Otomatik kart çekme
- [x] Oyuncu bağlantı durumu takibi
- [x] Session yönetimi ve reconnect
- [x] Responsive tasarım
- [x] Anti-cheat (seeded shuffle)

### 🔄 Geliştirme Aşamasında
- [ ] Kenardan kart ekleme (3+ oyuncu)
- [ ] Sohbet sistemi
- [ ] Oyun geçmişi
- [ ] Skor tablosu
- [ ] Ses efektleri

### 📋 TODO
- [ ] Redis adapter (kalıcı veri)
- [ ] 52'lik deste seçeneği
- [ ] Joker desteği
- [ ] Tur zamanlayıcısı
- [ ] Özel oda ayarları
- [ ] Mobil uygulama (React Native)

## 🔧 Geliştirme

### Kod Kalitesi
```bash
# Linting
pnpm lint

# Formatting
pnpm format
```

### Environment Variables

#### Server (.env)
```bash
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
REDIS_URL=redis://localhost:6379  # Opsiyonel
NODE_ENV=development
```

#### Web (.env)
```bash
VITE_SERVER_URL=http://localhost:3001
```

## 📡 API ve Socket Events

### Client -> Server
- `client:createRoom` - Oda oluştur
- `client:joinRoom` - Odaya katıl
- `client:startGame` - Oyunu başlat
- `client:playAttack` - Saldırı kartı oyna
- `client:playDefense` - Savunma kartı oyna
- `client:take` - Kartları al
- `client:endTurn` - Turu bitir

### Server -> Client
- `server:state` - Oyun durumu
- `server:error` - Hata mesajı
- `server:lobbyRooms` - Oda listesi

## 🚢 Deployment

### Vercel (Web)
```bash
# Vercel CLI ile
vercel --prod

# Veya GitHub integration kullan
```

### Render/Fly.io (Server)
```bash
# Dockerfile mevcut
docker build -t durak-server .
docker run -p 3001:3001 durak-server
```

### Environment Variables (Production)
- `PORT`: Server portu
- `CLIENT_ORIGIN`: Frontend URL'i
- `REDIS_URL`: Redis bağlantı string'i (opsiyonel)

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

### Geliştirme Kuralları
- TypeScript strict mode kullanın
- ESLint kurallarına uyun
- Test yazın
- Commit mesajlarını açıklayıcı yapın

## 📄 Lisans

MIT License - Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🎉 Teşekkürler

- Durak oyun kuralları için Rus kart oyunu geleneği
- Socket.IO ekibi gerçek zamanlı iletişim için
- React ve TypeScript toplulukları

---

**Oyun Keyifli Olsun! 🃏**