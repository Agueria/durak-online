import { z } from 'zod';
export declare const SuitSchema: z.ZodEnum<["S", "H", "D", "C"]>;
export declare const RankSchema: z.ZodEnum<["6", "7", "8", "9", "10", "J", "Q", "K", "A"]>;
export declare const GamePhaseSchema: z.ZodEnum<["lobby", "attacking", "defending", "resolve", "draw", "finished"]>;
export declare const CardSchema: z.ZodObject<{
    id: z.ZodString;
    suit: z.ZodEnum<["S", "H", "D", "C"]>;
    rank: z.ZodEnum<["6", "7", "8", "9", "10", "J", "Q", "K", "A"]>;
}, "strip", z.ZodTypeAny, {
    id: string;
    suit: "S" | "H" | "D" | "C";
    rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
}, {
    id: string;
    suit: "S" | "H" | "D" | "C";
    rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
}>;
export declare const PlayerViewSchema: z.ZodObject<{
    id: z.ZodString;
    nickname: z.ZodString;
    handCount: z.ZodNumber;
    isConnected: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    id: string;
    nickname: string;
    handCount: number;
    isConnected: boolean;
}, {
    id: string;
    nickname: string;
    handCount: number;
    isConnected: boolean;
}>;
export declare const TablePairSchema: z.ZodObject<{
    attack: z.ZodObject<{
        id: z.ZodString;
        suit: z.ZodEnum<["S", "H", "D", "C"]>;
        rank: z.ZodEnum<["6", "7", "8", "9", "10", "J", "Q", "K", "A"]>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        suit: "S" | "H" | "D" | "C";
        rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
    }, {
        id: string;
        suit: "S" | "H" | "D" | "C";
        rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
    }>;
    defense: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        suit: z.ZodEnum<["S", "H", "D", "C"]>;
        rank: z.ZodEnum<["6", "7", "8", "9", "10", "J", "Q", "K", "A"]>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        suit: "S" | "H" | "D" | "C";
        rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
    }, {
        id: string;
        suit: "S" | "H" | "D" | "C";
        rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
    }>>;
}, "strip", z.ZodTypeAny, {
    attack: {
        id: string;
        suit: "S" | "H" | "D" | "C";
        rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
    };
    defense?: {
        id: string;
        suit: "S" | "H" | "D" | "C";
        rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
    } | undefined;
}, {
    attack: {
        id: string;
        suit: "S" | "H" | "D" | "C";
        rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
    };
    defense?: {
        id: string;
        suit: "S" | "H" | "D" | "C";
        rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
    } | undefined;
}>;
export declare const GameSettingsSchema: z.ZodObject<{
    allowReinforceFromOthers: z.ZodDefault<z.ZodBoolean>;
    maxAttackCardsPerTurn: z.ZodOptional<z.ZodNumber>;
    useJokers: z.ZodDefault<z.ZodBoolean>;
    deckSize: z.ZodDefault<z.ZodEnum<["36", "52"]>>;
}, "strip", z.ZodTypeAny, {
    allowReinforceFromOthers: boolean;
    useJokers: boolean;
    deckSize: "36" | "52";
    maxAttackCardsPerTurn?: number | undefined;
}, {
    allowReinforceFromOthers?: boolean | undefined;
    maxAttackCardsPerTurn?: number | undefined;
    useJokers?: boolean | undefined;
    deckSize?: "36" | "52" | undefined;
}>;
export declare const GameStateSchema: z.ZodObject<{
    roomId: z.ZodString;
    playersOrder: z.ZodArray<z.ZodString, "many">;
    turn: z.ZodObject<{
        attackerId: z.ZodString;
        defenderId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        attackerId: string;
        defenderId: string;
    }, {
        attackerId: string;
        defenderId: string;
    }>;
    trumpSuit: z.ZodEnum<["S", "H", "D", "C"]>;
    deckCount: z.ZodNumber;
    discardCount: z.ZodNumber;
    table: z.ZodArray<z.ZodObject<{
        attack: z.ZodObject<{
            id: z.ZodString;
            suit: z.ZodEnum<["S", "H", "D", "C"]>;
            rank: z.ZodEnum<["6", "7", "8", "9", "10", "J", "Q", "K", "A"]>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            suit: "S" | "H" | "D" | "C";
            rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
        }, {
            id: string;
            suit: "S" | "H" | "D" | "C";
            rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
        }>;
        defense: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            suit: z.ZodEnum<["S", "H", "D", "C"]>;
            rank: z.ZodEnum<["6", "7", "8", "9", "10", "J", "Q", "K", "A"]>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            suit: "S" | "H" | "D" | "C";
            rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
        }, {
            id: string;
            suit: "S" | "H" | "D" | "C";
            rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
        }>>;
    }, "strip", z.ZodTypeAny, {
        attack: {
            id: string;
            suit: "S" | "H" | "D" | "C";
            rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
        };
        defense?: {
            id: string;
            suit: "S" | "H" | "D" | "C";
            rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
        } | undefined;
    }, {
        attack: {
            id: string;
            suit: "S" | "H" | "D" | "C";
            rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
        };
        defense?: {
            id: string;
            suit: "S" | "H" | "D" | "C";
            rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
        } | undefined;
    }>, "many">;
    phase: z.ZodEnum<["lobby", "attacking", "defending", "resolve", "draw", "finished"]>;
    lastActionAt: z.ZodNumber;
    winnerIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    loserId: z.ZodOptional<z.ZodString>;
    settings: z.ZodObject<{
        allowReinforceFromOthers: z.ZodDefault<z.ZodBoolean>;
        maxAttackCardsPerTurn: z.ZodOptional<z.ZodNumber>;
        useJokers: z.ZodDefault<z.ZodBoolean>;
        deckSize: z.ZodDefault<z.ZodEnum<["36", "52"]>>;
    }, "strip", z.ZodTypeAny, {
        allowReinforceFromOthers: boolean;
        useJokers: boolean;
        deckSize: "36" | "52";
        maxAttackCardsPerTurn?: number | undefined;
    }, {
        allowReinforceFromOthers?: boolean | undefined;
        maxAttackCardsPerTurn?: number | undefined;
        useJokers?: boolean | undefined;
        deckSize?: "36" | "52" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    roomId: string;
    playersOrder: string[];
    turn: {
        attackerId: string;
        defenderId: string;
    };
    trumpSuit: "S" | "H" | "D" | "C";
    deckCount: number;
    discardCount: number;
    table: {
        attack: {
            id: string;
            suit: "S" | "H" | "D" | "C";
            rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
        };
        defense?: {
            id: string;
            suit: "S" | "H" | "D" | "C";
            rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
        } | undefined;
    }[];
    phase: "lobby" | "attacking" | "defending" | "resolve" | "draw" | "finished";
    lastActionAt: number;
    settings: {
        allowReinforceFromOthers: boolean;
        useJokers: boolean;
        deckSize: "36" | "52";
        maxAttackCardsPerTurn?: number | undefined;
    };
    winnerIds?: string[] | undefined;
    loserId?: string | undefined;
}, {
    roomId: string;
    playersOrder: string[];
    turn: {
        attackerId: string;
        defenderId: string;
    };
    trumpSuit: "S" | "H" | "D" | "C";
    deckCount: number;
    discardCount: number;
    table: {
        attack: {
            id: string;
            suit: "S" | "H" | "D" | "C";
            rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
        };
        defense?: {
            id: string;
            suit: "S" | "H" | "D" | "C";
            rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
        } | undefined;
    }[];
    phase: "lobby" | "attacking" | "defending" | "resolve" | "draw" | "finished";
    lastActionAt: number;
    settings: {
        allowReinforceFromOthers?: boolean | undefined;
        maxAttackCardsPerTurn?: number | undefined;
        useJokers?: boolean | undefined;
        deckSize?: "36" | "52" | undefined;
    };
    winnerIds?: string[] | undefined;
    loserId?: string | undefined;
}>;
export declare const CreateRoomSchema: z.ZodObject<{
    name: z.ZodString;
    maxPlayers: z.ZodDefault<z.ZodNumber>;
    settings: z.ZodOptional<z.ZodObject<{
        allowReinforceFromOthers: z.ZodDefault<z.ZodBoolean>;
        maxAttackCardsPerTurn: z.ZodOptional<z.ZodNumber>;
        useJokers: z.ZodDefault<z.ZodBoolean>;
        deckSize: z.ZodDefault<z.ZodEnum<["36", "52"]>>;
    }, "strip", z.ZodTypeAny, {
        allowReinforceFromOthers: boolean;
        useJokers: boolean;
        deckSize: "36" | "52";
        maxAttackCardsPerTurn?: number | undefined;
    }, {
        allowReinforceFromOthers?: boolean | undefined;
        maxAttackCardsPerTurn?: number | undefined;
        useJokers?: boolean | undefined;
        deckSize?: "36" | "52" | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    maxPlayers: number;
    settings?: {
        allowReinforceFromOthers: boolean;
        useJokers: boolean;
        deckSize: "36" | "52";
        maxAttackCardsPerTurn?: number | undefined;
    } | undefined;
}, {
    name: string;
    settings?: {
        allowReinforceFromOthers?: boolean | undefined;
        maxAttackCardsPerTurn?: number | undefined;
        useJokers?: boolean | undefined;
        deckSize?: "36" | "52" | undefined;
    } | undefined;
    maxPlayers?: number | undefined;
}>;
export declare const JoinRoomSchema: z.ZodObject<{
    roomId: z.ZodString;
    nickname: z.ZodString;
}, "strip", z.ZodTypeAny, {
    nickname: string;
    roomId: string;
}, {
    nickname: string;
    roomId: string;
}>;
export declare const PlayAttackSchema: z.ZodObject<{
    cards: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        suit: z.ZodEnum<["S", "H", "D", "C"]>;
        rank: z.ZodEnum<["6", "7", "8", "9", "10", "J", "Q", "K", "A"]>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        suit: "S" | "H" | "D" | "C";
        rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
    }, {
        id: string;
        suit: "S" | "H" | "D" | "C";
        rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    cards: {
        id: string;
        suit: "S" | "H" | "D" | "C";
        rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
    }[];
}, {
    cards: {
        id: string;
        suit: "S" | "H" | "D" | "C";
        rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
    }[];
}>;
export declare const PlayDefenseSchema: z.ZodObject<{
    attackIndex: z.ZodNumber;
    card: z.ZodObject<{
        id: z.ZodString;
        suit: z.ZodEnum<["S", "H", "D", "C"]>;
        rank: z.ZodEnum<["6", "7", "8", "9", "10", "J", "Q", "K", "A"]>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        suit: "S" | "H" | "D" | "C";
        rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
    }, {
        id: string;
        suit: "S" | "H" | "D" | "C";
        rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
    }>;
}, "strip", z.ZodTypeAny, {
    attackIndex: number;
    card: {
        id: string;
        suit: "S" | "H" | "D" | "C";
        rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
    };
}, {
    attackIndex: number;
    card: {
        id: string;
        suit: "S" | "H" | "D" | "C";
        rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
    };
}>;
export declare const ChatMessageSchema: z.ZodObject<{
    text: z.ZodString;
}, "strip", z.ZodTypeAny, {
    text: string;
}, {
    text: string;
}>;
export declare const ServerStateSchema: z.ZodObject<{
    gameState: z.ZodObject<{
        roomId: z.ZodString;
        playersOrder: z.ZodArray<z.ZodString, "many">;
        turn: z.ZodObject<{
            attackerId: z.ZodString;
            defenderId: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            attackerId: string;
            defenderId: string;
        }, {
            attackerId: string;
            defenderId: string;
        }>;
        trumpSuit: z.ZodEnum<["S", "H", "D", "C"]>;
        deckCount: z.ZodNumber;
        discardCount: z.ZodNumber;
        table: z.ZodArray<z.ZodObject<{
            attack: z.ZodObject<{
                id: z.ZodString;
                suit: z.ZodEnum<["S", "H", "D", "C"]>;
                rank: z.ZodEnum<["6", "7", "8", "9", "10", "J", "Q", "K", "A"]>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                suit: "S" | "H" | "D" | "C";
                rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
            }, {
                id: string;
                suit: "S" | "H" | "D" | "C";
                rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
            }>;
            defense: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                suit: z.ZodEnum<["S", "H", "D", "C"]>;
                rank: z.ZodEnum<["6", "7", "8", "9", "10", "J", "Q", "K", "A"]>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                suit: "S" | "H" | "D" | "C";
                rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
            }, {
                id: string;
                suit: "S" | "H" | "D" | "C";
                rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
            }>>;
        }, "strip", z.ZodTypeAny, {
            attack: {
                id: string;
                suit: "S" | "H" | "D" | "C";
                rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
            };
            defense?: {
                id: string;
                suit: "S" | "H" | "D" | "C";
                rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
            } | undefined;
        }, {
            attack: {
                id: string;
                suit: "S" | "H" | "D" | "C";
                rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
            };
            defense?: {
                id: string;
                suit: "S" | "H" | "D" | "C";
                rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
            } | undefined;
        }>, "many">;
        phase: z.ZodEnum<["lobby", "attacking", "defending", "resolve", "draw", "finished"]>;
        lastActionAt: z.ZodNumber;
        winnerIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        loserId: z.ZodOptional<z.ZodString>;
        settings: z.ZodObject<{
            allowReinforceFromOthers: z.ZodDefault<z.ZodBoolean>;
            maxAttackCardsPerTurn: z.ZodOptional<z.ZodNumber>;
            useJokers: z.ZodDefault<z.ZodBoolean>;
            deckSize: z.ZodDefault<z.ZodEnum<["36", "52"]>>;
        }, "strip", z.ZodTypeAny, {
            allowReinforceFromOthers: boolean;
            useJokers: boolean;
            deckSize: "36" | "52";
            maxAttackCardsPerTurn?: number | undefined;
        }, {
            allowReinforceFromOthers?: boolean | undefined;
            maxAttackCardsPerTurn?: number | undefined;
            useJokers?: boolean | undefined;
            deckSize?: "36" | "52" | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        roomId: string;
        playersOrder: string[];
        turn: {
            attackerId: string;
            defenderId: string;
        };
        trumpSuit: "S" | "H" | "D" | "C";
        deckCount: number;
        discardCount: number;
        table: {
            attack: {
                id: string;
                suit: "S" | "H" | "D" | "C";
                rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
            };
            defense?: {
                id: string;
                suit: "S" | "H" | "D" | "C";
                rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
            } | undefined;
        }[];
        phase: "lobby" | "attacking" | "defending" | "resolve" | "draw" | "finished";
        lastActionAt: number;
        settings: {
            allowReinforceFromOthers: boolean;
            useJokers: boolean;
            deckSize: "36" | "52";
            maxAttackCardsPerTurn?: number | undefined;
        };
        winnerIds?: string[] | undefined;
        loserId?: string | undefined;
    }, {
        roomId: string;
        playersOrder: string[];
        turn: {
            attackerId: string;
            defenderId: string;
        };
        trumpSuit: "S" | "H" | "D" | "C";
        deckCount: number;
        discardCount: number;
        table: {
            attack: {
                id: string;
                suit: "S" | "H" | "D" | "C";
                rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
            };
            defense?: {
                id: string;
                suit: "S" | "H" | "D" | "C";
                rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
            } | undefined;
        }[];
        phase: "lobby" | "attacking" | "defending" | "resolve" | "draw" | "finished";
        lastActionAt: number;
        settings: {
            allowReinforceFromOthers?: boolean | undefined;
            maxAttackCardsPerTurn?: number | undefined;
            useJokers?: boolean | undefined;
            deckSize?: "36" | "52" | undefined;
        };
        winnerIds?: string[] | undefined;
        loserId?: string | undefined;
    }>;
    privatePlayer: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        nickname: z.ZodString;
        handCount: z.ZodNumber;
        isConnected: z.ZodBoolean;
        hand: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            suit: z.ZodEnum<["S", "H", "D", "C"]>;
            rank: z.ZodEnum<["6", "7", "8", "9", "10", "J", "Q", "K", "A"]>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            suit: "S" | "H" | "D" | "C";
            rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
        }, {
            id: string;
            suit: "S" | "H" | "D" | "C";
            rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        id: string;
        nickname: string;
        handCount: number;
        isConnected: boolean;
        hand: {
            id: string;
            suit: "S" | "H" | "D" | "C";
            rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
        }[];
    }, {
        id: string;
        nickname: string;
        handCount: number;
        isConnected: boolean;
        hand: {
            id: string;
            suit: "S" | "H" | "D" | "C";
            rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
        }[];
    }>>;
    players: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        nickname: z.ZodString;
        handCount: z.ZodNumber;
        isConnected: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        id: string;
        nickname: string;
        handCount: number;
        isConnected: boolean;
    }, {
        id: string;
        nickname: string;
        handCount: number;
        isConnected: boolean;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    gameState: {
        roomId: string;
        playersOrder: string[];
        turn: {
            attackerId: string;
            defenderId: string;
        };
        trumpSuit: "S" | "H" | "D" | "C";
        deckCount: number;
        discardCount: number;
        table: {
            attack: {
                id: string;
                suit: "S" | "H" | "D" | "C";
                rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
            };
            defense?: {
                id: string;
                suit: "S" | "H" | "D" | "C";
                rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
            } | undefined;
        }[];
        phase: "lobby" | "attacking" | "defending" | "resolve" | "draw" | "finished";
        lastActionAt: number;
        settings: {
            allowReinforceFromOthers: boolean;
            useJokers: boolean;
            deckSize: "36" | "52";
            maxAttackCardsPerTurn?: number | undefined;
        };
        winnerIds?: string[] | undefined;
        loserId?: string | undefined;
    };
    players: {
        id: string;
        nickname: string;
        handCount: number;
        isConnected: boolean;
    }[];
    privatePlayer?: {
        id: string;
        nickname: string;
        handCount: number;
        isConnected: boolean;
        hand: {
            id: string;
            suit: "S" | "H" | "D" | "C";
            rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
        }[];
    } | undefined;
}, {
    gameState: {
        roomId: string;
        playersOrder: string[];
        turn: {
            attackerId: string;
            defenderId: string;
        };
        trumpSuit: "S" | "H" | "D" | "C";
        deckCount: number;
        discardCount: number;
        table: {
            attack: {
                id: string;
                suit: "S" | "H" | "D" | "C";
                rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
            };
            defense?: {
                id: string;
                suit: "S" | "H" | "D" | "C";
                rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
            } | undefined;
        }[];
        phase: "lobby" | "attacking" | "defending" | "resolve" | "draw" | "finished";
        lastActionAt: number;
        settings: {
            allowReinforceFromOthers?: boolean | undefined;
            maxAttackCardsPerTurn?: number | undefined;
            useJokers?: boolean | undefined;
            deckSize?: "36" | "52" | undefined;
        };
        winnerIds?: string[] | undefined;
        loserId?: string | undefined;
    };
    players: {
        id: string;
        nickname: string;
        handCount: number;
        isConnected: boolean;
    }[];
    privatePlayer?: {
        id: string;
        nickname: string;
        handCount: number;
        isConnected: boolean;
        hand: {
            id: string;
            suit: "S" | "H" | "D" | "C";
            rank: "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
        }[];
    } | undefined;
}>;
export declare const ServerErrorSchema: z.ZodObject<{
    code: z.ZodString;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
    message: string;
}, {
    code: string;
    message: string;
}>;
export declare const RoomSummarySchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    playerCount: z.ZodNumber;
    maxPlayers: z.ZodNumber;
    phase: z.ZodEnum<["lobby", "attacking", "defending", "resolve", "draw", "finished"]>;
    createdAt: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: string;
    phase: "lobby" | "attacking" | "defending" | "resolve" | "draw" | "finished";
    name: string;
    maxPlayers: number;
    playerCount: number;
    createdAt: number;
}, {
    id: string;
    phase: "lobby" | "attacking" | "defending" | "resolve" | "draw" | "finished";
    name: string;
    maxPlayers: number;
    playerCount: number;
    createdAt: number;
}>;
export declare const LobbyRoomsSchema: z.ZodObject<{
    rooms: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        playerCount: z.ZodNumber;
        maxPlayers: z.ZodNumber;
        phase: z.ZodEnum<["lobby", "attacking", "defending", "resolve", "draw", "finished"]>;
        createdAt: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: string;
        phase: "lobby" | "attacking" | "defending" | "resolve" | "draw" | "finished";
        name: string;
        maxPlayers: number;
        playerCount: number;
        createdAt: number;
    }, {
        id: string;
        phase: "lobby" | "attacking" | "defending" | "resolve" | "draw" | "finished";
        name: string;
        maxPlayers: number;
        playerCount: number;
        createdAt: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    rooms: {
        id: string;
        phase: "lobby" | "attacking" | "defending" | "resolve" | "draw" | "finished";
        name: string;
        maxPlayers: number;
        playerCount: number;
        createdAt: number;
    }[];
}, {
    rooms: {
        id: string;
        phase: "lobby" | "attacking" | "defending" | "resolve" | "draw" | "finished";
        name: string;
        maxPlayers: number;
        playerCount: number;
        createdAt: number;
    }[];
}>;
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
