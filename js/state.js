export const gameState = {
  currentView: 'arena',
  databases: {
    cards: []
  },
  currencies: {
    silver: 500, // Partiamo con un po' di monete per farti testare i pacchetti
    gems: 50
  },
  player: {
    username: "Guerriero",
    nameChangeCount: 0,
    stats: { matches: 0, wins: 0, losses: 0 },
    hp: 30, maxHp: 30, mana: 1, maxMana: 1,
    collection: [], // Carte trovate e potenziate
    deck: [],       // Il mazzo salvato (ID carte)
    matchDeck: [],  // Il mazzo fisico in partita
    hand: [],       
    board: [null, null, null, null, null],
    fieldCard: null,
    avatarCard: null
  },
  opponent: {
    name: 'IA Nemica', faction: 'Medioevo', isBot: true,
    hp: 30, maxHp: 30, mana: 1, maxMana: 1,
    matchDeck: [], hand: [],
    board: [null, null, null, null, null],
    fieldCard: null
  },
  turn: 1,
  tutorial: { active: true, step: 1 },
  quests: {
    loginStreak: 5,
    daily: [{ id: 1, title: "Vinci 3 partite con Nativi", progress: 1, target: 3, reward: "1 Pkt Nativi", completed: false }],
    weekly: [{ id: 3, title: "Completa 10 partite", progress: 4, target: 10, reward: "1 Pkt", completed: false }]
  }
};