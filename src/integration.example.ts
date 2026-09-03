/**
 * Integration Example: Complete Game Flow
 * Demonstrates all systems working together
 */

import { GameEngine } from "../src/engine/GameEngine";
import { AIBot } from "../src/ai/AIBot";
import { ShopSimulator } from "../src/economy/ShopSimulator";
import { P2PMatchmaker } from "../src/network/P2PMatchmaker";
import { Card, PlayerState } from "../src/types/Card";

// Mock card pool
const createMockCards = (): Card[] => [
  {
    cardId: "berserker",
    name: "Berserker",
    faction: "Vichinghi",
    rarity: "Rara",
    manaCost: 4,
    stats: { attack: 5, defense: 2, level: 3, maxLevel: 5 },
    keywords: ["SenzaPaura", "Furia"],
    abilities: [
      {
        type: "Triggered",
        trigger: "OnPlayerDamagedThisTurn",
        effect: "ReduceManaCost",
        value: 1,
        description: "Cost reduced when damaged",
      },
    ],
    description: "Fearless warrior who fights harder when hurt",
    createdAt: new Date().toISOString(),
  },
  {
    cardId: "siege_bow",
    name: "Siege Bow",
    faction: "Romani",
    rarity: "Epica",
    manaCost: 3,
    stats: { attack: 3, defense: 1, level: 2, maxLevel: 5 },
    keywords: ["Affondo", "Trafittura"],
    abilities: [],
    description: "Piercing attack, can strike immediately",
    createdAt: new Date().toISOString(),
  },
  {
    cardId: "healer",
    name: "Healer Priestess",
    faction: "Egiziani",
    rarity: "Rara",
    manaCost: 2,
    stats: { attack: 1, defense: 4, level: 2, maxLevel: 5 },
    keywords: ["Rigenera"],
    abilities: [],
    description: "Regenerates 2 defense each turn",
    createdAt: new Date().toISOString(),
  },
  {
    cardId: "warrior",
    name: "Warrior",
    faction: "Neutrale",
    rarity: "Comune",
    manaCost: 2,
    stats: { attack: 2, defense: 3, level: 1, maxLevel: 5 },
    keywords: [],
    abilities: [],
    description: "Basic warrior",
    createdAt: new Date().toISOString(),
  },
];

/**
 * Demo 1: Basic Game Flow
 */
export function demo_basicGameFlow() {
  console.log("\n=== DEMO 1: Basic Game Flow ===\n");

  const player1: PlayerState = {
    playerId: "human",
    name: "Player 1",
    health: 30,
    maxHealth: 30,
    currentMana: 1,
    maxManaPerTurn: 1,
    cardsInHand: [createMockCards()[3], createMockCards()[3]], // 2 Warriors
    cardsInPlay: [],
    cardsInDeck: [],
    cardsInGraveyard: [],
    damageThisTurn: 0,
    resources: { dustCrafting: 0, crystals: 0 },
  };

  const player2: PlayerState = {
    playerId: "bot",
    name: "AI Bot",
    health: 30,
    maxHealth: 30,
    currentMana: 1,
    maxManaPerTurn: 1,
    cardsInHand: [createMockCards()[3], createMockCards()[0]], // Warrior + Berserker
    cardsInPlay: [],
    cardsInDeck: [],
    cardsInGraveyard: [],
    damageThisTurn: 0,
    resources: { dustCrafting: 0, crystals: 0 },
  };

  const engine = new GameEngine(player1, player2);
  const gameState = engine.getGameState();

  console.log(`[TURN 1] Player 1's Turn`);
  engine.startTurn(player1.playerId);
  console.log(`  Current mana: ${player1.currentMana}/${player1.maxManaPerTurn}`);
  console.log(`  Hand size: ${player1.cardsInHand.length}`);

  // Play first card
  if (engine.playCard(player1.playerId, 0)) {
    console.log(`  ✓ Played: ${player1.cardsInHand[0]?.name}`);
    console.log(`  Mana remaining: ${player1.currentMana}`);
  }

  console.log(`\n  Ending turn...`);
  engine.endTurn(player1.playerId);

  console.log(`\n[TURN 1] Bot's Turn`);
  const bot = new AIBot("normal");
  const threat = bot.assessThreat(player2, player1);
  console.log(`  Threat assessment: ${threat.incomingDamage} damage incoming`);

  const plan = bot.planTurn(player2, player1, engine);
  console.log(`  AI recommendation: "${plan.recommendation}"`);
  console.log(`  Cards to play: ${plan.cardsToPlay.length}`);

  console.log(`\n=== GAME STATE ===`);
  console.log(`  P1 Health: ${player1.health}/30`);
  console.log(`  P2 Health: ${player2.health}/30`);
  console.log(`  P1 Board: ${player1.cardsInPlay.length} cards`);
  console.log(`  P2 Board: ${player2.cardsInPlay.length} cards`);
}

/**
 * Demo 2: AI Decision Making
 */
