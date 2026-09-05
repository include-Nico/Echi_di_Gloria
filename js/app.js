import { gameState } from './state.js';
import { getSession } from './services/authService.js';
import { renderAuthModal } from './views/authModalView.js';
import { renderArena } from './views/arenaView.js';
import { renderCampaign } from './views/campaignView.js';
import { renderCollection } from './views/collectionView.js';
import { renderShop } from './views/shopView.js';

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

async function loadDatabases() {
  try {
    const response = await fetch('/data/cards.json');
    if (response.ok) {
      gameState.databases.cards = await response.json();
    } else {
      console.error("Errore HTTP durante il fetch di cards.json:", response.status);
    }
  } catch (error) {
    console.error("Errore nel caricamento del database carte:", error);
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  await loadDatabases();

  const session = getSession();
  if (!session) {
    renderAuthModal((user) => {
      document.getElementById('silverCount').textContent = user.silver;
      document.getElementById('gemsCount').textContent = user.gems;
      navigate('arena');
    });
  } else {
    gameState.currencies.silver = session.user.silver;
    gameState.currencies.gems = session.user.gems;
    if (session.user.playerCard) {
      gameState.player.avatarCard = session.user.playerCard;
    }
    document.getElementById('silverCount').textContent = session.user.silver;
    document.getElementById('gemsCount').textContent = session.user.gems;
    navigate('arena');
  }
});