/**
 * Game State & Rules Engine Types
 */

import { Card } from "./Card";

export interface PlayerState {
  playerId: string;
  name: string;
  health: number;
  maxHealth: number;
  currentMana: number;
  maxManaPerTurn: number;
  cardsInHand: Card[];
  cardsInPlay: BoardCard[];
  cardsInDeck: Card[];
  cardsInGraveyard: Card[];
  damageThisTurn: number;
  resources: {
    dustCrafting: number;
    crystals: number;
  };
}

export interface BoardCard {
  instanceId: string;
  card: Card;
  currentAttack: number;
  currentDefense: number;
  remainingHealth: number;
  manaLocked: boolean;
  buffs: CardBuff[];
  debuffs: CardDebuff[];
}

export interface CardBuff {
  id: string;
  effect: string;
  value: number;
  duration: "permanent" | "until_end_of_turn" | "n_turns";
  turnsRemaining?: number;
  applicator: string;
}

export interface CardDebuff {
  id: string;
  effect: string;
  value: number;
  duration: "permanent" | "until_end_of_turn" | "n_turns";
  turnsRemaining?: number;
  applicator: string;
}

export type GamePhase = 
  | "setup" 
  | "player1_turn" 
  | "player2_turn" 
  | "battle_phase" 
  | "end_phase" 
  | "game_over";

export interface GameState {
  gameId: string;
  players: Map<string, PlayerState>;
  currentPlayerTurn: string;
  currentPhase: GamePhase;
  turnsPlayed: number;
  history: GameAction[];
  manaAccumulated: Map<string, number>;
  stackedEffects: TriggerStack[];
  startedAt: string;
  updatedAt: string;
}

export interface TriggerStack {
  sourceCard: Card;
  triggeredAbility: string;
  targetPlayerId?: string;
  targetCardInstanceId?: string;
  priority: number;
}

export type ActionType =
  | "play_card"
  | "attack"
  | "activate_ability"
  | "end_turn"
  | "mulligan"
  | "concede"
  | "fusion_combine";

export interface GameAction {
  actionId: string;
  type: ActionType;
  playerId: string;
  cardId?: string;
  cardInstanceId?: string;
  targetPlayerId?: string;
  targetCardInstanceId?: string;
  manaSpent?: number;
  damages?: DamageResult[];
  timestamp: string;
  resolved: boolean;
}

export interface DamageResult {
  source: string;
  target: string;
  amount: number;
  isOverflow: boolean;
  blockedByDefense: number;
  finalDamage: number;
}

export interface GameLog {
  gameId: string;
  logEntry: string;
  timestamp: string;
  actionType: ActionType;
}
