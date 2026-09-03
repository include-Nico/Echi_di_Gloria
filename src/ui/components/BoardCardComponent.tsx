/**
 * Board Card Component - Card rendered on the battle arena
 */

import React, { useState } from "react";
import { BoardCard as BoardCardType } from "../../types/GameState";
import "../styles/BoardCard.css";

interface BoardCardProps {
  card: BoardCardType;
  position: "player" | "opponent";
  isDamaged?: boolean;
  isLocked?: boolean;
  onSelect?: () => void;
  onAttackTarget?: () => void;
}

export const BoardCardComponent: React.FC<BoardCardProps> = ({
  card,
  position,
  isDamaged = false,
  isLocked = false,
  onSelect,
  onAttackTarget,
}) => {
  const [showBuffs, setShowBuffs] = useState(false);
  const healthPercentage = (card.remainingHealth / card.card.stats.defense) * 100;

  return (
    <div
      className={`board-card position-${position} ${isDamaged ? "damaged" : ""} ${
        isLocked ? "locked" : ""
      }`}
      onClick={onSelect}
      onContextMenu={(e) => {
        e.preventDefault();
        onAttackTarget?.();
      }}
    >
      <div className="board-card-visual">
        <div className="card-frame">
          {card.card.imageUrl ? (
            <img src={card.card.imageUrl} alt={card.card.name} />
          ) : (
            <div className="visual-placeholder">{card.card.faction.substring(0, 2)}</div>
          )}
        </div>

        <div className="board-card-header">
          <span className="name">{card.card.name}</span>
          <span className="cost">{card.card.manaCost}</span>
        </div>
      </div>

      <div className="board-card-stats">
        <div className="stat-attack">
          <span>{card.currentAttack}</span>
          {card.currentAttack !== card.card.stats.attack && (
            <span className="modified">({card.card.stats.attack})</span>
          )}
        </div>

        <div className="health-bar">
          <div
            className={`health-fill ${healthPercentage > 50 ? "healthy" : "wounded"}`}
            style={{ width: `${healthPercentage}%` }}
          />
          <span className="health-text">
            {card.remainingHealth}/{card.card.stats.defense}
          </span>
        </div>

        <div className="stat-defense">
          <span>{card.currentDefense}</span>
          {card.currentDefense !== card.card.stats.defense && (
            <span className="modified">({card.card.stats.defense})</span>
          )}
        </div>
      </div>

      {(card.buffs.length > 0 || card.debuffs.length > 0) && (
        <div className="effects-indicator" onMouseEnter={() => setShowBuffs(true)} onMouseLeave={() => setShowBuffs(false)}>
          <div className="effect-badge">{card.buffs.length + card.debuffs.length}</div>
          {showBuffs && (
            <div className="effects-tooltip">
              {card.buffs.map((b) => (
                <div key={b.id} className="buff">
                  ✅ {b.effect} +{b.value}
                </div>
              ))}
              {card.debuffs.map((d) => (
                <div key={d.id} className="debuff">
                  ❌ {d.effect} -{d.value}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isLocked && <div className="locked-badge">🔒</div>}
      {card.manaLocked && <div className="mana-locked-badge">⏸️</div>}

      <div className="board-keywords">
        {card.card.keywords.map((kw) => (
          <span key={kw} className="keyword-badge" title={kw}>
            {kw.substring(0, 1)}
          </span>
        ))}
      </div>
    </div>
  );
};

export default BoardCardComponent;
