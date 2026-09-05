export const gameState = {
  currentView: 'arena',
  databases: {
    cards: []
  },
  currencies: {
    silver: 0,
    gems: 0
  },
  player: {
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
  turn: 1
};