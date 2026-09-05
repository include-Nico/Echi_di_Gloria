export const gameState = {
  currentView: 'arena',
  databases: {
    cards: []
  },
  currencies: {
    silver: 50,
    gems: 0
  },
  player: {
    username: "Guerriero",
    nameChangeCount: 0,
    stats: {
      matches: 0,
      wins: 0,
      losses: 0
    },
    hp: 30,
    maxHp: 30,
    mana: 1,
    maxMana: 1,
    deck: [],       // Il mazzo da cui si pesca
    hand: [],       // Le carte in mano
    board: [null, null, null, null, null],
    graveyard: [],  // Carte distrutte
    avatarCard: null
  },
  opponent: {
    name: '',
    faction: '',
    isBot: true,
    hp: 30,
    maxHp: 30,
    mana: 1,
    maxMana: 1,
    deck: [],
    hand: [],
    board: [null, null, null, null, null],
    graveyard: []
  },
  turn: 1,
  tutorial: {
    active: true,
    step: 1
  },
  quests: {
    loginStreak: 5,
    daily: [
      { id: 1, title: "Vinci 3 partite con mazzo Nativi", progress: 1, target: 3, reward: "1 Pacchetto Nativi", completed: false },
      { id: 2, title: "Gioca 5 carte Leggendarie", progress: 5, target: 5, reward: "50 Gemme", completed: true }
    ],
    weekly: [
      { id: 3, title: "Completa 10 partite in Campagna", progress: 4, target: 10, reward: "1 Pkt a scelta", completed: false }
    ]
  }
};