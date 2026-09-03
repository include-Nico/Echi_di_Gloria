/**
 * Mana Bar Component - Display current mana, max mana, and accumulation
 */

import React from "react";
import "../styles/ManaBar.css";

interface ManaBarProps {
  currentMana: number;
  maxManaPerTurn: number;
  accumulated: number;
  maxAccumulation?: number;
  turnNumber?: number;
  isActive?: boolean;
}

export const ManaBarComponent: React.FC<ManaBarProps> = ({
  currentMana,
  maxManaPerTurn,
  accumulated,
  maxAccumulation = 3,
  turnNumber = 1,
  isActive = false,
}) => {
  const manaPercentage = (currentMana / (maxManaPerTurn + maxAccumulation)) * 100;

  return (
    <div className={`mana-bar ${isActive ? "active" : "inactive"}`}>
      <div className="turn-badge">
        <span className="turn-label">Turn</span>
        <span className="turn-number">{turnNumber}</span>
      </div>

      <div className="mana-pool">
        <div className="mana-label">
          <span className="current">{currentMana}</span>
          <span className="separator">/</span>
          <span className="max">{maxManaPerTurn}</span>
        </div>

        <div className="mana-bar-fill">
          <div
            className="mana-current"
            style={{ width: `${Math.min((currentMana / maxManaPerTurn) * 100, 100)}%` }}
          >
            <div className="mana-sparkle" />
          </div>

          {accumulated > 0 && (
            <div
              className="mana-accumulated"
              style={{
                width: `${(accumulated / maxAccumulation) * 25}%`,
                marginLeft: "auto",
              }}
              title={`+${accumulated} accumulated`}
            >
              <span className="overflow-label">+{accumulated}</span>
            </div>
          )}
        </div>

        <div className="mana-breakdown">
          <div className="breakdown-item">
            <span className="label">This Turn:</span>
            <span className="value">{Math.max(0, currentMana - accumulated)}</span>
          </div>
          <div className="breakdown-item">
            <span className="label">Carried Over:</span>
            <span className="value">{accumulated}</span>
            <span className="cap">max +{maxAccumulation}</span>
          </div>
        </div>
      </div>

      <div className="mana-status">
        {currentMana === 0 && <span className="depleted">💤 No Mana</span>}
        {currentMana <= 2 && currentMana > 0 && <span className="low">⚠️ Low</span>}
        {currentMana > 2 && currentMana < maxManaPerTurn && <span className="available">✓</span>}
        {currentMana >= maxManaPerTurn && <span className="full">🔋 Full</span>}
      </div>
    </div>
  );
};

export default ManaBarComponent;
