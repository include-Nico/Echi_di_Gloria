import { gameState } from '../state.js';
import { FULL_CARD_DB } from '../data/cards.js';

export function renderArena() {
  const container = document.createElement('div');
  container.className = 'flex flex-col w-full h-full select-none overflow-hidden relative';

  // --- STATO LOCALE DELLA VISTA ---
  let viewState = 'lobby'; // 'lobby' | 'loading' | 'battle'
  let botDifficulty = 'Facile';
  
  // Variabili per l'interazione nel combattimento
  let selectedHandIndex = null;
  let selectedFriendlySlot = null;

  // Renderizza la UI in base allo stato corrente
  function updateUI() {
    container.innerHTML = '';
    
    if (viewState === 'lobby') {
      container.appendChild(renderLobby());
    } else if (viewState === 'loading') {
      container.appendChild(renderLoading());
    } else if (viewState === 'battle') {
      container.appendChild(renderBattleBoard());
      attachBattleListeners();
    }
  }

  // ==========================================
  // 1. LOBBY PRE-PARTITA
  // ==========================================
  function renderLobby() {
    const el = document.createElement('div');
    el.className = 'flex flex-col gap-4 p-4 h-full overflow-y-auto w-full max-w-md mx-auto';
    el.innerHTML = `
      <div class="text-center mt-2 mb-4">
        <h2 class="font-display font-bold text-2xl text-primary tracking-widest drop-shadow-md">IL SANCTUM</h2>
        <p class="font-tactical text-[11px] text-on-surface-variant uppercase mt-1">Scegli il tuo campo di battaglia</p>
      </div>

      <!-- ALLENAMENTO E BOT -->
      <div class="bg-surface-container-low border border-outline-variant p-4 rounded-xl shadow-lg flex flex-col gap-3 relative overflow-hidden">
        <div class="absolute -right-6 -top-6 w-24 h-24 bg-error/10 rounded-full blur-2xl pointer-events-none"></div>
        <div class="flex items-center gap-2 border-b border-surface-container-high pb-2">
          <span class="material-symbols-outlined text-error text-xl">smart_toy</span>
          <h3 class="font-display font-bold text-sm text-error">SFIDA CONTRO L'IA</h3>
        </div>
        
        <label class="font-tactical text-[10px] text-on-surface-variant">SELEZIONA DIFFICOLTÀ</label>
        <select id="difficultySelect" class="w-full bg-surface-container-lowest border border-outline-variant text-on-surface font-tactical text-xs p-2.5 rounded outline-none focus:border-error">
          <option value="Facile">Facile (Solo Comuni) • Premio: 10 Monete</option>
          <option value="Medio">Medio (Non Comuni/Rare) • Premio: 20 Monete</option>
          <option value="Difficile">Difficile (Sinergie) • Premio: 30 Monete</option>
          <option value="Boss">Boss (Deck Leggendario) • Premio: 50 Monete + Carta</option>
        </select>
        
        <button id="startBotBtn" class="w-full py-3 bg-error-container text-on-error-container hover:bg-error hover:text-on-error font-tactical font-bold text-xs rounded shadow-lg active:scale-95 transition-all mt-2">
          CERCA AVVERSARIO
        </button>
      </div>

      <!-- MULTIPLAYER E AMICI -->
      <div class="bg-surface-container-low border border-outline-variant p-4 rounded-xl shadow-lg flex flex-col gap-3 relative overflow-hidden mt-2">
        <div class="absolute -left-6 -bottom-6 w-24 h-24 bg-secondary/10 rounded-full blur-2xl pointer-events-none"></div>
        <div class="flex items-center gap-2 border-b border-surface-container-high pb-2">
          <span class="material-symbols-outlined text-secondary text-xl">group</span>
          <h3 class="font-display font-bold text-sm text-secondary">DUELLO TRA AMICI</h3>
        </div>
        
        <div class="flex gap-2 items-end mt-1">
          <div class="flex flex-col flex-1 gap-1">
            <label class="font-tactical text-[10px] text-on-surface-variant">CODICE STANZA (6 CIFRE)</label>
            <input type="text" placeholder="000000" maxlength="6" class="w-full bg-surface-container-lowest border border-outline-variant text-secondary font-tactical text-center text-lg p-2 rounded outline-none focus:border-secondary" />
          </div>
          <button class="bg-surface-container-highest text-on-surface hover:text-secondary border border-outline-variant hover:border-secondary p-3 rounded active:scale-95 transition-all">
            <span class="material-symbols-outlined text-[20px]">login</span>
          </button>
        </div>

        <div class="flex items-center gap-2 w-full mt-2">
          <div class="h-px bg-surface-container-high flex-1"></div>
          <span class="font-tactical text-[9px] text-outline-variant">OPPURE</span>
          <div class="h-px bg-surface-container-high flex-1"></div>
        </div>

        <div class="flex gap-2 mt-1">
          <button class="flex-1 py-2.5 bg-surface-container-lowest border border-secondary/50 text-secondary font-tactical text-[10px] font-bold rounded flex items-center justify-center gap-1 active:scale-95 transition-all">
            <span class="material-symbols-outlined text-[16px]">qr_code</span> GENERA QR
          </button>
          <button class="flex-1 py-2.5 bg-secondary text-on-secondary font-tactical text-[10px] font-bold rounded flex items-center justify-center gap-1 active:scale-95 transition-all">
            <span class="material-symbols-outlined text-[16px]">qr_code_scanner</span> SCANSIONA
          </button>
        </div>
      </div>
    `;

    el.querySelector('#startBotBtn').addEventListener('click', () => {
      botDifficulty = el.querySelector('#difficultySelect').value;
      initMatchState();
      viewState = 'loading';
      updateUI();
    });

    return el;
  }

  // ==========================================
  // 2. SCHERMATA DI CARICAMENTO
  // ==========================================
  function renderLoading() {
    const el = document.createElement('div');
    el.className = 'flex flex-col items-center justify-center w-full h-full bg-surface-container-lowest p-6 text-center';
    el.innerHTML = `
      <div class="relative flex justify-center items-center mb-8">
        <span class="material-symbols-outlined text-6xl text-primary animate-spin" style="animation-duration: 3s;">settings_input_component</span>
        <span class="material-symbols-outlined text-4xl text-error absolute animate-pulse">swords</span>
      </div>
      <h2 class="font-display font-bold text-xl text-on-surface mb-2">EVOCAZIONE DELL'ARENA</h2>
      <p class="font-tactical text-xs text-on-surface-variant">Connessione al Sanctum... Preparazione mazzi (Difficoltà: ${botDifficulty}).</p>
      
      <div class="w-full max-w-xs bg-surface-container-high h-1.5 rounded-full mt-8 overflow-hidden">
        <div class="bg-primary h-full rounded-full transition-all duration-1000 w-0" id="loadingBar"></div>
      </div>
    `;

    // Simula tempo di caricamento
    setTimeout(() => {
      const bar = el.querySelector('#loadingBar');
      if(bar) bar.style.width = '100%';
    }, 100);

    setTimeout(() => {
      viewState = 'battle';
      updateUI();
    }, 1500);

    return el;
  }

  // ==========================================
  // 3. CAMPO DI BATTAGLIA E LOGICA
  // ==========================================
  function initMatchState() {
    // Inizializza lo stato della partita per il prototipo
    gameState.turn = 1;
    gameState.player.maxMana = 1;
    gameState.player.mana = 1;
    gameState.player.hp = 30;
    gameState.player.board = [null, null, null, null, null];
    
    // Popola mano fittizia dal DB
    gameState.player.hand = [
      {...FULL_CARD_DB.find(c => c.name === "Indigeno"), currentDef: 2},
      {...FULL_CARD_DB.find(c => c.name === "Berserker"), currentDef: 2},
      {...FULL_CARD_DB.find(c => c.name === "Arceri Base"), currentDef: 1}
    ];

    gameState.opponent.isBot = true;
    gameState.opponent.name = `Bot ${botDifficulty}`;
    gameState.opponent.faction = 'Medioevo';
    gameState.opponent.hp = 30;
    gameState.opponent.maxMana = 1;
    gameState.opponent.mana = 1;
    gameState.opponent.board = [null, null, null, null, null];
    
    // Il bot ha già una carta schierata per testare l'attacco
    gameState.opponent.board[2] = {...FULL_CARD_DB.find(c => c.name === "Crociato"), currentDef: 3};
  }

  function renderBattleBoard() {
    const p = gameState.player;
    const o = gameState.opponent;
    const el = document.createElement('div');
    el.className = 'flex flex-col w-full h-full';

    el.innerHTML = `
      <!-- ZONA AVVERSARIO -->
      <section class="relative px-3 pt-2 pb-3 bg-gradient-to-b from-surface-container-lowest to-surface-container-low shadow-md border-b border-outline-variant/30">
        <div class="flex items-center justify-between gap-2 mb-2">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 rounded-full bg-surface-container-highest shadow-inner p-0.5 relative border border-error/50">
              <div class="absolute -bottom-1 -right-1 bg-surface-container-lowest text-error font-tactical text-[9px] px-1 rounded border border-error/50">BOT</div>
              <img class="w-full h-full rounded-full object-cover" src="https://image.pollinations.ai/prompt/dark%20fantasy%20medieval%20knight%20commander%20portrait?width=100&height=100&nologo=true" />
            </div>
            <div class="flex flex-col">
              <span class="font-display font-bold text-sm text-on-surface">${o.name}</span>
              <span class="font-tactical text-[9px] text-error">${o.faction}</span>
            </div>
          </div>
          
          <!-- Avatar Nemico Cliccabile (Bersaglio Attacco Diretto) -->
          <button id="enemyHeroTarget" class="flex items-center gap-1 bg-error-container/20 border border-error px-2 py-1 rounded shadow cursor-crosshair hover:bg-error-container/40 transition-colors">
            <span class="material-symbols-outlined text-error text-[14px]" style="font-variation-settings: 'FILL' 1;">favorite</span>
            <span class="font-tactical text-sm text-error font-bold">${o.hp}</span>
          </button>
        </div>

        <div class="grid grid-cols-5 gap-1.5 pt-1" id="opponentBoard">
          ${o.board.map((card, idx) => renderBoardSlot(card, idx, true)).join('')}
        </div>
      </section>

      <!-- LOG COMBATTIMENTO E DIVISORE -->
      <div class="relative my-2 px-3 flex flex-col gap-1 z-10 shrink-0">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 bg-surface-container-highest/80 px-3 py-0.5 rounded-full shadow border border-primary/20">
            <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span class="font-display text-[10px] text-primary font-bold tracking-widest uppercase">Turno ${gameState.turn}</span>
          </div>
          <div class="font-tactical text-[10px] text-secondary flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">diamond</span> MANA BOT: ${o.mana}
          </div>
        </div>
        <div id="battleLog" class="bg-surface-container-lowest border border-outline-variant/50 px-2 py-1.5 rounded shadow-inner flex items-center gap-1 text-[10px] font-body text-on-surface-variant truncate">
          <span class="material-symbols-outlined text-tertiary text-[14px]">info</span>
          <span>Il combattimento ha inizio. Tocca a te.</span>
        </div>
      </div>

      <!-- ZONA GIOCATORE -->
      <section class="relative px-3 flex flex-col gap-2 flex-1 pb-4">
        <div class="grid grid-cols-5 gap-1.5" id="playerBoard">
          ${p.board.map((card, idx) => renderBoardSlot(card, idx, false)).join('')}
        </div>

        <div class="flex items-center justify-between bg-surface-container-lowest border border-primary/30 px-3 py-2 rounded-xl shadow-md mt-auto mb-1">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-2xl" style="font-variation-settings: 'FILL' 1;">favorite</span>
            <span class="font-tactical text-xl text-on-surface font-bold leading-none">${p.hp}</span>
          </div>
          <div class="flex flex-col items-end gap-1">
            <div class="flex gap-1">${renderManaCrystals(p.mana, p.maxMana)}</div>
            <span class="font-tactical text-[9px] text-secondary font-bold tracking-wider">${p.mana} / ${p.maxMana} MANA</span>
          </div>
        </div>

        <div class="relative flex items-end justify-between gap-2 h-24">
          <div class="flex items-end -space-x-4 flex-1 overflow-visible pb-1 px-2" id="playerHand">
            ${p.hand.map((card, idx) => renderHandCard(card, idx, p.mana)).join('')}
          </div>
          <button id="endTurnBtn" class="shrink-0 flex flex-col items-center justify-center w-20 h-[72px] bg-primary text-on-primary hover:bg-primary-fixed-dim rounded-xl shadow-[0_4px_16px_rgba(242,202,80,0.3)] active:scale-95 transition-all border border-[#fff]/20">
            <span class="material-symbols-outlined text-lg">hourglass_top</span>
            <span class="font-display text-[9px] font-bold tracking-wider text-center mt-1">PASSA</span>
          </button>
        </div>
      </section>
    `;
    return el;
  }

  // --- HELPERS DI RENDER ---
  function renderManaCrystals(current, max) {
    let html = '';
    for (let i = 0; i < max; i++) {
      html += `<span class="w-2.5 h-2.5 rounded-full ${i < current ? 'bg-secondary shadow-[0_0_6px_rgba(189,244,255,0.8)]' : 'bg-surface-container-highest border border-outline-variant'}"></span>`;
    }
    return html;
  }

  function renderBoardSlot(card, idx, isOpponent) {
    const isSelected = selectedFriendlySlot === idx && !isOpponent;
    const selectionRing = isSelected ? 'ring-2 ring-primary shadow-[0_0_15px_rgba(242,202,80,0.6)] -translate-y-2' : '';
    
    if (!card) {
      const clickAction = !isOpponent ? `data-action="deploy" data-slot="${idx}"` : '';
      const hoverStyle = (!isOpponent && selectedHandIndex !== null) ? 'hover:bg-primary/20 hover:border-primary border-primary/50' : 'border-outline-variant/30';
      return `
        <div class="slot-empty relative flex items-center justify-center rounded bg-surface-container-lowest/50 aspect-[5/7] shadow-inner border border-dashed ${hoverStyle} transition-colors cursor-pointer" ${clickAction}>
          <span class="material-symbols-outlined text-outline-variant text-sm opacity-30">add</span>
        </div>
      `;
    }

    const clickAction = !isOpponent ? `data-action="selectFriendly" data-slot="${idx}"` : `data-action="attackTarget" data-slot="${idx}"`;
    const targetCursor = isOpponent && selectedFriendlySlot !== null ? 'cursor-crosshair hover:border-error' : 'cursor-pointer';

    return `
      <div class="slot-filled relative flex flex-col bg-surface-container-high rounded p-1 shadow-md aspect-[5/7] transition-all border border-outline-variant/50 ${selectionRing} ${targetCursor}" ${clickAction}>
        <div class="relative w-full h-[55%] rounded overflow-hidden">
          <img class="w-full h-full object-cover" src="${card.art}" />
        </div>
        <div class="flex flex-col justify-between flex-1 mt-0.5">
          <span class="font-display font-bold text-[7px] leading-tight text-on-surface truncate text-center">${card.name}</span>
          <div class="flex items-center justify-between px-0.5 mt-auto bg-surface-container-lowest rounded py-0.5">
            <span class="font-tactical text-[9px] text-error font-bold flex items-center gap-0.5"><span class="material-symbols-outlined text-[8px]">swords</span>${card.attack}</span>
            <span class="font-tactical text-[9px] text-secondary font-bold flex items-center gap-0.5"><span class="material-symbols-outlined text-[8px]">shield</span>${card.currentDef}</span>
          </div>
        </div>
      </div>
    `;
  }

  function renderHandCard(card, idx, currentMana) {
    const canPlay = currentMana >= card.cost;
    const isSelected = selectedHandIndex === idx;
    const playClasses = canPlay ? 'hover:-translate-y-4 shadow-lg ring-1 ring-primary/50' : 'opacity-60 grayscale-[50%]';
    const selectionClass = isSelected ? '-translate-y-6 ring-2 ring-primary shadow-[0_0_20px_rgba(242,202,80,0.6)] z-40' : '';

    return `
      <div class="hand-card relative w-16 aspect-[5/7] bg-surface-container-high rounded p-1 transition-transform cursor-pointer hover:z-30 border border-outline-variant/50 ${playClasses} ${selectionClass}" data-action="selectHand" data-index="${idx}">
        <div class="absolute -top-1 -right-1 z-20 w-4 h-4 rounded-full ${canPlay ? 'bg-secondary text-on-secondary shadow-md' : 'bg-surface-container-highest text-outline border border-outline-variant'} flex items-center justify-center font-tactical text-[9px] font-bold">${card.cost}</div>
        <div class="w-full h-full rounded overflow-hidden relative">
          <img class="w-full h-full object-cover" src="${card.art}" />
          <div class="absolute bottom-0 inset-x-0 bg-surface-container-lowest/90 px-0.5 pt-2 pb-0.5 text-center bg-gradient-to-t from-surface-container-lowest to-transparent">
            <span class="font-display font-bold text-[6px] text-on-surface truncate block">${card.name}</span>
            <div class="flex justify-between font-tactical text-[7px] font-bold px-0.5 mt-0.5">
              <span class="text-error">${card.attack}</span><span class="text-secondary">${card.defense}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // --- LOGICA INTERATTIVA (Event Delegation) ---
  function attachBattleListeners() {
    container.querySelector('#endTurnBtn').addEventListener('click', executeBotTurn);
    
    // Attacco diretto all'Eroe Nemico
    container.querySelector('#enemyHeroTarget').addEventListener('click', () => {
      if (selectedFriendlySlot !== null) resolveAttack(selectedFriendlySlot, 'hero');
    });

    // Clic sulla griglia o sulla mano
    container.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]');
      if (!target) return;

      const action = target.dataset.action;

      if (action === 'selectHand') {
        const idx = parseInt(target.dataset.index);
        const card = gameState.player.hand[idx];
        if (gameState.player.mana >= card.cost) {
          selectedHandIndex = selectedHandIndex === idx ? null : idx; // Toggle
          selectedFriendlySlot = null; // Resetta la selezione board
          updateUI();
          logMsg(`Selezionata carta: ${card.name}. Scegli uno slot vuoto per schierarla.`);
        } else {
          logMsg("Mana insufficiente!", true);
        }
      } 
      
      else if (action === 'deploy') {
        if (selectedHandIndex !== null) {
          const slotIdx = parseInt(target.dataset.slot);
          const card = gameState.player.hand[selectedHandIndex];
          
          gameState.player.mana -= card.cost;
          gameState.player.board[slotIdx] = card;
          gameState.player.hand.splice(selectedHandIndex, 1);
          
          selectedHandIndex = null;
          logMsg(`Schierato ${card.name} nello slot ${slotIdx + 1}.`);
          updateUI();
        }
      } 
      
      else if (action === 'selectFriendly') {
        const idx = parseInt(target.dataset.slot);
        selectedFriendlySlot = selectedFriendlySlot === idx ? null : idx;
        selectedHandIndex = null;
        updateUI();
        if(selectedFriendlySlot !== null) logMsg("Scegli un bersaglio nemico da attaccare.");
      }

      else if (action === 'attackTarget') {
        if (selectedFriendlySlot !== null) {
          const targetSlot = parseInt(target.dataset.slot);
          resolveAttack(selectedFriendlySlot, targetSlot);
        }
      }
    });
  }

  // Risoluzione Combattimento (Inclusa regola "Eccedenza Danno" della prompt)
  function resolveAttack(attackerSlotIdx, defenderTarget) {
    const attacker = gameState.player.board[attackerSlotIdx];
    
    if (defenderTarget === 'hero') {
      // Controlla se c'è Taunt/Difesa sul board (Semplificazione: puoi attaccare l'eroe solo se board vuota o carte senza Provocazione. Assumiamo attacco diretto libero per ora).
      gameState.opponent.hp -= attacker.attack;
      logMsg(`${attacker.name} infligge ${attacker.attack} danni all'Inquisitore!`);
    } else {
      const defender = gameState.opponent.board[defenderTarget];
      let damageToDef = attacker.attack;
      let excessDamage = 0;

      if (damageToDef >= defender.currentDef) {
        excessDamage = damageToDef - defender.currentDef;
        logMsg(`${attacker.name} distrugge ${defender.name}! ${excessDamage > 0 ? `(${excessDamage} danni in eccesso all'Eroe)` : ''}`);
        gameState.opponent.board[defenderTarget] = null;
        if (excessDamage > 0) gameState.opponent.hp -= excessDamage;
      } else {
        defender.currentDef -= damageToDef;
        logMsg(`${attacker.name} colpisce ${defender.name}. Difesa rimanente: ${defender.currentDef}.`);
      }
    }

    // L'attaccante ha agito (simulazione semplice: lo deselezioniamo)
    selectedFriendlySlot = null;
    
    // Condizione di Vittoria
    if (gameState.opponent.hp <= 0) {
      gameState.opponent.hp = 0;
      updateUI();
      setTimeout(() => alert("VITTORIA! Hai sconfitto l'IA."), 500);
      return;
    }
    
    updateUI();
  }

  // Logica Turno Avversario (IA Semplice)
  function executeBotTurn() {
    logMsg("Turno Avversario in corso...");
    selectedHandIndex = null;
    selectedFriendlySlot = null;
    updateUI(); // Blocca UI

    setTimeout(() => {
      // Il Bot avanza di turno e ripristina mana
      gameState.turn++;
      gameState.opponent.maxMana = Math.min(10, gameState.opponent.maxMana + 1);
      gameState.opponent.mana = gameState.opponent.maxMana;
      gameState.player.maxMana = Math.min(10, gameState.player.maxMana + 1);
      gameState.player.mana = gameState.player.maxMana;

      // Il bot attacca casualmente se ha creature (Simulazione Turno 2/4 dal prompt)
      const botCard = gameState.opponent.board[2];
      const playerTargetIdx = gameState.player.board.findIndex(c => c !== null);
      
      if (botCard && playerTargetIdx !== -1) {
        const pCard = gameState.player.board[playerTargetIdx];
        if (botCard.attack >= pCard.currentDef) {
          gameState.player.board[playerTargetIdx] = null;
          logMsg(`Il Bot usa ${botCard.name} e distrugge il tuo ${pCard.name}!`, true);
        } else {
          pCard.currentDef -= botCard.attack;
          logMsg(`Il Bot usa ${botCard.name} contro ${pCard.name}.`, true);
        }
      } else if (botCard) {
        gameState.player.hp -= botCard.attack;
        logMsg(`Il Bot attacca direttamente! Subisci ${botCard.attack} danni.`, true);
      } else {
        logMsg("Il Bot passa il turno senza attaccare.");
      }

      // Fine turno bot, tocca al giocatore
      updateUI();
    }, 1500);
  }

  function logMsg(msg, isError = false) {
    const logEl = document.getElementById('battleLog');
    if (!logEl) return;
    const icon = isError ? 'warning' : 'history_toggle_off';
    const color = isError ? 'text-error' : 'text-primary';
    logEl.innerHTML = `<span class="material-symbols-outlined ${color} text-[14px]">${icon}</span> <span class="${color}">${msg}</span>`;
  }

  // Inizializza al primo mount
  updateUI();

  return container;
}