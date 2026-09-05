import { gameState } from '../state.js';

export function renderCollection() {
  const container = document.createElement('div');
  container.className = 'flex flex-col gap-4 px-3 pt-4 pb-24 h-full overflow-y-auto select-none';

  // --- DATI FITTIZI SE LA COLLEZIONE È VUOTA ---
  const avatarCard = gameState.player?.avatarCard || {
    id: "AVATAR_01", name: "Ragnar_IlRosso", faction: "Vichinghi", rarity: "Unica", 
    cost: 3, attack: 3, defense: 2, level: 1, xp: 45, maxXp: 100, isAvatar: true,
    art: "https://lh3.googleusercontent.com/aida-public/AB6AXuDpiMSftlbBYWJIGEuY_7L4pvuxvz8QaCn04mqLYn3TaFbX8_hR1QDLKn0UCnf3n92Mti1LHwfU442UI72CbyPLAPdUHZ6Vzs5SzThWbO4_dX2T-1_CSvKljwp3pHzATMzDbDspV8cc1cx-0BHCSVHdZf7nPunoJYq_hpDhMVhnHrEV9X8tU3gSEkvrSFM9MjLbkINf9g8IfPHy1ZCPaZlDHH4l2Z3LrpsmYcVqhWlstpKBedpzuImWCA"
  };

  const mockCollection = [
    avatarCard,
    { id: "VIK_003", name: "Berserker", faction: "Vichinghi", rarity: "Rara", cost: 4, level: 2, copies: 3, copiesNeeded: 3, art: "https://lh3.googleusercontent.com/aida-public/AB6AXuCMtrFSEQ3-mfv9ksxWBsdZn1XSlxacxb5n41fUzfF1nVdB7l1c7-QFFga7BkbU46mA2H8sLigNQzorK9TvJ1hkLTUX8EV0mZ2X84zZhBes7g4tyB35mWTHPg7zAX3VFjnIA-qBK0HWO_4GnWRH741Fz9qD8bb-IyJitE6yRb39hdLfQxtgKA8o0c0IPtG6Jgur7Lr0HqnOBJ_HPeIX-elqF3yi_r4lFZBaMKoiM0Az333fbLsV4Tsh-A" },
    { id: "MED_001", name: "Crociato", faction: "Medioevo", rarity: "Comune", cost: 2, level: 1, copies: 1, copiesNeeded: 5, art: "https://lh3.googleusercontent.com/aida-public/AB6AXuA0C5LMqAmqkr4WDknoWSJE0Cz__qdsbRDLa0i922VXOS9OmCdwOwV_HwU5yO_Cr9H0QlMd7n-9yeoik0liA6cSLM1qF_CQq5coJGS7B4tJZixvDiJys1IGbpDCz9nFmU48whiKd14Qd6wKF0eUcbM_8b8CjHYHOEHpM37MRZutv5_-W-M7DKfiUietsGeuezdPbaMbcy4U9Yo4aac3E0YfOd7O3Uk500C39-vEOI8Wsi-7QwKH54_XgQ" },
    { id: "JAP_001", name: "Samurai", faction: "Giapponesi", rarity: "Non Comune", cost: 4, level: 3, copies: 4, copiesNeeded: 10, art: "https://lh3.googleusercontent.com/aida-public/AB6AXuC38-XIFKSVChpxmXZg0keFEMKjRKGWwtPM9oBYh4VVJq-dJ0c4q1-vU3iwPkX1d4nl2RoKCPuBS3aTJiNNpqhub8xOJRpzp6ITu0T7o3VN1fmfrvKm_AfKqcjD7vzHQHcq7Y-_3ji1tLbbke98NFHQYgnHNYoY_6ECDKny6DnSsyGhpTA3oJZaAsaTFoLu1S9Q_kamI6Z8ILSRk0gEnn4Ebap6442kzSdJ-4C6k9YrrMQw7X7-P0G-7w" },
    { id: "NAT_001", name: "Capo Tribù", faction: "Nativi", rarity: "Epica", cost: 4, level: 1, copies: 1, copiesNeeded: 2, art: "https://lh3.googleusercontent.com/aida-public/AB6AXuBrO3LiwSIxNr0EiIyNC6IwdbazjAybNEDO_rSUFIuQq_ykKX7kPfkhUSTZh-62uK15Ld3sgy3FYYP5_Xx3JomlfnKEtZtIoSQfsucIUMDlOZVVpwFBqd46FUUQxlM6tp76ROOfBxY72hGr9ndHewjnUpFZZVEmJRVG-7Ewm7hZEygdVIlmXjoq1lrjUcRkckZ8f9QK9nbvBa2-6mlll5tuJj9K0PS8bm00OWSiq87pzvtK6OL71-Ctfg" }
  ];

  let currentFilter = 'Tutte';

  // --- SEZIONE 1: MAZZO ATTIVO ---
  const deckSection = document.createElement('div');
  deckSection.className = 'bg-surface-container-low border border-outline-variant rounded-xl p-3 shadow-lg flex flex-col gap-2 relative overflow-hidden';
  deckSection.innerHTML = `
    <div class="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none"></div>
    <div class="flex items-center justify-between z-10">
      <div class="flex flex-col">
        <span class="font-display font-bold text-primary text-sm tracking-wide">MAZZO DA BATTAGLIA</span>
        <div class="flex items-center gap-3 font-tactical text-[10px] text-on-surface-variant mt-0.5">
          <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[12px]">style</span> 30/30 Carte</span>
          <span class="flex items-center gap-1 text-secondary"><span class="material-symbols-outlined text-[12px]">diamond</span> 3.4 Costo Medio</span>
        </div>
      </div>
      <button class="bg-surface-container-highest p-1.5 rounded-lg border border-outline-variant hover:border-primary transition-colors text-on-surface">
        <span class="material-symbols-outlined text-sm">edit</span>
      </button>
    </div>
    
    <!-- Mini griglia Mazzo -->
    <div class="grid grid-cols-5 gap-1.5 mt-1 z-10" id="activeDeckGrid">
      ${renderMiniCard(avatarCard, true)}
      ${renderMiniCard(mockCollection[1], false, 3)}
      ${renderMiniCard(mockCollection[2], false, 3)}
      ${renderMiniCard(mockCollection[3], false, 2)}
      <!-- Placeholder vuoti per le altre carte -->
      <div class="aspect-[5/7] bg-surface-container-highest rounded border border-outline-variant/30 flex items-center justify-center opacity-50"><span class="material-symbols-outlined text-outline text-xs">add</span></div>
    </div>
  `;

  // --- SEZIONE 2: FILTRI (Sticky) ---
  const filterSection = document.createElement('div');
  filterSection.className = 'sticky top-16 z-40 bg-surface/95 backdrop-blur-md py-2 -mx-3 px-3 flex gap-2 overflow-x-auto no-scrollbar font-tactical text-[11px] border-b border-surface-container-high';
  const factions = ['Tutte', 'Vichinghi', 'Medioevo', 'Giapponesi', 'Nativi', 'Epiche', 'Leggendarie'];
  
  factions.forEach(f => {
    const btn = document.createElement('button');
    btn.className = `shrink-0 px-3 py-1.5 rounded-full border transition-all ${f === 'Tutte' ? 'bg-primary text-on-primary border-primary font-bold' : 'bg-surface-container text-on-surface-variant border-outline-variant hover:text-on-surface'}`;
    btn.textContent = f;
    btn.onclick = () => {
      // Aggiorna UI Filtri
      filterSection.querySelectorAll('button').forEach(b => {
        b.className = 'shrink-0 px-3 py-1.5 rounded-full border transition-all bg-surface-container text-on-surface-variant border-outline-variant hover:text-on-surface';
      });
      btn.className = 'shrink-0 px-3 py-1.5 rounded-full border transition-all bg-primary text-on-primary border-primary font-bold';
      
      // Filtra griglia
      currentFilter = f;
      renderGrid();
    };
    filterSection.appendChild(btn);
  });

  // --- SEZIONE 3: GRIGLIA COLLEZIONE ---
  const gridSection = document.createElement('div');
  gridSection.className = 'grid grid-cols-3 gap-3 mt-2';
  gridSection.id = 'collectionGrid';

  function renderGrid() {
    gridSection.innerHTML = '';
    const filtered = mockCollection.filter(c => {
      if (currentFilter === 'Tutte') return true;
      if (currentFilter === 'Epiche') return c.rarity === 'Epica';
      if (currentFilter === 'Leggendarie') return c.rarity === 'Leggendaria';
      return c.faction === currentFilter;
    });

    filtered.forEach(card => {
      gridSection.innerHTML += renderCollectionCard(card);
    });
  }

  // Inizializzazione
  container.appendChild(deckSection);
  container.appendChild(filterSection);
  container.appendChild(gridSection);
  renderGrid();

  // Gestione click sulle carte tramite Event Delegation
  container.addEventListener('click', (e) => {
    const cardEl = e.target.closest('.collection-card');
    if (cardEl) {
      const isAvatar = cardEl.dataset.isAvatar === 'true';
      if (isAvatar) {
        openAvatarForgeModal(avatarCard);
      } else {
        // Apri modale dettagli carta standard
        alert(`Dettagli Carta: ${cardEl.dataset.name}\nQui potrai aggiungerla al mazzo o fonderla se hai abbastanza copie.`);
      }
    }
  });

  return container;
}

