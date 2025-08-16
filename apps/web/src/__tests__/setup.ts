import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Socket.IO mock
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    connected: false,
    id: 'mock-socket-id'
  }))
}));

// LocalStorage mock
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

// Environment variables mock
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_SERVER_URL: 'http://localhost:3001'
  },
  writable: true,
});