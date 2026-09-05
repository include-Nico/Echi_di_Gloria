const STORAGE_KEY = 'echi_di_gloria_save_v2';

export const gameState = {
  currentView: 'arena',
  databases: {
    cards: []
  },
  currencies: {
    silver: 300,
    gems: 50
  },
  player: {
    username: "Guerriero",
    nameChangeCount: 0,
    stats: { matches: 0, wins: 0, losses: 0 },
    hp: 30,
    maxHp: 30,
    mana: 1,
    maxMana: 1,
    collection: [], // Elenco carte possedute con copie e livello
    deck: [],       // ID delle carte nel mazzo (max 30)
    matchDeck: [],  // Mazzo fisico durante la partita
    hand: [],
    board: [null, null, null, null, null],
    fieldCard: null,
    avatarCard: null
  },
  opponent: {
    name: 'Guerriero IA',
    faction: 'Medioevo',
    isBot: true,
    hp: 30,
    maxHp: 30,
    mana: 1,
    maxMana: 1,
    matchDeck: [],
    hand: [],
    board: [null, null, null, null, null],
    fieldCard: null
  },
  turn: 1,
  tutorial: { active: false, step: 1 },
  quests: {
    loginStreak: 5,
    daily: [{ id: 1, title: "Vinci 3 partite con Nativi", progress: 1, target: 3, reward: "1 Pkt Nativi", completed: false }],
    weekly: [{ id: 3, title: "Completa 10 partite", progress: 4, target: 10, reward: "1 Pkt", completed: false }]
  }
};

// Salva lo stato completo sul browser
export function saveGameState() {
  try {
    const dataToSave = {
      currentView: gameState.currentView,
      currencies: gameState.currencies,
      player: {
        username: gameState.player.username,
        nameChangeCount: gameState.player.nameChangeCount,
        stats: gameState.player.stats,
        collection: gameState.player.collection,
        deck: gameState.player.deck,
        avatarCard: gameState.player.avatarCard
      }
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (err) {
    console.error("Errore salvataggio gameState:", err);
  }
}

// Carica lo stato all'avvio
export function loadGameState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    
    if (parsed.currentView) gameState.currentView = parsed.currentView;
    if (parsed.currencies) gameState.currencies = parsed.currencies;
    if (parsed.player) {
      if (parsed.player.username) gameState.player.username = parsed.player.username;
      if (parsed.player.nameChangeCount) gameState.player.nameChangeCount = parsed.player.nameChangeCount;
      if (parsed.player.stats) gameState.player.stats = parsed.player.stats;
      if (Array.isArray(parsed.player.collection)) gameState.player.collection = parsed.player.collection;
      if (Array.isArray(parsed.player.deck)) gameState.player.deck = parsed.player.deck;
      if (parsed.player.avatarCard) gameState.player.avatarCard = parsed.player.avatarCard;
    }
    return true;
  } catch (err) {
    console.error("Errore caricamento gameState:", err);
    return false;
  }
}