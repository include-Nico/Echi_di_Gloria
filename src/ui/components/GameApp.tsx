/**
 * React App Component - Main game container
 */

import React, { useState, useEffect } from "react";
import { GameState, PlayerState } from "../../types/GameState";
import { GameEngine } from "../../engine/GameEngine";
import { BattleArenaComponent } from "./BattleArenaComponent";
import { Card } from "../../types/Card";
import "../styles/App.css";

interface AppProps {
  playerName?: string;
  difficulty?: "easy" | "normal" | "hard";
}

// Mock player states for demo
const createMockPlayer = (id: string, name: string, deck: Card[]): PlayerState => ({
  playerId: id,
  name,
  health: 30,
  maxHealth: 30,
  currentMana: 1,
  maxManaPerTurn: 1,
  cardsInHand: deck.slice(0, 3),
  cardsInPlay: [],
  cardsInDeck: deck.slice(3),
  cardsInGraveyard: [],
  damageThisTurn: 0,
  resources: { dustCrafting: 0, crystals: 0 },
});

export const GameApp: React.FC<AppProps> = ({
  playerName = "Player",
  difficulty = "normal",
}) => {
  const [gameEngine, setGameEngine] = useState<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string>("");
  const [gameStatus, setGameStatus] = useState<"setup" | "playing" | "ended">("setup");

  // Initialize game
  useEffect(() => {
    // This would normally load from database or match the user with opponent
    const mockDeck: Card[] = [
      {
        cardId: "warrior1",
        name: "Warrior",
        faction: "Neutrale",
        rarity: "Comune",
        manaCost: 2,
        stats: { attack: 2, defense: 3, level: 1, maxLevel: 5 },
        keywords: [],
        abilities: [],
        description: "Basic warrior",
        createdAt: new Date().toISOString(),
      },
      // Add more cards here...
    ];

    const player1 = createMockPlayer("player1", playerName, mockDeck);
    const player2 = createMockPlayer("ai_bot", "AI Bot", mockDeck);

    const engine = new GameEngine(player1, player2);
    setGameEngine(engine);
    setGameState(engine.getGameState());
    setCurrentPlayerId("player1");
    setGameStatus("playing");

    // Start first turn
    engine.startTurn("player1");
  }, [playerName]);

  const handlePlayCard = (cardIndex: number) => {
    if (!gameEngine || !gameState) return;

    const success = gameEngine.playCard(currentPlayerId, cardIndex);
    if (success) {
      setGameState(gameEngine.getGameState());
      console.log(`Card played: ${gameState.players.get(currentPlayerId)?.cardsInHand[cardIndex]?.name}`);
    }
  };

  const handleAttackCard = (sourceId: string, targetId?: string) => {
    if (!gameEngine || !gameState) return;

    const damages = gameEngine.attack(currentPlayerId, sourceId, targetId);
    setGameState(gameEngine.getGameState());

    console.log(`Attack resolved: ${damages.length} damage`);

    // Check win condition
    const winner = gameEngine.checkWinCondition();
    if (winner) {
      setGameStatus("ended");
      console.log(`Game Over! Winner: ${winner}`);
    }
  };

  const handleEndTurn = () => {
    if (!gameEngine || !gameState) return;

    gameEngine.endTurn(currentPlayerId);
    setGameState(gameEngine.getGameState());

    // Switch to opponent
    const nextPlayer = Array.from(gameState.players.keys()).find(
      (id) => id !== currentPlayerId
    );
    if (nextPlayer) {
      setCurrentPlayerId(nextPlayer);
      // For demo: simulate opponent turn
      setTimeout(() => {
        simulateAITurn(nextPlayer);
      }, 1000);
    }
  };

  const simulateAITurn = (playerId: string) => {
    if (!gameEngine) return;

    // Simple AI: play first playable card, then end turn
    const player = gameEngine.getGameState().players.get(playerId);
    if (player) {
      for (let i = 0; i < player.cardsInHand.length; i++) {
        if (gameEngine.playCard(playerId, i)) {
          break;
        }
      }
    }

    gameEngine.endTurn(playerId);
    setGameState(gameEngine.getGameState());
    setCurrentPlayerId("player1");
  };

  if (!gameEngine || !gameState) {
    return <div className="app-loading">Initializing game...</div>;
  }

  return (
    <div className="game-app">
      {gameStatus === "playing" && (
        <BattleArenaComponent
          gameState={gameState}
          currentPlayerId={currentPlayerId}
          onPlayCard={handlePlayCard}
          onAttackCard={handleAttackCard}
          onEndTurn={handleEndTurn}
        />
      )}

      {gameStatus === "ended" && (
        <div className="game-ended">
          <h1>Game Over!</h1>
          <button onClick={() => window.location.reload()}>Play Again</button>
        </div>
      )}
    </div>
  );
};

export default GameApp;
