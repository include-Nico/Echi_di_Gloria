/**
 * GoogleAppsScript.gs
 * Deploy this as HTTP Endpoint in Google Apps Script
 * 
 * Steps to deploy:
 * 1. Create new Google Apps Script project
 * 2. Copy this entire file into the editor
 * 3. Create 4 Google Sheets:
 *    - Users (columns: id, email, passwordHash, verified, verificationCode, createdAt, lastLogin)
 *    - Decks (columns: id, userId, name, cardIds, wins, losses, created)
 *    - Matches (columns: id, playerId, opponentId, winner, duration, timestamp)
 *    - Economy (columns: userId, dust, crystals, packsOwned, lastDailyReward)
 * 4. Set Sheet IDs in CONFIG below
 * 5. Deploy as new deployment > New > Web app > Execute as: Me > Allow all users
 * 6. Copy deployment URL into app
 */

// ====== CONFIGURATION ======
const CONFIG = {
  SPREADSHEET_ID: "YOUR_GOOGLE_SHEET_ID_HERE",
  SHEETS: {
    USERS: "Users",
    DECKS: "Decks",
    MATCHES: "Matches",
    ECONOMY: "Economy"
  },
  RATE_LIMIT: {
    MAX_CALLS_PER_MINUTE: 60,
    BURST_SIZE: 5
  }
};

const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);

// ====== RATE LIMITING ======
const callLog = {};

function checkRateLimit(ip) {
  const now = Date.now();
  if (!callLog[ip]) {
    callLog[ip] = [];
  }
  
  // Remove old entries (>1 minute)
  callLog[ip] = callLog[ip].filter(t => now - t < 60000);
  
  if (callLog[ip].length >= CONFIG.RATE_LIMIT.MAX_CALLS_PER_MINUTE) {
    return false;
  }
  
  callLog[ip].push(now);
  return true;
}

// ====== HTTP HANDLER ======
function doGet(e) {
  const ip = e.requestUrl?.split("://")[1]?.split("/")[0] || "unknown";
  
  if (!checkRateLimit(ip)) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: "Rate limit exceeded" })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  const action = e.parameter.action || "";
  const params = e.parameter;

  try {
    let result = null;

    switch (action) {
      case "getUserByEmail":
        result = getUserByEmail(params.email);
        break;
      case "createUser":
        result = createUser(params);
        break;
      case "verifyEmail":
        result = verifyEmail(params.email, params.code);
        break;
      case "updateLastLogin":
        result = updateLastLogin(params.userId, parseInt(params.timestamp));
        break;
      case "getUserDecks":
        result = getUserDecks(params.userId);
        break;
      case "createDeck":
        result = createDeck(params);
        break;
      case "updateDeckStats":
        result = updateDeckStats(params.deckId, params.winner === "1");
        break;
      case "recordMatch":
        result = recordMatch(params);
        break;
      case "getPlayerStats":
        result = getPlayerStats(params.userId);
        break;
      case "getUserEconomy":
        result = getUserEconomy(params.userId);
        break;
      case "addDust":
        result = addDust(params.userId, parseInt(params.amount));
        break;
      case "addCrystals":
        result = addCrystals(params.userId, parseInt(params.amount));
        break;
      case "claimDailyReward":
        result = claimDailyReward(params.userId);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return ContentService.createTextOutput(
      JSON.stringify({ result, error: null })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ 
        error: error.message,
        result: null 
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// ====== USER OPERATIONS ======
function getUserByEmail(email) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.USERS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === email) { // column B = email
      return {
        id: data[i][0],
        email: data[i][1],
        passwordHash: data[i][2],
        verified: data[i][3] === "TRUE",
        verificationCode: data[i][4],
        createdAt: data[i][5],
        lastLogin: data[i][6]
      };
    }
  }
  return null;
}

function createUser(params) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.USERS);
  sheet.appendRow([
    params.userId,
    params.email,
    params.passwordHash,
    "FALSE",
    params.verificationCode,
    params.createdAt,
    params.createdAt
  ]);
  
  // Create economy row
  const ecoSheet = ss.getSheetByName(CONFIG.SHEETS.ECONOMY);
  ecoSheet.appendRow([
    params.userId,
    100, // starter dust
    0,   // starter crystals
    0,   // packs
    0    // lastDailyReward
  ]);
  
  return { success: true };
}

