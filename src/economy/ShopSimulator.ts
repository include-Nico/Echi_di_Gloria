/**
 * Shop Economy & Drop Rate Simulator
 * Weighted random algorithm, rarity distribution, pity system
 */

import { Card, Rarity } from "../types/Card";

interface ShopConfig {
  packSize: number;
  rarityWeights: Record<Rarity, number>;
  pityThreshold: number; // Guaranteed legendary after N packs
  dustCraftValue: Record<Rarity, number>;
  pricePerPack: number;
}

interface ShopPack {
  packId: string;
  cards: Card[];
  totalDustValue: number;
  containsLegendary: boolean;
  purchasedAt: string;
}

export class ShopSimulator {
  private config: ShopConfig;
  private cardPool: Card[] = [];
  private pityCounter: number = 0;
  private lastLegendaryPull: number = 0;

  constructor(cardPool: Card[]) {
    this.cardPool = cardPool;
    this.config = {
      packSize: 5,
      rarityWeights: {
        Comune: 0.68,
        Rara: 0.22,
        Epica: 0.08,
        Leggendaria: 0.02,
      },
      pityThreshold: 40,
      dustCraftValue: {
        Comune: 100,
        Rara: 400,
        Epica: 1600,
        Leggendaria: 3200,
      },
      pricePerPack: 100,
    };
  }

  /**
   * Simulate opening a card pack with weighted drop rates
   * Implements pity system: guaranteed legendary every 40 packs
   */
  openPack(): ShopPack {
    const cards: Card[] = [];
    let totalDust = 0;
    let containsLegendary = false;

    for (let i = 0; i < this.config.packSize; i++) {
      const card = this.drawCard();
      cards.push(card);
      totalDust += this.config.dustCraftValue[card.rarity];

      if (card.rarity === "Leggendaria") {
        containsLegendary = true;
        this.pityCounter = 0;
        this.lastLegendaryPull = this.pityCounter;
      }
    }

    this.pityCounter += 1;

    // Force legendary on pity threshold
    if (this.pityCounter >= this.config.pityThreshold && !containsLegendary) {
      const legendaryCards = this.cardPool.filter((c) => c.rarity === "Leggendaria");
      if (legendaryCards.length > 0) {
        cards[0] = this.selectRandomCard(legendaryCards);
        totalDust -= this.config.dustCraftValue["Comune"];
        totalDust += this.config.dustCraftValue["Leggendaria"];
        containsLegendary = true;
        this.pityCounter = 0;
      }
    }

    return {
      packId: `pack_${Date.now()}_${Math.random()}`,
      cards,
      totalDustValue: totalDust,
      containsLegendary,
      purchasedAt: new Date().toISOString(),
    };
  }

  /**
   * Draw single card using weighted rarity system
   */
  private drawCard(): Card {
    const roll = Math.random();
    let cumulative = 0;

    for (const [rarity, weight] of Object.entries(this.config.rarityWeights)) {
      cumulative += weight;
      if (roll <= cumulative) {
        const cardsOfRarity = this.cardPool.filter((c) => c.rarity === (rarity as Rarity));
        if (cardsOfRarity.length > 0) {
          return this.selectRandomCard(cardsOfRarity);
        }
      }
    }

    // Fallback to common
    const commons = this.cardPool.filter((c) => c.rarity === "Comune");
    return this.selectRandomCard(commons);
  }

  /**
   * Simulate multi-pack opening with statistics
   */
  simulateBulkOpen(
    packCount: number
  ): {
    packs: ShopPack[];
    totalDust: number;
    legendaryCount: number;
    epicCount: number;
    avgPackValue: number;
  } {
    const packs: ShopPack[] = [];
    let totalDust = 0;
    let legendaryCount = 0;
    let epicCount = 0;

    for (let i = 0; i < packCount; i++) {
      const pack = this.openPack();
      packs.push(pack);
      totalDust += pack.totalDustValue;

      pack.cards.forEach((card) => {
        if (card.rarity === "Leggendaria") legendaryCount += 1;
        if (card.rarity === "Epica") epicCount += 1;
      });
    }

    return {
      packs,
      totalDust,
      legendaryCount,
      epicCount,
      avgPackValue: totalDust / packCount,
    };
  }

  /**
   * Craft card using dust (requires matching card rarity)
   */
  craftCard(dust: number, targetRarity: Rarity): Card | null {
    const cost = this.config.dustCraftValue[targetRarity];

    if (dust < cost) {
      return null;
    }

    const cardsOfRarity = this.cardPool.filter((c) => c.rarity === targetRarity);
    if (cardsOfRarity.length === 0) {
      return null;
    }

    return this.selectRandomCard(cardsOfRarity);
  }

  /**
   * Helper: Select random card from array
   */
  private selectRandomCard(cards: Card[]): Card {
    return cards[Math.floor(Math.random() * cards.length)];
  }

  /**
   * Get shop configuration (for UI display)
   */
  getConfig(): ShopConfig {
    return this.config;
  }

  /**
   * Get pity counter status
   */
  getPityStatus(): { current: number; threshold: number; guarantee: boolean } {
    return {
      current: this.pityCounter,
      threshold: this.config.pityThreshold,
      guarantee: this.pityCounter >= this.config.pityThreshold,
    };
  }
}
