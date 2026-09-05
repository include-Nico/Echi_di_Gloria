import { gameState } from '../state.js';

export function renderCollection() {
  const container = document.createElement('div');
  // Container padding responsivo
  container.className = 'flex flex-col gap-4 p-3 md:p-6 pb-24 h-full overflow-y-auto select-none';

  // Dati di base (in futuro li prenderai dal backend)
  const avatarCard = gameState.player?.avatarCard || {
    id: "AVATAR_01", name: "Guerriero", faction: "Vichinghi", rarity: "Unica", 
    cost: 3, attack: 3, defense: 2, level: 1, xp: 45, maxXp: 100, isAvatar: true,
    art: "https://lh3.googleusercontent.com/aida-public/AB6AXuDpiMSftlbBYWJIGEuY_7L4pvuxvz8QaCn04mqLYn3TaFbX8_hR1QDLKn0UCnf3n92Mti1LHwfU442UI72CbyPLAPdUHZ6Vzs5SzThWbO4_dX2T-1_CSvKljwp3pHzATMzDbDspV8cc1cx-0BHCSVHdZf7nPunoJYq_hpDhMVhnHrEV9X8tU3gSEkvrSFM9MjLbkINf9g8IfPHy1ZCPaZlDHH4l2Z3LrpsmYcVqhWlstpKBedpzuImWCA"
  };

  let mockCollection = [
    avatarCard,
    { id: "VIK_003", name: "Berserker", faction: "Vichinghi", rarity: "Rara", cost: 4, attack: 5, defense: 2, level: 2, copies: 3, copiesNeeded: 3, inDeck: 2, desc: "Senza Paura (Attacca Subito)", art: "https://lh3.googleusercontent.com/aida-public/AB6AXuCMtrFSEQ3-mfv9ksxWBsdZn1XSlxacxb5n41fUzfF1nVdB7l1c7-QFFga7BkbU46mA2H8sLigNQzorK9TvJ1hkLTUX8EV0mZ2X84zZhBes7g4tyB35mWTHPg7zAX3VFjnIA-qBK0HWO_4GnWRH741Fz9qD8bb-IyJitE6yRb39hdLfQxtgKA8o0c0IPtG6Jgur7Lr0HqnOBJ_HPeIX-elqF3yi_r4lFZBaMKoiM0Az333fbLsV4Tsh-A" },
    { id: "MED_001", name: "Crociato", faction: "Medioevo", rarity: "Comune", cost: 2, attack: 2, defense: 3, level: 1, copies: 1, copiesNeeded: 5, inDeck: 0, desc: "Scudo Sacro (Annulla 1° danno)", art: "https://lh3.googleusercontent.com/aida-public/AB6AXuA0C5LMqAmqkr4WDknoWSJE0Cz__qdsbRDLa0i922VXOS9OmCdwOwV_HwU5yO_Cr9H0QlMd7n-9yeoik0liA6cSLM1qF_CQq5coJGS7B4tJZixvDiJys1IGbpDCz9nFmU48whiKd14Qd6wKF0eUcbM_8b8CjHYHOEHpM37MRZutv5_-W-M7DKfiUietsGeuezdPbaMbcy4U9Yo4aac3E0YfOd7O3Uk500C39-vEOI8Wsi-7QwKH54_XgQ" },
    { id: "JAP_001", name: "Samurai", faction: "Giapponesi", rarity: "Non Comune", cost: 4, attack: 4, defense: 4, level: 3, copies: 4, copiesNeeded: 10, inDeck: 1, desc: "Pesca 1 se uccide un nemico", art: "https://lh3.googleusercontent.com/aida-public/AB6AXuC38-XIFKSVChpxmXZg0keFEMKjRKGWwtPM9oBYh4VVJq-dJ0c4q1-vU3iwPkX1d4nl2RoKCPuBS3aTJiNNpqhub8xOJRpzp6ITu0T7o3VN1fmfrvKm_AfKqcjD7vzHQHcq7Y-_3ji1tLbbke98NFHQYgnHNYoY_6ECDKny6DnSsyGhpTA3oJZaAsaTFoLu1S9Q_kamI6Z8ILSRk0gEnn4Ebap6442kzSdJ-4C6k9YrrMQw7X7-P0G-7w" },
    { id: "NAT_001", name: "Capo Tribù", faction: "Nativi", rarity: "Epica", cost: 4, attack: 3, defense: 4, level: 1, copies: 1, copiesNeeded: 2, inDeck: 0, desc: "+1 Segnalino Totem a fine turno", art: "https://lh3.googleusercontent.com/aida-public/AB6AXuBrO3LiwSIxNr0EiIyNC6IwdbazjAybNEDO_rSUFIuQq_ykKX7kPfkhUSTZh-62uK15Ld3sgy3FYYP5_Xx3JomlfnKEtZtIoSQfsucIUMDlOZVVpwFBqd46FUUQxlM6tp76ROOfBxY72hGr9ndHewjnUpFZZVEmJRVG-7Ewm7hZEygdVIlmXjoq1lrjUcRkckZ8f9QK9nbvBa2-6mlll5tuJj9K0PS8bm00OWSiq87pzvtK6OL71-Ctfg" }
  ];

  let currentFilter = 'Tutte';

  // --- 1. MAZZO ATTIVO ---
  const deckSection = document.createElement('div');
  deckSection.className = 'bg-surface-container-low border border-outline-variant rounded-xl p-3 shadow-lg flex flex-col gap-2 relative overflow-hidden';
  
  function updateDeckSection() {
    let totalCards = 1; // L'avatar è sempre fisso (1)
    let totalMana = avatarCard.cost;
    let gridHTML = renderMiniCard(avatarCard, true, 1);

    mockCollection.forEach(c => {
      if (!c.isAvatar && c.inDeck > 0) {
        totalCards += c.inDeck;
        totalMana += (c.cost * c.inDeck);
        gridHTML += renderMiniCard(c, false, c.inDeck);
      }
    });

    // Riempi slot vuoti fino a massimo 10 in UI (anteprima)
    const previewSlots = Math.min(10, totalCards + (30 - totalCards));
    for(let i = totalCards; i < 10; i++) {
      gridHTML += `<div class="aspect-[5/7] bg-surface-container-highest rounded border border-dashed border-outline-variant/30 flex items-center justify-center opacity-50"><span class="material-symbols-outlined text-outline text-xs">add</span></div>`;
    }

    const avgMana = totalCards > 0 ? (totalMana / totalCards).toFixed(1) : 0;

    deckSection.innerHTML = `
      <div class="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none"></div>
      <div class="flex items-center justify-between z-10">
        <div class="flex flex-col">
          <span class="font-display font-bold text-primary text-sm tracking-wide">MAZZO DA BATTAGLIA</span>
          <div class="flex items-center gap-3 font-tactical text-[10px] text-on-surface-variant mt-0.5">
            <span class="flex items-center gap-1 ${totalCards === 30 ? 'text-secondary' : 'text-error'}"><span class="material-symbols-outlined text-[12px]">style</span> ${totalCards}/30 Carte</span>
            <span class="flex items-center gap-1 text-primary"><span class="material-symbols-outlined text-[12px]">diamond</span> ${avgMana} Costo Medio</span>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-5 md:grid-cols-10 gap-1.5 mt-1 z-10" id="activeDeckGrid">
        ${gridHTML}
      </div>
    `;
  }

  // --- 2. FILTRI (Sticky) ---
  const filterSection = document.createElement('div');
  filterSection.className = 'sticky top-16 md:top-0 z-40 bg-surface/95 backdrop-blur-md py-2 -mx-3 md:-mx-6 px-3 md:px-6 flex gap-2 overflow-x-auto no-scrollbar font-tactical text-[11px] border-b border-surface-container-high';
  const factions = ['Tutte', 'Vichinghi', 'Medioevo', 'Giapponesi', 'Nativi', 'Epiche', 'Leggendarie'];
  
  factions.forEach(f => {
    const btn = document.createElement('button');
    btn.className = `shrink-0 px-3 py-1.5 rounded-full border transition-all ${f === 'Tutte' ? 'bg-primary text-on-primary border-primary font-bold' : 'bg-surface-container text-on-surface-variant border-outline-variant hover:text-on-surface'}`;
    btn.textContent = f;
    btn.onclick = () => {
      filterSection.querySelectorAll('button').forEach(b => b.className = 'shrink-0 px-3 py-1.5 rounded-full border transition-all bg-surface-container text-on-surface-variant border-outline-variant hover:text-on-surface');
      btn.className = 'shrink-0 px-3 py-1.5 rounded-full border transition-all bg-primary text-on-primary border-primary font-bold';
      currentFilter = f;
      renderGrid();
    };
    filterSection.appendChild(btn);
  });

  // --- 3. GRIGLIA COLLEZIONE ---
  const gridSection = document.createElement('div');
  gridSection.className = 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-2';

  function renderGrid() {
    gridSection.innerHTML = '';
    const filtered = mockCollection.filter(c => {
      if (currentFilter === 'Tutte') return true;
      if (currentFilter === 'Epiche') return c.rarity === 'Epica';
      if (currentFilter === 'Leggendarie') return c.rarity === 'Leggendaria';
      return c.faction === currentFilter;
    });

    filtered.forEach((card, index) => {
      const cardHTML = document.createElement('div');
      cardHTML.innerHTML = renderCollectionCard(card);
      // Assegna evento custom modal
      cardHTML.firstElementChild.addEventListener('click', () => {
        if (card.isAvatar) openAvatarForgeModal(card);
        else openCardDetailsModal(card);
      });
      gridSection.appendChild(cardHTML.firstElementChild);
    });
  }

  // Costruzione DOM
  container.appendChild(deckSection);
  updateDeckSection();
  container.appendChild(filterSection);
  container.appendChild(gridSection);
  renderGrid();

  // --- MODALE DETTAGLI CARTA E GESTIONE MAZZO ---
  function openCardDetailsModal(card) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none';
    
    // Controlli Deck
    const maxCopies = card.rarity === 'Leggendaria' ? 1 : 3;
    const canAdd = card.inDeck < maxCopies;
    const canRemove = card.inDeck > 0;
    const isForgeReady = card.copies >= card.copiesNeeded;

    modal.innerHTML = `
      <div class="w-full max-w-sm bg-surface-container border border-outline-variant p-5 rounded-xl shadow-2xl flex flex-col gap-4">
        <div class="flex justify-between items-start">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-2xl">info</span>
            <div>
              <h2 class="font-display font-bold text-lg text-on-surface truncate">${card.name}</h2>
              <span class="font-tactical text-[10px] text-on-surface-variant uppercase">${card.faction} • ${card.rarity}</span>
            </div>
          </div>
          <button class="close-modal text-outline hover:text-on-surface"><span class="material-symbols-outlined">close</span></button>
        </div>

        <div class="flex gap-4 bg-surface-container-low p-3 rounded-lg border border-surface-container-high">
          <div class="w-24 aspect-[5/7] rounded overflow-hidden relative shadow-lg shrink-0">
            <img src="${card.art}" class="w-full h-full object-cover"/>
            <div class="absolute top-0 left-0 bg-surface-container-lowest/90 px-1 font-tactical text-xs text-secondary font-bold rounded-br">${card.cost}</div>
          </div>
          <div class="flex flex-col flex-1 justify-between">
            <p class="font-body text-xs text-on-surface-variant leading-relaxed">${card.desc}</p>
            <div class="flex items-center justify-between font-tactical text-xs mt-2">
              <span class="text-error font-bold flex items-center gap-1"><span class="material-symbols-outlined text-sm">swords</span> ${card.attack}</span>
              <span class="text-secondary font-bold flex items-center gap-1"><span class="material-symbols-outlined text-sm">shield</span> ${card.defense}</span>
            </div>
            <div class="mt-2 text-center bg-surface-container-highest rounded py-1 font-tactical text-[10px] text-primary">
              IN MAZZO: ${card.inDeck} / ${maxCopies}
            </div>
          </div>
        </div>

        <!-- Azioni -->
        <div class="flex flex-col gap-2 mt-2">
          <div class="flex gap-2">
            <button id="btnRemoveDeck" class="flex-1 py-2.5 bg-surface-container-highest text-on-surface font-tactical text-xs font-bold rounded shadow transition-all active:scale-95 flex items-center justify-center gap-1 ${!canRemove ? 'opacity-50 pointer-events-none' : 'hover:bg-error/20 hover:text-error'}" ${!canRemove ? 'disabled' : ''}>
              <span class="material-symbols-outlined text-sm">remove</span> Rimuovi
            </button>
            <button id="btnAddDeck" class="flex-1 py-2.5 bg-primary hover:bg-primary-fixed-dim text-on-primary font-tactical text-xs font-bold rounded shadow transition-all active:scale-95 flex items-center justify-center gap-1 ${!canAdd ? 'opacity-50 pointer-events-none' : ''}" ${!canAdd ? 'disabled' : ''}>
              <span class="material-symbols-outlined text-sm">add</span> Aggiungi
            </button>
          </div>
          ${isForgeReady ? `
            <button class="w-full py-2 bg-secondary text-on-secondary font-tactical text-xs font-bold rounded shadow flex items-center justify-center gap-2 active:scale-95 mt-1">
              <span class="material-symbols-outlined text-sm">auto_fix_high</span> FORGIA COPIE (${card.copies}/${card.copiesNeeded})
            </button>
          ` : `
            <div class="w-full py-2 bg-surface-container-highest text-outline-variant font-tactical text-[10px] rounded text-center">
              COPIE INSUFFICIENTI PER LA FORGIA (${card.copies}/${card.copiesNeeded})
            </div>
          `}
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    
    modal.querySelector('.close-modal').onclick = () => modal.remove();
    modal.onclick = (e) => { if(e.target === modal) modal.remove(); };

    modal.querySelector('#btnAddDeck').onclick = () => {
      let currentDeckSize = 1; // Avatar
      mockCollection.forEach(c => { if(!c.isAvatar) currentDeckSize += c.inDeck; });
      if (currentDeckSize >= 30) {
        showToast("Il mazzo è già pieno (30/30).");
        return;
      }
      card.inDeck++;
      updateDeckSection();
      modal.remove();
      showToast(`${card.name} aggiunta al mazzo.`);
    };

    modal.querySelector('#btnRemoveDeck').onclick = () => {
      card.inDeck--;
      updateDeckSection();
      modal.remove();
      showToast(`${card.name} rimossa dal mazzo.`);
    };
  }

  // --- SISTEMA TOAST (Notifiche In-Game Senza Alert) ---
  function showToast(msg) {
    let toast = document.getElementById('ingame-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'ingame-toast';
      toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 bg-surface-container-highest/95 backdrop-blur text-primary border border-primary/30 font-tactical text-xs rounded-full shadow-2xl transition-all duration-300 z-[100]';
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

  // Helper render HTML
  function renderMiniCard(card, isAvatar = false, qty = 1) {
    const avatarBorder = isAvatar ? 'border border-primary shadow-[0_0_8px_rgba(242,202,80,0.5)]' : 'border border-outline-variant';
    return `
      <div class="relative aspect-[5/7] bg-surface-container-high rounded overflow-hidden ${avatarBorder}">
        <img src="${card.art}" class="w-full h-full object-cover" />
        <div class="absolute top-0 left-0 bg-surface-container-lowest/90 px-1 font-tactical text-[8px] md:text-[10px] text-secondary font-bold rounded-br">${card.cost}</div>
        ${isAvatar ? `<div class="absolute bottom-0 inset-x-0 bg-primary text-on-primary text-center font-tactical text-[6px] md:text-[8px] font-bold py-0.5">AVATAR</div>` 
                   : `<div class="absolute bottom-0 inset-x-0 bg-surface-container-lowest/90 text-on-surface text-center font-tactical text-[7px] md:text-[9px] font-bold py-0.5 border-t border-outline-variant/50">x${qty}</div>`}
      </div>
    `;
  }

  function renderCollectionCard(card) {
    const isAvatar = card.isAvatar;
    const isForgeReady = !isAvatar && card.copies >= card.copiesNeeded;
    
    let progressHTML = '';
    if (isAvatar) {
      const percent = Math.min(100, (card.xp / card.maxXp) * 100);
      progressHTML = `
        <div class="w-full h-1.5 bg-surface-container-highest mt-1 rounded-full overflow-hidden relative">
          <div class="h-full bg-secondary" style="width: ${percent}%;"></div>
        </div>`;
    } else {
      const percent = Math.min(100, (card.copies / card.copiesNeeded) * 100);
      const barColor = isForgeReady ? 'bg-primary' : 'bg-secondary';
      progressHTML = `
        <div class="w-full h-1.5 bg-surface-container-highest mt-1 rounded-full overflow-hidden relative ${isForgeReady ? 'ring-1 ring-primary' : ''}">
          <div class="h-full ${barColor}" style="width: ${percent}%;"></div>
        </div>`;
    }

    const glowEffect = isForgeReady ? 'shadow-[0_0_12px_rgba(242,202,80,0.4)] border-primary' : (isAvatar ? 'border-secondary shadow-[0_0_12px_rgba(189,244,255,0.2)]' : 'border-outline-variant/50');
    const displayQty = !isAvatar && card.inDeck > 0 ? `<div class="absolute -top-1.5 -left-1.5 z-20 bg-surface-container-lowest border border-primary text-primary w-5 h-5 rounded-full flex items-center justify-center font-tactical text-[9px] font-bold shadow-lg">${card.inDeck}</div>` : '';

    return `
      <div>
        <div class="collection-card relative flex flex-col bg-surface-container-low rounded-lg p-1.5 border ${glowEffect} cursor-pointer hover:-translate-y-1 transition-transform">
          ${displayQty}
          ${isForgeReady ? `<div class="absolute -top-2 -right-2 z-20 bg-primary text-on-primary rounded-full p-0.5 shadow-lg animate-bounce"><span class="material-symbols-outlined text-[12px]">auto_fix_high</span></div>` : ''}
          
          <div class="relative w-full aspect-[5/7] rounded bg-surface-container-highest overflow-hidden">
            <img src="${card.art}" class="w-full h-full object-cover" />
            <div class="absolute top-0 left-0 bg-surface-container-lowest/90 px-1.5 py-0.5 rounded-br font-tactical text-[10px] text-secondary font-bold shadow">${card.cost}</div>
            <div class="absolute top-0 right-0 flex items-center gap-0.5 bg-surface-container-lowest/90 px-1 py-0.5 rounded-bl shadow">
              <span class="material-symbols-outlined text-[10px] text-primary" style="font-variation-settings: 'FILL' 1;">star</span>
              <span class="font-tactical text-[9px] text-on-surface">Lv ${card.level}</span>
            </div>
            ${isAvatar ? `<div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-secondary/80 to-transparent pt-4 pb-0.5 text-center font-tactical text-[8px] text-on-secondary font-bold uppercase tracking-widest">AVATAR</div>` : ''}
          </div>
          
          <div class="mt-1 flex flex-col justify-between flex-1">
            <span class="font-display font-bold text-[10px] text-on-surface truncate">${card.name}</span>
            ${progressHTML}
          </div>
        </div>
      </div>
    `;
  }

  // (Mantenuta la modale Avatar fornita nel passaggio precedente, omessa qui per concisione, basta incollare openAvatarForgeModal)
  function openAvatarForgeModal(avatar) {
    /* Identico alla logica scritta in precedenza */
  }

  return container;
}