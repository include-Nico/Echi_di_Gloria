# 🧪 End-to-End Testing Guide

## Quick Start

This guide walks through testing all systems: Authentication → Database → Game Engine → Multiplayer.

**Estimated time**: 30 minutes for full flow

---

## Part 1: Authentication & Database (10 mins)

### 1.1 Register New Account
1. Open http://localhost:5173
2. Click **"Non hai un account? Registrati qui"**
3. Fill form:
   - Email: `test_player_1@gmail.com`
   - Password: `SecureTest123!`
   - Confirm: `SecureTest123!`
4. Click **"Crea Account"**
5. **Expected**: "Abbiamo inviato un codice di verifica" screen

**What's tested:**
- ✅ Password hashing (PBKDF2-SHA256)
- ✅ User creation in Google Sheets
- ✅ Email verification code generation

### 1.2 Verify Email (Simulated)
1. **In production, check email for code**
2. **For local testing, simulate code**:
   ```javascript
   // Browser console
   localStorage.setItem('verificationCode', 'TEST1234');
   ```
3. Enter: `TEST1234` in verification code box
4. Click **"Verifica Email"**
5. **Expected**: "✅ Account Creato! La tua email è verificata..."

**What's tested:**
- ✅ Email verification flow
- ✅ Account marked verified in database
- ✅ JWT token creation

### 1.3 Login
1. Refresh page
2. Click **"Accedi qui"** (should auto-show after account creation)
3. Fill form:
   - Email: `test_player_1@gmail.com`
   - Password: `SecureTest123!`
4. Click **"Accedi"**
5. **Expected**: Redirected to game lobby/deck selection

**What's tested:**
- ✅ Password verification (hashed comparison)
- ✅ JWT token generation & storage
- ✅ Session persistence (localStorage)

### 1.4 Verify Data in Google Sheets
1. Open your Google Sheet (create in DATABASE_SETUP.md)
2. Go to **"Users"** tab
3. Find row with email `test_player_1@gmail.com`
4. Verify columns:
   - `verified`: TRUE
   - `passwordHash`: `$2b$10$...` (hashed, not plaintext!)
   - `lastLogin`: Recent timestamp

5. Go to **"Economy"** tab
6. Find row with matching `userId`
7. Verify:
   - `dust`: 100 (starter amount)
   - `crystals`: 0
   - `packsOwned`: 0

**What's tested:**
- ✅ Database persistence
- ✅ No plaintext passwords stored
- ✅ Economy initialization

---

## Part 2: Shop & Card Economy (5 mins)

### 2.1 Open Pack
1. In game lobby, find **"Shop"** button
2. Click **"Open Pack"** (costs 50 dust, you have 100)
3. **Expected**: 5 cards revealed with rarity badges

**Verify drop rates manually:**
- Colors on cards: Yellow=Leggendaria, Purple=Epica, Blue=Rara, Gray=Comune
- Should see ~68% gray cards (Common)

**What's tested:**
- ✅ Shop economy system
- ✅ Pack opening (5 random cards)
- ✅ Dust deduction from account

### 2.2 Check Database Update
1. Google Sheets → **"Economy"** tab
2. Find your user row
3. Verify:
   - `dust`: 50 (100 - 50 used)
   - `packsOwned`: 1

**What's tested:**
- ✅ Database sync
- ✅ Economy state persistence

---

## Part 3: Deck Building & Game Prep (5 mins)

### 3.1 Create Deck
1. Click **"Decks"** → **"New Deck"**
2. Name it: `Test Deck 1`
3. Select 30 cards (max deck size)
   - Try different rarities
   - Mix factions if available
4. Click **"Save Deck"**
5. **Expected**: Deck appears in list

**What's tested:**
- ✅ Deck persistence
- ✅ Card collection management

### 3.2 Verify in Database
1. Google Sheets → **"Decks"** tab
2. Find row with `name`: `Test Deck 1`
3. Verify:
   - `userId`: Matches your user
   - `cardIds`: JSON array with card IDs
   - `wins`: 0
   - `losses`: 0

**What's tested:**
- ✅ Deck storage in database

---

## Part 4: Single-Player vs AI (5 mins)

### 4.1 Start AI Practice Match
1. Click **"Play"** → **"Practice vs AI"**
2. Select difficulty: **"Normal"**
3. Select opponent: **"Berserker AI"**
4. Click **"Start Match"**
5. **Expected**: Battle arena loads with 30 health on both sides

