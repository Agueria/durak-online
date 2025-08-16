import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Events } from '@durak/shared';
import { useGameStore, useRooms } from '../store/useGameStore';
import { CreateRoomForm } from '../components/JoinForm';
import socketManager from '../lib/socket';

export function Lobby() {
  const navigate = useNavigate();
  const rooms = useRooms();
  const { setRooms, showToast, setLoading } = useGameStore();
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    // Socket event listeners
    const socket = socketManager.getSocket();
    if (!socket) return;

    const handleLobbyRooms = (data: any) => {
      setRooms(data.rooms);
    };

    const handleServerState = (data: any) => {
      // Oda oluşturuldu/katılındı, room sayfasına git
      if (data.gameState?.roomId) {
        navigate(`/room/${data.gameState.roomId}`);
      }
    };

    socket.on(Events.LOBBY_ROOMS, handleLobbyRooms);
    socket.on(Events.SERVER_STATE, handleServerState);

    // İlk oda listesini al
    socket.emit('client:getLobbyRooms');

    return () => {
      socket.off(Events.LOBBY_ROOMS, handleLobbyRooms);
      socket.off(Events.SERVER_STATE, handleServerState);
    };
  }, [setRooms, navigate]);

  const handleJoinRoom = (roomId: string) => {
    const socket = socketManager.getSocket();
    if (!socket) {
      showToast('Bağlantı hatası', 'error');
      return;
    }

    // Nickname'i localStorage'dan al veya varsayılan kullan
    const nickname = localStorage.getItem('durak_nickname') || 'Oyuncu';

    setLoading(true);
    socket.emit(Events.CLIENT_JOIN_ROOM, {
      roomId,
      nickname
    });
  };

  const handleCreateRoom = (name: string, maxPlayers: number) => {
    const socket = socketManager.getSocket();
    if (!socket) {
      showToast('Bağlantı hatası', 'error');
      return;
    }

    setLoading(true);
    socket.emit(Events.CLIENT_CREATE_ROOM, {
      name,
      maxPlayers
    });
  };

  const getPhaseText = (phase: string) => {
    switch (phase) {
      case 'lobby':
        return 'Bekliyor';
      case 'attacking':
      case 'defending':
      case 'resolve':
      case 'draw':
        return 'Oyunda';
      case 'finished':
        return 'Bitti';
      default:
        return phase;
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'lobby':
        return 'bg-yellow-600';
      case 'attacking':
      case 'defending':
      case 'resolve':
      case 'draw':
        return 'bg-green-600';
      case 'finished':
        return 'bg-gray-600';
      default:
        return 'bg-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🃏 Durak Online
          </h1>
          <p className="text-gray-400">
            Klasik Rus kart oyunu • Çevrim içi çok oyunculu
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Oda Listesi */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  Aktif Odalar ({rooms.length})
                </h2>
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="btn btn-primary"
                >
                  {showCreateForm ? 'İptal' : '+ Yeni Oda'}
                </button>
              </div>

              {showCreateForm && (
                <div className="mb-6">
                  <CreateRoomForm
                    onCreateRoom={handleCreateRoom}
                    isLoading={false}
                  />
                </div>
              )}

              {rooms.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-6xl mb-4">🎮</div>
                  <p className="text-lg mb-2">Henüz aktif oda yok</p>
                  <p className="text-sm">İlk odayı siz oluşturun!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      className="bg-gray-700 rounded-lg p-4 flex items-center justify-between hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col">
                          <h3 className="font-medium text-white">
                            {room.name}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <span>
                              👥 {room.playerCount}/{room.maxPlayers}
                            </span>
                            <span>•</span>
                            <span className={`px-2 py-1 rounded text-xs text-white ${getPhaseColor(room.phase)}`}>
                              {getPhaseText(room.phase)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400">
                          {new Date(room.createdAt).toLocaleTimeString('tr-TR')}
                        </span>
                        <button
                          onClick={() => handleJoinRoom(room.id)}
                          disabled={room.playerCount >= room.maxPlayers}
                          className="btn btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {room.playerCount >= room.maxPlayers ? 'Dolu' : 'Katıl'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Yan Panel */}
          <div className="space-y-6">
            {/* Oyun Kuralları */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                📋 Oyun Kuralları
              </h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>• 36'lık deste (6-A)</p>
                <p>• Her oyuncuya 6 kart</p>
                <p>• Koz: Deste altındaki kart</p>
                <p>• Saldırı: Aynı değerde kartlar</p>
                <p>• Savunma: Daha yüksek kart veya koz</p>
                <p>• Hedef: Elindeki kartları bitir</p>
                <p>• Son kalan oyuncu "Durak"</p>
              </div>
            </div>

            {/* İstatistikler */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                📊 İstatistikler
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Aktif Odalar:</span>
                  <span className="text-white font-medium">{rooms.length}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Toplam Oyuncu:</span>
                  <span className="text-white font-medium">
                    {rooms.reduce((sum, room) => sum + room.playerCount, 0)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Oyunda:</span>
                  <span className="text-white font-medium">
                    {rooms.filter(room => room.phase !== 'lobby' && room.phase !== 'finished').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Bağlantı Durumu */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                🔗 Bağlantı
              </h3>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  socketManager.isConnected() ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm text-gray-300">
                  {socketManager.isConnected() ? 'Bağlı' : 'Bağlantı Kesildi'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}