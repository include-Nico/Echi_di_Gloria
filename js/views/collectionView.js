import { gameState, saveGameState } from '../state.js';

// Nuova regola copie per rarità: 5, 4, 3, 2, 1
export function getMaxCopiesForRarity(rarity) {
  switch (rarity) {
    case 'Comune': return 5;
    case 'Non Comune': return 4;
    case 'Rara': return 3;
    case 'Epica': return 2;
    case 'Leggendaria': return 1;
    default: return 3;
  }
}

function getFactionTheme(faction) {
  switch(faction) {
    case 'Vichinghi': return { icon: 'ac_unit', color: 'from-blue-950 to-slate-900', border: 'border-cyan-500/40', text: 'text-cyan-400' };
    case 'Medioevo': return { icon: 'shield', color: 'from-amber-950 to-stone-900', border: 'border-amber-500/40', text: 'text-amber-400' };
    case 'Giapponesi': return { icon: 'swords', color: 'from-rose-950 to-neutral-900', border: 'border-rose-500/40', text: 'text-rose-400' };
    case 'Nativi': return { icon: 'forest', color: 'from-emerald-950 to-stone-900', border: 'border-emerald-500/40', text: 'text-emerald-400' };
    default: return { icon: 'token', color: 'from-neutral-900 to-black', border: 'border-outline-variant', text: 'text-primary' };
  }
}

