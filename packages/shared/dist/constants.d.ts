export declare const SUITS: readonly ["S", "H", "D", "C"];
export declare const RANKS: readonly ["6", "7", "8", "9", "10", "J", "Q", "K", "A"];
export declare const RANK_VALUES: Record<string, number>;
export declare const GAME_PHASES: {
    readonly LOBBY: "lobby";
    readonly ATTACKING: "attacking";
    readonly DEFENDING: "defending";
    readonly RESOLVE: "resolve";
    readonly DRAW: "draw";
    readonly FINISHED: "finished";
};
export declare const MAX_PLAYERS = 6;
export declare const MIN_PLAYERS = 2;
export declare const INITIAL_HAND_SIZE = 6;
export declare const DECK_SIZE_36 = 36;
export declare const RECONNECT_TIMEOUT = 60000;
