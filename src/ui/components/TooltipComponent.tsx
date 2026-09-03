/**
 * Battle Arena Component - Main game board with player and opponent zones
 */

import React, { useState } from "react";
import { GameState } from "../../types/GameState";
import ManaBarComponent from "./ManaBarComponent";
import BoardCardComponent from "./BoardCardComponent";
import PlayerHandComponent from "./PlayerHandComponent";
import "../styles/BattleArena.css";

interface BattleArenaProps {
  gameState: GameState;
  currentPlayerId: string;
  onPlayCard: (cardIndex: number) => void;
  onAttackCard: (sourceId: string, targetId?: string) => void;
  onEndTurn: () => void;
}

export const BattleArenaComponent: React.FC<BattleArenaProps> = ({
  gameState,
  currentPlayerId,
  onPlayCard,
  onAttackCard,
  onEndTurn,
}) => {
  const playerState = gameState.players.get(currentPlayerId);
  const opponentState = Array.from(gameState.players.values()).find(
    (p) => p.playerId !== currentPlayerId
  );
  const isPlayerTurn = gameState.currentPlayerTurn === currentPlayerId;

  const [selectedBoardCard, setSelectedBoardCard] = useState<string | null>(null);
  const [dropZoneActive, setDropZoneActive] = useState(false);

  if (!playerState || !opponentState) {
    return <div className="arena-error">Game state invalid</div>;
  }

  const manaAccumulated = gameState.manaAccumulated.get(currentPlayerId) || 0;

  const handleCardDropped = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDropZoneActive(false);

    const cardIndexStr = e.dataTransfer.getData("cardIndex");
    if (cardIndexStr !== "") {
      const cardIndex = parseInt(cardIndexStr);
      onPlayCard(cardIndex);
    }
  };

  const handleBoardCardClick = (cardInstanceId: string) => {
    setSelectedBoardCard(selectedBoardCard === cardInstanceId ? null : cardInstanceId);
  };

  const handleAttackClick = (targetInstanceId?: string) => {
    if (selectedBoardCard) {
      onAttackCard(selectedBoardCard, targetInstanceId);
      setSelectedBoardCard(null);
    }
  };

  return (
    <div className="battle-arena">
      <div className="arena-header">
        <div className="player-info">
          <span className="player-name">{playerState.name}</span>
          <div className="health-display">
            <span className="health-number">{playerState.health}</span>
            <span className="health-max">/ {playerState.maxHealth}</span>
          </div>
        </div>

        <div className="turn-indicator">
          <span className={`turn-status ${isPlayerTurn ? "active" : "waiting"}`}>
            {isPlayerTurn ? "Your Turn" : "Opponent's Turn"}
          </span>
          <span className="turn-number">Turn {gameState.turnsPlayed}</span>
        </div>

        <div className="opponent-info">
          <span className="player-name">{opponentState.name}</span>
          <div className="health-display">
            <span className="health-number">{opponentState.health}</span>
            <span className="health-max">/ {opponentState.maxHealth}</span>
          </div>
        </div>
      </div>

      <div className="mana-section">
        <ManaBarComponent
          currentMana={playerState.currentMana}
          maxManaPerTurn={playerState.maxManaPerTurn}
          accumulated={manaAccumulated}
          turnNumber={gameState.turnsPlayed}
          isActive={isPlayerTurn}
        />
      </div>

      <div className="opponent-board">
        <h3>Opponent Board</h3>
        <div className="board-zone opponent">
          {opponentState.cardsInPlay.length === 0 ? (
            <div className="empty-board">No cards</div>
          ) : (
            opponentState.cardsInPlay.map((boardCard) => (
              <BoardCardComponent
                key={boardCard.instanceId}
                card={boardCard}
                position="opponent"
                onSelect={() => handleBoardCardClick(boardCard.instanceId)}
                onAttackTarget={() => handleAttackClick(boardCard.instanceId)}
              />
            ))
          )}
        </div>
      </div>

      <div className="player-board">
        <h3>Your Board</h3>
        <div className="board-zone player">
          {playerState.cardsInPlay.length === 0 ? (
            <div className="empty-board">No cards on board</div>
          ) : (
            playerState.cardsInPlay.map((boardCard) => (
              <BoardCardComponent
                key={boardCard.instanceId}
                card={boardCard}
                position="player"
                isSelected={selectedBoardCard === boardCard.instanceId}
                onSelect={() => handleBoardCardClick(boardCard.instanceId)}
              />
            ))
          )}
        </div>
      </div>

      <div
        className={`drop-zone ${dropZoneActive ? "active" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDropZoneActive(true);
        }}
        onDragLeave={() => setDropZoneActive(false)}
        onDrop={handleCardDropped}
      >
        <span>Drop card here to play</span>
      </div>

      <div className="player-hand-section">
        <PlayerHandComponent
          cards={playerState.cardsInHand}
          currentMana={playerState.currentMana}
          onPlayCard={onPlayCard}
          isActive={isPlayerTurn}
        />
      </div>

      <div className="action-bar">
        <button
          className="btn-attack"
          disabled={!selectedBoardCard}
          onClick={() => {
            if (selectedBoardCard) {
              handleAttackClick();
              setSelectedBoardCard(null);
            }
          }}
        >
          Attack Face ({selectedBoardCard ? "Active" : "Select Card"})
        </button>

        <button className="btn-end-turn" disabled={!isPlayerTurn} onClick={onEndTurn}>
          End Turn
        </button>
      </div>

      {gameState.currentPhase === "game_over" && (
        <div className="game-over-overlay">
          <div className="game-over-content">
            <h2>Game Over!</h2>
            <p>Winner: {gameState.currentPlayerTurn}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BattleArenaComponent;
