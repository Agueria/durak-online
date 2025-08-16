import { CreateRoomSchema, Events, LobbyRoomsSchema } from '@durak/shared';
/**
 * Lobby ile ilgili socket event handler'ları
 */
export function setupLobbyHandlers(socket, sessionManager, roomManager) {
    /**
     * Oda oluşturma
     */
    socket.on(Events.CLIENT_CREATE_ROOM, (data) => {
        try {
            const session = sessionManager.getSessionBySocket(socket.id);
            if (!session) {
                socket.emit(Events.SERVER_ERROR, {
                    code: 'NO_SESSION',
                    message: 'Oturum bulunamadı'
                });
                return;
            }
            const parsed = CreateRoomSchema.parse(data);
            const room = roomManager.createRoom(parsed.name, parsed.maxPlayers, parsed.settings);
            // Oluşturanı otomatik olarak odaya ekle
            const joinResult = roomManager.joinRoom(room.id, session);
            if (!joinResult.success) {
                socket.emit(Events.SERVER_ERROR, {
                    code: 'JOIN_FAILED',
                    message: joinResult.error || 'Odaya katılım başarısız'
                });
                return;
            }
            // Odaya katıl
            socket.join(room.id);
            // Lobby'e yeni oda listesini gönder
            broadcastLobbyRooms(socket, roomManager);
            // Oda durumunu gönder
            const serverState = roomManager.getServerState(room.id, session.playerId);
            if (serverState) {
                socket.emit(Events.SERVER_STATE, serverState);
            }
        }
        catch (error) {
            socket.emit(Events.SERVER_ERROR, {
                code: 'INVALID_DATA',
                message: 'Geçersiz veri formatı'
            });
        }
    });
    /**
     * Lobby oda listesi isteme
     */
    socket.on('client:getLobbyRooms', () => {
        const rooms = roomManager.getRoomSummaries();
        const lobbyData = LobbyRoomsSchema.parse({ rooms });
        socket.emit(Events.LOBBY_ROOMS, lobbyData);
    });
}
/**
 * Tüm lobby'deki kullanıcılara oda listesini gönderir
 */
function broadcastLobbyRooms(socket, roomManager) {
    const rooms = roomManager.getRoomSummaries();
    const lobbyData = LobbyRoomsSchema.parse({ rooms });
    socket.broadcast.emit(Events.LOBBY_ROOMS, lobbyData);
    socket.emit(Events.LOBBY_ROOMS, lobbyData);
}
