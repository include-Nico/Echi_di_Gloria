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
    btn.className = `nav-btn flex flex-col items-center ${isActive ? 'text-primary' : 'text-on-surface-variant'}`;
  });

  const root = document.getElementById('appRoot');
  root.innerHTML = '';
  root.appendChild(viewMap[viewName]());
}

window.navigate = navigate;

window.addEventListener('DOMContentLoaded', () => {
  const session = getSession();
  if (!session) {
    // Utente non autenticato: mostra modal e blocca fino a login/verifica OTP
    renderAuthModal((user) => {
      document.getElementById('silverCount').textContent = user.silver;
      document.getElementById('gemsCount').textContent = user.gems;
      navigate('arena');
    });
  } else {
    gameState.currencies.silver = session.user.silver;
    gameState.currencies.gems = session.user.gems;
    document.getElementById('silverCount').textContent = session.user.silver;
    document.getElementById('gemsCount').textContent = session.user.gems;
    navigate('arena');
  }
});