
import type { GameState, PlayerView } from '@durak/shared';

interface TurnBarProps {
  gameState: GameState;
  players: PlayerView[];
  currentPlayerId?: string;
}

export function TurnBar({ gameState, players, currentPlayerId }: TurnBarProps) {
  const attacker = players.find(p => p.id === gameState.turn.attackerId);
  const defender = players.find(p => p.id === gameState.turn.defenderId);
  
  const getPhaseText = () => {
    switch (gameState.phase) {
      case 'lobby':
        return 'Oyun başlamayı bekliyor...';
      case 'attacking':
        return 'Saldırı Fazı';
      case 'defending':
        return 'Savunma Fazı';
      case 'resolve':
        return 'Tur Çözümleniyor...';
      case 'draw':
        return 'Kart Çekiliyor...';
      case 'finished':
        return 'Oyun Bitti!';
      default:
        return gameState.phase;
    }
  };

  const getCurrentPlayerRole = () => {
    if (!currentPlayerId) return null;
    
    if (currentPlayerId === gameState.turn.attackerId) {
      return 'Saldırıyorsunuz';
    } else if (currentPlayerId === gameState.turn.defenderId) {
      return 'Savunuyorsunuz';
    } else {
      return 'Sıranızı bekliyorsunuz';
    }
  };

  if (gameState.phase === 'lobby') {
    return (
      <div className="bg-gray-800 rounded-lg p-4 text-center">
        <div className="text-lg font-medium text-white">
          {getPhaseText()}
        </div>
        <div className="text-sm text-gray-400 mt-1">
          {players.length} oyuncu hazır
        </div>
      </div>
    );
  }

  if (gameState.phase === 'finished') {
    const winner = gameState.winnerIds?.[0];
    const loser = gameState.loserId;
    const winnerName = players.find(p => p.id === winner)?.nickname;
    const loserName = players.find(p => p.id === loser)?.nickname;

    return (
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-4 text-center">
        <div className="text-lg font-bold text-white">
          🎉 Oyun Bitti! 🎉
        </div>
        {winnerName && (
          <div className="text-sm text-white mt-1">
            Kazanan: {winnerName}
          </div>
        )}
        {loserName && (
          <div className="text-xs text-white/80 mt-1">
            Durak: {loserName}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-lg font-medium text-white">
            {getPhaseText()}
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            {attacker && (
              <div className={`px-2 py-1 rounded ${
                currentPlayerId === attacker.id ? 'bg-red-600 text-white' : 'bg-red-200 text-red-800'
              }`}>
                🗡️ {attacker.nickname}
              </div>
            )}
            
            <span className="text-gray-400">vs</span>
            
            {defender && (
              <div className={`px-2 py-1 rounded ${
                currentPlayerId === defender.id ? 'bg-blue-600 text-white' : 'bg-blue-200 text-blue-800'
              }`}>
                🛡️ {defender.nickname}
              </div>
            )}
          </div>
        </div>
        
        {currentPlayerId && (
          <div className="text-sm font-medium text-white">
            {getCurrentPlayerRole()}
          </div>
        )}
      </div>
      
      {/* Tur zamanlayıcısı - ileride eklenebilir */}
      <div className="mt-2 text-xs text-gray-400">
        Son hareket: {new Date(gameState.lastActionAt).toLocaleTimeString('tr-TR')}
      </div>
    </div>
  );
}