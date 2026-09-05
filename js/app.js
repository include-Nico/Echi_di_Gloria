import { gameState, saveGameState, loadGameState } from './state.js';
import { getSession } from './services/authService.js';
import { renderAuthModal } from './views/authModalView.js';
import { renderArena } from './views/arenaView.js';
import { renderCampaign } from './views/campaignView.js';
import { renderCollection } from './views/collectionView.js';
import { renderShop } from './views/shopView.js';
import { renderProfileModal } from './views/profileModalView.js';
import { renderQuestsModal } from './views/questsModalView.js';

const viewMap = {
  arena: renderArena,
  campaign: renderCampaign,
  collection: renderCollection,
  shop: renderShop
};

export function navigate(viewName) {
  if (!viewMap[viewName]) return;
  gameState.currentView = viewName;
  saveGameState(); // Ricorda la pagina attiva al reload

  document.querySelectorAll('.nav-btn').forEach(btn => {
    const isActive = btn.dataset.view === viewName;
    btn.className = `nav-btn flex flex-col items-center transition-colors ${isActive ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`;
  });

  const root = document.getElementById('appRoot');
  root.innerHTML = '';
  root.appendChild(viewMap[viewName]());
}

window.navigate = navigate;
window.openProfile = () => renderProfileModal();
window.openQuests = () => renderQuestsModal();

async function loadDatabases() {
  try {
    const response = await fetch('/data/cards.json');
    if (response.ok) {
      gameState.databases.cards = await response.json();
    }
  } catch (error) {
    console.error("Errore fetch cards.json:", error);
  }
}

// Inizializza mazzo base se collezione vuota
function initStarterCollection() {
  if (gameState.player.collection.length === 0 && gameState.databases.cards.length > 0) {
    const starterCards = gameState.databases.cards.slice(0, 10);
    starterCards.forEach(card => {
      gameState.player.collection.push({
        ...card,
        level: 1,
        copies: 1,
        copiesNeeded: 3
      });
      gameState.player.deck.push(card.id);
    });
    saveGameState();
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  await loadDatabases();
  loadGameState();
  initStarterCollection();

  const silverEl = document.getElementById('silverCount');
  const gemsEl = document.getElementById('gemsCount');
  if (silverEl) silverEl.textContent = gameState.currencies.silver;
  if (gemsEl) gemsEl.textContent = gameState.currencies.gems;

  const session = getSession();
  if (!session && !gameState.player.username) {
    renderAuthModal((user) => {
      gameState.player.username = user.username;
      saveGameState();
      navigate(gameState.currentView || 'arena');
    });
  } else {
    navigate(gameState.currentView || 'arena');
  }
});