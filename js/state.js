export const gameState = {
  currentView: 'arena',
  currencies: {
    silver: 1450,
    gems: 320
  },
  player: {
    hp: 28,
    maxHp: 30,
    mana: 3,
    maxMana: 10,
    hand: [],
    board: [null, null, null, null, null],
    fieldCard: null,
    tookDamageThisTurn: true
  },
  opponent: {
    name: 'Lord Malakar',
    faction: 'Medioevo',
    isBot: true,
    hp: 26,
    maxHp: 30,
    mana: 4,
    board: [null, null, null, null, null],
    fieldCard: null
  },
  turn: 3
};