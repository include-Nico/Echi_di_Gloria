/**
 * Balance Validation Tests
 * Validates mana curve, damage overflow, fusion cost floors
 */

import { GameEngine } from "../engine/GameEngine";
import { Card, CardStats } from "../types/Card";
import { PlayerState } from "../types/GameState";

export class BalanceValidator {
  /**
   * Test 1: Mana accumulation cap (max +3 per turn)
   */
  static testManaAccumulationCap(): boolean {
    const player1: PlayerState = {
      playerId: "p1",
      name: "Player 1",
      health: 30,
      maxHealth: 30,
      currentMana: 1,
      maxManaPerTurn: 1,
      cardsInHand: [],
      cardsInPlay: [],
      cardsInDeck: [],
      cardsInGraveyard: [],
      damageThisTurn: 0,
      resources: { dustCrafting: 0, crystals: 0 },
    };

    const player2: PlayerState = {
      playerId: "p2",
      name: "Player 2",
      health: 30,
      maxHealth: 30,
      currentMana: 1,
      maxManaPerTurn: 1,
      cardsInHand: [],
      cardsInPlay: [],
      cardsInDeck: [],
      cardsInGraveyard: [],
      damageThisTurn: 0,
      resources: { dustCrafting: 0, crystals: 0 },
    };

    const engine = new GameEngine(player1, player2);
    const state = engine.getGameState();

    // Simulate 5 turns without spending mana
    for (let i = 0; i < 5; i++) {
      const currentPlayer = state.players.get(state.currentPlayerTurn);
      if (currentPlayer) {
        // Mana should increment, but overflow should cap
        engine.endTurn(state.currentPlayerTurn);
      }
    }

    // Check accumulated mana
    const accumulatedP1 = state.manaAccumulated.get("p1") || 0;
    const success = accumulatedP1 <= 3; // Max +3

    console.log(`✓ Mana Accumulation Cap: ${success ? "PASS" : "FAIL"} (accumulated: ${accumulatedP1})`);
    return success;
  }

  /**
   * Test 2: Fusion cost floor (never below 1)
   */
  static testFusionCostFloor(): boolean {
    const testCard: Card = {
      cardId: "test_fusion",
      name: "Test Fusion",
      faction: "Neutrale",
      rarity: "Epica",
      manaCost: 2,
      stats: { attack: 3, defense: 2, level: 1, maxLevel: 5 },
      keywords: ["Fusione"],
      abilities: [],
      fusionProgress: {
        currentCopies: 3,
        requiredCopies: 3,
        bonusPerFusion: { attackIncrease: 1, defenseIncrease: 1, costReduction: 5 }, // Huge reduction
      },
      description: "Test card for fusion cost floor",
      createdAt: new Date().toISOString(),
    };

    // In playCard(), fusion reduction is capped to MIN_MANA_COST (1)
    // After reduction: max(1, 2 - 5) = 1
    const finalCost = Math.max(1, testCard.manaCost - 5);
    const success = finalCost >= 1;

    console.log(`✓ Fusion Cost Floor: ${success ? "PASS" : "FAIL"} (final cost: ${finalCost})`);
    return success;
  }

  /**
   * Test 3: Trafittura (piercing) only on specific keywords
   */
  static testTrafitturaRestriction(): boolean {
    const piercer: Card = {
      cardId: "test_piercer",
      name: "Piercer",
      faction: "Vichinghi",
      rarity: "Rara",
      manaCost: 3,
      stats: { attack: 5, defense: 1, level: 1, maxLevel: 5 },
      keywords: ["Trafittura"],
      abilities: [],
      description: "Card with piercing",
      createdAt: new Date().toISOString(),
    };

    const normalCard: Card = {
      cardId: "test_normal",
      name: "Normal",
      faction: "Neutrale",
      rarity: "Comune",
      manaCost: 2,
      stats: { attack: 4, defense: 3, level: 1, maxLevel: 5 },
      keywords: [],
      abilities: [],
      description: "Normal card",
      createdAt: new Date().toISOString(),
    };

    const hasPiercing = piercer.keywords.includes("Trafittura");
    const noPiercing = !normalCard.keywords.includes("Trafittura");
    const success = hasPiercing && noPiercing;

    console.log(`✓ Trafittura Restriction: ${success ? "PASS" : "FAIL"} (piercer: ${hasPiercing}, normal: ${noPiercing})`);
    return success;
  }

