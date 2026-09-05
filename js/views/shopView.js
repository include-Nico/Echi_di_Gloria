import { gameState } from '../state.js';

export function renderShop() {
  const container = document.createElement('div');
  container.className = 'flex flex-col gap-4 p-3 md:p-6 pb-24 h-full overflow-y-auto select-none';

  const FULL_CARD_DB = gameState.databases.cards || [];
  const dailyCard = FULL_CARD_DB.find(c => c.id === 'JAP_008') || FULL_CARD_DB[0] || { cost: 0, name: "Errore Rete", rarity: "", art: "" }; 
  const dailyPrice = 450;
  const originalPrice = 650;

  const packs = [
    { id: 'standard', name: 'Standard', desc: '1 Non Comune Garantita', cost: 50, currency: 'silver', art: 'https://image.pollinations.ai/prompt/simple%20brown%20leather%20card%20booster%20pack%20fantasy?width=400&height=300&nologo=true', faction: null, guarantee: 'Non Comune' },
    { id: 'vichinghi', name: 'Vichinghi', desc: '1 Rara Garantita', cost: 100, currency: 'silver', art: 'https://image.pollinations.ai/prompt/simple%20icy%20blue%20viking%20card%20booster%20pack?width=400&height=300&nologo=true', faction: 'Vichinghi', guarantee: 'Rara' },
    { id: 'medioevo', name: 'Medioevo', desc: '1 Rara Garantita', cost: 100, currency: 'silver', art: 'https://image.pollinations.ai/prompt/simple%20red%20and%20silver%20medieval%20card%20booster%20pack?width=400&height=300&nologo=true', faction: 'Medioevo', guarantee: 'Rara' },
    { id: 'giapponesi', name: 'Giapponesi', desc: '1 Rara Garantita', cost: 100, currency: 'silver', art: 'https://image.pollinations.ai/prompt/simple%20black%20and%20pink%20samurai%20card%20booster%20pack?width=400&height=300&nologo=true', faction: 'Giapponesi', guarantee: 'Rara' },
    { id: 'nativi', name: 'Nativi', desc: '1 Rara Garantita', cost: 100, currency: 'silver', art: 'https://image.pollinations.ai/prompt/simple%20green%20and%20wood%20tribal%20card%20booster%20pack?width=400&height=300&nologo=true', faction: 'Nativi', guarantee: 'Rara' },
    { id: 'leggendario', name: 'Leggendario', desc: '1 Epica/Legg.', cost: 200, currency: 'gems', art: 'https://image.pollinations.ai/prompt/simple%20glowing%20gold%20card%20booster%20pack?width=400&height=300&nologo=true', faction: null, guarantee: 'Epica' }
  ];

  container.innerHTML = `
    <!-- Negozio Giornaliero -->
    <div class="relative overflow-hidden rounded-xl bg-surface-container-high shadow-xl border border-primary/20">
      <div class="absolute -right-8 -top-8 w-44 h-44 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
      <div class="p-4 flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <span class="inline-flex items-center px-2 py-0.5 bg-primary text-on-primary rounded font-tactical text-[9px] uppercase font-bold">Offerta 24h</span>
          <span class="font-display font-bold text-sm text-primary tracking-wide">-30% Sconto</span>
        </div>
        <div class="flex gap-4 items-center">
          <div class="relative w-24 aspect-[5/7] rounded overflow-hidden shadow-lg border border-primary shrink-0">
            <img class="w-full h-full object-cover" src="${dailyCard.art}" />
          </div>
          <div class="flex flex-col flex-1 justify-between py-1 h-full">
            <div>
              <div class="font-display font-bold text-base text-on-surface leading-tight">${dailyCard.name}</div>
              <div class="font-tactical text-[9px] text-on-surface-variant uppercase mt-0.5">${dailyCard.faction} • ${dailyCard.rarity}</div>
            </div>
            <button id="buyDailyBtn" class="w-full mt-2 py-2 px-3 bg-surface-container-lowest border border-primary text-primary hover:bg-primary hover:text-on-primary transition-colors rounded shadow flex items-center justify-between active:scale-95">
              <span class="font-tactical text-[11px] font-bold">RISCATTA</span>
              <div class="flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">toll</span><span class="font-tactical text-sm font-bold">${dailyPrice}</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pacchetti -->
    <div class="flex flex-col gap-2 mt-2">
      <span class="font-display font-bold text-sm text-on-surface tracking-wide">Buste & Reliquie</span>
      <div class="grid grid-cols-2 gap-3" id="packsGrid">
        ${packs.map((pack, idx) => `
          <div class="flex flex-col rounded-xl bg-surface-container-low p-2 shadow-md border border-surface-container-highest">
            <div class="relative w-full aspect-[4/3] rounded-lg overflow-hidden mb-2">
              <img class="w-full h-full object-cover" src="${pack.art}" />
              <div class="absolute bottom-1 left-1 bg-surface-container-lowest/90 backdrop-blur px-1.5 py-0.5 rounded text-primary font-tactical text-[8px] font-bold border border-primary/40">${pack.desc}</div>
            </div>
            <span class="font-display font-bold text-xs text-on-surface truncate">${pack.name}</span>
            <button class="buy-pack-btn mt-2 py-1.5 w-full ${pack.currency === 'gems' ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface border border-outline-variant'} rounded flex items-center justify-center gap-1 active:scale-95 shadow" data-idx="${idx}">
              <span class="material-symbols-outlined text-[14px] ${pack.currency === 'gems' ? 'text-secondary' : 'text-outline'}">${pack.currency === 'gems' ? 'diamond' : 'toll'}</span>
              <span class="font-tactical text-xs font-bold">${pack.cost}</span>
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  container.querySelector('#buyDailyBtn').addEventListener('click', () => {
    if (gameState.currencies.silver >= dailyPrice) {
      gameState.currencies.silver -= dailyPrice;
      addCardsToCollection([dailyCard]);
      updateCurrencyUI();
      showToast(`${dailyCard.name} salvata nella Collezione!`);
    } else showToast("Argento insufficiente.");
  });

  container.querySelectorAll('.buy-pack-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pack = packs[btn.dataset.idx];
      if (pack.currency === 'silver' && gameState.currencies.silver >= pack.cost) {
        gameState.currencies.silver -= pack.cost;
        updateCurrencyUI();
        openBoosterPack(pack, FULL_CARD_DB);
      } else if (pack.currency === 'gems' && gameState.currencies.gems >= pack.cost) {
        gameState.currencies.gems -= pack.cost;
        updateCurrencyUI();
        openBoosterPack(pack, FULL_CARD_DB);
      } else {
        showToast("Valuta insufficiente.");
      }
    });
  });

  return container;
}

