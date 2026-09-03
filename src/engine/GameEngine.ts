/**
 * Game Engine - Core Rules & Turn Flow
 * Implements mana mechanics, damage calculation, ability resolution
 */

import { Card, TriggerType } from "../types/Card";
import {
  GameState,
  PlayerState,
  BoardCard,
  GamePhase,
  GameAction,
  DamageResult,
} from "../types/GameState";

const MANA_ACCUMULATION_CAP = 3;
const MIN_MANA_COST = 1;
const MAX_HEALTH = 30;

export class GameEngine {
  private gameState: GameState;

  constructor(player1: PlayerState, player2: PlayerState) {
    this.gameState = {
      gameId: `game_${Date.now()}`,
      players: new Map([
        [player1.playerId, player1],
        [player2.playerId, player2],
      ]),
      currentPlayerTurn: player1.playerId,
      currentPhase: "setup",
      turnsPlayed: 0,
      history: [],
      manaAccumulated: new Map([
        [player1.playerId, 0],
        [player2.playerId, 0],
      ]),
      stackedEffects: [],
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  startTurn(playerId: string): void {
    const player = this.gameState.players.get(playerId);
    if (!player) throw new Error("Player not found");

    player.maxManaPerTurn = Math.min(player.maxManaPerTurn + 1, 10);

    const accumulated = this.gameState.manaAccumulated.get(playerId) || 0;
    const bonusToAdd = Math.min(accumulated, MANA_ACCUMULATION_CAP);
    player.currentMana = player.maxManaPerTurn + bonusToAdd;

    this.gameState.manaAccumulated.set(playerId, 0);
    this.gameState.currentPhase = `${playerId}_turn` as GamePhase;
    this.gameState.turnsPlayed += 1;

    this.resolveTriggeredAbilities(playerId, "OnTurnStart");
  }

  playCard(playerId: string, cardIndex: number, targetInstanceId?: string): boolean {
    const player = this.gameState.players.get(playerId);
    if (!player || cardIndex < 0 || cardIndex >= player.cardsInHand.length) {
      return false;
    }

    const card = player.cardsInHand[cardIndex];
    let manaCost = card.manaCost;

    if (card.fusionProgress && card.fusionProgress.currentCopies >= 3) {
      const reduction = card.fusionProgress.bonusPerFusion?.costReduction || 1;
      manaCost = Math.max(MIN_MANA_COST, manaCost - reduction);
    }

    if (card.keywords.includes("Furia") && player.damageThisTurn > 0) {
      manaCost = Math.max(MIN_MANA_COST, manaCost - 1);
    }

    if (player.currentMana < manaCost) return false;

    player.currentMana -= manaCost;
    const boardCard: BoardCard = {
      instanceId: `card_${Date.now()}_${Math.random()}`,
      card,
      currentAttack: card.stats.attack,
      currentDefense: card.stats.defense,
      remainingHealth: card.stats.defense,
      manaLocked: !card.keywords.includes("Affondo"),
      buffs: [],
      debuffs: [],
    };

    player.cardsInPlay.push(boardCard);
    player.cardsInHand.splice(cardIndex, 1);

    const action: GameAction = {
      actionId: `act_${Date.now()}`,
      type: "play_card",
      playerId,
      cardId: card.cardId,
      cardInstanceId: boardCard.instanceId,
      manaSpent: manaCost,
      timestamp: new Date().toISOString(),
      resolved: true,
    };
    this.gameState.history.push(action);

    return true;
  }

  attack(
    playerId: string,
    sourceInstanceId: string,
    targetInstanceId?: string
  ): DamageResult[] {
    const player = this.gameState.players.get(playerId);
    if (!player) return [];

    const sourceCard = player.cardsInPlay.find((c) => c.instanceId === sourceInstanceId);
    if (!sourceCard || sourceCard.manaLocked) return [];

    const damages: DamageResult[] = [];

    if (targetInstanceId) {
      const opponent = Array.from(this.gameState.players.values()).find(
        (p) => p.playerId !== playerId
      );
      if (!opponent) return [];

      const targetCard = opponent.cardsInPlay.find((c) => c.instanceId === targetInstanceId);
      if (!targetCard) return [];

      const damage = sourceCard.currentAttack;
      const defense = targetCard.currentDefense;
      const overflow = Math.max(0, damage - defense);

      const result: DamageResult = {
        source: sourceCard.card.name,
        target: targetInstanceId,
        amount: damage,
        isOverflow: false,
        blockedByDefense: defense,
        finalDamage: defense,
      };
      damages.push(result);

      if (overflow > 0 && sourceCard.card.keywords.includes("Trafittura")) {
        opponent.health = Math.max(0, opponent.health - overflow);
        result.isOverflow = true;
        result.finalDamage = damage;
      }

      targetCard.remainingHealth -= defense;
      if (targetCard.remainingHealth <= 0) {
        opponent.cardsInPlay = opponent.cardsInPlay.filter(
          (c) => c.instanceId !== targetInstanceId
        );
      }
    } else {
      const opponent = Array.from(this.gameState.players.values()).find(
        (p) => p.playerId !== playerId
      );
      if (!opponent) return [];

      let finalDamage = sourceCard.currentAttack;

      opponent.health = Math.max(0, opponent.health - finalDamage);

      const result: DamageResult = {
        source: sourceCard.card.name,
        target: opponent.playerId,
        amount: finalDamage,
        isOverflow: true,
        blockedByDefense: 0,
        finalDamage,
      };
      damages.push(result);

      opponent.damageThisTurn += finalDamage;
    }

    sourceCard.manaLocked = true;

    return damages;
  }

  endTurn(playerId: string): void {
    const player = this.gameState.players.get(playerId);
    if (!player) return;

    player.cardsInPlay.forEach((card) => {
      card.manaLocked = false;

      card.buffs = card.buffs.filter((b) => b.duration === "permanent");
      card.debuffs = card.debuffs.filter((d) => d.duration === "permanent");
    });

    player.cardsInPlay
      .filter((c) => c.card.keywords.includes("Rigenera"))
      .forEach((c) => {
        c.remainingHealth = Math.min(c.card.stats.defense, c.remainingHealth + 2);
      });

    const unspent = Math.max(0, player.currentMana);
    this.gameState.manaAccumulated.set(playerId, Math.min(unspent, MANA_ACCUMULATION_CAP));
    player.currentMana = 0;
    player.damageThisTurn = 0;

    this.resolveTriggeredAbilities(playerId, "OnTurnEnd");

    const otherPlayer = Array.from(this.gameState.players.values()).find(
      (p) => p.playerId !== playerId
    );
    if (otherPlayer) {
      this.gameState.currentPlayerTurn = otherPlayer.playerId;
      this.startTurn(otherPlayer.playerId);
    }
  }

  private resolveTriggeredAbilities(playerId: string, trigger: TriggerType): void {
    const player = this.gameState.players.get(playerId);
    if (!player) return;

    player.cardsInPlay.forEach((boardCard) => {
      const matchingAbility = boardCard.card.abilities.find(
        (a) => a.type === "Triggered" && a.trigger === trigger
      );

      if (matchingAbility) {
        this.executeAbility(playerId, boardCard.instanceId, matchingAbility);
      }
    });
  }

  private executeAbility(playerId: string, cardInstanceId: string, ability: any): void {
    const player = this.gameState.players.get(playerId);
    if (!player) return;

    const boardCard = player.cardsInPlay.find((c) => c.instanceId === cardInstanceId);
    if (!boardCard) return;

    switch (ability.effect) {
      case "DealDamage":
        const opponent = Array.from(this.gameState.players.values()).find(
          (p) => p.playerId !== playerId
        );
        if (opponent && ability.value) {
          opponent.health = Math.max(0, opponent.health - ability.value);
        }
        break;
      case "GainStats":
        if (ability.value) {
          boardCard.currentAttack += ability.value;
        }
        break;
    }
  }

  checkWinCondition(): string | null {
    for (const player of this.gameState.players.values()) {
      if (player.health <= 0) {
        const winner = Array.from(this.gameState.players.values()).find(
          (p) => p.playerId !== player.playerId
        );
        return winner?.playerId || null;
      }
    }
    return null;
  }

  getGameState(): GameState {
    return this.gameState;
  }
}
