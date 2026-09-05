import { gameState } from '../state.js';

export function renderArena() {
  const container = document.createElement('div');
  container.className = 'flex flex-col w-full h-full select-none overflow-hidden pb-4';

  // Sincronizza lo stato prima del render
  const p = gameState.player;
  const o = gameState.opponent;

  // Render dell'interfaccia dell'Arena
  container.innerHTML = `
    <!-- ZONA AVVERSARIO -->
    <section class="relative px-3 pt-2 pb-3 bg-gradient-to-b from-surface-container-lowest to-surface-container-low shadow-md rounded-b-xl">
      <div class="flex items-center justify-between gap-2 mb-2">
        <div class="flex items-center gap-2 min-w-0">
          <div class="w-10 h-10 rounded-full bg-surface-container-highest shadow-inner p-0.5 relative">
            <div class="absolute -bottom-1 -right-1 bg-surface-container-lowest text-tertiary font-tactical text-[10px] px-1 rounded">BOT</div>
            <img class="w-full h-full rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQ2Yi1W12V2BwB77apDL3wCZm-qX-P30_99TTVYI3jWqNrf3T6k0vq_4uxjgd0m6oGnFXL8ztXZKhBsDpEI_6Pk6ZIuCwHENpFFHFeVSGFp9pEB80hAyeTFscdDVp2ANuYWuU1LWOBGoI4TI9cTPrUk-FzpXChe9viWkWXCDGo5065Lexa87ol5_x2xbEsONxFGof5vAFp44tNe2_P2AYn9k0XtZ6N2QSv7vs4f6XDIShDuncvgWaP2Q" />
          </div>
          <div class="flex flex-col">
            <span class="font-display font-bold text-sm text-on-surface">${o.name}</span>
            <span class="font-body text-[10px] text-on-surface-variant">${o.faction}</span>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1 bg-surface-container-highest/90 px-2 py-1 rounded shadow">
            <span class="material-symbols-outlined text-tertiary text-sm" style="font-variation-settings: 'FILL' 1;">favorite</span>
            <span class="font-tactical text-sm text-tertiary font-bold">${o.hp} <span class="text-[10px] text-outline font-normal">/30</span></span>
          </div>
          <div class="flex items-center gap-1 bg-surface-container-lowest/80 px-2 py-1 rounded">
            ${renderManaCrystals(o.mana, o.mana, 'secondary')}
          </div>
        </div>
      </div>

      <!-- Corsia Avversario -->
      <div class="grid grid-cols-5 gap-1.5 pt-1" id="opponentBoard">
        ${renderBoardSlots(o.board, true)}
      </div>
    </section>

    <!-- DIVISORE E LOG COMBATTIMENTO -->
    <div class="relative my-2 px-3 flex flex-col gap-1.5 z-10">
      <div class="flex items-center justify-center h-6 bg-surface-container-highest/80 rounded-full shadow-md relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"></div>
        <span class="font-display text-[11px] text-primary font-bold tracking-widest uppercase z-10">Turno ${gameState.turn}</span>
      </div>
      <div id="battleLog" class="flex items-center justify-between bg-surface-container-lowest/90 px-2 py-1.5 rounded shadow-sm">
        <div class="flex items-center gap-1 text-[11px] font-body text-on-surface truncate">
          <span class="material-symbols-outlined text-tertiary text-[14px]">local_fire_department</span>
          <span>Il match ha inizio. Prepara le difese.</span>
        </div>
      </div>
    </div>

    <!-- ZONA GIOCATORE -->
    <section class="relative px-3 flex flex-col gap-2 flex-1">
      <!-- Corsia Giocatore -->
      <div class="grid grid-cols-5 gap-1.5" id="playerBoard">
        ${renderBoardSlots(p.board, false)}
      </div>

      <!-- Dashboard Risorse Giocatore -->
      <div class="flex items-center justify-between bg-surface-container-lowest/90 px-3 py-2 rounded-xl shadow-md mt-1">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-tertiary text-2xl" style="font-variation-settings: 'FILL' 1;">favorite</span>
          <div class="flex flex-col">
            <span class="font-tactical text-lg text-on-surface font-bold leading-none">${p.hp}<span class="text-xs text-outline font-normal">/30</span></span>
          </div>
        </div>
        <div class="flex flex-col items-end gap-1">
          <div class="flex gap-1">${renderManaCrystals(p.mana, p.maxMana, 'secondary')}</div>
          <span class="font-tactical text-[10px] text-secondary font-bold">${p.mana} / ${p.maxMana} MANA</span>
        </div>
      </div>

      <!-- Mano del Giocatore e Pulsante Fine Turno -->
      <div class="relative flex items-end justify-between gap-2 mt-auto pt-2">
        <div class="flex items-end -space-x-4 flex-1 overflow-visible pb-1" id="playerHand">
          ${renderHand(p.hand)}
        </div>
        <button id="endTurnBtn" class="shrink-0 flex flex-col items-center justify-center w-24 h-20 bg-gradient-to-b from-primary via-primary-container to-inverse-primary rounded-xl shadow-[0_4px_16px_rgba(242,202,80,0.3)] text-on-primary active:scale-95 transition-all">
          <span class="material-symbols-outlined text-xl">hourglass_top</span>
          <span class="font-display text-[10px] font-bold tracking-wider text-center mt-1">TERMINA<br/>TURNO</span>
        </button>
      </div>
    </section>
  `;

  // Listener per le azioni
  container.querySelector('#endTurnBtn').addEventListener('click', handleEndTurn);
  
  // Delega eventi per le carte in mano
  container.querySelector('#playerHand').addEventListener('click', (e) => {
    const cardEl = e.target.closest('.hand-card');
    if (!cardEl) return;
    const index = parseInt(cardEl.dataset.index);
    playCard(index);
  });

  return container;
}