**What's tested:**
- ✅ Game engine initialization
- ✅ AI bot decision-making
- ✅ UI rendering (cards, mana, health)

### 4.2 Play a Few Turns
1. In hand, find a card with cost ≤ current mana (should be highlighted in green)
2. Drag card to drop zone
3. Click **"Play Card"**
4. **Expected**: Card appears on your side, mana decrements

5. Click **"Attack"** to attack opponent cards
6. Click **"End Turn"**
7. **Expected**: Opponent AI plays its turn

8. Try playing 2-3 more turns
9. **Expected**: Health bars update, cards resolve abilities (Furia, Trafittura, etc.)

**What's tested:**
- ✅ Drag-drop card playing
- ✅ Mana system (accumulation cap, Fusion cost floor)
- ✅ Combat resolution (damage, defense, piercing)
- ✅ AI decision-making
- ✅ UI state updates

### 4.3 Continue to Game End
- Let game continue until someone reaches 0 health
- **Expected**: Victory/Defeat screen with:
  - Match duration
  - Winner name
  - Rewards (dust, +1 win to deck)

**What's tested:**
- ✅ Win condition detection
- ✅ Match result recording
- ✅ Economy reward calculation

---

## Part 5: Multiplayer (P2P) Setup (30 seconds)

### 5.1 Open Two Browser Windows
**Window A (Player 1 - Host):**
1. http://localhost:5173
2. Login as `test_player_1@gmail.com`
3. Click **"Play"** → **"Find Opponent"**
4. Click **"Create Room"**
5. **Expected**: 6-character code appears (e.g., "K9M2P5")
6. Copy the code

**Window B (Player 2 - Guest):**
1. http://localhost:5173 (or open new incognito window)
2. Register/login as `test_player_2@gmail.com`
3. Click **"Play"** → **"Find Opponent"**
4. Paste code "K9M2P5"
5. Click **"Join"**

**What's tested:**
- ✅ Signaling server room creation
- ✅ QR code generation
- ✅ Room lookup by code
- ✅ Socket.io connection

### 5.2 Watch WebRTC Connection Establish
1. **Window A**: Should show "Waiting for opponent..."
2. **Window B**: Shows "Connecting..."
3. **After ~1-2 seconds**: Both show "Connected!"

**What's tested:**
- ✅ WebRTC peer connection
- ✅ Offer/Answer handshake
- ✅ Data channel establishment

### 5.3 Check Console Logs
```javascript
// Browser console in both windows
[P2P] Socket connected: socket_abc123
[P2P] Room state: { room: {...}, yourRole: "host", otherPlayer: {...} }
[WebRTC] Connection state: connected
```

**What's tested:**
- ✅ Signaling server communication
- ✅ Connection state monitoring

---

## Part 6: Multiplayer Game (P2P) (10 mins)

### 6.1 Start Match
1. **Both windows**: Should auto-load battle arena
2. **Window A (Host)**: Shows your board, health, mana
3. **Window B (Guest)**: Shows opponent board

**What's tested:**
- ✅ Game state synchronization
- ✅ Dual-player turn management

### 6.2 Play Turns
**Player 1 (Host) turn:**
1. Drag a card from hand
2. Drop on board
3. See card appear on your board in Window A
4. **Check Window B**: Opponent card visible on their screen (peer-to-peer!)
5. Click **"End Turn"**

**Player 2 (Guest) turn:**
1. Play a card
2. Verify it appears on their board (Window B)
3. Verify it appears on opponent's board (Window A) - **PEER-TO-PEER!**
4. Attack opponent card or direct face
5. See health update (peer-to-peer!)
6. Click **"End Turn"**

**What's tested:**
- ✅ WebRTC data channel message relay
- ✅ Game state sync (completely peer-to-peer)
- ✅ Turn management
- ✅ Combat resolution
- ✅ Zero-lag gameplay (direct P2P, no server relay)

### 6.3 Check Network Tab (Dev Tools)
1. Open DevTools → **Network** tab
2. Filter: **WebSocket**
3. See: `socket.io` connection only for initial handshake
4. **No subsequent HTTP requests!** (Proves P2P after handshake)

**What's tested:**
- ✅ Signaling server only used for setup
- ✅ All game traffic is peer-to-peer

### 6.4 Complete Match
- Continue playing until someone reaches 0 health
- **Expected**: Victory screen
- Check:
  - Match duration displayed
  - Winner name correct
  - Deck stats updated in database

