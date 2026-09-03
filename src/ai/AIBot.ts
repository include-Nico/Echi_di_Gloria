/**
 * AI Bot Decision Tree Engine
 * Evaluates card weights, calculates threat scores, plans turns
 */

import { Card, KeywordType } from "../types/Card";
import { PlayerState, BoardCard } from "../types/GameState";
import { GameEngine } from "../engine/GameEngine";

interface CardEvaluation {
  card: Card;
  weight: number;
  strategicValue: "offensive" | "defensive" | "economic" | "combo";
  playPriority: number;
}

interface ThreatAssessment {
  playerHealth: number;
  incomingDamage: number;
  turnsToLosing: number;
  criticalThreats: BoardCard[];
}

export class AIBot {
  private difficulty: "easy" | "normal" | "hard";
  private threatWeights = {
    highAttack: 0.4,
    piercing: 0.6,
    affondo: 0.35,
    defender: -0.3,
    regen: 0.2,
  };

  private cardValueWeights = {
    manaEfficiency: 0.3,
    keywordCount: 0.2,
    rarity: 0.15,
    futureFusion: 0.1,
  };

  constructor(difficulty: "easy" | "normal" | "hard" = "normal") {
    this.difficulty = difficulty;
  }

  evaluateCard(
    card: Card,
    gameContext: { currentMana: number; opponentThreat: number }
  ): CardEvaluation {
    let weight = 0;
    let strategicValue: "offensive" | "defensive" | "economic" | "combo" = "offensive";

    const totalStats = card.stats.attack + card.stats.defense;
    const efficiency = totalStats / Math.max(1, card.manaCost);
    weight += efficiency * this.cardValueWeights.manaEfficiency;

    let keywordValue = 0;
    card.keywords.forEach((keyword: KeywordType) => {
      switch (keyword) {
        case "Affondo":
          keywordValue += 0.5;
          strategicValue = "offensive";
          break;
        case "Trafittura":
          keywordValue += 0.6;
          strategicValue = "offensive";
          break;
        case "Furia":
          keywordValue += 0.3;
          strategicValue = "combo";
          break;
        case "Rigenera":
          keywordValue += 0.35;
          strategicValue = "defensive";
          break;
        case "Elusivo":
          keywordValue += 0.25;
          break;
        case "SenzaPaura":
          keywordValue += 0.2;
          strategicValue = "defensive";
          break;
        case "Trappola":
          keywordValue += 0.15;
          strategicValue = "combo";
          break;
      }
    });
    weight += keywordValue * this.cardValueWeights.keywordCount;

    const rarityBonus = {
      Comune: 0,
      Rara: 0.15,
      Epica: 0.3,
      Leggendaria: 0.5,
    };
    weight += rarityBonus[card.rarity] * this.cardValueWeights.rarity;

    if (
      card.keywords.includes("Fusione") &&
      card.fusionProgress &&
      card.fusionProgress.currentCopies > 1
    ) {
      weight +=
        (card.fusionProgress.currentCopies / 3) *
        this.cardValueWeights.futureFusion;
    }

    const canAfford = card.manaCost <= gameContext.currentMana;
    if (!canAfford) weight *= 0.5;

    if (gameContext.opponentThreat > 20) {
      if (card.keywords.includes("Rigenera") || card.stats.defense > 3) {
        weight *= 1.3;
      }
    }

    if (this.difficulty === "easy") {
      weight *= 0.7 + Math.random() * 0.3;
    }

    const playPriority = Math.floor(weight * 100);

    return {
      card,
      weight,
      strategicValue,
      playPriority,
    };
  }

  assessThreat(playerState: PlayerState, opponentState: PlayerState): ThreatAssessment {
    let incomingDamage = 0;
    const criticalThreats: BoardCard[] = [];

    opponentState.cardsInPlay.forEach((boardCard) => {
      let cardThreat = boardCard.currentAttack;

      if (boardCard.card.keywords.includes("Trafittura")) {
        cardThreat *= this.threatWeights.piercing;
      }
      if (boardCard.card.keywords.includes("Affondo")) {
        cardThreat *= 1 + this.threatWeights.affondo;
      }

      incomingDamage += cardThreat;

      if (cardThreat >= playerState.health * 0.5) {
        criticalThreats.push(boardCard);
      }
    });

    const turnsToLosing = Math.ceil(playerState.health / Math.max(1, incomingDamage));

    return {
      playerHealth: playerState.health,
      incomingDamage: Math.round(incomingDamage),
      turnsToLosing,
      criticalThreats,
    };
  }

  planTurn(
    playerState: PlayerState,
    opponentState: PlayerState,
    engine: GameEngine
  ): {
    cardsToPlay: { cardIndex: number; target?: string }[];
    attacks: { sourceId: string; targetId?: string }[];
    recommendation: string;
  } {
    const threat = this.assessThreat(playerState, opponentState);
    const availableMana = playerState.currentMana;

    const evaluated = playerState.cardsInHand.map((card, index) => ({
      index,
      ...this.evaluateCard(card, {
        currentMana: availableMana,
        opponentThreat: threat.incomingDamage,
      }),
    }));

    evaluated.sort((a, b) => b.playPriority - a.playPriority);

    const cardsToPlay: { cardIndex: number; target?: string }[] = [];
    let manaRemaining = availableMana;

    for (const eval of evaluated) {
      if (eval.card.manaCost <= manaRemaining) {
        cardsToPlay.push({ cardIndex: eval.index });
        manaRemaining -= eval.card.manaCost;
      }
    }

    const attacks: { sourceId: string; targetId?: string }[] = [];
    playerState.cardsInPlay.forEach((card) => {
      if (!card.card.keywords.includes("Affondo")) return;

      if (threat.criticalThreats.length > 0) {
        const target = threat.criticalThreats[0];
        attacks.push({ sourceId: card.instanceId, targetId: target.instanceId });
      } else {
        attacks.push({ sourceId: card.instanceId });
      }
    });

    const recommendation =
      threat.turnsToLosing <= 2
        ? "URGENT: Defend or finish opponent quickly"
        : threat.incomingDamage > playerState.health * 0.3
          ? "Build defenses and remove threats"
          : "Build board and attack";

    return { cardsToPlay, attacks, recommendation };
  }

  setDifficulty(level: "easy" | "normal" | "hard"): void {
    this.difficulty = level;

    if (level === "hard") {
      this.threatWeights.piercing = 0.8;
      this.threatWeights.affondo = 0.45;
    } else if (level === "easy") {
      this.threatWeights.piercing = 0.4;
    }
  }
}
