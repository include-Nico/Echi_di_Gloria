# Echi di Gloria - CCG Game Engine

**Echi di Gloria** è un **Collectible Card Game** completo con:
- 🎮 **Game Engine** con regole di bilanciamento
- 🤖 **AI Bot** con albero decisionale pesato
- 💰 **Shop Economy** con simulatore di drop rate e pity system
- 🌐 **P2P Matchmaking** con QR Code su WebRTC
- ✅ **Balance Validation Tests** per garantire fair play

---

## Architettura

```
src/
├── types/
│   ├── Card.ts               # Modello carte (stats, abilità, keywords)
│   └── GameState.ts          # Stato di gioco, turni, danni
├── engine/
│   └── GameEngine.ts         # Core rules: mana, attacchi, abilità
├── ai/
│   └── AIBot.ts              # Decisioni IA con threat assessment
├── economy/
│   └── ShopSimulator.ts       # Pack opening, drop rates, pity
└── network/
    └── P2PMatchmaker.ts      # WebRTC signaling, QR pairing

tests/
└── BalanceValidator.test.ts  # Validazione regole e equilibrio
```

---

## Punti Critici di Game Design

### 1. **Accumulo Mana senza Cap**
**Problema:** Reward dello stallo (passare turni per arrivare a 10 mana).

**Soluzione:** Max +3 mana non speso → carry-over limitato
```typescript
// Turn 1: 1 mana (0 accumulate)
// Turn 2: 2 mana + 0 carry = 2 mana
// Turn 3: 3 mana + 0 carry = 3 mana
// ...
// Turn 6: 6 mana, player spends 3 → 3 carry-over
// Turn 7: 7 mana + min(3, 3 cap) = 10 mana
```

### 2. **Danno Eccedente (Overflow/Trafittura)**
**Problema:** Carte con 5+ Attacco + Trafittura chiudono in 2 turni.

**Soluzione:** **Solo carte con keyword "Trafittura"** passano la difesa
```typescript
// Berserker (5 attacco) vs difesa 3
// Normale: 5 - 3 = 2 damage assorbito
// Trafittura: 5 - 3 = 2 PIERCING damage to face
```

### 3. **Potenziamento Fusione (Cost Reduction)**
**Problema:** Ridurre permanentemente costi bassi rompe la curva di mana.

**Soluzione:** **Floor Rule: min cost = 1 mana**
```typescript
// Card normalmente 3 mana
// Fusion: max(1, 3 - costReduction)
// Anche se costReduction = 5 → final = 1 mana
```

---

## Componenti Principali

### **GameEngine.ts**
Implementa il core loop di gioco:

```typescript
// Setup
const engine = new GameEngine(player1, player2);

// Turn flow
engine.startTurn(playerId);
engine.playCard(playerId, cardIndex);
engine.attack(playerId, sourceCardId, targetCardId);
engine.endTurn(playerId);

// Win condition
const winner = engine.checkWinCondition();
```

**Regole implementate:**
- ✅ Mana accumulation capped at +3
- ✅ Fusion cost floors to 1 mana
- ✅ Furia triggers on damage (reduces cost)
- ✅ Trafittura pierces defense only
- ✅ Affondo can attack immediately
- ✅ Rigenera heals 2 at turn end
- ✅ Ability triggering system

---

### **AIBot.ts**
Valuta carte e pianifica turni intelligentemente:

```typescript
const bot = new AIBot("hard"); // easy, normal, hard

// Evaluate single card
const eval = bot.evaluateCard(card, {
  currentMana: player.currentMana,
  opponentThreat: threatLevel
});
// Returns: weight, strategicValue, playPriority

// Assess threat and plan response
const threat = bot.assessThreat(playerState, opponentState);
// Returns: incomingDamage, turnsToLosing, criticalThreats

// Get full turn plan
const plan = bot.planTurn(playerState, opponentState, engine);
// Returns: cardsToPlay[], attacks[], recommendation
```

**Weights per difficulty:**
| Fattore | Easy | Normal | Hard |
|---------|------|--------|------|
| Piercing | 0.4x | 0.6x | 0.8x |
| Affondo | 0.35x | 0.35x | 0.45x |
| Mana Efficiency | 0.3 | 0.3 | 0.3 |

---

### **ShopSimulator.ts**
Simula apertura pack con controllo delle probabilità:

