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
    nameChangeCount: 0, // Contatore per raddoppiare il costo delle gemme
    hp: 30,
    maxHp: 30,
    mana: 1,
    maxMana: 1,
    hand: [],
    board: [null, null, null, null, null],
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
    board: [null, null, null, null, null]
  },
  turn: 1,
  tutorial: {
    active: true, // Impostato a true per i nuovi giocatori
    step: 1 // 1: Mana, 2: Schieramento, 3: Attacco, 4: Fine
  },
  quests: {
    loginStreak: 5,
    daily: [
      { id: 1, title: "Vinci 3 partite con mazzo Nativi", progress: 1, target: 3, reward: "1 Pacchetto Nativi", completed: false },
      { id: 2, title: "Gioca 5 carte Leggendarie", progress: 5, target: 5, reward: "50 Gemme", completed: true }
    ],
    weekly: [
      { id: 3, title: "Completa 10 partite in Campagna", progress: 4, target: 10, reward: "1 Pacchetto a scelta", completed: false },
      { id: 4, title: "Vinci 5 partite PvP", progress: 2, target: 5, reward: "100 Gemme", completed: false }
    ]
  }
};