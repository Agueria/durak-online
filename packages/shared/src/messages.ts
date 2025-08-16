// Socket.IO event adları - type-safe
export const Events = {
  // Server -> Client
  SERVER_STATE: 'server:state',
  SERVER_ERROR: 'server:error', 
  LOBBY_ROOMS: 'server:lobbyRooms',
  
  // Client -> Server - Lobby
  CLIENT_CREATE_ROOM: 'client:createRoom',
  CLIENT_JOIN_ROOM: 'client:joinRoom',
  CLIENT_LEAVE_ROOM: 'client:leaveRoom',
  CLIENT_START_GAME: 'client:startGame',
  
  // Client -> Server - Gameplay
  CLIENT_PLAY_ATTACK: 'client:playAttack',
  CLIENT_PLAY_DEFENSE: 'client:playDefense', 
  CLIENT_PASS: 'client:pass',
  CLIENT_TAKE: 'client:take',
  CLIENT_END_TURN: 'client:endTurn',
  CLIENT_CHAT: 'client:chat',
  
  // Connection
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  RECONNECT: 'reconnect'
} as const;

export type EventName = typeof Events[keyof typeof Events];