**What's tested:**
- ✅ Match completion
- ✅ Win/loss recording
- ✅ Database update (deck wins/losses)

---

## Part 7: Database Verification (2 mins)

### 7.1 Check Match History
1. Google Sheets → **"Matches"** tab
2. Find rows with recent `timestamp`
3. Verify:
   - `playerId`: Player 1's user ID
   - `opponentId`: Player 2's user ID
   - `winner`: Correct player ID
   - `duration`: Match length in ms

**What's tested:**
- ✅ Match persistence
- ✅ History tracking

### 7.2 Check Deck Stats Update
1. Google Sheets → **"Decks"** tab
2. Find `Test Deck 1` rows (might be multiple from both players)
3. Verify:
   - Winning player's deck: `wins` incremented
   - Losing player's deck: `losses` incremented

**What's tested:**
- ✅ Deck statistics update
- ✅ Win/loss tracking

---

## Part 8: Advanced Tests (Optional)

### 8.1 Test Rate Limiting
1. Close browser window with Player 2
2. Window A: Try to login 3 times with wrong password (intentionally)
3. 4th attempt should show:
   - "Account temporarily locked. Try again at HH:MM:SS"
   - Wait 15 minutes to try again (or modify code to shorter lockout for testing)

**What's tested:**
- ✅ Rate limiting enforcement
- ✅ Account protection

### 8.2 Test Room Expiry
1. Create room (Player 1)
2. Wait 5+ minutes without Player 2 joining
3. Try to connect Player 2
4. **Expected**: "Room not found" error

**What's tested:**
- ✅ Room auto-expiry
- ✅ Server cleanup

### 8.3 Test Reconnection
1. During active multiplayer match
2. Disconnect internet (or throttle in DevTools)
3. Watch connection status change
4. Reconnect internet
5. Connection should restore automatically

**What's tested:**
- ✅ Graceful degradation
- ✅ Auto-reconnection logic

### 8.4 Test AI vs AI
1. Start AI match with AI difficulty
2. Set both to same AI (if supported)
3. Watch 2 AI bots play each other
4. Verify decision-making, threat assessment, etc.

**What's tested:**
- ✅ AI bot stability
- ✅ Threat calculation
- ✅ Difficulty scaling

---

## Troubleshooting

### Issue: "Room not found" immediately
- **Cause**: Signaling server not running
- **Fix**: `npx ts-node src/server/signalingServer.ts`

### Issue: WebRTC Connection Fails
- **Cause**: Firewall blocking WebRTC (port 49152-65535)
- **Fix**: 
  - Check firewall settings
  - Try different network
  - Add STUN server (see signalingServer.ts)

### Issue: Data doesn't sync between windows
- **Cause**: Data channel not open
- **Fix**: Check console for `[DataChannel] Opened`

### Issue: Google Sheets shows no data
- **Cause**: Apps Script not deployed
- **Fix**: Follow DATABASE_SETUP.md steps 1-3

### Issue: Password hash looks wrong ($2b$ format)
- **This is correct!** It's PBKDF2-SHA256 with salt

---

## Success Criteria

✅ All of the following must pass:

1. **Authentication**: Register → Verify Email → Login successful
2. **Database**: User data appears in Google Sheets (Users tab)
3. **Economy**: Pack opens, dust deducted, packsOwned incremented
4. **AI Match**: Play 3+ turns vs AI, game state updates correctly
5. **Multiplayer Setup**: Create room → Get 6-char code → Join with code
6. **P2P Connection**: WebRTC connects (status shows "connected")
7. **Multiplayer Gameplay**: Play turns, cards sync P2P (no server relay)
8. **Match End**: Victory/Defeat screen, results recorded in Matches tab
9. **Database**: Match history appears in Google Sheets (Matches tab)
10. **Deck Stats**: Winning deck's wins incremented in Decks tab

---

## Performance Benchmarks

| Operation | Target | Actual |
|-----------|--------|--------|
| Login | <2s | ___ |
| Pack opening | <1s | ___ |
| AI turn | <2s | ___ |
| WebRTC connection | <500ms | ___ |
| Game state sync | <100ms | ___ |
| Match end to database | <5s | ___ |

Fill in "Actual" after testing.

---

## Sign-Off

- [ ] I completed all 8 parts
- [ ] I verified all success criteria
- [ ] I found no blocking bugs
- [ ] I'm ready for production deployment

**Date tested**: _______________
**Tester name**: _______________
**Version**: 0.4.0 (Signaling Server)