// --- COMPONENTI UI (Template String) ---

function renderMiniCard(card, isAvatar = false, qty = 1) {
  const avatarBorder = isAvatar ? 'border-2 border-primary shadow-[0_0_8px_rgba(242,202,80,0.5)]' : 'border border-outline-variant';
  return `
    <div class="relative aspect-[5/7] bg-surface-container-high rounded overflow-hidden ${avatarBorder}">
      <img src="${card.art}" class="w-full h-full object-cover" />
      <div class="absolute top-0 left-0 bg-surface-container-lowest/90 px-1 font-tactical text-[8px] text-secondary font-bold rounded-br">${card.cost}</div>
      ${isAvatar ? `<div class="absolute bottom-0 inset-x-0 bg-primary text-on-primary text-center font-tactical text-[7px] font-bold py-0.5">AVATAR</div>` 
                 : `<div class="absolute bottom-0 inset-x-0 bg-surface-container-lowest/90 text-on-surface text-center font-tactical text-[8px] font-bold py-0.5 border-t border-outline-variant/50">x${qty}</div>`}
    </div>
  `;
}

function renderCollectionCard(card) {
  const isAvatar = card.isAvatar;
  const isForgeReady = !isAvatar && card.copies >= card.copiesNeeded;
  
  // Progress Bar Logica
  let progressHTML = '';
  if (isAvatar) {
    const percent = Math.min(100, (card.xp / card.maxXp) * 100);
    progressHTML = `
      <div class="w-full h-1.5 bg-surface-container-highest mt-1 rounded-full overflow-hidden flex relative">
        <div class="h-full bg-secondary" style="width: ${percent}%;"></div>
        <div class="absolute inset-0 flex items-center justify-center font-tactical text-[6px] text-white mix-blend-difference">XP ${card.xp}/${card.maxXp}</div>
      </div>`;
  } else {
    const percent = Math.min(100, (card.copies / card.copiesNeeded) * 100);
    const barColor = isForgeReady ? 'bg-primary' : 'bg-secondary';
    progressHTML = `
      <div class="w-full h-1.5 bg-surface-container-highest mt-1 rounded-full overflow-hidden flex relative ${isForgeReady ? 'ring-1 ring-primary' : ''}">
        <div class="h-full ${barColor}" style="width: ${percent}%;"></div>
        <div class="absolute inset-0 flex items-center justify-center font-tactical text-[6px] text-white mix-blend-difference">${card.copies}/${card.copiesNeeded}</div>
      </div>`;
  }

  const glowEffect = isForgeReady ? 'shadow-[0_0_12px_rgba(242,202,80,0.4)] border-primary' : (isAvatar ? 'border-secondary shadow-[0_0_12px_rgba(189,244,255,0.2)]' : 'border-outline-variant');

  return `
    <div class="collection-card relative flex flex-col bg-surface-container-low rounded-lg p-1.5 border ${glowEffect} cursor-pointer hover:-translate-y-1 transition-transform" 
         data-is-avatar="${isAvatar ? 'true' : 'false'}" data-name="${card.name}">
      
      ${isForgeReady ? `<div class="absolute -top-2 -right-2 z-20 bg-primary text-on-primary rounded-full p-0.5 shadow-lg animate-bounce"><span class="material-symbols-outlined text-[12px]">auto_fix_high</span></div>` : ''}
      
      <div class="relative w-full aspect-[5/7] rounded bg-surface-container-highest overflow-hidden">
        <img src="${card.art}" class="w-full h-full object-cover" />
        
        <!-- Costo -->
        <div class="absolute top-0 left-0 bg-surface-container-lowest/90 px-1.5 py-0.5 rounded-br font-tactical text-[10px] text-secondary font-bold shadow">${card.cost}</div>
        
        <!-- Livello -->
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
  `;
}

