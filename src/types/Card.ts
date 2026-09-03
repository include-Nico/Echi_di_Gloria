/**
 * Card Data Model for Echi di Gloria CCG
 * Supports stats, keywords, triggered abilities, and fusion mechanics
 */

export interface CardStats {
  attack: number;
  defense: number;
  level: number;
  maxLevel: number;
}

export type KeywordType = 
  | "SenzaPaura" // Fearless: Takes reduced damage
  | "Furia" // Frenzy: Cost reduction when player damaged
  | "Trafittura" // Piercing: Overflow damage to face (only specific factions)
  | "Affondo" // Charge: Can attack immediately when played
  | "Trappola" // Trap: Triggered effect on opponent action
  | "Rigenera" // Regenerate: Heal at end of turn
  | "Elusivo" // Elusive: Hard to target
  | "Fusione"; // Fusion: Can combine copies

export type AbilityType = "Passive" | "Triggered" | "Activated";

export type TriggerType =
  | "OnPlayerDamagedThisTurn"
  | "OnCardPlayed"
  | "OnTurnStart"
  | "OnTurnEnd"
  | "OnCardDestroyed"
  | "OnOpponentAttacks"
  | "OnManaAvailable";

export interface Ability {
  type: AbilityType;
  trigger?: TriggerType;
  effect: string;
  value?: number;
  condition?: string;
  description: string;
}

export interface FusionProgress {
  currentCopies: number;
  requiredCopies: number;
  bonusPerFusion?: {
    attackIncrease: number;
    defenseIncrease: number;
    costReduction: number;
  };
}

export type Faction = 
  | "Vichinghi" 
  | "Celti" 
  | "Romani" 
  | "Egiziani" 
  | "Neutrale";

export type Rarity = "Comune" | "Rara" | "Epica" | "Leggendaria";

export interface Card {
  cardId: string;
  name: string;
  faction: Faction;
  rarity: Rarity;
  manaCost: number;
  stats: CardStats;
  keywords: KeywordType[];
  abilities: Ability[];
  fusionProgress?: FusionProgress;
  description: string;
  imageUrl?: string;
  createdAt: string;
  isRemoved?: boolean;
}