// Genera i cristalli di mana visivi
function renderManaCrystals(current, max, colorClass) {
  let html = '';
  for (let i = 0; i < max; i++) {
    if (i < current) {
      html += `<span class="w-2.5 h-2.5 rounded-full bg-${colorClass} shadow-[0_0_6px_rgba(189,244,255,0.8)]"></span>`;
    } else {
      html += `<span class="w-2.5 h-2.5 rounded-full bg-surface-container-highest"></span>`;
    }
  }
  return html;
}

// Genera le 5 posizioni della board
function renderBoardSlots(board, isOpponent) {
  return board.map((card, idx) => {
    if (!card) {
      return `
        <div class="relative flex items-center justify-center rounded bg-surface-container-lowest/50 aspect-[5/7] shadow-inner ${!isOpponent ? 'hover:bg-surface-container-low cursor-pointer border border-dashed border-outline-variant/30' : ''}">
          <span class="material-symbols-outlined text-outline-variant text-sm opacity-30">shield</span>
        </div>
      `;
    }
    // Render della carta piazzata
    return `
      <div class="relative flex flex-col bg-surface-container-high rounded p-1 shadow-md aspect-[5/7]">
        <div class="relative w-full h-[60%] rounded overflow-hidden">
          <img class="w-full h-full object-cover" src="${card.art}" />
          <div class="absolute top-0 left-0 bg-surface-container-lowest/90 px-1 rounded-br font-tactical text-[9px] text-secondary font-bold">${card.cost}</div>
        </div>
        <div class="flex flex-col justify-between flex-1 mt-0.5">
          <span class="font-display font-bold text-[8px] leading-tight text-on-surface truncate text-center">${card.name}</span>
          <div class="flex items-center justify-between px-0.5 mt-auto">
            <span class="font-tactical text-[10px] text-error font-bold">${card.attack}</span>
            <span class="font-tactical text-[10px] text-secondary font-bold">${card.defense}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Genera le carte in mano
function renderHand(hand) {
  if (hand.length === 0) {
    return `<span class="text-xs text-outline-variant font-tactical italic px-2">Mano vuota</span>`;
  }
  
  return hand.map((card, idx) => {
    const canPlay = gameState.player.mana >= card.cost;
    const playClasses = canPlay ? 'hover:-translate-y-4 shadow-lg ring-1 ring-primary/50' : 'opacity-70 grayscale-[30%]';
    
    return `
      <div class="hand-card relative w-16 aspect-[5/7] bg-surface-container-high rounded p-1 transition-transform cursor-pointer hover:z-30 ${playClasses}" data-index="${idx}">
        <div class="absolute -top-1 -right-1 z-20 w-4 h-4 rounded-full ${canPlay ? 'bg-secondary text-on-secondary' : 'bg-surface-container-highest text-outline'} flex items-center justify-center font-tactical text-[9px] font-bold shadow">${card.cost}</div>
        <div class="w-full h-full rounded overflow-hidden relative">
          <img class="w-full h-full object-cover" src="${card.art}" />
          <div class="absolute bottom-0 inset-x-0 bg-surface-container-lowest/90 px-0.5 text-center">
            <span class="font-display font-bold text-[7px] text-on-surface truncate block">${card.name}</span>
            <div class="flex justify-between font-tactical text-[7px] text-primary px-0.5">
              <span>${card.attack}</span><span>${card.defense}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Logica provvisoria per simulare le azioni
function handleEndTurn() {
  const log = document.getElementById('battleLog');
  log.innerHTML = `<div class="flex items-center gap-1 text-[11px] font-body text-tertiary truncate"><span class="material-symbols-outlined text-[14px]">history_toggle_off</span><span>Turno passato al Bot...</span></div>`;
  
  setTimeout(() => {
    gameState.turn++;
    if(gameState.player.maxMana < 10) gameState.player.maxMana++;
    gameState.player.mana = gameState.player.maxMana;
    
    // Aggiorna UI forzando il re-render dal router
    window.navigate('arena');
  }, 1000);
}

function playCard(handIndex) {
  const card = gameState.player.hand[handIndex];
  if (gameState.player.mana < card.cost) return;

  const emptySlotIdx = gameState.player.board.findIndex(slot => slot === null);
  if (emptySlotIdx === -1) {
    alert("Campo pieno!");
    return;
  }

  gameState.player.mana -= card.cost;
  gameState.player.board[emptySlotIdx] = card;
  gameState.player.hand.splice(handIndex, 1);
  
  window.navigate('arena');
}