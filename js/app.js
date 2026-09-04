import { gameState } from './state.js';
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
    btn.className = `nav-btn flex flex-col items-center ${isActive ? 'text-primary' : 'text-on-surface-variant'}`;
  });

  const root = document.getElementById('appRoot');
  root.innerHTML = '';
  root.appendChild(viewMap[viewName]());
}

window.navigate = navigate;

window.addEventListener('DOMContentLoaded', () => {
  navigate('arena');
});