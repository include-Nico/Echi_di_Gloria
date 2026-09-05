import { gameState } from '../state.js';

export function renderShop() {
  const container = document.createElement('div');
  container.className = 'flex flex-col gap-4 p-3 md:p-6 pb-24 h-full overflow-y-auto select-none';

  const FULL_CARD_DB = gameState.databases.cards || [];
  
  const dailyCard = FULL_CARD_DB.find(c => c.id === 'JAP_008') || FULL_CARD_DB[0] || { cost: 0, name: "Errore Rete", rarity: "", art: "" }; 
  const dailyPrice = 450;
  const originalPrice = 650;

  const packs = [
    { id: 'standard', name: 'Standard', desc: '1 Non Comune Garantita', cost: 50, currency: 'silver', art: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQLz2KyMcLOfs1r6-uM3fTKqdlemkwTYMiMjJcH6qu7TlmIE52UXwqBjxibYoory-FDFAb-oDnl_9Rlx3KOK73idvj0mpJ604YUKedW0JWo3VWBd3FQfUdZIbgOlM1q8JIh3e-x2xyFZQ6_UlaYS9b6icQKm3d837-rYsVNTkHHJ15Q4ndlX0GRbllZ7wbbOzMPjG7jYtuD13ytO6eSjKebmPKjqwYq8loYOdBw0fbv21EAdRdsgPXjA', faction: null, guarantee: 'Non Comune' },
    { id: 'vichinghi', name: 'Vichinghi', desc: '1 Rara Garantita', cost: 100, currency: 'silver', art: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJ_TMBRWC-iWUf3Yc5x2w_3apKtYYt3gos1HFwHakmHtduUrx3PKM7yetQCiDMJF6RlnxCwLeFG38pN04QLz9dq_p1qQ_if1qgUStwGXs-pXr5223EP3fyVIicZZ0yCFRKn0F3jTgZYBJBjTk8jpJW8E-HE9R-0lcHeFh3XDiWKyibTjP5DxlrD2mNvzXKgWtlZH88sfROIT61q9YQL2mrb61L-RkrM_NQFSZP_EUZq7NnrbLzEepDqQ', faction: 'Vichinghi', guarantee: 'Rara' },
    { id: 'medioevo', name: 'Medioevo', desc: '1 Rara Garantita', cost: 100, currency: 'silver', art: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWjRSdUgKcd0Ed2DO8CySiDhg8np1fu_uAgROGnMHDKXmL3OzBqgdLkuXUBRpjaP0zjkvPV9EhFP4r9ByvuNNrllmtDRNYj4G_V7d3QJ5o0_zkfteuCwRTESmMQx3DOWG0nrMAVobrMWZOduw198K7bGdc_eaKo9kA8idGphgmGUru7Yty5zn27DWJy4qN3wMtHr0_ZNJ_XBHHWVsjVfi8m4dSr2fKiXckTnAFrkQ68g0gahD_8vF4iQ', faction: 'Medioevo', guarantee: 'Rara' },
    { id: 'giapponesi', name: 'Giapponesi', desc: '1 Rara Garantita', cost: 100, currency: 'silver', art: 'https://image.pollinations.ai/prompt/dark%20fantasy%20japanese%20shrine%20booster%20pack%20foil%20card%20art?width=400&height=300&nologo=true', faction: 'Giapponesi', guarantee: 'Rara' },
    { id: 'nativi', name: 'Nativi', desc: '1 Rara Garantita', cost: 100, currency: 'silver', art: 'https://image.pollinations.ai/prompt/dark%20fantasy%20native%20american%20totem%20booster%20pack%20foil%20card%20art?width=400&height=300&nologo=true', faction: 'Nativi', guarantee: 'Rara' },
    { id: 'leggendario', name: 'Leggendario', desc: '1 Epica/Legg.', cost: 200, currency: 'gems', art: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5RvjcrHvsSqu9HWfgGZneQJb_rw7lFu3kxbTPd-PJZOlVVGcZ9zYdz-0qIOuuQjnYmy1mXBsKZgkvU-9CHgnN4GkUcScVrK_WBq0Tp2J_VW0-PR1ZaLBBQ1v3qsQPxg6fcD8adMVtfroWar9xWcx2mkgungtym0rVA4vis7xfiqQSvLYeC_LryyM2Ec-TCUhNNtc8rCBY85JHA54CM0eARzXJwfYg-k3ZStmRKL4hUONIZlPJOq8sGQ', faction: null, guarantee: 'Epica' }
  ];

  container.innerHTML = `
    <div class="relative overflow-hidden rounded-xl bg-surface-container-high shadow-xl border border-primary/20">
      <div class="absolute -right-8 -top-8 w-44 h-44 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
      <div class="p-4 flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center justify-center px-1.5 py-0.5 bg-primary text-on-primary rounded font-tactical text-[9px] uppercase font-bold">Offerta 24h</span>
            <span class="text-on-surface-variant font-tactical text-[10px] flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">schedule</span> 14:22:08</span>
          </div>
          <span class="font-display font-bold text-sm text-primary tracking-wide">-30% Sconto</span>
        </div>
        
        <div class="flex gap-4 items-center">
          <div class="relative w-24 aspect-[5/7] rounded overflow-hidden shadow-lg border border-primary shrink-0">
            <img class="w-full h-full object-cover" src="${dailyCard.art}" alt="${dailyCard.name}" />
            <div class="absolute top-0 left-0 bg-surface-container-lowest/90 px-1 font-tactical text-[10px] text-secondary font-bold">${dailyCard.cost}</div>
          </div>
          <div class="flex flex-col flex-1 justify-between py-1 h-full">
            <div>
              <div class="font-display font-bold text-base text-on-surface leading-tight">${dailyCard.name}</div>
              <div class="font-tactical text-[9px] text-on-surface-variant uppercase mt-0.5">${dailyCard.faction} • ${dailyCard.rarity}</div>
              <p class="font-body text-[10px] text-on-surface-variant line-clamp-2 mt-1">${dailyCard.desc || ''}</p>
            </div>
            
            <button id="buyDailyBtn" class="w-full mt-2 py-2 px-3 bg-surface-container-lowest border border-primary text-primary hover:bg-primary hover:text-on-primary transition-colors rounded shadow flex items-center justify-between active:scale-95">
              <span class="font-tactical text-[11px] font-bold">RISCATTA</span>
              <div class="flex items-center gap-1">
                <span class="line-through opacity-50 font-tactical text-[9px]">${originalPrice}</span>
                <span class="material-symbols-outlined text-[14px]">toll</span>
                <span class="font-tactical text-sm font-bold">${dailyPrice}</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2 mt-2">
      <div class="flex items-center justify-between">
        <span class="font-display font-bold text-sm text-on-surface tracking-wide">Buste & Reliquie</span>
      </div>
      
      <div class="grid grid-cols-2 gap-3" id="packsGrid">
        ${packs.map((pack, idx) => `
          <div class="flex flex-col rounded-xl bg-surface-container-low p-2 shadow-md border border-surface-container-highest">
            <div class="relative w-full aspect-[4/3] rounded-lg overflow-hidden mb-2 shadow-inner border border-outline-variant/30">
              <img class="w-full h-full object-cover" src="${pack.art}" alt="${pack.name}" />
              ${pack.faction ? `
                <div class="absolute top-1 right-1 bg-surface-container-lowest/90 px-1.5 py-0.5 rounded font-tactical text-[8px] text-on-surface uppercase border border-outline-variant">
                  ${pack.faction}
                </div>
              ` : ''}
              <div class="absolute bottom-1 left-1 bg-surface-container-lowest/90 backdrop-blur px-1.5 py-0.5 rounded text-primary font-tactical text-[8px] font-bold border border-primary/40">
                ${pack.desc}
              </div>
            </div>
            <span class="font-display font-bold text-xs text-on-surface truncate">${pack.name}</span>
            <button class="buy-pack-btn mt-2 py-1.5 w-full ${pack.currency === 'gems' ? 'bg-primary text-on-primary hover:bg-primary-fixed-dim' : 'bg-surface-container-highest text-on-surface hover:bg-surface-bright border border-outline-variant'} rounded flex items-center justify-center gap-1 transition-all active:scale-95 shadow" data-idx="${idx}">
              <span class="material-symbols-outlined text-[14px] ${pack.currency === 'gems' ? 'text-secondary' : 'text-outline'}">
                ${pack.currency === 'gems' ? 'diamond' : 'toll'}
              </span>
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
      updateCurrencyUI();
      showToast(`${dailyCard.name} aggiunta alla Collezione!`);
    } else {
      showToast("Argento insufficiente.");
    }
  });

  container.querySelectorAll('.buy-pack-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pack = packs[btn.dataset.idx];
      if (pack.currency === 'silver') {
        if (gameState.currencies.silver >= pack.cost) {
          gameState.currencies.silver -= pack.cost;
          updateCurrencyUI();
          openBoosterPack(pack, FULL_CARD_DB);
        } else {
          showToast("Argento insufficiente.");
        }
      } else {
        if (gameState.currencies.gems >= pack.cost) {
          gameState.currencies.gems -= pack.cost;
          updateCurrencyUI();
          openBoosterPack(pack, FULL_CARD_DB);
        } else {
          showToast("Gemme insufficiente.");
        }
      }
    });
  });

  return container;
}