// --- MODALE FORGIA DELL'ANIMA (AVATAR) ---
function openAvatarForgeModal(avatar) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none';
  
  modal.innerHTML = `
    <div class="w-full max-w-sm bg-surface-container-low border border-secondary p-5 rounded-xl shadow-[0_0_30px_rgba(189,244,255,0.15)] flex flex-col gap-4">
      <div class="flex justify-between items-start">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-secondary text-2xl">auto_fix_high</span>
          <div>
            <h2 class="font-display font-bold text-lg text-secondary">FORGIA DELL'ANIMA</h2>
            <p class="font-tactical text-[10px] text-on-surface-variant">Potenzia il tuo Avatar con l'XP della Campagna</p>
          </div>
        </div>
        <button class="close-modal text-outline hover:text-on-surface"><span class="material-symbols-outlined">close</span></button>
      </div>

      <div class="flex gap-4 items-center bg-surface-container-highest p-3 rounded-lg border border-outline-variant">
        <div class="w-20 aspect-[5/7] rounded overflow-hidden border border-secondary shadow-lg shrink-0">
          <img src="${avatar.art}" class="w-full h-full object-cover"/>
        </div>
        <div class="flex flex-col flex-1">
          <span class="font-display font-bold text-sm text-on-surface">${avatar.name}</span>
          <span class="font-tactical text-[10px] text-secondary uppercase">${avatar.faction} • Livello ${avatar.level}</span>
          
          <div class="flex items-center gap-2 mt-2 font-tactical text-xs">
            <span class="text-error font-bold flex items-center gap-0.5"><span class="material-symbols-outlined text-[12px]">swords</span> ${avatar.attack}</span>
            <span class="text-secondary font-bold flex items-center gap-0.5"><span class="material-symbols-outlined text-[12px]">shield</span> ${avatar.defense}</span>
          </div>

          <div class="mt-3">
            <div class="flex justify-between font-tactical text-[9px] text-on-surface-variant mb-1">
              <span>Esperienza</span>
              <span class="text-secondary">${avatar.xp} / ${avatar.maxXp}</span>
            </div>
            <div class="w-full h-1.5 bg-surface-container-lowest rounded-full overflow-hidden">
              <div class="h-full bg-secondary shadow-[0_0_8px_rgba(189,244,255,0.8)]" style="width: ${(avatar.xp/avatar.maxXp)*100}%;"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Skill Tree Preview -->
      <div class="flex flex-col gap-2">
        <span class="font-tactical text-[11px] text-outline tracking-wider">PROSSIMO RISVEGLIO (LIV. 5)</span>
        <div class="bg-surface-container p-2.5 rounded-lg border border-outline-variant flex gap-2 items-center opacity-60 grayscale">
          <span class="material-symbols-outlined text-primary text-xl">bolt</span>
          <div class="flex flex-col">
            <span class="font-tactical text-xs text-on-surface font-bold">Abilità Fazione Sbloccata</span>
            <span class="font-body text-[10px] text-on-surface-variant">Richiede Livello 5. L'Avatar apprenderà l'abilità passiva della sua discendenza.</span>
          </div>
        </div>
      </div>

      <button class="w-full py-2.5 bg-secondary text-on-secondary font-tactical font-bold rounded shadow-lg active:scale-95 transition-all mt-2" ${avatar.xp < avatar.maxXp ? 'disabled style="opacity:0.5;"' : ''}>
        ${avatar.xp >= avatar.maxXp ? 'INFONDI ANIMA (SALI DI LIVELLO)' : 'ESPERIENZA INSUFFICIENTE'}
      </button>
    </div>
  `;

  document.body.appendChild(modal);
  
  modal.querySelector('.close-modal').onclick = () => modal.remove();
  modal.onclick = (e) => { if(e.target === modal) modal.remove(); };
}