export function renderCollection() {
  const container = document.createElement('div');
  container.className = 'flex flex-col w-full h-full bg-surface select-none relative pb-20';

  let currentTab = 'collection'; // 'collection' | 'deck'
  let filterFaction = 'Tutte';
  let filterRarity = 'Tutte';
  let searchQuery = '';

  function updateUI() {
    const totalDeckCards = gameState.player.deck.length;

    container.innerHTML = `
      <div class="flex flex-col h-full overflow-hidden">
        
        <!-- HEADER FISSO -->
        <div class="p-3 bg-surface-container-lowest border-b border-outline-variant/30 shrink-0 flex flex-col gap-2.5">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-primary text-2xl">auto_stories</span>
              <h2 class="font-display font-bold text-lg text-primary tracking-wide">IL GRIMORIO</h2>
            </div>
            <div class="flex items-center gap-2">
              <span class="font-tactical text-[10px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded border border-outline-variant/30">
                Collezione: <strong class="text-primary">${gameState.player.collection.length}</strong>
              </span>
            </div>
          </div>

          <!-- TABS PRINCIPALI -->
          <div class="flex bg-surface-container-highest/60 rounded-lg p-1 border border-outline-variant/30">
            <button id="tabColBtn" class="flex-1 py-1.5 rounded font-tactical text-xs font-bold transition-all ${currentTab === 'collection' ? 'bg-primary text-[#110d0a] shadow' : 'text-on-surface-variant'}">
              COLLEZIONE
            </button>
            <button id="tabDeckBtn" class="flex-1 py-1.5 rounded font-tactical text-xs font-bold transition-all ${currentTab === 'deck' ? 'bg-secondary text-[#110d0a] shadow' : 'text-on-surface-variant'}">
              MAZZO (${totalDeckCards}/30)
            </button>
          </div>

          ${currentTab === 'collection' ? `
            <!-- BARRA RICERCA & FILTRI RAPIDI -->
            <div class="flex flex-col gap-2 pt-1">
              <!-- Search Input -->
              <div class="relative w-full">
                <span class="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline-variant text-sm">search</span>
                <input type="text" id="cardSearchInput" placeholder="Cerca guerriero per nome..." value="${searchQuery}" 
                  class="w-full bg-surface-container border border-outline-variant/40 text-on-surface font-tactical text-xs pl-8 pr-3 py-1.5 rounded-lg outline-none focus:border-primary transition-colors placeholder:text-outline-variant" />
              </div>

              <!-- Filtro Fazioni -->
              <div class="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5" id="factionFilterBar">
                ${['Tutte', 'Vichinghi', 'Medioevo', 'Giapponesi', 'Nativi'].map(f => `
                  <button class="faction-pill shrink-0 px-2.5 py-1 rounded-full font-tactical text-[10px] font-bold border transition-all ${filterFaction === f ? 'bg-primary text-[#110d0a] border-primary shadow-sm' : 'bg-surface-container border-outline-variant/40 text-on-surface-variant'}" data-faction="${f}">
                    ${f}
                  </button>
                `).join('')}
              </div>

              <!-- Filtro Rarità (Aggiornato con la nuova scala 5, 4, 3, 2, 1) -->
              <div class="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5" id="rarityFilterBar">
                ${[
                  { label: 'Tutte', val: 'Tutte' },
                  { label: 'Comuni (max 5)', val: 'Comune' },
                  { label: 'Non Comuni (max 4)', val: 'Non Comune' },
                  { label: 'Rare (max 3)', val: 'Rara' },
                  { label: 'Epiche (max 2)', val: 'Epica' },
                  { label: 'Legg. (solo 1)', val: 'Leggendaria' }
                ].map(r => `
                  <button class="rarity-pill shrink-0 px-2 py-0.5 rounded-md font-tactical text-[9px] border transition-all ${filterRarity === r.val ? 'bg-secondary text-[#110d0a] border-secondary font-bold' : 'bg-surface-container-lowest border-outline-variant/30 text-outline'}" data-rarity="${r.val}">
                    ${r.label}
                  </button>
                `).join('')}
              </div>
            </div>
          ` : `
            <!-- STATUS MAZZO -->
            <div class="flex justify-between items-center bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant/30">
              <span class="font-tactical text-[11px] text-on-surface">Capacità Mazzo:</span>
              <span class="font-tactical text-xs font-bold ${totalDeckCards === 30 ? 'text-[#4ade80]' : (totalDeckCards > 30 ? 'text-error' : 'text-primary')}">
                ${totalDeckCards} / 30 carte ${totalDeckCards === 30 ? '✓ (Pronto)' : ''}
              </span>
            </div>
          `}
        </div>

        <!-- GRIGLIA CARTE SCORREVOLE -->
        <div class="flex-1 overflow-y-auto p-3">
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3" id="cardsGrid">
            ${currentTab === 'collection' ? renderCollectionCards() : renderDeckCards()}
          </div>
        </div>
      </div>
    `;

    attachEvents();
  }

  function attachEvents() {
    container.querySelector('#tabColBtn').onclick = () => { currentTab = 'collection'; updateUI(); };
    container.querySelector('#tabDeckBtn').onclick = () => { currentTab = 'deck'; updateUI(); };

    if (currentTab === 'collection') {
      const searchInput = container.querySelector('#cardSearchInput');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          searchQuery = e.target.value;
          const grid = container.querySelector('#cardsGrid');
          if (grid) grid.innerHTML = renderCollectionCards();
          attachCardActionEvents();
        });
      }

      container.querySelectorAll('.faction-pill').forEach(btn => {
        btn.onclick = () => {
          filterFaction = btn.dataset.faction;
          updateUI();
        };
      });

      container.querySelectorAll('.rarity-pill').forEach(btn => {
        btn.onclick = () => {
          filterRarity = btn.dataset.rarity;
          updateUI();
        };
      });
    }

    attachCardActionEvents();
  }

  function attachCardActionEvents() {
    // AGGIUNGI AL MAZZO (+)
    container.querySelectorAll('.btn-add-deck').forEach(btn => {
      btn.onclick = (e) => {
        const cardId = e.currentTarget.dataset.id;
        const card = gameState.player.collection.find(c => c.id === cardId);
        if (!card) return;

        const inDeck = gameState.player.deck.filter(id => id === cardId).length;
        const maxByRarity = getMaxCopiesForRarity(card.rarity);

        if (gameState.player.deck.length >= 30) {
          alert("Il mazzo è già al completo (30/30)!");
          return;
        }

        if (inDeck >= maxByRarity) {
          if (card.rarity === 'Leggendaria') {
            alert("Le carte Leggendarie sono uniche: puoi inserirne al massimo 1 copia nel mazzo!");
          } else {
            alert(`Limite rarità raggiunto! Puoi inserire al massimo ${maxByRarity} copie di una carta ${card.rarity}.`);
          }
          return;
        }

        gameState.player.deck.push(cardId);
        saveGameState();
        updateUI();
      };
    });

    // RIMUOVI DAL MAZZO (-)
    container.querySelectorAll('.btn-remove-deck').forEach(btn => {
      btn.onclick = (e) => {
        const cardId = e.currentTarget.dataset.id;
        const idx = gameState.player.deck.indexOf(cardId);
        if (idx !== -1) {
          gameState.player.deck.splice(idx, 1);
          saveGameState();
          updateUI();
        }
      };
    });

    // FUSIONE / POTENZIAMENTO (+1 LVL)
    container.querySelectorAll('.btn-upgrade-card').forEach(btn => {
      btn.onclick = (e) => {
        const cardId = e.currentTarget.dataset.id;
        const card = gameState.player.collection.find(c => c.id === cardId);
        if (!card) return;

        const needed = card.copiesNeeded || 3;
        const currentLvl = card.level || 1;

        if (currentLvl >= 5) {
          alert("Questa carta ha già raggiunto il livello massimo (5)!");
          return;
        }

        if (card.copies >= needed) {
          card.copies -= needed;
          card.level = currentLvl + 1;
          card.attack = (card.attack || 0) + 1;
          card.defense = (card.defense || 0) + 1;
          card.copiesNeeded = Math.floor(needed * 1.5) + 1;
          
          saveGameState();
          updateUI();
        }
      };
    });
  }

  // RENDERING CARTE IN COLLEZIONE
  function renderCollectionCards() {
    let list = gameState.player.collection;

    if (filterFaction !== 'Tutte') {
      list = list.filter(c => c.faction === filterFaction);
    }
    if (filterRarity !== 'Tutte') {
      list = list.filter(c => c.rarity === filterRarity);
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q));
    }

    if (list.length === 0) {
      return `
        <div class="col-span-2 sm:col-span-3 text-center text-on-surface-variant py-12 font-body text-xs">
          Nessuna reliquia trovata con i filtri attuali.
        </div>
      `;
    }

    return list.map(card => {
      const inDeck = gameState.player.deck.filter(id => id === card.id).length;
      const maxByRarity = getMaxCopiesForRarity(card.rarity);
      const owned = card.copies || 1;
      
      const theme = getFactionTheme(card.faction);
      const needed = card.copiesNeeded || 3;
      const currentLvl = card.level || 1;
      const isMaxLevel = currentLvl >= 5;
      const canUpgrade = !isMaxLevel && owned >= needed;

      return `
        <div class="flex flex-col bg-surface-container rounded-xl p-2 border ${theme.border} shadow-md relative">
          
          <!-- STENDARDO CARTA ARALDICA -->
          <div class="relative w-full aspect-[4/5] rounded-lg overflow-hidden bg-gradient-to-b ${theme.color} flex flex-col justify-between p-2 shadow-inner border border-white/10">
            
            <!-- Intestazione: Fazione & Costo Mana -->
            <div class="flex justify-between items-start">
              <span class="inline-flex items-center gap-1 font-tactical text-[8px] uppercase tracking-wider text-on-surface/90 bg-black/50 px-1.5 py-0.5 rounded">
                <span class="material-symbols-outlined text-[10px] ${theme.text}">${theme.icon}</span> ${card.faction}
              </span>
              <div class="w-5 h-5 rounded-full bg-secondary text-[#110d0a] font-tactical text-[10px] font-bold flex items-center justify-center shadow">
                ${card.cost}
              </div>
            </div>

            <!-- Centro: Nome & Livello -->
            <div class="text-center py-1">
              <span class="font-display font-bold text-xs text-on-surface block leading-tight truncate drop-shadow-md">${card.name}</span>
              <div class="flex items-center justify-center gap-1 mt-0.5">
                <span class="font-tactical text-[8px] px-1 rounded ${isMaxLevel ? 'bg-primary text-[#110d0a] font-bold' : 'text-primary bg-black/40'}">
                  ${isMaxLevel ? 'MAX LVL 5' : `Livello ${currentLvl}`}
                </span>
                <span class="font-tactical text-[8px] text-on-surface-variant bg-black/30 px-1 rounded">${card.rarity}</span>
              </div>
            </div>

            <!-- In Basso: Statistiche Attacco & Difesa -->
            <div class="flex justify-between items-center bg-black/60 backdrop-blur rounded px-2 py-1">
              <div class="flex items-center gap-0.5 text-error font-tactical font-bold text-xs">
                <span class="material-symbols-outlined text-[12px]">swords</span> ${card.attack}
              </div>
              <div class="flex items-center gap-0.5 text-secondary font-tactical font-bold text-xs">
                <span class="material-symbols-outlined text-[12px]">shield</span> ${card.defense}
              </div>
            </div>
          </div>

          <!-- CONTROLLI POTENZIAMENTO E INSERIMENTO MAZZO -->
          <div class="mt-2 flex flex-col gap-1.5">
            
            <!-- Barra Copie per Livello -->
            <div class="flex justify-between items-center font-tactical text-[9px] px-0.5">
              <span class="text-on-surface-variant">Copie per Fusione:</span>
              <span class="${canUpgrade ? 'text-[#4ade80] font-bold' : 'text-on-surface'}">${owned}/${needed}</span>
            </div>

            <!-- Bottone Fusione (se ci sono duplicati a sufficienza) -->
            ${canUpgrade ? `
              <button class="btn-upgrade-card w-full py-1 bg-[#4ade80] hover:bg-[#3ec470] text-[#110d0a] font-tactical text-[9px] font-bold rounded shadow active:scale-95 animate-pulse" data-id="${card.id}">
                FONDI (+1 LVL)
              </button>
            ` : ''}

            <!-- STEPPER MAZZO [-] [inDeck / Max] [+] -->
            <div class="flex items-center justify-between bg-surface-container-highest rounded-lg p-0.5 border border-outline-variant/30">
              <button class="btn-remove-deck w-7 h-6 flex items-center justify-center rounded bg-surface-container text-on-surface hover:text-error active:scale-90 transition-transform ${inDeck === 0 ? 'opacity-30 pointer-events-none' : ''}" data-id="${card.id}">
                <span class="material-symbols-outlined text-sm">remove</span>
              </button>

              <div class="flex flex-col items-center">
                <span class="font-tactical text-[10px] font-bold ${inDeck > 0 ? 'text-primary' : 'text-outline'}">
                  ${inDeck} / ${maxByRarity}
                </span>
                <span class="font-tactical text-[7px] text-outline uppercase leading-none">nel mazzo</span>
              </div>

              <button class="btn-add-deck w-7 h-6 flex items-center justify-center rounded bg-surface-container text-on-surface hover:text-primary active:scale-90 transition-transform ${inDeck >= maxByRarity || gameState.player.deck.length >= 30 ? 'opacity-30 pointer-events-none' : ''}" data-id="${card.id}">
                <span class="material-symbols-outlined text-sm">add</span>
              </button>
            </div>

          </div>
        </div>
      `;
    }).join('');
  }

  // RENDERING CARTE NEL MAZZO
  function renderDeckCards() {
    const deckIds = gameState.player.deck;
    if (deckIds.length === 0) {
      return `
        <div class="col-span-2 sm:col-span-3 text-center text-on-surface-variant py-12 font-body text-xs">
          Il tuo mazzo è vuoto. Vai nella scheda "Collezione" e premi [+] sulle tue carte per comporlo (fino a 30).
        </div>
      `;
    }

    const counts = {};
    deckIds.forEach(id => { counts[id] = (counts[id] || 0) + 1; });

    const uniqueCards = Object.keys(counts).map(id => {
      const c = gameState.player.collection.find(item => item.id === id);
      return c ? { card: c, count: counts[id] } : null;
    }).filter(Boolean);

    return uniqueCards.map(({ card, count }) => {
      const theme = getFactionTheme(card.faction);
      const maxByRarity = getMaxCopiesForRarity(card.rarity);

      return `
        <div class="flex flex-col bg-surface-container rounded-xl p-2 border border-secondary/30 shadow-md relative">
          
          <div class="relative w-full aspect-[4/5] rounded-lg overflow-hidden bg-gradient-to-b ${theme.color} flex flex-col justify-between p-2 shadow-inner border border-white/10">
            <div class="flex justify-between items-start">
              <span class="font-tactical text-[8px] uppercase tracking-wider text-on-surface/90 bg-black/50 px-1 py-0.5 rounded">
                ${card.faction}
              </span>
              <div class="w-5 h-5 rounded-full bg-secondary text-[#110d0a] font-tactical text-[10px] font-bold flex items-center justify-center">
                ${card.cost}
              </div>
            </div>

            <div class="text-center py-1">
              <span class="font-display font-bold text-xs text-on-surface block leading-tight truncate">${card.name}</span>
              <span class="font-tactical text-[8px] text-primary block mt-0.5">Livello ${card.level || 1}</span>
            </div>

            <div class="flex justify-between items-center bg-black/60 rounded px-2 py-1">
              <span class="text-error font-tactical font-bold text-xs">⚔${card.attack}</span>
              <span class="text-secondary font-tactical font-bold text-xs">🛡${card.defense}</span>
            </div>
          </div>

          <!-- CONTROLLI QUANTITÀ NEL MAZZO -->
          <div class="mt-2 flex items-center justify-between bg-surface-container-highest rounded-lg p-1 border border-outline-variant/30">
            <button class="btn-remove-deck w-7 h-6 flex items-center justify-center rounded bg-surface-container text-error active:scale-90" data-id="${card.id}">
              <span class="material-symbols-outlined text-sm">remove</span>
            </button>
            <span class="font-tactical text-xs font-bold text-secondary">
              x${count} <span class="text-[9px] text-outline font-normal">/ ${maxByRarity}</span>
            </span>
            <button class="btn-add-deck w-7 h-6 flex items-center justify-center rounded bg-surface-container text-primary active:scale-90 ${count >= maxByRarity || deckIds.length >= 30 ? 'opacity-30 pointer-events-none' : ''}" data-id="${card.id}">
              <span class="material-symbols-outlined text-sm">add</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  updateUI();
  return container;
}