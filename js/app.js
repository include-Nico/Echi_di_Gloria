import { gameState } from './state.js';
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

  document.querySelectorAll('.nav-btn').forEach(btn => {
    const isActive = btn.dataset.view === viewName;
    btn.className = `nav-btn flex flex-col items-center transition-colors ${isActive ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`;
  });

  const root = document.getElementById('appRoot');
  root.innerHTML = '';
  root.appendChild(viewMap[viewName]());
}

window.navigate = navigate;

// Esponi le funzioni dei modali globali
window.openProfile = () => renderProfileModal();
window.openQuests = () => renderQuestsModal();

async function loadDatabases() {
  try {
    const response = await fetch('/data/cards.json');
    if (response.ok) {
      gameState.databases.cards = await response.json();
    }
  } catch (error) {
    console.error("Errore nel caricamento del database:", error);
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  await loadDatabases();

  const session = getSession();
  if (!session) {
    renderAuthModal((user) => {
      gameState.player.username = user.username;
      document.getElementById('silverCount').textContent = user.silver;
      document.getElementById('gemsCount').textContent = user.gems;
      navigate('arena');
    });
  } else {
    gameState.currencies.silver = session.user.silver;
    gameState.currencies.gems = session.user.gems;
    gameState.player.username = session.user.username;
    if (session.user.playerCard) {
      gameState.player.avatarCard = session.user.playerCard;
    }
    document.getElementById('silverCount').textContent = session.user.silver;
    document.getElementById('gemsCount').textContent = session.user.gems;
    navigate('arena');
  }
});