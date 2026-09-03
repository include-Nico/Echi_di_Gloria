/**
 * GoogleSheetsDB.ts
 * Secure wrapper around Google Sheets + Apps Script for user data, decks, matches
 * Sheets used:
 *   - Users: email, passwordHash, verified, createdAt, lastLogin
 *   - Decks: userId, deckName, cardIds, wins, losses, created
 *   - Matches: playerId, opponentId, winner, duration, timestamp
 *   - Economy: userId, dust, crystals, packsOwned, lastDailyReward
 */

interface SheetRow {
  [key: string]: string | number | boolean;
}

interface User {
  id: string;
  email: string;
  passwordHash: string;
  verified: boolean;
  verificationCode?: string;
  createdAt: number;
  lastLogin: number;
}

interface Deck {
  id: string;
  userId: string;
  name: string;
  cardIds: string[];
  wins: number;
  losses: number;
  created: number;
}

interface Match {
  id: string;
  playerId: string;
  opponentId: string;
  winner: string;
  duration: number; // milliseconds
  timestamp: number;
}

interface UserEconomy {
  userId: string;
  dust: number;
  crystals: number;
  packsOwned: number;
  lastDailyReward: number;
}

class GoogleSheetsDB {
  private scriptUrl: string;
  private cache: Map<string, any> = new Map();
  private cacheExpiry: number = 60000; // 1 minute

  constructor(scriptUrl: string) {
    this.scriptUrl = scriptUrl;
  }

  /**
   * Execute Apps Script function via HTTP GET
   * Request format: ?action=getUserByEmail&email=user@example.com
   */
  private async executeFunction(
    action: string,
    params: Record<string, string | number>
  ): Promise<any> {
    const queryString = new URLSearchParams({
      action,
      ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
    }).toString();

    try {
      const response = await fetch(`${this.scriptUrl}?${queryString}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Apps Script error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      return data.result;
    } catch (error) {
      console.error(`[GoogleSheetsDB] ${action} failed:`, error);
      throw error;
    }
  }

  // ====== USER MANAGEMENT ======

  async getUserByEmail(email: string): Promise<User | null> {
    const cacheKey = `user:${email}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    const result = await this.executeFunction("getUserByEmail", { email });
    if (!result) return null;

    const user = result as User;
    this.cache.set(cacheKey, { data: user, timestamp: Date.now() });
    return user;
  }

  async createUser(email: string, passwordHash: string): Promise<User> {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const verificationCode = Math.random().toString(36).substr(2, 8).toUpperCase();

    const user: User = {
      id: userId,
      email,
      passwordHash,
      verified: false,
      verificationCode,
      createdAt: Date.now(),
      lastLogin: Date.now()
    };

    await this.executeFunction("createUser", {
      userId,
      email,
      passwordHash,
      verificationCode,
      createdAt: user.createdAt
    });

    this.cache.delete(`user:${email}`);
    return user;
  }

  async verifyEmail(email: string, code: string): Promise<boolean> {
    const result = await this.executeFunction("verifyEmail", { email, code });
    if (result) {
      this.cache.delete(`user:${email}`);
    }
    return result;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.executeFunction("updateLastLogin", { userId, timestamp: Date.now() });
  }

  // ====== DECK MANAGEMENT ======

  async getUserDecks(userId: string): Promise<Deck[]> {
    const cacheKey = `decks:${userId}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    const result = await this.executeFunction("getUserDecks", { userId });
    const decks = (result || []) as Deck[];

    this.cache.set(cacheKey, { data: decks, timestamp: Date.now() });
    return decks;
  }

  async createDeck(userId: string, name: string, cardIds: string[]): Promise<Deck> {
    const deckId = `deck_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const deck: Deck = {
      id: deckId,
      userId,
      name,
      cardIds,
      wins: 0,
      losses: 0,
      created: Date.now()
    };

    await this.executeFunction("createDeck", {
      deckId,
      userId,
      name,
      cardIds: JSON.stringify(cardIds),
      created: deck.created
    });

    this.cache.delete(`decks:${userId}`);
    return deck;
  }

  async updateDeckStats(deckId: string, winner: boolean): Promise<void> {
    await this.executeFunction("updateDeckStats", {
      deckId,
      winner: winner ? 1 : 0
    });
  }

  // ====== MATCH HISTORY ======

  async recordMatch(
    playerId: string,
    opponentId: string,
    winner: string,
    duration: number
  ): Promise<Match> {
    const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const match: Match = {
      id: matchId,
      playerId,
      opponentId,
      winner,
      duration,
      timestamp: Date.now()
    };

    await this.executeFunction("recordMatch", {
      matchId,
      playerId,
      opponentId,
      winner,
      duration,
      timestamp: match.timestamp
    });

    return match;
  }

  async getPlayerStats(userId: string): Promise<{
    totalMatches: number;
    wins: number;
    losses: number;
    winRate: number;
  }> {
    const result = await this.executeFunction("getPlayerStats", { userId });

    return {
      totalMatches: result.totalMatches || 0,
      wins: result.wins || 0,
      losses: result.losses || 0,
      winRate: (result.wins || 0) / (result.totalMatches || 1)
    };
  }

  // ====== ECONOMY ====== 

  async getUserEconomy(userId: string): Promise<UserEconomy> {
    const cacheKey = `economy:${userId}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    const result = await this.executeFunction("getUserEconomy", { userId });
    const economy: UserEconomy = {
      userId,
      dust: result?.dust || 0,
      crystals: result?.crystals || 0,
      packsOwned: result?.packsOwned || 0,
      lastDailyReward: result?.lastDailyReward || 0
    };

    this.cache.set(cacheKey, { data: economy, timestamp: Date.now() });
    return economy;
  }

  async addDust(userId: string, amount: number): Promise<number> {
    const result = await this.executeFunction("addDust", { userId, amount });
    this.cache.delete(`economy:${userId}`);
    return result;
  }

  async addCrystals(userId: string, amount: number): Promise<number> {
    const result = await this.executeFunction("addCrystals", { userId, amount });
    this.cache.delete(`economy:${userId}`);
    return result;
  }

  async claimDailyReward(userId: string): Promise<{ dust: number; crystals: number } | null> {
    const result = await this.executeFunction("claimDailyReward", { userId });
    if (result) {
      this.cache.delete(`economy:${userId}`);
    }
    return result;
  }

  // ====== CACHE MANAGEMENT ======

  clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

export { GoogleSheetsDB, User, Deck, Match, UserEconomy };
