/**
 * Card Component - Displays individual card with stats and keywords
 */

import React from "react";
import { Card, KeywordType } from "../../types/Card";
import "../styles/Card.css";

interface CardProps {
  card: Card;
  isSelected?: boolean;
  isPlayable?: boolean;
  onClick?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  variant?: "hand" | "board" | "preview";
}

const KeywordIcons: Record<KeywordType, string> = {
  SenzaPaura: "🛡️",
  Furia: "⚡",
  Trafittura: "🏹",
  Affondo: "⚔️",
  Trappola: "🪤",
  Rigenera: "💚",
  Elusivo: "👻",
  Fusione: "🔄",
};

export const CardComponent: React.FC<CardProps> = ({
  card,
  isSelected = false,
  isPlayable = true,
  onClick,
  draggable = false,
  onDragStart,
  variant = "hand",
}) => {
  const rarityClass = `rarity-${card.rarity.toLowerCase()}`;
  const factionClass = `faction-${card.faction.toLowerCase()}`;

  return (
    <div
      className={`card ${rarityClass} ${factionClass} ${isSelected ? "selected" : ""} ${
        !isPlayable ? "disabled" : ""
      } variant-${variant}`}
      onClick={onClick}
      draggable={draggable && variant !== "preview"}
      onDragStart={onDragStart}
    >
      <div className="card-header">
        <h3 className="card-name">{card.name}</h3>
        <span className="card-cost">{card.manaCost}</span>
      </div>

      <div className="card-image">
        {card.imageUrl ? (
          <img src={card.imageUrl} alt={card.name} />
        ) : (
          <div className="image-placeholder">{card.faction.substring(0, 3)}</div>
        )}
      </div>

      <div className="card-stats">
        <div className="stat attack" title="Attack">
          <span className="stat-icon">⚔️</span>
          <span className="stat-value">{card.stats.attack}</span>
        </div>
        <div className="stat defense" title="Defense">
          <span className="stat-icon">🛡️</span>
          <span className="stat-value">{card.stats.defense}</span>
        </div>
      </div>

      {card.keywords.length > 0 && (
        <div className="card-keywords">
          {card.keywords.map((keyword) => (
            <span key={keyword} className="keyword" title={keyword}>
              {KeywordIcons[keyword]}
            </span>
          ))}
        </div>
      )}

      <p className="card-description">{card.description}</p>

      <div className="card-rarity">{card.rarity}</div>
    </div>
  );
};

export default CardComponent;
