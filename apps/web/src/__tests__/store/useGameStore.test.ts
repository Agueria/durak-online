import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameStore } from '../../store/useGameStore';
import type { Card, GameState, ServerState } from '@durak/shared';

describe('useGameStore', () => {
  beforeEach(() => {
    // Her test öncesi store'u temizle
    act(() => {
      useGameStore.setState({
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
        }
      });
    });
  });

  describe('Initial State', () => {
    it('başlangıç durumu doğru', () => {
      const { result } = renderHook(() => useGameStore());
      
      expect(result.current.gameState).toBeNull();
      expect(result.current.privatePlayer).toBeNull();
      expect(result.current.players).toEqual([]);
      expect(result.current.rooms).toEqual([]);
      expect(result.current.ui.selectedCards).toEqual([]);
      expect(result.current.ui.showToast).toBe(false);
      expect(result.current.ui.isLoading).toBe(false);
    });
  });

  describe('Server State Management', () => {
    it('server state güncelleme', () => {
      const { result } = renderHook(() => useGameStore());
      
      const mockServerState: ServerState = {
        gameState: {
          roomId: 'test-room',
          playersOrder: ['p1', 'p2'],
          turn: { attackerId: 'p1', defenderId: 'p2' },
          trumpSuit: 'H',
          deckCount: 20,
          discardCount: 0,
          table: [],
          phase: 'attacking',
          lastActionAt: Date.now(),
          settings: { allowReinforceFromOthers: false, useJokers: false, deckSize: '36' }
        },
        privatePlayer: {
          id: 'p1',
          nickname: 'Player1',
          handCount: 6,
          isConnected: true,
          hand: [
            { id: 'S-6', suit: 'S', rank: '6' },
            { id: 'H-7', suit: 'H', rank: '7' }
          ]
        },
        players: [
          { id: 'p1', nickname: 'Player1', handCount: 6, isConnected: true },
          { id: 'p2', nickname: 'Player2', handCount: 6, isConnected: true }
        ]
      };

      act(() => {
        result.current.setServerState(mockServerState);
      });

      expect(result.current.gameState).toEqual(mockServerState.gameState);
      expect(result.current.privatePlayer).toEqual(mockServerState.privatePlayer);
      expect(result.current.players).toEqual(mockServerState.players);
    });

    it('hata durumu yönetimi', () => {
      const { result } = renderHook(() => useGameStore());
      
      const mockError = {
        code: 'TEST_ERROR',
        message: 'Test hata mesajı'
      };

      act(() => {
        result.current.setError(mockError);
      });

      expect(result.current.ui.showToast).toBe(true);
      expect(result.current.ui.toastMessage).toBe('Test hata mesajı');
      expect(result.current.ui.toastType).toBe('error');
    });
  });

  describe('Card Selection', () => {
    const mockCard1: Card = { id: 'S-6', suit: 'S', rank: '6' };
    const mockCard2: Card = { id: 'H-7', suit: 'H', rank: '7' };

    it('kart seçme', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.selectCard(mockCard1);
      });

      expect(result.current.ui.selectedCards).toContain(mockCard1);
      expect(result.current.getSelectedCardIds()).toContain('S-6');
    });

    it('çoklu kart seçme', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.selectCard(mockCard1);
        result.current.selectCard(mockCard2);
      });

      expect(result.current.ui.selectedCards).toHaveLength(2);
      expect(result.current.ui.selectedCards).toContain(mockCard1);
      expect(result.current.ui.selectedCards).toContain(mockCard2);
    });

    it('aynı kartı tekrar seçme - değişiklik yok', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.selectCard(mockCard1);
        result.current.selectCard(mockCard1);
      });

      expect(result.current.ui.selectedCards).toHaveLength(1);
    });

    it('kart seçimini kaldırma', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.selectCard(mockCard1);
        result.current.selectCard(mockCard2);
      });

      expect(result.current.ui.selectedCards).toHaveLength(2);

      act(() => {
        result.current.deselectCard(mockCard1);
      });

      expect(result.current.ui.selectedCards).toHaveLength(1);
      expect(result.current.ui.selectedCards).toContain(mockCard2);
      expect(result.current.ui.selectedCards).not.toContain(mockCard1);
    });

    it('tüm seçimleri temizleme', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.selectCard(mockCard1);
        result.current.selectCard(mockCard2);
      });

      expect(result.current.ui.selectedCards).toHaveLength(2);

      act(() => {
        result.current.clearSelectedCards();
      });

      expect(result.current.ui.selectedCards).toHaveLength(0);
    });
  });

  describe('Toast Management', () => {
    it('toast gösterme', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.showToast('Test mesajı', 'success');
      });

      expect(result.current.ui.showToast).toBe(true);
      expect(result.current.ui.toastMessage).toBe('Test mesajı');
      expect(result.current.ui.toastType).toBe('success');
    });

    it('varsayılan toast tipi', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.showToast('Test mesajı');
      });

      expect(result.current.ui.toastType).toBe('info');
    });

    it('toast gizleme', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.showToast('Test mesajı');
      });

      expect(result.current.ui.showToast).toBe(true);

      act(() => {
        result.current.hideToast();
      });

      expect(result.current.ui.showToast).toBe(false);
    });
  });

  describe('Loading State', () => {
    it('loading durumu yönetimi', () => {
      const { result } = renderHook(() => useGameStore());

      expect(result.current.ui.isLoading).toBe(false);

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.ui.isLoading).toBe(true);

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.ui.isLoading).toBe(false);
    });
  });

  describe('Computed Values', () => {
    const setupGameState = () => {
      const mockServerState: ServerState = {
        gameState: {
          roomId: 'test-room',
          playersOrder: ['p1', 'p2'],
          turn: { attackerId: 'p1', defenderId: 'p2' },
          trumpSuit: 'H',
          deckCount: 20,
          discardCount: 0,
          table: [],
          phase: 'attacking',
          lastActionAt: Date.now(),
          settings: { allowReinforceFromOthers: false, useJokers: false, deckSize: '36' }
        },
        privatePlayer: {
          id: 'p1',
          nickname: 'Player1',
          handCount: 6,
          isConnected: true,
          hand: []
        },
        players: []
      };

      return mockServerState;
    };

    it('isMyTurn - saldıran oyuncu', () => {
      const { result } = renderHook(() => useGameStore());
      const mockState = setupGameState();

      act(() => {
        result.current.setServerState(mockState);
      });

      expect(result.current.isMyTurn()).toBe(true);
    });

    it('isMyTurn - savunan oyuncu', () => {
      const { result } = renderHook(() => useGameStore());
      const mockState = setupGameState();
      mockState.privatePlayer!.id = 'p2';

      act(() => {
        result.current.setServerState(mockState);
      });

      expect(result.current.isMyTurn()).toBe(true);
    });

    it('isMyTurn - sırada olmayan oyuncu', () => {
      const { result } = renderHook(() => useGameStore());
      const mockState = setupGameState();
      mockState.privatePlayer!.id = 'p3';

      act(() => {
        result.current.setServerState(mockState);
      });

      expect(result.current.isMyTurn()).toBe(false);
    });

    it('canAttack - saldıran oyuncu, saldırı fazı', () => {
      const { result } = renderHook(() => useGameStore());
      const mockState = setupGameState();

      act(() => {
        result.current.setServerState(mockState);
      });

      expect(result.current.canAttack()).toBe(true);
    });

    it('canAttack - savunan oyuncu, saldırı fazı', () => {
      const { result } = renderHook(() => useGameStore());
      const mockState = setupGameState();
      mockState.privatePlayer!.id = 'p2';

      act(() => {
        result.current.setServerState(mockState);
      });

      expect(result.current.canAttack()).toBe(false);
    });

    it('canDefend - savunan oyuncu, savunma fazı', () => {
      const { result } = renderHook(() => useGameStore());
      const mockState = setupGameState();
      mockState.gameState!.phase = 'defending';
      mockState.privatePlayer!.id = 'p2';

      act(() => {
        result.current.setServerState(mockState);
      });

      expect(result.current.canDefend()).toBe(true);
    });

    it('canDefend - saldıran oyuncu, savunma fazı', () => {
      const { result } = renderHook(() => useGameStore());
      const mockState = setupGameState();
      mockState.gameState!.phase = 'defending';

      act(() => {
        result.current.setServerState(mockState);
      });

      expect(result.current.canDefend()).toBe(false);
    });
  });

  describe('Rooms Management', () => {
    it('oda listesi güncelleme', () => {
      const { result } = renderHook(() => useGameStore());
      
      const mockRooms = [
        {
          id: 'room1',
          name: 'Test Odası 1',
          playerCount: 2,
          maxPlayers: 4,
          phase: 'lobby' as const,
          createdAt: Date.now()
        },
        {
          id: 'room2',
          name: 'Test Odası 2',
          playerCount: 1,
          maxPlayers: 2,
          phase: 'attacking' as const,
          createdAt: Date.now()
        }
      ];

      act(() => {
        result.current.setRooms(mockRooms);
      });

      expect(result.current.rooms).toEqual(mockRooms);
      expect(result.current.rooms).toHaveLength(2);
    });
  });
});