function updateCurrencyUI() {
  document.getElementById('silverCount').textContent = gameState.currencies.silver;
  document.getElementById('gemsCount').textContent = gameState.currencies.gems;
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
  setTimeout(() => { 
    toast.style.opacity = '0'; 
    toast.style.transform = 'translate(-50%, 10px)'; 
  }, 2000);
}

function openBoosterPack(packDef, FULL_CARD_DB) {
  let pool = FULL_CARD_DB;
  if (packDef.faction) {
    pool = FULL_CARD_DB.filter(c => c.faction === packDef.faction);
  }
  if(pool.length === 0) pool = FULL_CARD_DB;

  const pullRates = { 'Comune': 0.50, 'Non Comune': 0.30, 'Rara': 0.14, 'Epica': 0.05, 'Leggendaria': 0.01 };

  const getCardByRarity = (targetRarity) => {
    let filtered = pool;
    if (targetRarity === 'Epica/Leggendaria') {
      filtered = pool.filter(c => c.rarity === 'Epica' || c.rarity === 'Leggendaria');
    } else if (targetRarity) {
      filtered = pool.filter(c => c.rarity === targetRarity);
    }
    if (filtered.length === 0) {
      filtered = FULL_CARD_DB.filter(c => c.rarity === targetRarity) || pool; 
    }
    if (filtered.length === 0) filtered = FULL_CARD_DB; // Estremo fallback
    return filtered[Math.floor(Math.random() * filtered.length)];
  };

  const rollRandomCard = () => {
    const r = Math.random();
    if (r < pullRates['Leggendaria']) return getCardByRarity('Leggendaria');
    if (r < pullRates['Leggendaria'] + pullRates['Epica']) return getCardByRarity('Epica');
    if (r < pullRates['Leggendaria'] + pullRates['Epica'] + pullRates['Rara']) return getCardByRarity('Rara');
    if (r < pullRates['Leggendaria'] + pullRates['Epica'] + pullRates['Rara'] + pullRates['Non Comune']) return getCardByRarity('Non Comune');
    return getCardByRarity('Comune');
  };

  const pulledCards = [];
  for (let i = 0; i < 4; i++) {
    pulledCards.push(rollRandomCard());
  }
  
  if (packDef.guarantee === 'Epica') {
    pulledCards.push(getCardByRarity('Epica/Leggendaria'));
  } else {
    pulledCards.push(getCardByRarity(packDef.guarantee));
  }

  renderPackRevealModal(pulledCards);
}