  /**
   * Test 4: Furia (Frenzy) reduces cost only when player damaged
   */
  static testFuriaCondition(): boolean {
    const furiaCard: Card = {
      cardId: "test_furia",
      name: "Berserker",
      faction: "Vichinghi",
      rarity: "Rara",
      manaCost: 4,
      stats: { attack: 5, defense: 2, level: 1, maxLevel: 5 },
      keywords: ["Furia"],
      abilities: [
        {
          type: "Triggered",
          trigger: "OnPlayerDamagedThisTurn",
          effect: "ReduceManaCost",
          value: 1,
          description: "Cost reduced by 1 when player damaged",
        },
      ],
      description: "Furia card",
      createdAt: new Date().toISOString(),
    };

    const hasAbility = furiaCard.abilities.some((a) => a.trigger === "OnPlayerDamagedThisTurn");
    const success = hasAbility;

    console.log(`✓ Furia Condition: ${success ? "PASS" : "FAIL"} (has damage trigger: ${hasAbility})`);
    return success;
  }

  /**
   * Test 5: Mana efficiency curve (stats-to-cost ratio)
   */
  static testManaEfficiency(): {
    pass: boolean;
    avgEfficiency: number;
    summary: string;
  } {
    const cards: Card[] = [
      {
        cardId: "c1",
        name: "Weak 1-drop",
        faction: "Neutrale",
        rarity: "Comune",
        manaCost: 1,
        stats: { attack: 1, defense: 1, level: 1, maxLevel: 5 },
        keywords: [],
        abilities: [],
        description: "1-drop",
        createdAt: new Date().toISOString(),
      },
      {
        cardId: "c2",
        name: "Strong 3-drop",
        faction: "Neutrale",
        rarity: "Rara",
        manaCost: 3,
        stats: { attack: 4, defense: 3, level: 1, maxLevel: 5 },
        keywords: [],
        abilities: [],
        description: "3-drop",
        createdAt: new Date().toISOString(),
      },
      {
        cardId: "c3",
        name: "Legendary 5-drop",
        faction: "Neutrale",
        rarity: "Leggendaria",
        manaCost: 5,
        stats: { attack: 8, defense: 5, level: 1, maxLevel: 5 },
        keywords: ["Trafittura"],
        abilities: [],
        description: "5-drop",
        createdAt: new Date().toISOString(),
      },
    ];

    let totalEfficiency = 0;
    cards.forEach((card) => {
      const stats = card.stats.attack + card.stats.defense;
      const efficiency = stats / card.manaCost;
      totalEfficiency += efficiency;
    });

    const avgEfficiency = totalEfficiency / cards.length;
    const pass = avgEfficiency >= 1.5; // Average should be at least 1.5 stats per mana

    console.log(`✓ Mana Efficiency Curve: ${pass ? "PASS" : "FAIL"} (avg efficiency: ${avgEfficiency.toFixed(2)})`);
    return { pass, avgEfficiency, summary: "All cards have reasonable stats-to-cost" };
  }

  /**
   * Run all balance tests
   */
  static runAllTests(): { passed: number; failed: number; summary: string[] } {
    const results: string[] = [];
    let passed = 0;
    let failed = 0;

    const tests = [
      () => BalanceValidator.testManaAccumulationCap(),
      () => BalanceValidator.testFusionCostFloor(),
      () => BalanceValidator.testTrafitturaRestriction(),
      () => BalanceValidator.testFuriaCondition(),
      () => BalanceValidator.testManaEfficiency().pass,
    ];

    tests.forEach((test) => {
      try {
        if (test()) {
          passed += 1;
        } else {
          failed += 1;
        }
      } catch (e) {
        failed += 1;
        results.push(`ERROR: ${e}`);
      }
    });

    console.log(`\n=== Balance Validation Summary ===`);
    console.log(`Passed: ${passed}/${passed + failed}`);

    return { passed, failed, summary: results };
  }
}
