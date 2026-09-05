import { gameState, saveGameState } from '../state.js';

export function renderShop() {
  const container = document.createElement('div');
  container.className = 'flex flex-col gap-4 p-3 md:p-6 pb-24 h-full overflow-y-auto select-none';

  const FULL_CARD_DB = gameState.databases.cards || [];
  const dailyCard = FULL_CARD_DB.find(c => c.id === 'JAP_008') || FULL_CARD_DB[0] || { id: "DEF", cost: 2, name: "Guerriero", faction: "Vichinghi", rarity: "Comune", attack: 2, defense: 2 }; 
  const dailyPrice = 150;

  const packs = [
    { id: 'standard', name: 'Busta Standard', desc: '5 Carte miste', cost: 50, currency: 'silver', guarantee: 'Non Comune' },
    { id: 'vichinghi', name: 'Busta Vichinghi', desc: '5 Carte Nordiche', cost: 100, currency: 'silver', faction: 'Vichinghi', guarantee: 'Rara' },
    { id: 'medioevo', name: 'Busta Medioevo', desc: '5 Carte Crociate', cost: 100, currency: 'silver', faction: 'Medioevo', guarantee: 'Rara' },
    { id: 'giapponesi', name: 'Busta Samurai', desc: '5 Carte d\'Oriente', cost: 100, currency: 'silver', faction: 'Giapponesi', guarantee: 'Rara' },
    { id: 'nativi', name: 'Busta Tribale', desc: '5 Carte Nativi', cost: 100, currency: 'silver', faction: 'Nativi', guarantee: 'Rara' },
    { id: 'leggendario', name: 'Reliquia Divina', desc: '1 Epica / Legg. Garantita', cost: 100, currency: 'gems', guarantee: 'Epica' }
  ];

  container.innerHTML = `
    <!-- OFFERTA 24H -->
    <div class="bg-surface-container rounded-xl p-3.5 border border-primary/30 flex items-center justify-between shadow-lg">
      <div class="flex flex-col">
        <span class="font-tactical text-[9px] uppercase font-bold text-primary">Offerta del Giorno</span>
        <span class="font-display font-bold text-base text-on-surface leading-tight">${dailyCard.name}</span>
        <span class="font-tactical text-[10px] text-on-surface-variant">${dailyCard.faction} • ${dailyCard.rarity}</span>
      </div>
      <button id="buyDailyBtn" class="px-4 py-2.5 bg-primary text-[#110d0a] font-tactical font-bold text-xs rounded-lg shadow active:scale-95 flex items-center gap-1">
        <span class="material-symbols-outlined text-[15px]">toll</span> ${dailyPrice}
      </button>
    </div>

    <!-- BUSTE -->
    <div class="flex flex-col gap-2 mt-2">
      <span class="font-display font-bold text-sm text-on-surface tracking-wide">Buste Reliquia</span>
      <div class="grid grid-cols-2 gap-3">
        ${packs.map((pack, idx) => `
          <div class="flex flex-col justify-between bg-surface-container rounded-xl p-3 border border-outline-variant/40 shadow">
            <div>
              <span class="font-display font-bold text-xs text-primary block leading-tight">${pack.name}</span>
              <span class="font-tactical text-[10px] text-on-surface-variant block mt-0.5 leading-snug">${pack.desc}</span>
            </div>
            <button class="buy-pack-btn mt-3 py-2 w-full ${pack.currency === 'gems' ? 'bg-secondary text-[#110d0a]' : 'bg-surface-container-highest text-on-surface border border-outline-variant'} font-tactical font-bold text-xs rounded shadow active:scale-95 flex items-center justify-center gap-1" data-idx="${idx}">
              <span class="material-symbols-outlined text-[15px]">${pack.currency === 'gems' ? 'diamond' : 'toll'}</span>
              ${pack.cost}
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Compra Carta del giorno
  container.querySelector('#buyDailyBtn').onclick = () => {
    if (gameState.currencies.silver >= dailyPrice) {
      gameState.currencies.silver -= dailyPrice;
      savePulledCards([dailyCard]);
      showToast(`${dailyCard.name} aggiunta al Grimorio!`);
    } else {
      showToast("Argento insufficiente.");
    }
  };

  // Compra Pacchetti
  container.querySelectorAll('.buy-pack-btn').forEach(btn => {
    btn.onclick = () => {
      const pack = packs[btn.dataset.idx];
      if (pack.currency === 'silver') {
        if (gameState.currencies.silver >= pack.cost) {
          gameState.currencies.silver -= pack.cost;
          openPack(pack, FULL_CARD_DB);
        } else showToast("Argento insufficiente.");
      } else {
        if (gameState.currencies.gems >= pack.cost) {
          gameState.currencies.gems -= pack.cost;
          openPack(pack, FULL_CARD_DB);
        } else showToast("Gemme insufficienti.");
      }
    };
  });

  return container;
}

// Salva e impila i duplicati nel grimorio
function savePulledCards(cards) {
  cards.forEach(pulled => {
    const existing = gameState.player.collection.find(c => c.id === pulled.id);
    if (existing) {
      existing.copies = (existing.copies || 1) + 1;
    } else {
      gameState.player.collection.push({
        ...pulled,
        level: 1,
        copies: 1,
        copiesNeeded: 3
      });
      // Se il mazzo ha spazio, aggiungila subito
      if (gameState.player.deck.length < 30) {
        gameState.player.deck.push(pulled.id);
      }
    }
  });

  saveGameState();
  
  const s = document.getElementById('silverCount');
  const g = document.getElementById('gemsCount');
  if (s) s.textContent = gameState.currencies.silver;
  if (g) g.textContent = gameState.currencies.gems;
}

function openPack(pack, pool) {
  const cards = [];
  let available = pack.faction ? pool.filter(c => c.faction === pack.faction) : pool;
  if (available.length === 0) available = pool;

  for (let i = 0; i < 5; i++) {
    const randomCard = available[Math.floor(Math.random() * available.length)];
    cards.push(randomCard);
  }

  savePulledCards(cards);
  renderRevealModal(cards);
}

function renderRevealModal(cards) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-[70] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4';

  modal.innerHTML = `
    <h2 class="font-display font-bold text-lg text-primary mb-4 tracking-widest">NUOVE RELIQUIE AGGIUNTE</h2>
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full max-w-sm mb-6">
      ${cards.map(c => `
        <div class="bg-surface-container-high border border-outline-variant rounded-lg p-2 text-center shadow">
          <span class="font-display font-bold text-xs text-on-surface block truncate">${c.name}</span>
          <span class="font-tactical text-[9px] text-primary block mt-0.5">${c.faction}</span>
          <div class="flex justify-between items-center mt-1 text-[10px] font-tactical">
            <span class="text-error font-bold">⚔ ${c.attack}</span>
            <span class="text-secondary font-bold">🛡 ${c.defense}</span>
          </div>
        </div>
      `).join('')}
    </div>
    <button id="closeModalBtn" class="w-full max-w-xs py-3 bg-primary text-[#110d0a] font-tactical font-bold text-xs rounded-xl shadow-lg active:scale-95">
      RIPONI NEL GRIMORIO
    </button>
  `;

  document.body.appendChild(modal);
  modal.querySelector('#closeModalBtn').onclick = () => modal.remove();
}

function showToast(msg) {
  let toast = document.getElementById('ingame-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'ingame-toast';
    toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 bg-surface-container-highest text-primary border border-primary/30 font-tactical text-xs rounded-full shadow-2xl z-[100] transition-all';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  setTimeout(() => { toast.style.opacity = '0'; }, 2000);
}