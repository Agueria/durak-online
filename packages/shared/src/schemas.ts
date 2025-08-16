import { z } from 'zod';
import { SUITS, RANKS, GAME_PHASES } from './constants.js';

// Temel tipler
export const SuitSchema = z.enum(SUITS);
export const RankSchema = z.enum(RANKS);
export const GamePhaseSchema = z.enum([
  GAME_PHASES.LOBBY,
  GAME_PHASES.ATTACKING,
  GAME_PHASES.DEFENDING, 
  GAME_PHASES.RESOLVE,
  GAME_PHASES.DRAW,
  GAME_PHASES.FINISHED
]);

export const CardSchema = z.object({
  id: z.string(),
  suit: SuitSchema,
  rank: RankSchema
});

export const PlayerViewSchema = z.object({
  id: z.string(),
  nickname: z.string(),
  handCount: z.number(),
  isConnected: z.boolean()
});

export const TablePairSchema = z.object({
  attack: CardSchema,
  defense: CardSchema.optional()
});

export const GameSettingsSchema = z.object({
  allowReinforceFromOthers: z.boolean().default(false),
  maxAttackCardsPerTurn: z.number().optional(),
  useJokers: z.boolean().default(false),
  deckSize: z.enum(['36', '52']).default('36')
});

export const GameStateSchema = z.object({
  roomId: z.string(),
  playersOrder: z.array(z.string()),
  turn: z.object({
    attackerId: z.string(),
    defenderId: z.string()
  }),
  trumpSuit: SuitSchema,
  deckCount: z.number(),
  discardCount: z.number(),
  table: z.array(TablePairSchema),
  phase: GamePhaseSchema,
  lastActionAt: z.number(),
  winnerIds: z.array(z.string()).optional(),
  loserId: z.string().optional(),
  settings: GameSettingsSchema
});

// Client -> Server event şemaları
export const CreateRoomSchema = z.object({
  name: z.string().min(1).max(50),
  maxPlayers: z.number().min(2).max(6).default(2),
  settings: GameSettingsSchema.optional()
});

export const JoinRoomSchema = z.object({
  roomId: z.string(),
  nickname: z.string().min(1).max(20)
});

export const PlayAttackSchema = z.object({
  cards: z.array(CardSchema).min(1)
});

export const PlayDefenseSchema = z.object({
  attackIndex: z.number(),
  card: CardSchema
});

export const ChatMessageSchema = z.object({
  text: z.string().min(1).max(200)
});

// Server -> Client event şemaları
export const ServerStateSchema = z.object({
  gameState: GameStateSchema,
  privatePlayer: z.object({
    id: z.string(),
    nickname: z.string(), 
    handCount: z.number(),
    isConnected: z.boolean(),
    hand: z.array(CardSchema)
  }).optional(),
  players: z.array(PlayerViewSchema)
});

export const ServerErrorSchema = z.object({
  code: z.string(),
  message: z.string()
});

export const RoomSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  playerCount: z.number(),
  maxPlayers: z.number(),
  phase: GamePhaseSchema,
  createdAt: z.number()
});

export const LobbyRoomsSchema = z.object({
  rooms: z.array(RoomSummarySchema)
});

// Type exports
export type Suit = z.infer<typeof SuitSchema>;
export type Rank = z.infer<typeof RankSchema>;
export type Card = z.infer<typeof CardSchema>;
export type PlayerView = z.infer<typeof PlayerViewSchema>;
export type TablePair = z.infer<typeof TablePairSchema>;
export type GamePhase = z.infer<typeof GamePhaseSchema>;
export type GameSettings = z.infer<typeof GameSettingsSchema>;
export type GameState = z.infer<typeof GameStateSchema>;
export type CreateRoom = z.infer<typeof CreateRoomSchema>;
export type JoinRoom = z.infer<typeof JoinRoomSchema>;
export type PlayAttack = z.infer<typeof PlayAttackSchema>;
export type PlayDefense = z.infer<typeof PlayDefenseSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ServerState = z.infer<typeof ServerStateSchema>;
export type ServerError = z.infer<typeof ServerErrorSchema>;
export type RoomSummary = z.infer<typeof RoomSummarySchema>;
export type LobbyRooms = z.infer<typeof LobbyRoomsSchema>;