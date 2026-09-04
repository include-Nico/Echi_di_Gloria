export function resolveAttack(attacker, defender) {
  let effectiveDamage = attacker.attack;
  let overkillDamage = 0;
  let defenderDied = false;

  // Meccanica: Scudo Sacro Medioevo (annulla il primo danno subito)
  if (defender.hasSacredShield) {
    defender.hasSacredShield = false;
    return {
      damageDealt: 0,
      overkill: 0,
      defenderDied: false,
      shieldBroken: true
    };
  }

  if (effectiveDamage >= defender.defense) {
    overkillDamage = effectiveDamage - defender.defense;
    defender.defense = 0;
    defenderDied = true;
  } else {
    defender.defense -= effectiveDamage;
  }

  return {
    damageDealt: effectiveDamage,
    overkill: overkillDamage,
    defenderDied,
    shieldBroken: false
  };
}

export function computeSynergyBonus(boardSlots) {
  const factionCounts = {};
  boardSlots.forEach(card => {
    if (card) {
      factionCounts[card.faction] = (factionCounts[card.faction] || 0) + 1;
    }
  });

  // Fratellanza: +1 Attacco a tutte le creature con 2+ alleati della stessa fazione
  return boardSlots.map(card => {
    if (!card) return null;
    const bonus = (factionCounts[card.faction] >= 2) ? 1 : 0;
    return {
      ...card,
      effectiveAttack: card.attack + bonus
    };
  });
}