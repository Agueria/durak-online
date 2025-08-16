import { playAttack, playDefense, takeCards, endTurnResolve } from './actions.js';
/**
 * Tek giriş noktalı oyun durumu reducer'ı
 * Tüm oyun aksiyonları bu fonksiyon üzerinden işlenir
 */
export function gameReducer(gameState, players, deck, action) {
    try {
        switch (action.type) {
            case 'PLAY_ATTACK':
                return playAttack(gameState, players, action);
            case 'PLAY_DEFENSE':
                return playDefense(gameState, players, action);
            case 'TAKE':
                return takeCards(gameState, players, action.playerId);
            case 'END_TURN':
                return endTurnResolve(gameState, players, deck);
            case 'PASS':
                // Pas geçme - şimdilik sadece faz değişikliği
                if (gameState.phase === 'attacking') {
                    // Başka saldırı ekleyenler varsa onları bekle
                    // Şimdilik basit implementasyon
                    return { success: true, newState: gameState };
                }
                return { success: false, error: 'Pas geçilemez' };
            default:
                return { success: false, error: 'Bilinmeyen aksiyon tipi' };
        }
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Bilinmeyen hata'
        };
    }
}
/**
 * Oyun durumunu güvenli bir şekilde klonlar
 */
export function cloneGameState(gameState) {
    return JSON.parse(JSON.stringify(gameState));
}
/**
 * Oyuncu haritasını güvenli bir şekilde klonlar
 */
export function clonePlayers(players) {
    const cloned = new Map();
    for (const [id, player] of players) {
        cloned.set(id, {
            ...player,
            hand: [...player.hand]
        });
    }
    return cloned;
}