function verifyEmail(email, code) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.USERS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === email && data[i][4] === code) {
      sheet.getRange(i + 1, 4).setValue("TRUE"); // verified column
      sheet.getRange(i + 1, 5).setValue(""); // clear code
      return true;
    }
  }
  return false;
}

function updateLastLogin(userId, timestamp) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.USERS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId) {
      sheet.getRange(i + 1, 7).setValue(timestamp);
      return true;
    }
  }
  return false;
}

// ====== DECK OPERATIONS ======
function getUserDecks(userId) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.DECKS);
  const data = sheet.getDataRange().getValues();
  const decks = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === userId) {
      decks.push({
        id: data[i][0],
        userId: data[i][1],
        name: data[i][2],
        cardIds: JSON.parse(data[i][3]),
        wins: data[i][4],
        losses: data[i][5],
        created: data[i][6]
      });
    }
  }
  return decks;
}

function createDeck(params) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.DECKS);
  sheet.appendRow([
    params.deckId,
    params.userId,
    params.name,
    params.cardIds,
    0, // wins
    0, // losses
    params.created
  ]);
  return { success: true };
}

function updateDeckStats(deckId, isWin) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.DECKS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === deckId) {
      const winsCol = 5;
      const lossesCol = 6;
      const currentWins = data[i][winsCol - 1];
      const currentLosses = data[i][lossesCol - 1];
      
      if (isWin) {
        sheet.getRange(i + 1, winsCol).setValue(currentWins + 1);
      } else {
        sheet.getRange(i + 1, lossesCol).setValue(currentLosses + 1);
      }
      return true;
    }
  }
  return false;
}

// ====== MATCH OPERATIONS ======
function recordMatch(params) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.MATCHES);
  sheet.appendRow([
    params.matchId,
    params.playerId,
    params.opponentId,
    params.winner,
    params.duration,
    params.timestamp
  ]);
  return { success: true };
}

function getPlayerStats(userId) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.MATCHES);
  const data = sheet.getDataRange().getValues();
  
  let totalMatches = 0;
  let wins = 0;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === userId || data[i][2] === userId) {
      totalMatches++;
      if (data[i][3] === userId) {
        wins++;
      }
    }
  }
  
  return {
    totalMatches,
    wins,
    losses: totalMatches - wins
  };
}

// ====== ECONOMY OPERATIONS ======
function getUserEconomy(userId) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.ECONOMY);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId) {
      return {
        userId: data[i][0],
        dust: data[i][1],
        crystals: data[i][2],
        packsOwned: data[i][3],
        lastDailyReward: data[i][4]
      };
    }
  }
  return null;
}

function addDust(userId, amount) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.ECONOMY);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId) {
      const newDust = data[i][1] + amount;
      sheet.getRange(i + 1, 2).setValue(newDust);
      return newDust;
    }
  }
  return 0;
}

function addCrystals(userId, amount) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.ECONOMY);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId) {
      const newCrystals = data[i][2] + amount;
      sheet.getRange(i + 1, 3).setValue(newCrystals);
      return newCrystals;
    }
  }
  return 0;
}

function claimDailyReward(userId) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.ECONOMY);
  const data = sheet.getDataRange().getValues();
  
  const today = new Date().toDateString();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId) {
      const lastReward = new Date(data[i][4]).toDateString();
      
      if (lastReward === today) {
        return null; // Already claimed today
      }
      
      // Award dust + crystals
      const dust = data[i][1] + 50;
      const crystals = data[i][2] + 5;
      
      sheet.getRange(i + 1, 2).setValue(dust);
      sheet.getRange(i + 1, 3).setValue(crystals);
      sheet.getRange(i + 1, 5).setValue(Date.now());
      
      return { dust: 50, crystals: 5 };
    }
  }
  return null;
}