// LOGICA DI SALVATAGGIO NELLA COLLEZIONE
function addCardsToCollection(pulledCards) {
  pulledCards.forEach(card => {
    const existing = gameState.player.collection.find(c => c.id === card.id);
    if (existing) {
      existing.copies++;
    } else {
      // Se non esiste, la aggiunge con livello 1 e 1 copia
      gameState.player.collection.push({ ...card, level: 1, copies: 1, copiesNeeded: 3 });
    }
  });
}

function updateCurrencyUI() {
  const s = document.getElementById('silverCount');
  const g = document.getElementById('gemsCount');
  if(s) s.textContent = gameState.currencies.silver;
  if(g) g.textContent = gameState.currencies.gems;
}

function showToast(msg) {
  let toast = document.getElementById('ingame-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'ingame-toast';
    toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 bg-surface-container-highest/95 backdrop-blur text-primary border border-primary/30 font-tactical text-xs rounded-full shadow-2xl transition-all duration-300 z-[100] opacity-0';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translate(-50%, 0)';
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translate(-50%, 10px)'; }, 2000);
}

function openBoosterPack(packDef, FULL_CARD_DB) {
  let pool = packDef.faction ? FULL_CARD_DB.filter(c => c.faction === packDef.faction) : FULL_CARD_DB;
  if(pool.length === 0) pool = FULL_CARD_DB;

  const pullRates = { 'Comune': 0.50, 'Non Comune': 0.30, 'Rara': 0.14, 'Epica': 0.05, 'Leggendaria': 0.01 };

  const getCardByRarity = (targetRarity) => {
    let filtered = pool.filter(c => targetRarity === 'Epica/Leggendaria' ? (c.rarity === 'Epica' || c.rarity === 'Leggendaria') : c.rarity === targetRarity);
    if (filtered.length === 0) filtered = FULL_CARD_DB.filter(c => c.rarity === targetRarity);
    if (filtered.length === 0) filtered = FULL_CARD_DB;
    return filtered[Math.floor(Math.random() * filtered.length)];
  };

  const pulledCards = [];
  for (let i = 0; i < 4; i++) {
    const r = Math.random();
    let rarity = 'Comune';
    if (r < pullRates['Leggendaria']) rarity = 'Leggendaria';
    else if (r < pullRates['Leggendaria'] + pullRates['Epica']) rarity = 'Epica';
    else if (r < pullRates['Leggendaria'] + pullRates['Epica'] + pullRates['Rara']) rarity = 'Rara';
    else if (r < pullRates['Leggendaria'] + pullRates['Epica'] + pullRates['Rara'] + pullRates['Non Comune']) rarity = 'Non Comune';
    
    pulledCards.push(getCardByRarity(rarity));
  }
  
  pulledCards.push(getCardByRarity(packDef.guarantee === 'Epica' ? 'Epica/Leggendaria' : packDef.guarantee));

  // SALVA IN COLLEZIONE!
  addCardsToCollection(pulledCards);

  renderPackRevealModal(pulledCards);
}

function renderPackRevealModal(cards) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-[60] bg-surface-container-lowest/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 overflow-hidden';
  
  const cardsHtml = cards.map((c, i) => {
    const rarityClass = c.rarity ? c.rarity.replace(/\s+/g, '') : 'Comune'; 
    return `
    <div class="w-full max-w-[100px] aspect-[5/7] mx-auto opacity-0 translate-y-10 transition-all duration-500 card-slot relative">
      <div class="w-full h-full relative rounded overflow-hidden border-2 border-outline-variant shadow-[0_0_15px_rgba(242,202,80,0.2)]">
        <img src="${c.art}" class="w-full h-full object-cover" />
        <div class="absolute bottom-0 inset-x-0 bg-surface-container-lowest/90 px-1 py-1 text-center font-tactical font-bold text-[8px] truncate text-primary">
          ${c.name.toUpperCase()}
        </div>
      </div>
    </div>
    `;
  }).join('');

  modal.innerHTML = `
    <h2 class="font-display font-bold text-xl text-primary mb-8 text-center drop-shadow-lg">RELIQUIE TROVATE</h2>
    <div class="grid grid-cols-3 md:grid-cols-5 gap-2 w-full max-w-4xl px-2">${cardsHtml}</div>
    <button id="closeRevealBtn" class="mt-12 px-6 py-2.5 bg-primary text-on-primary font-tactical font-bold rounded-full shadow-lg active:scale-95 transition-all opacity-0 pointer-events-none">CONTINUA</button>
  `;

  document.body.appendChild(modal);

  modal.querySelectorAll('.card-slot').forEach((slot, i) => {
    setTimeout(() => slot.classList.remove('opacity-0', 'translate-y-10'), i * 150 + 100);
  });

  setTimeout(() => {
    modal.querySelector('#closeRevealBtn').classList.remove('opacity-0', 'pointer-events-none');
  }, cards.length * 150 + 500);

  modal.querySelector('#closeRevealBtn').onclick = () => {
    modal.remove();
  };
}