function renderPackRevealModal(cards) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-[60] bg-surface-container-lowest/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 overflow-hidden';
  
  const styles = `
    <style>
      .perspective { perspective: 1000px; }
      .preserve-3d { transform-style: preserve-3d; transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
      .backface-hidden { backface-visibility: hidden; }
      .rotate-y-180 { transform: rotateY(180deg); }
      @keyframes pop-epic {
        0% { transform: scale(1); }
        50% { transform: scale(1.15); box-shadow: 0 0 30px #ffbebe; }
        100% { transform: scale(1); box-shadow: 0 0 15px #ffbebe; }
      }
      .glow-Comune { box-shadow: 0 0 10px rgba(153, 144, 124, 0.5); }
      .glow-NonComune { box-shadow: 0 0 15px rgba(0, 227, 253, 0.6); }
      .glow-Rara { box-shadow: 0 0 20px rgba(189, 244, 255, 0.8); }
      .glow-Epica { box-shadow: 0 0 25px rgba(255, 190, 190, 1); }
      .glow-Leggendaria { box-shadow: 0 0 40px rgba(242, 202, 80, 1); }
    </style>
  `;

  const cardsHtml = cards.map((c, i) => {
    const rarityClass = c.rarity.replace(/\s+/g, ''); 
    return `
    <div class="perspective w-full max-w-[120px] aspect-[5/7] mx-auto opacity-0 translate-y-10 transition-all duration-500 card-slot" data-index="${i}" data-rarity="${c.rarity}">
      <div class="preserve-3d w-full h-full relative rotate-y-180 card-inner cursor-pointer rounded overflow-hidden border border-outline-variant glow-${rarityClass}">
        <div class="backface-hidden absolute inset-0 bg-surface-container-highest">
          <img src="${c.art}" class="w-full h-full object-cover" alt="${c.name}" />
          <div class="absolute bottom-0 inset-x-0 bg-surface-container-lowest/90 px-1 py-1 text-center font-tactical font-bold text-[8px]">
            <span class="${c.rarity === 'Leggendaria' ? 'text-primary' : (c.rarity === 'Epica' ? 'text-tertiary' : 'text-on-surface')}">
              ${c.rarity.toUpperCase()}
            </span>
          </div>
        </div>
        <div class="backface-hidden rotate-y-180 absolute inset-0 bg-surface-container-highest flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] border border-outline-variant">
          <span class="material-symbols-outlined text-outline-variant text-4xl">shield</span>
        </div>
      </div>
    </div>
    `;
  }).join('');

  modal.innerHTML = `
    ${styles}
    <h2 class="font-display font-bold text-xl text-primary mb-8 text-center drop-shadow-lg">RELIQUIE TROVATE</h2>
    <div class="grid grid-cols-3 md:grid-cols-5 gap-3 w-full max-w-4xl px-4">
      ${cardsHtml}
    </div>
    <button id="closeRevealBtn" class="mt-12 px-6 py-2.5 bg-surface-container text-on-surface-variant font-tactical font-bold rounded-full border border-outline-variant hover:text-primary transition-colors opacity-0 pointer-events-none">
      CHIUDI
    </button>
  `;

  document.body.appendChild(modal);

  const cardSlots = modal.querySelectorAll('.card-slot');
  
  cardSlots.forEach((slot, i) => {
    setTimeout(() => {
      slot.classList.remove('opacity-0', 'translate-y-10');
    }, i * 150 + 100);
  });

  setTimeout(() => {
    cardSlots.forEach((slot, i) => {
      const rarity = slot.dataset.rarity;
      const inner = slot.querySelector('.card-inner');
      
      setTimeout(() => {
        if (rarity === 'Leggendaria') {
          inner.classList.remove('rotate-y-180');
        } else if (rarity === 'Epica') {
          inner.classList.remove('rotate-y-180');
          setTimeout(() => { slot.style.animation = 'pop-epic 0.6s ease-out'; }, 300);
        } else {
          inner.classList.remove('rotate-y-180');
        }
      }, i * 400);
    });
    
    setTimeout(() => {
      const closeBtn = modal.querySelector('#closeRevealBtn');
      closeBtn.classList.remove('opacity-0', 'pointer-events-none');
    }, cards.length * 400 + 1500);

  }, cards.length * 150 + 500);

  modal.querySelector('#closeRevealBtn').onclick = () => {
    modal.remove();
    showToast("Carte salvate nella Collezione.");
  };
}