export declare const Events: {
    readonly SERVER_STATE: "server:state";
    readonly SERVER_ERROR: "server:error";
    readonly LOBBY_ROOMS: "server:lobbyRooms";
    readonly CLIENT_CREATE_ROOM: "client:createRoom";
    readonly CLIENT_JOIN_ROOM: "client:joinRoom";
    readonly CLIENT_LEAVE_ROOM: "client:leaveRoom";
    readonly CLIENT_START_GAME: "client:startGame";
    readonly CLIENT_PLAY_ATTACK: "client:playAttack";
    readonly CLIENT_PLAY_DEFENSE: "client:playDefense";
    readonly CLIENT_PASS: "client:pass";
    readonly CLIENT_TAKE: "client:take";
    readonly CLIENT_END_TURN: "client:endTurn";
    readonly CLIENT_CHAT: "client:chat";
    readonly CONNECTION: "connection";
    readonly DISCONNECT: "disconnect";
    readonly RECONNECT: "reconnect";
};
export type EventName = typeof Events[keyof typeof Events];
