import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { 
  GameState, 
  ServerState, 
  RoomSummary, 
  Card, 
  ServerError 
} from '@durak/shared';

interface UIState {
  selectedCards: Card[];
  showToast: boolean;
  toastMessage: string;
  toastType: 'error' | 'success' | 'info';
  isLoading: boolean;
}

interface GameStore {
  // Server state
  gameState: GameState | null;
  privatePlayer: ServerState['privatePlayer'] | null;
  players: ServerState['players'];
  
  // Lobby state
  rooms: RoomSummary[];
  
  // UI state
  ui: UIState;
  
  // Actions
  setServerState: (state: ServerState) => void;
  setRooms: (rooms: RoomSummary[]) => void;
  setError: (error: ServerError) => void;
  
  // UI actions
  selectCard: (card: Card) => void;
  deselectCard: (card: Card) => void;
  clearSelectedCards: () => void;
  showToast: (message: string, type?: 'error' | 'success' | 'info') => void;
  hideToast: () => void;
  setLoading: (loading: boolean) => void;
  
  // Computed
  isMyTurn: () => boolean;
  canAttack: () => boolean;
  canDefend: () => boolean;
  getSelectedCardIds: () => string[];
}

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    gameState: null,
    privatePlayer: null,
    players: [],
    rooms: [],
    ui: {
      selectedCards: [],
      showToast: false,
      toastMessage: '',
      toastType: 'info',
      isLoading: false
    },

    // Server state actions
    setServerState: (state: ServerState) => {
      set({
        gameState: state.gameState,
        privatePlayer: state.privatePlayer,
        players: state.players
      });
    },

    setRooms: (rooms: RoomSummary[]) => {
      set({ rooms });
    },

    setError: (error: ServerError) => {
      set(state => ({
        ui: {
          ...state.ui,
          showToast: true,
          toastMessage: error.message,
          toastType: 'error'
        }
      }));
    },

    // UI actions
    selectCard: (card: Card) => {
      set(state => {
        const isAlreadySelected = state.ui.selectedCards.some(c => c.id === card.id);
        if (isAlreadySelected) return state;

        return {
          ui: {
            ...state.ui,
            selectedCards: [...state.ui.selectedCards, card]
          }
        };
      });
    },

    deselectCard: (card: Card) => {
      set(state => ({
        ui: {
          ...state.ui,
          selectedCards: state.ui.selectedCards.filter(c => c.id !== card.id)
        }
      }));
    },

    clearSelectedCards: () => {
      set(state => ({
        ui: {
          ...state.ui,
          selectedCards: []
        }
      }));
    },

    showToast: (message: string, type: 'error' | 'success' | 'info' = 'info') => {
      set(state => ({
        ui: {
          ...state.ui,
          showToast: true,
          toastMessage: message,
          toastType: type
        }
      }));

      // Auto hide after 3 seconds
      setTimeout(() => {
        get().hideToast();
      }, 3000);
    },

    hideToast: () => {
      set(state => ({
        ui: {
          ...state.ui,
          showToast: false
        }
      }));
    },

    setLoading: (loading: boolean) => {
      set(state => ({
        ui: {
          ...state.ui,
          isLoading: loading
        }
      }));
    },

    // Computed getters
    isMyTurn: () => {
      const { gameState, privatePlayer } = get();
      if (!gameState || !privatePlayer) return false;
      
      return gameState.turn.attackerId === privatePlayer.id || 
             gameState.turn.defenderId === privatePlayer.id;
    },

    canAttack: () => {
      const { gameState, privatePlayer } = get();
      if (!gameState || !privatePlayer) return false;
      
      return gameState.phase === 'attacking' && 
             gameState.turn.attackerId === privatePlayer.id;
    },

    canDefend: () => {
      const { gameState, privatePlayer } = get();
      if (!gameState || !privatePlayer) return false;
      
      return gameState.phase === 'defending' && 
             gameState.turn.defenderId === privatePlayer.id;
    },

    getSelectedCardIds: () => {
      return get().ui.selectedCards.map(card => card.id);
    }
  }))
);

// Selector hooks for better performance
export const useGameState = () => useGameStore(state => state.gameState);
export const usePrivatePlayer = () => useGameStore(state => state.privatePlayer);
export const usePlayers = () => useGameStore(state => state.players);
export const useRooms = () => useGameStore(state => state.rooms);
export const useUI = () => useGameStore(state => state.ui);
export const useSelectedCards = () => useGameStore(state => state.ui.selectedCards);