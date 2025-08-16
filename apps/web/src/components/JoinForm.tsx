import { useState } from 'react';

interface JoinFormProps {
  onJoin: (nickname: string) => void;
  isLoading?: boolean;
  defaultNickname?: string;
}

export function JoinForm({ onJoin, isLoading = false, defaultNickname = '' }: JoinFormProps) {
  const [nickname, setNickname] = useState(defaultNickname);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedNickname = nickname.trim();
    if (trimmedNickname.length < 2) {
      alert('Nickname en az 2 karakter olmalı');
      return;
    }
    
    if (trimmedNickname.length > 20) {
      alert('Nickname en fazla 20 karakter olabilir');
      return;
    }

    onJoin(trimmedNickname);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        Durak Online'a Hoş Geldiniz
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nickname" className="block text-sm font-medium text-gray-300 mb-2">
            Oyuncu Adınız
          </label>
          <input
            type="text"
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Nickname girin..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={20}
            minLength={2}
            required
            disabled={isLoading}
            autoFocus
          />
          <div className="text-xs text-gray-400 mt-1">
            2-20 karakter arası
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isLoading || nickname.trim().length < 2}
          className="w-full btn btn-primary py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Bağlanıyor...</span>
            </div>
          ) : (
            'Oyuna Katıl'
          )}
        </button>
      </form>
      
      <div className="mt-6 text-center text-sm text-gray-400">
        <p>🃏 Klasik Durak kart oyunu</p>
        <p>👥 2-6 oyuncu • 36'lık deste</p>
      </div>
    </div>
  );
}

interface CreateRoomFormProps {
  onCreateRoom: (name: string, maxPlayers: number) => void;
  isLoading?: boolean;
}

export function CreateRoomForm({ onCreateRoom, isLoading = false }: CreateRoomFormProps) {
  const [roomName, setRoomName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = roomName.trim();
    if (trimmedName.length < 1) {
      alert('Oda adı gerekli');
      return;
    }

    onCreateRoom(trimmedName, maxPlayers);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-bold text-white mb-4">
        Yeni Oda Oluştur
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="roomName" className="block text-sm font-medium text-gray-300 mb-2">
            Oda Adı
          </label>
          <input
            type="text"
            id="roomName"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Oda adı girin..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={50}
            required
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label htmlFor="maxPlayers" className="block text-sm font-medium text-gray-300 mb-2">
            Maksimum Oyuncu Sayısı
          </label>
          <select
            id="maxPlayers"
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            <option value={2}>2 Oyuncu</option>
            <option value={3}>3 Oyuncu</option>
            <option value={4}>4 Oyuncu</option>
            <option value={5}>5 Oyuncu</option>
            <option value={6}>6 Oyuncu</option>
          </select>
        </div>
        
        <button
          type="submit"
          disabled={isLoading || roomName.trim().length < 1}
          className="w-full btn btn-primary disabled:opacity-50"
        >
          {isLoading ? 'Oluşturuluyor...' : 'Oda Oluştur'}
        </button>
      </form>
    </div>
  );
}