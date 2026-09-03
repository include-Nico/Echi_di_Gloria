/**
 * Player Hand Component - Cards in player's hand with drag-drop support
 */

import React, { useState } from "react";
import { Card } from "../../types/Card";
import CardComponent from "./CardComponent";
import "../styles/PlayerHand.css";

interface PlayerHandProps {
  cards: Card[];
  currentMana: number;
  onPlayCard: (cardIndex: number) => void;
  isActive?: boolean;
  selectedCardIndex?: number;
}

export const PlayerHandComponent: React.FC<PlayerHandProps> = ({
  cards,
  currentMana,
  onPlayCard,
  isActive = false,
  selectedCardIndex = -1,
}) => {
  const [draggedCardIndex, setDraggedCardIndex] = useState<number | null>(null);

  const handleDragStart = (index: number, e: React.DragEvent<HTMLDivElement>) => {
    setDraggedCardIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("cardIndex", index.toString());
  };

  const handleDragEnd = () => {
    setDraggedCardIndex(null);
  };

  const canPlayCard = (card: Card): boolean => {
    let manaCost = card.manaCost;

    if (card.fusionProgress && card.fusionProgress.currentCopies >= 3) {
      manaCost = Math.max(1, manaCost - (card.fusionProgress.bonusPerFusion?.costReduction || 1));
    }

    return currentMana >= manaCost && isActive;
  };

  return (
    <div className={`player-hand ${isActive ? "active" : "inactive"}`}>
      <div className="hand-header">
        <h3>Your Hand</h3>
        <span className="card-count">{cards.length}</span>
      </div>

      <div className="hand-container">
        {cards.length === 0 ? (
          <div className="empty-hand">No cards in hand</div>
        ) : (
          <div className="cards-grid">
            {cards.map((card, index) => {
              const isPlayable = canPlayCard(card);
              const isDragging = draggedCardIndex === index;

              return (
                <div
                  key={`${card.cardId}-${index}`}
                  className={`hand-card-wrapper ${isDragging ? "dragging" : ""}`}
                >
                  <CardComponent
                    card={card}
                    variant="hand"
                    isSelected={selectedCardIndex === index}
                    isPlayable={isPlayable}
                    draggable={isActive}
                    onDragStart={(e) => handleDragStart(index, e)}
                    onClick={() => {
                      if (isPlayable && isActive) {
                        onPlayCard(index);
                      }
                    }}
                  />
                  {!isPlayable && (
                    <div className="unplayable-overlay">
                      <span className="unplayable-reason">
                        {!isActive ? "Not your turn" : `Need ${card.manaCost - currentMana} more mana`}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="hand-footer">
        <small>Drag cards to board or click to play</small>
      </div>
    </div>
  );
};

export default PlayerHandComponent;