```typescript
const shop = new ShopSimulator(cardPool);

// Open single pack
const pack = shop.openPack();
// Returns: cards[], totalDustValue, containsLegendary

// Bulk open with stats
const bulk = shop.simulateBulkOpen(10);
// Returns: avgPackValue, legendaryCount, epicCount

// Check pity status
const pity = shop.getPityStatus();
// { current: 15, threshold: 40, guarantee: false }

// Craft card with dust
const crafted = shop.craftCard(1600, "Epica");
```

**Drop Rates:**
| Rarity | Probabilità | Dust Value | Pity |
|--------|-------------|-----------|------|
| Comune | 68% | 100 | - |
| Rara | 22% | 400 | - |
| Epica | 8% | 1600 | - |
| Leggendaria | 2% | 3200 | 40 pack guarantee |

---

### **P2PMatchmaker.ts**
Crea stanze e sincronizza giocatori via QR:

```typescript
const matchmaker = new P2PMatchmaker("https://signaling.server");

// Host creates room
const { room, qrCodeData } = matchmaker.createRoom(hostId, hostName);
// QR payload: { roomCode, hostPlayerId, signalingServer }

// Guest scans and joins
const { success, room } = matchmaker.joinRoomByQR(qrData, guestId, guestName);

// Establish P2P connection
const peer = matchmaker.establishPeerConnection(peerId, peerName, iceServers);

// Send WebRTC signals
await matchmaker.sendSignal(fromId, toId, offer);

// Heartbeat
matchmaker.sendHeartbeat(peerId);
```

---

### **BalanceValidator.test.ts**
Test automatici per garantire equilibrio:

```typescript
BalanceValidator.runAllTests();

// Tests:
// ✓ Mana Accumulation Cap (max +3)
// ✓ Fusion Cost Floor (min 1 mana)
// ✓ Trafittura Restriction (only pierces with keyword)
// ✓ Furia Condition (reduces cost on damage)
// ✓ Mana Efficiency Curve (1.5+ stats per mana)
```

---

## Flusso P2P con QR Code

```
[Giocatore A - Host]                [Giocatore B - Guest]
    ↓                                      ↓
createRoom()                    Scan QR Code (vede roomCode)
    ↓                                      ↓
qrCodeData generato             joinRoomByQR(qrData)
(embedded in QR)                          ↓
    ↓                            room.status = "ready"
[Trasmette QR]                           ↓
    ↓                      [Entrambi connessi via signaling]
WebRTC Signaling                          ↓
  (ICE offers)          P2P Connection Established (DataChannel)
    ↓                                      ↓
 GIOCO INIZIA ←────────→ Sincronizzazione Deck Lock
```

---

## Installazione & Build

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Watch mode
npm run dev

# Run balance tests
npm test

# Lint & format
npm run lint
npm run format
```

---

## Esempio di Utilizzo Completo

```typescript
import { GameEngine } from "./src/engine/GameEngine";
import { AIBot } from "./src/ai/AIBot";
import { ShopSimulator } from "./src/economy/ShopSimulator";
import { P2PMatchmaker } from "./src/network/P2PMatchmaker";
import { Card, PlayerState } from "./src/types";

// 1. Setup gioco
const player1: PlayerState = { /* ... */ };
const engine = new GameEngine(player1, player2);

// 2. Turn flow
engine.startTurn(player1.playerId);
engine.playCard(player1.playerId, 0); // Play first card
engine.attack(player1.playerId, cardInstanceId);
engine.endTurn(player1.playerId);

// 3. AI response
const bot = new AIBot("normal");
const plan = bot.planTurn(player2, player1, engine);
plan.cardsToPlay.forEach(c => engine.playCard(player2.playerId, c.cardIndex));

// 4. Shop economy
const shop = new ShopSimulator(allCards);
const pack = shop.openPack();

// 5. P2P matchmaking
const matchmaker = new P2PMatchmaker("https://signal.server");
const { room, qrCodeData } = matchmaker.createRoom("host_id", "Host");
// Guest scans QR
const joined = matchmaker.joinRoomByQR(qrCodeData, "guest_id", "Guest");
```

---

## Prossimi Step

- [ ] Implementare UI Web (React/Vue)
- [ ] Configurare Signaling Server WebRTC
- [ ] Aggiungere persistenza (database)
- [ ] Sistema di skin/cosmetics
- [ ] Ranked ladder & matchmaking rating
- [ ] Campaign story progression
- [ ] Live balancing patches

---

## Licenza
MIT - Include Nico 2026
