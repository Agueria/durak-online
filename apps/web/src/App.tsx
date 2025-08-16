import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Events } from '@durak/shared';
import { useGameStore } from './store/useGameStore';
import { JoinForm } from './components/JoinForm';
import { ToastContainer } from './components/Toast';
import { Lobby } from './routes/lobby';
import { Room } from './routes/room/[roomId]';
import socketManager from './lib/socket';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [nickname, setNickname] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const { setError, showToast } = useGameStore();

  useEffect(() => {
    // Kaydedilmiş nickname'i kontrol et
    const savedNickname = localStorage.getItem('durak_nickname');
    if (savedNickname) {
      handleConnect(savedNickname);
    }
  }, []);

  const handleConnect = (playerNickname: string) => {
    setIsConnecting(true);
    setNickname(playerNickname);
    
    // Nickname'i kaydet
    localStorage.setItem('durak_nickname', playerNickname);

    try {
      const socket = socketManager.connect(playerNickname);

      const handleConnect = () => {
        setIsConnected(true);
        setIsConnecting(false);
        showToast(`Hoş geldiniz, ${playerNickname}!`, 'success');
      };

      const handleDisconnect = () => {
        setIsConnected(false);
        showToast('Bağlantı kesildi', 'error');
      };

      const handleConnectError = (error: any) => {
        setIsConnecting(false);
        setIsConnected(false);
        showToast('Bağlantı hatası: ' + error.message, 'error');
      };

      const handleServerError = (error: any) => {
        setError(error);
      };

      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      socket.on('connect_error', handleConnectError);
      socket.on(Events.SERVER_ERROR, handleServerError);

      // Cleanup
      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
        socket.off('connect_error', handleConnectError);
        socket.off(Events.SERVER_ERROR, handleServerError);
      };
    } catch (error) {
      setIsConnecting(false);
      showToast('Bağlantı kurulamadı', 'error');
    }
  };

  const handleDisconnect = () => {
    socketManager.disconnect();
    socketManager.clearSession();
    localStorage.removeItem('durak_nickname');
    setIsConnected(false);
    setNickname('');
  };

  // Bağlantı kurulmamışsa giriş formu göster
  if (!isConnected) {
    return (
      <ToastContainer>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <JoinForm
            onJoin={handleConnect}
            isLoading={isConnecting}
            defaultNickname={nickname}
          />
        </div>
      </ToastContainer>
    );
  }

  return (
    <ToastContainer>
      <Router>
        <div className="min-h-screen bg-gray-900">
          {/* Üst navigasyon */}
          <nav className="bg-gray-800 border-b border-gray-700 px-4 py-2">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold text-white">
                  🃏 Durak Online
                </h1>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    socketManager.isConnected() ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-gray-300">
                    {socketManager.isConnected() ? 'Bağlı' : 'Bağlantı Kesildi'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-300">
                  Hoş geldiniz, <span className="text-white font-medium">{nickname}</span>
                </span>
                <button
                  onClick={handleDisconnect}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Çıkış
                </button>
              </div>
            </div>
          </nav>

          {/* Ana içerik */}
          <Routes>
            <Route path="/" element={<Lobby />} />
            <Route path="/room/:roomId" element={<Room />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </ToastContainer>
  );
}

export default App;