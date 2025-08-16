export const SUITS = ['S', 'H', 'D', 'C'];
export const RANKS = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
export const RANK_VALUES = {
    '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14
};
export const GAME_PHASES = {
    LOBBY: 'lobby',
    ATTACKING: 'attacking',
    DEFENDING: 'defending',
    RESOLVE: 'resolve',
    DRAW: 'draw',
    FINISHED: 'finished'
};
export const MAX_PLAYERS = 6;
export const MIN_PLAYERS = 2;
export const INITIAL_HAND_SIZE = 6;
export const DECK_SIZE_36 = 36;
export const RECONNECT_TIMEOUT = 60000; // 60 saniye
