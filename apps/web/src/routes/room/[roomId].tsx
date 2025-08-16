import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Events } from '@durak/shared';
import { useGameStore, useGameState, usePrivatePlayer, usePlayers, useSelectedCards } from '../../store/useGameStore';
import { Table, TableStats } from '../../components/Table';
import { Hand, OpponentHand } from '../../components/Hand';
import { TrumpBadge, TrumpCard } from '../../components/TrumpBadge';
import { TurnBar } from '../../components/TurnBar';
import socketManager from '../../lib/socket';

export function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  
  const gameState = useGameState();
  const privatePlayer = usePrivatePlayer();
  const players = usePlayers();
  const selectedCards = useSelectedCards();
  
  const { 
    setServerState, 
    setError, 
    clearSelectedCards, 
    showToast,
    canAttack,
    canDefend
  } = useGameStore();
  
  const [selectedAttackIndex, setSelectedAttackIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!roomId) {
      navigate('/');
      return;
    }

    const socket = socketManager.getSocket();
    if (!socket) {
      navigate('/');
      return;
    }

    // Socket event listeners
    const handleServerState = (data: any) => {
      setServerState(data);
    };

    const handleServerError = (error: any) => {
      setError(error);
    };

    socket.on(Events.SERVER_STATE, handleServerState);
    socket.on(Events.SERVER_ERROR, handleServerError);

    return () => {
      socket.off(Events.SERVER_STATE, handleServerState);
      socket.off(Events.SERVER_ERROR, handleServerError);
    };
  }, [roomId, navigate, setServerState, setError]);

  const handleStartGame = () => {
    const socket = socketManager.getSocket();
    if (!socket) return;

    socket.emit(Events.CLIENT_START_GAME);
  };

  const handlePlayAttack = () => {
    if (selectedCards.length === 0) {
      showToast('Saldırı için kart seçin', 'error');
      return;
    }

    const socket = socketManager.getSocket();
    if (!socket) return;

    socket.emit(Events.CLIENT_PLAY_ATTACK, {
      cards: selectedCards
    });

    clearSelectedCards();
  };

  const handlePlayDefense = () => {
    if (selectedCards.length !== 1) {
      showToast('Savunma için tek kart seçin', 'error');
      return;
    }

    if (selectedAttackIndex === null) {
      showToast('Savunulacak saldırıyı seçin', 'error');
      return;
    }

    const socket = socketManager.getSocket();
    if (!socket) return;

    socket.emit(Events.CLIENT_PLAY_DEFENSE, {
      attackIndex: selectedAttackIndex,
      card: selectedCards[0]
    });

    clearSelectedCards();
    setSelectedAttackIndex(null);
  };

  const handleTakeCards = () => {
    const socket = socketManager.getSocket();
    if (!socket) return;

    socket.emit(Events.CLIENT_TAKE);
  };

  const handleEndTurn = () => {
    const socket = socketManager.getSocket();
    if (!socket) return;

    socket.emit(Events.CLIENT_END_TURN);
  };

  const handleLeaveRoom = () => {
    const socket = socketManager.getSocket();
    if (!socket) return;

    socket.emit(Events.CLIENT_LEAVE_ROOM);
    navigate('/');
  };

  const handleAttackCardClick = (index: number) => {
    if (canDefend()) {
      setSelectedAttackIndex(index);
      showToast(`${index + 1}. saldırı seçildi`, 'info');
    }
  };

  // Oyun durumu kontrolü
  if (!gameState) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Oyun yükleniyor...</div>
      </div>
    );
  }

  // Lobby durumu
  if (gameState.phase === 'lobby') {
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-white">
                Oda: {roomId}
              </h1>
              <button
                onClick={handleLeaveRoom}
                className="btn btn-secondary"
              >
                Odadan Ayrıl
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Oyuncular */}
              <div>
                <h2 className="text-lg font-bold text-white mb-4">
                  Oyuncular ({players.length})
                </h2>
                <div className="space-y-2">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className={`p-3 rounded-lg flex items-center justify-between ${
                        player.id === privatePlayer?.id 
                          ? 'bg-blue-600' 
                          : 'bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">
                          {player.nickname}
                        </span>
                        {player.id === privatePlayer?.id && (
                          <span className="text-xs bg-blue-500 px-2 py-1 rounded">
                            Siz
                          </span>
                        )}
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        player.isConnected ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Oyun Ayarları */}
              <div>
                <h2 className="text-lg font-bold text-white mb-4">
                  Oyun Ayarları
                </h2>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>🃏 Deste: 36 kart (6-A)</p>
                  <p>👥 Oyuncu: {players.length}/6</p>
                  <p>⚡ Hızlı oyun modu</p>
                </div>

                {players.length >= 2 && (
                  <button
                    onClick={handleStartGame}
                    className="btn btn-success w-full mt-4"
                  >
                    Oyunu Başlat
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Ana oyun ekranı
  const opponents = players.filter(p => p.id !== privatePlayer?.id);

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Üst Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLeaveRoom}
              className="btn btn-secondary btn-sm"
            >
              ← Ayrıl
            </button>
            <h1 className="text-xl font-bold text-white">
              Durak Online
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <TrumpBadge trumpSuit={gameState.trumpSuit} />
            <TableStats 
              deckCount={gameState.deckCount}
              discardCount={gameState.discardCount}
            />
          </div>
        </div>

        {/* Tur Bilgisi */}
        <div className="mb-4">
          <TurnBar 
            gameState={gameState}
            players={players}
            currentPlayerId={privatePlayer?.id}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Sol Panel - Rakipler */}
          <div className="space-y-4">
            {opponents.map((opponent) => (
              <OpponentHand
                key={opponent.id}
                cardCount={opponent.handCount}
                playerName={opponent.nickname}
                isConnected={opponent.isConnected}
              />
            ))}
          </div>

          {/* Merkez - Masa */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Table
                pairs={gameState.table}
                onAttackCardClick={handleAttackCardClick}
                canDefend={canDefend()}
              />
              
              {/* Koz kartı */}
              {gameState.deckCount > 0 && (
                <div className="absolute top-4 right-4">
                  <TrumpCard trumpSuit={gameState.trumpSuit} />
                </div>
              )}
            </div>
          </div>

          {/* Sağ Panel - Kontroller */}
          <div className="space-y-4">
            {/* Aksiyon Butonları */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-bold text-white mb-4">Aksiyonlar</h3>
              
              <div className="space-y-2">
                {canAttack() && (
                  <button
                    onClick={handlePlayAttack}
                    disabled={selectedCards.length === 0}
                    className="btn btn-danger w-full disabled:opacity-50"
                  >
                    🗡️ Saldır ({selectedCards.length})
                  </button>
                )}

                {canDefend() && (
                  <>
                    <button
                      onClick={handlePlayDefense}
                      disabled={selectedCards.length !== 1 || selectedAttackIndex === null}
                      className="btn btn-primary w-full disabled:opacity-50"
                    >
                      🛡️ Savun
                    </button>
                    <button
                      onClick={handleTakeCards}
                      className="btn btn-secondary w-full"
                    >
                      📥 Kartları Al
                    </button>
                  </>
                )}

                {canAttack() && gameState.table.length > 0 && (
                  <button
                    onClick={handleEndTurn}
                    className="btn btn-success w-full"
                  >
                    ✅ Turu Bitir
                  </button>
                )}
              </div>
            </div>

            {/* Seçili Kartlar */}
            {selectedCards.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-bold text-white mb-2">
                  Seçili Kartlar ({selectedCards.length})
                </h3>
                <div className="flex flex-wrap gap-1">
                  {selectedCards.map((card) => (
                    <div key={card.id} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                      {card.rank}{card.suit}
                    </div>
                  ))}
                </div>
                <button
                  onClick={clearSelectedCards}
                  className="btn btn-secondary btn-sm w-full mt-2"
                >
                  Temizle
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Alt - Oyuncunun Eli */}
        <div className="mt-6">
          <div className="bg-gray-800 rounded-lg">
            <div className="p-2 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">
                  {privatePlayer?.nickname} - {privatePlayer?.handCount} kart
                </span>
                {selectedCards.length > 0 && (
                  <span className="text-sm text-blue-400">
                    {selectedCards.length} kart seçili
                  </span>
                )}
              </div>
            </div>
            
            <Hand
              cards={privatePlayer?.hand || []}
              canPlay={canAttack() || canDefend()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}