export function demo_aiDecisionTree() {
  console.log("\n=== DEMO 2: AI Decision Tree ===\n");

  const bot = new AIBot("hard");
  const cards = createMockCards();

  console.log("Card Evaluations (Hard AI):\n");
  cards.forEach((card) => {
    const eval = bot.evaluateCard(card, {
      currentMana: 5,
      opponentThreat: 10,
    });
    console.log(`  ${card.name}`);
    console.log(`    Weight: ${eval.weight.toFixed(2)}`);
    console.log(`    Priority: ${eval.playPriority}`);
    console.log(`    Role: ${eval.strategicValue}`);
  });

  console.log("\n  Threat Assessment when Player at 15 HP:");
  const player: PlayerState = {
    playerId: "player",
    name: "Player",
    health: 15,
    maxHealth: 30,
    currentMana: 5,
    maxManaPerTurn: 5,
    cardsInHand: [],
    cardsInPlay: [],
    cardsInDeck: [],
    cardsInGraveyard: [],
    damageThisTurn: 0,
    resources: { dustCrafting: 0, crystals: 0 },
  };

  const opponent: PlayerState = {
    playerId: "opponent",
    name: "Opponent",
    health: 25,
    maxHealth: 30,
    currentMana: 5,
    maxManaPerTurn: 5,
    cardsInHand: [],
    cardsInPlay: [
      {
        instanceId: "board_1",
        card: cards[1], // Siege Bow (Affondo + Trafittura)
        currentAttack: 3,
        currentDefense: 1,
        remainingHealth: 1,
        manaLocked: false,
        buffs: [],
        debuffs: [],
      },
    ],
    cardsInDeck: [],
    cardsInGraveyard: [],
    damageThisTurn: 0,
    resources: { dustCrafting: 0, crystals: 0 },
  };

  const threat = bot.assessThreat(player, opponent);
  console.log(`    Incoming Damage: ${threat.incomingDamage}`);
  console.log(`    Turns to Lose: ${threat.turnsToLosing}`);
  console.log(`    Critical Threats: ${threat.criticalThreats.length}`);
}

/**
 * Demo 3: Shop & Economy
 */
export function demo_shopEconomy() {
  console.log("\n=== DEMO 3: Shop & Economy System ===\n");

  const shop = new ShopSimulator(createMockCards());

  console.log("Opening 3 packs:\n");
  let totalDust = 0;
  let legendaryCount = 0;

  for (let i = 0; i < 3; i++) {
    const pack = shop.openPack();
    console.log(`  Pack ${i + 1}:`);
    pack.cards.forEach((card) => {
      console.log(`    - ${card.name} (${card.rarity})`);
    });
    console.log(`    Total Dust: ${pack.totalDustValue}`);
    if (pack.containsLegendary) {
      console.log(`    ⭐ LEGENDARY PULL!`);
      legendaryCount += 1;
    }
    totalDust += pack.totalDustValue;
  }

  console.log(`\n  Total Dust Earned: ${totalDust}`);
  console.log(`  Legendaries: ${legendaryCount}`);

  // Pity status
  const pity = shop.getPityStatus();
  console.log(`\n  Pity Status: ${pity.current}/${pity.threshold}`);
  console.log(`  Guaranteed: ${pity.guarantee ? "YES" : "NO"}`);

  // Craft
  console.log(`\n  Crafting 1x Epica (costs 1600 dust)...`);
  const crafted = shop.craftCard(totalDust, "Epica");
  if (crafted) {
    console.log(`  ✓ Crafted: ${crafted.name} (${crafted.rarity})`);
  }
}

/**
 * Demo 4: P2P Matchmaking with QR
 */
export function demo_p2pMatchmaking() {
  console.log("\n=== DEMO 4: P2P Matchmaking with QR ===\n");

  const matchmaker = new P2PMatchmaker("https://signal.example.com");

  console.log("HOST creates room...");
  const { room, qrCodeData } = matchmaker.createRoom("host_abc", "Alice");
  console.log(`  Room ID: ${room.roomId}`);
  console.log(`  Room Code: ${room.roomCode}`);
  console.log(`  Status: ${room.status}`);
  console.log(`  QR Data (base64): ${qrCodeData.substring(0, 50)}...`);

  console.log("\nGUEST scans QR code...");
  const joinResult = matchmaker.joinRoomByQR(qrCodeData, "guest_xyz", "Bob");
  if (joinResult.success && joinResult.room) {
    console.log(`  ✓ Joined successfully!`);
    console.log(`  Room Status: ${joinResult.room.status}`);
    console.log(`  Host: ${joinResult.room.hostPlayerName}`);
    console.log(`  Guest: ${joinResult.room.guestPlayerName}`);
  }

  console.log("\nEstablishing P2P connection...");
  const hostPeer = matchmaker.establishPeerConnection("host_abc", "Alice", [
    { urls: "stun:stun.l.google.com:19302" },
  ]);
  const guestPeer = matchmaker.establishPeerConnection("guest_xyz", "Bob", [
    { urls: "stun:stun.l.google.com:19302" },
  ]);
  console.log(`  Host Connection: ${hostPeer.connectionState}`);
  console.log(`  Guest Connection: ${guestPeer.connectionState}`);

  console.log("\nHeartbeat check...");
  matchmaker.sendHeartbeat("host_abc");
  matchmaker.sendHeartbeat("guest_xyz");
  console.log(`  ✓ Both peers alive`);

  console.log("\nActive rooms:");
  matchmaker.getActiveRooms().forEach((r) => {
    console.log(`  - ${r.roomCode}: ${r.hostPlayerName} vs ${r.guestPlayerName || "waiting..."}`);
  });
}

/**
 * Run all demos
 */
export function runAllDemos() {
  demo_basicGameFlow();
  demo_aiDecisionTree();
  demo_shopEconomy();
  demo_p2pMatchmaking();

  console.log("\n" + "=".repeat(50));
  console.log("All demonstrations completed!");
  console.log("=".repeat(50) + "\n");
}

// Run if executed directly
if (require.main === module) {
  runAllDemos();
}
