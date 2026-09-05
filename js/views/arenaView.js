import { gameState } from '../state.js';

export function renderArena() {
  const container = document.createElement('div');
  container.className = 'flex flex-col w-full h-full select-none overflow-hidden relative bg-surface';

  let viewState = 'lobby'; // lobby | loading | battle | reward
  let botDifficulty = 'Facile';
  let lobbyTab = 'ia'; 
  
  let selectedHandIndex = null;
  let selectedFriendlySlot = null;
  
  // Dati di fine partita
  let matchResult = { won: false, rewardSilver: 0, rewardGems: 0 };

  // Helper per mostrare/nascondere Navbar e Header
  function toggleFullScreenMode(isFullScreen) {
    const header = document.querySelector('header');
    const nav = document.querySelector('nav');
    const appRoot = document.getElementById('appRoot');
    
    if (isFullScreen) {
      if(header) header.classList.add('hidden');
      if(nav) nav.classList.add('hidden');
      if(appRoot) {
        appRoot.classList.remove('top-16', 'bottom-16');
        appRoot.classList.add('top-0', 'bottom-0');
      }
    } else {
      if(header) header.classList.remove('hidden');
      if(nav) nav.classList.remove('hidden');
      if(appRoot) {
        appRoot.classList.add('top-16', 'bottom-16');
        appRoot.classList.remove('top-0', 'bottom-0');
      }
    }
  }

  function updateUI() {
    container.innerHTML = '';
    
    // Gestione layout globale
    if (viewState === 'battle' || viewState === 'loading' || viewState === 'reward') {
      toggleFullScreenMode(true);
    } else {
      toggleFullScreenMode(false);
    }

    if (viewState === 'lobby') {
      container.appendChild(renderLobby());
      attachLobbyListeners();
    } else if (viewState === 'loading') {
      container.appendChild(renderLoading());
    } else if (viewState === 'battle') {
      container.appendChild(renderBattleBoard());
      attachBattleListeners();
    } else if (viewState === 'reward') {
      container.appendChild(renderRewardScreen());
    }
  }

  // ==========================================
  // 1. LOBBY PRE-PARTITA
  // ==========================================
  function renderLobby() {
    const el = document.createElement('div');
    el.className = 'relative flex flex-col w-full h-full overflow-y-auto';
    const bgUrl = "https://image.pollinations.ai/prompt/dark%20fantasy%20war%20room%20table%20map%20glowing%20runes%20dim%20lighting?width=800&height=1200&nologo=true";
    
    el.innerHTML = `
      <div class="absolute inset-0 z-0">
        <img src="${bgUrl}" class="w-full h-full object-cover opacity-20 mix-blend-overlay" />
        <div class="absolute inset-0 bg-gradient-to-b from-surface via-surface/80 to-surface-container-lowest"></div>
      </div>

      <div class="relative z-10 flex flex-col gap-5 p-4 max-w-md mx-auto w-full pb-20">
        <div class="text-center mt-4">
          <span class="material-symbols-outlined text-4xl text-primary drop-shadow-[0_0_15px_rgba(242,202,80,0.8)]">fort</span>
          <h2 class="font-display font-bold text-3xl text-on-surface tracking-widest mt-1">IL SANCTUM</h2>
          <p class="font-tactical text-[11px] text-primary tracking-widest uppercase mt-1">Preparazione alla Battaglia</p>
        </div>

        <div class="flex bg-surface-container-highest/50 backdrop-blur-md rounded-xl p-1 shadow-inner border border-outline-variant/30">
          <button id="tabIaBtn" class="flex-1 py-2.5 rounded-lg font-tactical text-xs font-bold transition-all flex items-center justify-center gap-2 ${lobbyTab === 'ia' ? 'bg-primary text-[#110d0a] shadow-lg' : 'text-on-surface-variant hover:text-on-surface'}">
            <span class="material-symbols-outlined text-[16px]">smart_toy</span> IA & ALLENAMENTO
          </button>
          <button id="tabPvpBtn" class="flex-1 py-2.5 rounded-lg font-tactical text-xs font-bold transition-all flex items-center justify-center gap-2 ${lobbyTab === 'pvp' ? 'bg-secondary text-[#110d0a] shadow-lg' : 'text-on-surface-variant hover:text-on-surface'}">
            <span class="material-symbols-outlined text-[16px]">group</span> DUELLO PVP
          </button>
        </div>

        <!-- TAB IA -->
        <div id="contentIa" class="flex flex-col gap-4 ${lobbyTab === 'ia' ? '' : 'hidden'}">
          <div class="grid grid-cols-2 gap-3">
            <div class="diff-card relative p-3 rounded-xl border cursor-pointer transition-all ${botDifficulty === 'Facile' ? 'bg-surface-container-high border-[#4ade80] shadow-[0_0_15px_rgba(74,222,128,0.2)] scale-105' : 'bg-surface-container-lowest border-outline-variant/50 hover:border-outline-variant'}" data-diff="Facile">
              <div class="flex items-center gap-1 mb-1">
                <span class="material-symbols-outlined text-[#4ade80] text-[16px]">eco</span>
                <span class="font-display font-bold text-xs text-[#4ade80]">FACILE</span>
              </div>
              <div class="mt-2 pt-2 border-t border-outline-variant/30 flex items-center justify-between">
                <span class="font-tactical text-[8px] text-outline uppercase">Premio</span>
                <span class="font-tactical text-[10px] text-on-surface flex items-center gap-1"><span class="material-symbols-outlined text-[12px] text-primary">toll</span> 10</span>
              </div>
            </div>

            <div class="diff-card relative p-3 rounded-xl border cursor-pointer transition-all ${botDifficulty === 'Medio' ? 'bg-surface-container-high border-[#60a5fa] shadow-[0_0_15px_rgba(96,165,250,0.2)] scale-105' : 'bg-surface-container-lowest border-outline-variant/50 hover:border-outline-variant'}" data-diff="Medio">
              <div class="flex items-center gap-1 mb-1">
                <span class="material-symbols-outlined text-[#60a5fa] text-[16px]">shield</span>
                <span class="font-display font-bold text-xs text-[#60a5fa]">MEDIO</span>
              </div>
              <div class="mt-2 pt-2 border-t border-outline-variant/30 flex items-center justify-between">
                <span class="font-tactical text-[8px] text-outline uppercase">Premio</span>
                <span class="font-tactical text-[10px] text-on-surface flex items-center gap-1"><span class="material-symbols-outlined text-[12px] text-primary">toll</span> 20</span>
              </div>
            </div>

            <div class="diff-card relative p-3 rounded-xl border cursor-pointer transition-all ${botDifficulty === 'Difficile' ? 'bg-surface-container-high border-[#f87171] shadow-[0_0_15px_rgba(248,113,113,0.2)] scale-105' : 'bg-surface-container-lowest border-outline-variant/50 hover:border-outline-variant'}" data-diff="Difficile">
              <div class="flex items-center gap-1 mb-1">
                <span class="material-symbols-outlined text-[#f87171] text-[16px]">local_fire_department</span>
                <span class="font-display font-bold text-xs text-[#f87171]">DIFFICILE</span>
              </div>
              <div class="mt-2 pt-2 border-t border-outline-variant/30 flex items-center justify-between">
                <span class="font-tactical text-[8px] text-outline uppercase">Premio</span>
                <span class="font-tactical text-[10px] text-on-surface flex items-center gap-1"><span class="material-symbols-outlined text-[12px] text-primary">toll</span> 30</span>
              </div>
            </div>

            <div class="diff-card relative p-3 rounded-xl border cursor-pointer transition-all ${botDifficulty === 'Boss' ? 'bg-surface-container-high border-primary shadow-[0_0_20px_rgba(242,202,80,0.3)] scale-105' : 'bg-surface-container-lowest border-outline-variant/50 hover:border-outline-variant'}" data-diff="Boss">
              <div class="flex items-center gap-1 mb-1">
                <span class="material-symbols-outlined text-primary text-[16px]">stars</span>
                <span class="font-display font-bold text-xs text-primary">BOSS</span>
              </div>
              <div class="mt-2 pt-2 border-t border-outline-variant/30 flex items-center justify-between">
                <span class="font-tactical text-[8px] text-outline uppercase">Premio</span>
                <span class="font-tactical text-[10px] text-on-surface flex items-center gap-1 text-primary"><span class="material-symbols-outlined text-[12px]">style</span> +50</span>
              </div>
            </div>
          </div>

          <button id="startBotBtn" class="mt-4 w-full py-4 bg-primary hover:bg-primary-fixed-dim text-[#110d0a] font-tactical text-sm font-bold rounded-xl shadow-[0_4px_20px_rgba(242,202,80,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2">
            <span class="material-symbols-outlined text-[20px]">swords</span> ENTRA NELL'ARENA
          </button>
        </div>

        <!-- TAB PVP -->
        <div id="contentPvp" class="flex flex-col gap-6 ${lobbyTab === 'pvp' ? '' : 'hidden'}">
          <div class="bg-surface-container-lowest/80 backdrop-blur border border-outline-variant/50 p-4 rounded-xl shadow-lg">
            <div class="flex items-center gap-2 mb-3">
              <span class="material-symbols-outlined text-secondary text-[18px]">password</span>
              <span class="font-display font-bold text-xs text-secondary">ACCESSO PRIVATO</span>
            </div>
            <div class="flex gap-2">
              <input type="text" placeholder="CODICE" maxlength="6" class="flex-1 bg-surface-container-highest border border-outline-variant text-on-surface font-tactical text-center text-lg p-3 rounded-lg outline-none focus:border-secondary uppercase tracking-widest placeholder:text-outline-variant" />
              <button class="bg-secondary text-[#110d0a] px-4 rounded-lg font-tactical font-bold text-xs active:scale-95 transition-all shadow-[0_0_15px_rgba(189,244,255,0.3)]">
                UNISCITI
              </button>
            </div>
          </div>

          <div class="flex items-center gap-3 opacity-50">
            <div class="h-px bg-outline-variant flex-1"></div>
            <span class="font-tactical text-[9px] text-on-surface-variant uppercase tracking-widest">Incontro Locale</span>
            <div class="h-px bg-outline-variant flex-1"></div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <button class="flex flex-col items-center justify-center gap-2 py-5 bg-surface-container-low border border-outline-variant hover:border-secondary/80 rounded-xl text-on-surface hover:text-secondary active:scale-95 transition-all group">
              <span class="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">qr_code_2</span>
              <span class="font-tactical text-[10px] font-bold tracking-wider">MOSTRA QR</span>
            </button>
            <button class="flex flex-col items-center justify-center gap-2 py-5 bg-surface-container-low border border-outline-variant hover:border-secondary/80 rounded-xl text-on-surface hover:text-secondary active:scale-95 transition-all group">
              <span class="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">qr_code_scanner</span>
              <span class="font-tactical text-[10px] font-bold tracking-wider">SCANSIONA QR</span>
            </button>
          </div>
        </div>
      </div>
    `;
    return el;
  }

  function attachLobbyListeners() {
    container.querySelector('#tabIaBtn').addEventListener('click', () => { lobbyTab = 'ia'; updateUI(); });
    container.querySelector('#tabPvpBtn').addEventListener('click', () => { lobbyTab = 'pvp'; updateUI(); });

    if (lobbyTab === 'ia') {
      container.querySelectorAll('.diff-card').forEach(card => {
        card.addEventListener('click', () => {
          botDifficulty = card.dataset.diff;
          updateUI();
        });
      });

      container.querySelector('#startBotBtn').addEventListener('click', () => {
        initMatchState();
        viewState = 'loading';
        updateUI();
      });
    }
  }

  // ==========================================
  // 2. LOGICA PARTITA (DECK E PESCA)
  // ==========================================
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function drawCard(targetObj, amount = 1) {
    for (let i = 0; i < amount; i++) {
      if (targetObj.deck.length > 0 && targetObj.hand.length < 5) {
        const card = targetObj.deck.pop();
        // Aggiungiamo currentDef vitale per il combattimento
        targetObj.hand.push({ ...card, currentDef: card.defense }); 
      }
    }
  }

  function initMatchState() {
    const FULL_CARD_DB = gameState.databases.cards || [];
    if(FULL_CARD_DB.length === 0) return; // Se il DB è vuoto, non crascia
    
    gameState.turn = 1;
    gameState.player.maxMana = 1;
    gameState.player.mana = 1;
    gameState.player.hp = 30;
    gameState.player.board = [null, null, null, null, null];
    gameState.player.hand = [];
    
    // Generazione Mazzo Provvisorio (15 Carte casuali dal DB)
    gameState.player.deck = shuffleArray([...FULL_CARD_DB, ...FULL_CARD_DB]).slice(0, 15);
    drawCard(gameState.player, 4); // Mano Iniziale

    gameState.opponent.isBot = true;
    gameState.opponent.name = `Guerriero d'Ombra`;
    gameState.opponent.faction = 'Medioevo';
    gameState.opponent.hp = 30;
    gameState.opponent.maxMana = 1;
    gameState.opponent.mana = 1;
    gameState.opponent.board = [null, null, null, null, null];
    gameState.opponent.hand = [];
    gameState.opponent.deck = shuffleArray([...FULL_CARD_DB]).slice(0, 15);
    drawCard(gameState.opponent, 4);

    // Incrementa partita giocata nelle stats
    gameState.player.stats.matches++;
  }

  function renderLoading() {
    const el = document.createElement('div');
    el.className = 'flex flex-col items-center justify-center w-full h-full bg-surface-container-lowest p-6 text-center z-50 absolute inset-0';
    el.innerHTML = `
      <div class="relative flex justify-center items-center mb-8">
        <span class="material-symbols-outlined text-6xl text-primary animate-spin" style="animation-duration: 3s;">settings_input_component</span>
        <span class="material-symbols-outlined text-4xl text-error absolute animate-pulse">swords</span>
      </div>
      <h2 class="font-display font-bold text-xl text-on-surface mb-2 tracking-widest">EVOCAZIONE IN CORSO</h2>
      <div class="w-full max-w-xs bg-surface-container-high h-1.5 rounded-full mt-8 overflow-hidden">
        <div class="bg-primary h-full rounded-full transition-all duration-1000 w-0 shadow-[0_0_10px_rgba(242,202,80,0.8)]" id="loadingBar"></div>
      </div>
    `;

    setTimeout(() => { const bar = el.querySelector('#loadingBar'); if(bar) bar.style.width = '100%'; }, 100);
    setTimeout(() => { viewState = 'battle'; updateUI(); }, 1500);
    return el;
  }

  // ==========================================
  // 3. CAMPO DI BATTAGLIA
  // ==========================================
  function renderBattleBoard() {
    const p = gameState.player;
    const o = gameState.opponent;
    const el = document.createElement('div');
    el.className = 'flex flex-col w-full h-full bg-surface relative';

    el.innerHTML = `
      <!-- Header Battaglia Minimale (Senza Navbar) -->
      <div class="flex justify-between items-center px-3 py-2 bg-surface-container-lowest border-b border-outline-variant/30">
        <button id="surrenderBtn" class="font-tactical text-[9px] text-outline hover:text-error border border-outline-variant px-2 py-1 rounded">RITIRATA</button>
        <span class="font-display text-primary text-xs tracking-widest uppercase">Arena</span>
        <div class="w-10"></div> <!-- Placeholder per bilanciare -->
      </div>

      <!-- ZONA AVVERSARIO -->
      <section class="relative px-3 pt-2 pb-3 bg-gradient-to-b from-surface-container-lowest to-surface-container-low shadow-md border-b border-outline-variant/30">
        <div class="flex items-center justify-between gap-2 mb-2">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 rounded-full bg-surface-container-highest shadow-inner p-0.5 relative border border-error/50">
              <div class="absolute -bottom-1 -right-1 bg-error text-on-error font-tactical text-[9px] px-1 rounded shadow">IA</div>
              <img class="w-full h-full rounded-full object-cover" src="https://image.pollinations.ai/prompt/dark%20fantasy%20shadow%20knight%20portrait?width=100&height=100&nologo=true" />
            </div>
            <div class="flex flex-col">
              <span class="font-display font-bold text-sm text-on-surface drop-shadow">${o.name}</span>
              <span class="font-tactical text-[9px] text-on-surface-variant">Carte nel Deck: <span class="text-error">${o.deck.length}</span></span>
            </div>
          </div>
          
          <button id="enemyHeroTarget" class="flex items-center gap-1.5 bg-error-container/20 border border-error/50 px-3 py-1.5 rounded-lg shadow cursor-crosshair hover:bg-error-container/40 transition-colors">
            <span class="material-symbols-outlined text-error text-[16px]" style="font-variation-settings: 'FILL' 1;">favorite</span>
            <span class="font-tactical text-base text-error font-bold">${o.hp}</span>
          </button>
        </div>

        <div class="grid grid-cols-5 gap-1.5 pt-1" id="opponentBoard">
          ${o.board.map((card, idx) => renderBoardSlot(card, idx, true)).join('')}
        </div>
      </section>

      <!-- LOG E TURNO -->
      <div class="relative my-2 px-3 flex flex-col gap-1 z-10 shrink-0">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 bg-surface-container-highest/80 px-3 py-0.5 rounded-full shadow border border-primary/20">
            <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span class="font-display text-[10px] text-primary font-bold tracking-widest uppercase">Turno ${gameState.turn}</span>
          </div>
          <div class="font-tactical text-[10px] text-secondary flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">diamond</span> MANA NEMICO: ${o.mana}
          </div>
        </div>
        <div id="battleLog" class="bg-surface-container-lowest border border-outline-variant/50 px-2 py-1.5 rounded shadow-inner flex items-center gap-1.5 text-[10px] font-body text-on-surface-variant truncate">
          <span class="material-symbols-outlined text-tertiary text-[14px]">info</span>
          <span>Il combattimento ha inizio.</span>
        </div>
      </div>

      <!-- ZONA GIOCATORE -->
      <section class="relative px-3 flex flex-col gap-2 flex-1 pb-4">
        <div class="grid grid-cols-5 gap-1.5" id="playerBoard">
          ${p.board.map((card, idx) => renderBoardSlot(card, idx, false)).join('')}
        </div>

        <div class="flex items-center justify-between bg-surface-container-lowest border border-primary/30 px-3 py-2 rounded-xl shadow-md mt-auto mb-1">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-2xl drop-shadow-[0_0_8px_rgba(242,202,80,0.5)]" style="font-variation-settings: 'FILL' 1;">favorite</span>
            <span class="font-tactical text-xl text-on-surface font-bold leading-none">${p.hp}</span>
          </div>
          <div class="flex flex-col items-end gap-1">
            <div class="flex gap-1">${renderManaCrystals(p.mana, p.maxMana)}</div>
            <span class="font-tactical text-[9px] text-secondary font-bold tracking-wider">${p.mana} / ${p.maxMana} MANA</span>
          </div>
        </div>

        <div class="relative flex items-end justify-between gap-2 h-24">
          <!-- Area Deck e Hand -->
          <div class="flex items-end -space-x-4 flex-1 overflow-visible pb-1 px-2 relative" id="playerHand">
            <!-- Icona Deck per indicare che si sta pescando -->
            <div class="absolute -left-2 bottom-2 w-10 aspect-[5/7] bg-surface-container-highest border border-outline-variant rounded flex items-center justify-center opacity-50">
               <span class="font-tactical text-[8px]">${p.deck.length}</span>
            </div>
            <div class="ml-8 flex items-end -space-x-4">
               ${p.hand.map((card, idx) => renderHandCard(card, idx, p.mana)).join('')}
            </div>
          </div>
          <button id="endTurnBtn" class="shrink-0 flex flex-col items-center justify-center w-20 h-[72px] bg-primary text-[#110d0a] hover:bg-primary-fixed-dim rounded-xl shadow-[0_4px_16px_rgba(242,202,80,0.4)] active:scale-95 transition-all border border-[#fff]/20">
            <span class="material-symbols-outlined text-lg">hourglass_top</span>
            <span class="font-display text-[9px] font-bold tracking-wider text-center mt-1">PASSA</span>
          </button>
        </div>
      </section>
    `;

    if (gameState.tutorial && gameState.tutorial.active) {
      el.appendChild(renderTutorialOverlay());
    }

    return el;
  }

  function renderManaCrystals(current, max) {
    let html = '';
    for (let i = 0; i < max; i++) html += `<span class="w-2.5 h-2.5 rounded-full ${i < current ? 'bg-secondary shadow-[0_0_6px_rgba(189,244,255,0.8)]' : 'bg-surface-container-highest border border-outline-variant'}"></span>`;
    return html;
  }

  function renderBoardSlot(card, idx, isOpponent) {
    const isSelected = selectedFriendlySlot === idx && !isOpponent;
    const selectionRing = isSelected ? 'ring-2 ring-primary shadow-[0_0_15px_rgba(242,202,80,0.6)] -translate-y-2' : '';
    
    if (!card) {
      const hoverStyle = (!isOpponent && selectedHandIndex !== null) ? 'hover:bg-primary/20 border-primary/50 shadow-[inset_0_0_10px_rgba(242,202,80,0.2)]' : 'border-outline-variant/30';
      return `<div class="relative flex items-center justify-center rounded bg-surface-container-lowest/50 aspect-[5/7] shadow-inner border border-dashed ${hoverStyle} cursor-pointer" ${!isOpponent ? `data-action="deploy" data-slot="${idx}"` : ''}><span class="material-symbols-outlined text-outline-variant text-sm opacity-30">add</span></div>`;
    }

    const clickAction = !isOpponent ? `data-action="selectFriendly" data-slot="${idx}"` : `data-action="attackTarget" data-slot="${idx}"`;
    const targetCursor = isOpponent && selectedFriendlySlot !== null ? 'cursor-crosshair hover:border-error hover:shadow-[0_0_15px_rgba(248,113,113,0.5)]' : 'cursor-pointer';

    return `
      <div class="relative flex flex-col bg-surface-container-high rounded p-1 shadow-md aspect-[5/7] transition-all border border-outline-variant/50 ${selectionRing} ${targetCursor}" ${clickAction}>
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
      <div class="relative w-16 aspect-[5/7] bg-surface-container-high rounded p-1 transition-transform cursor-pointer hover:z-30 border border-outline-variant/50 ${playClasses} ${selectionClass}" data-action="selectHand" data-index="${idx}">
        <div class="absolute -top-1 -right-1 z-20 w-4 h-4 rounded-full ${canPlay ? 'bg-secondary text-[#110d0a] shadow-md' : 'bg-surface-container-highest text-outline border border-outline-variant'} flex items-center justify-center font-tactical text-[9px] font-bold">${card.cost}</div>
        <div class="w-full h-full rounded overflow-hidden relative">
          <img class="w-full h-full object-cover" src="${card.art}" />
          <div class="absolute bottom-0 inset-x-0 bg-surface-container-lowest/90 px-0.5 pt-2 pb-0.5 text-center bg-gradient-to-t from-surface-container-lowest to-transparent">
            <span class="font-display font-bold text-[6px] text-on-surface truncate block">${card.name}</span>
          </div>
        </div>
      </div>
    `;
  }

  function renderTutorialOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'absolute inset-0 z-50 bg-black/70 backdrop-blur-[2px] flex flex-col justify-end p-4';
    
    const steps = [
      { title: "BENVENUTO NELL'ARENA", text: "Ogni turno pescherai una carta e guadagnerai +1 Mana massimo. Il mana è essenziale per evocare guerrieri!" },
      { title: "SCHIERAMENTO", text: "Tocca una carta illuminata dalla mano, poi seleziona uno slot vuoto sul campo. Posiziona le tue difese." },
      { title: "ATTACCO SPIETATO", text: "Seleziona un tuo guerriero schierato e tocca un nemico. Se l'attacco supera la difesa, il danno in eccesso colpirà direttamente i Punti Vita del Capitano!" }
    ];

    const current = steps[gameState.tutorial.step - 1];

    overlay.innerHTML = `
      <div class="absolute top-16 right-4">
        <button id="skipTutorialBtn" class="bg-surface-container-highest/80 backdrop-blur border border-outline-variant px-3 py-1.5 rounded-full font-tactical text-[9px] font-bold text-outline hover:text-on-surface transition-colors flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">skip_next</span> SALTA
        </button>
      </div>
      <div class="bg-surface-container-low border-2 border-primary/50 rounded-xl p-4 shadow-[0_0_40px_rgba(0,0,0,0.9)] flex gap-3 relative mb-16 mx-auto w-full max-w-md">
        <div class="absolute -top-10 -left-2 w-20 h-20 rounded-full border-2 border-primary overflow-hidden shadow-lg bg-surface-container shrink-0">
          <img src="https://image.pollinations.ai/prompt/dark%20fantasy%20wise%20old%20master%20wizard%20portrait?width=150&height=150&nologo=true" class="w-full h-full object-cover"/>
        </div>
        <div class="ml-16 flex flex-col w-full">
          <span class="font-tactical text-[10px] text-primary uppercase font-bold">Maestro d'Armi</span>
          <h3 class="font-display font-bold text-sm text-on-surface mt-1">${current.title}</h3>
          <p class="font-body text-xs text-on-surface-variant leading-relaxed mt-1">${current.text}</p>
          <div class="flex justify-end mt-3">
            <button id="nextTutorialBtn" class="bg-primary hover:bg-primary-fixed-dim text-[#110d0a] font-tactical font-bold text-xs px-5 py-2 rounded shadow-lg active:scale-95 transition-all">
              ${gameState.tutorial.step === steps.length ? 'INIZIA BATTAGLIA' : 'AVANTI'}
            </button>
          </div>
        </div>
      </div>
    `;

    overlay.querySelector('#skipTutorialBtn').onclick = () => { gameState.tutorial.active = false; updateUI(); };
    overlay.querySelector('#nextTutorialBtn').onclick = () => {
      if (gameState.tutorial.step < steps.length) gameState.tutorial.step++;
      else gameState.tutorial.active = false;
      updateUI();
    };
    return overlay;
  }

  function attachBattleListeners() {
    container.querySelector('#surrenderBtn').addEventListener('click', () => {
      matchResult = { won: false, rewardSilver: 0, rewardGems: 0 };
      endMatch();
    });

    container.querySelector('#endTurnBtn').addEventListener('click', executeBotTurn);
    
    container.querySelector('#enemyHeroTarget').addEventListener('click', () => {
      if (selectedFriendlySlot !== null && (!gameState.tutorial || !gameState.tutorial.active)) {
        resolveAttack(selectedFriendlySlot, 'hero');
      }
    });

    container.addEventListener('click', (e) => {
      if (gameState.tutorial && gameState.tutorial.active) return;
      const target = e.target.closest('[data-action]');
      if (!target) return;
      const action = target.dataset.action;

      if (action === 'selectHand') {
        const idx = parseInt(target.dataset.index);
        const card = gameState.player.hand[idx];
        if (gameState.player.mana >= card.cost) {
          selectedHandIndex = selectedHandIndex === idx ? null : idx;
          selectedFriendlySlot = null;
          updateUI();
        } else logMsg("Mana insufficiente!", true);
      } 
      else if (action === 'deploy' && selectedHandIndex !== null) {
        const slotIdx = parseInt(target.dataset.slot);
        const card = gameState.player.hand[selectedHandIndex];
        gameState.player.mana -= card.cost;
        gameState.player.board[slotIdx] = card;
        gameState.player.hand.splice(selectedHandIndex, 1);
        selectedHandIndex = null;
        logMsg(`Schierato: ${card.name}.`);
        updateUI();
      } 
      else if (action === 'selectFriendly') {
        const idx = parseInt(target.dataset.slot);
        selectedFriendlySlot = selectedFriendlySlot === idx ? null : idx;
        selectedHandIndex = null;
        updateUI();
      }
      else if (action === 'attackTarget' && selectedFriendlySlot !== null) {
        resolveAttack(selectedFriendlySlot, parseInt(target.dataset.slot));
      }
    });
  }

  function resolveAttack(attackerSlotIdx, defenderTarget) {
    const attacker = gameState.player.board[attackerSlotIdx];
    
    if (defenderTarget === 'hero') {
      gameState.opponent.hp -= attacker.attack;
      logMsg(`${attacker.name} colpisce l'Eroe: ${attacker.attack} danni!`);
    } else {
      const defender = gameState.opponent.board[defenderTarget];
      let damageToDef = attacker.attack;
      let excessDamage = damageToDef - defender.currentDef;

      if (damageToDef >= defender.currentDef) {
        logMsg(`${attacker.name} distrugge ${defender.name}! ${excessDamage > 0 ? `(${excessDamage} danni extra)` : ''}`);
        gameState.opponent.board[defenderTarget] = null;
        if (excessDamage > 0) gameState.opponent.hp -= excessDamage;
      } else {
        defender.currentDef -= damageToDef;
        logMsg(`${attacker.name} attacca ${defender.name}. Difesa: ${defender.currentDef}.`);
      }
    }

    selectedFriendlySlot = null;
    if (gameState.opponent.hp <= 0) {
      gameState.opponent.hp = 0;
      matchResult = { won: true, rewardSilver: botDifficulty === 'Boss' ? 50 : 20, rewardGems: botDifficulty === 'Boss' ? 5 : 0 };
      endMatch();
      return;
    }
    updateUI();
  }

  function executeBotTurn() {
    logMsg("Il nemico elabora una strategia...");
    selectedHandIndex = null;
    selectedFriendlySlot = null;
    updateUI();

    setTimeout(() => {
      // Inizio Turno: Pesca e ripristino Mana
      gameState.turn++;
      gameState.opponent.maxMana = Math.min(10, gameState.opponent.maxMana + 1);
      gameState.opponent.mana = gameState.opponent.maxMana;
      drawCard(gameState.opponent, 1);
      
      gameState.player.maxMana = Math.min(10, gameState.player.maxMana + 1);
      gameState.player.mana = gameState.player.maxMana;
      drawCard(gameState.player, 1);

      // Semplice IA Attacco
      const botCardIdx = gameState.opponent.board.findIndex(c => c !== null);
      const playerTargetIdx = gameState.player.board.findIndex(c => c !== null);
      
      if (botCardIdx !== -1) {
        const botCard = gameState.opponent.board[botCardIdx];
        if (playerTargetIdx !== -1) {
          const pCard = gameState.player.board[playerTargetIdx];
          if (botCard.attack >= pCard.currentDef) {
            gameState.player.board[playerTargetIdx] = null;
            logMsg(`${botCard.name} nemico distrugge ${pCard.name}!`, true);
          } else {
            pCard.currentDef -= botCard.attack;
            logMsg(`${botCard.name} indebolisce ${pCard.name}.`, true);
          }
        } else {
          gameState.player.hp -= botCard.attack;
          logMsg(`Subisci ${botCard.attack} danni diretti!`, true);
        }
      }

      // Semplice IA Schieramento
      if (gameState.opponent.hand.length > 0) {
        const playableCardIdx = gameState.opponent.hand.findIndex(c => c.cost <= gameState.opponent.mana);
        const emptySlotIdx = gameState.opponent.board.findIndex(c => c === null);
        if (playableCardIdx !== -1 && emptySlotIdx !== -1) {
          const card = gameState.opponent.hand[playableCardIdx];
          gameState.opponent.mana -= card.cost;
          gameState.opponent.board[emptySlotIdx] = card;
          gameState.opponent.hand.splice(playableCardIdx, 1);
          logMsg(`Il Bot schiera una nuova minaccia.`);
        }
      }

      if (gameState.player.hp <= 0) {
        gameState.player.hp = 0;
        matchResult = { won: false, rewardSilver: 5, rewardGems: 0 }; // Premio consolazione
        endMatch();
        return;
      }

      updateUI();
    }, 1500);
  }

  function logMsg(msg, isError = false) {
    const logEl = document.getElementById('battleLog');
    if (!logEl) return;
    const color = isError ? 'text-error' : 'text-primary';
    logEl.innerHTML = `<span class="${color}">${msg}</span>`;
  }

  // ==========================================
  // 4. SCHERMATA RICOMPENSE POST-PARTITA
  // ==========================================
  function endMatch() {
    if (matchResult.won) {
      gameState.player.stats.wins++;
      gameState.currencies.silver += matchResult.rewardSilver;
      gameState.currencies.gems += matchResult.rewardGems;
    } else {
      gameState.player.stats.losses++;
      gameState.currencies.silver += matchResult.rewardSilver;
    }
    
    // Aggiorna contatori in alto globalmente
    const silverEl = document.getElementById('silverCount');
    const gemsEl = document.getElementById('gemsCount');
    if(silverEl) silverEl.textContent = gameState.currencies.silver;
    if(gemsEl) gemsEl.textContent = gameState.currencies.gems;

    viewState = 'reward';
    updateUI();
  }

  function renderRewardScreen() {
    const el = document.createElement('div');
    el.className = 'flex flex-col items-center justify-center w-full h-full bg-surface-container-lowest p-6 text-center z-50 absolute inset-0';
    
    const titleColor = matchResult.won ? 'text-primary' : 'text-error';
    const titleText = matchResult.won ? 'VITTORIA' : 'SCONFITTA';
    const icon = matchResult.won ? 'emoji_events' : 'skull';

    el.innerHTML = `
      <div class="relative flex justify-center items-center mb-6">
        <div class="absolute w-40 h-40 ${matchResult.won ? 'bg-primary/20' : 'bg-error/20'} rounded-full blur-3xl"></div>
        <span class="material-symbols-outlined text-7xl ${titleColor} relative z-10 drop-shadow-lg">${icon}</span>
      </div>
      
      <h2 class="font-display font-bold text-4xl ${titleColor} mb-2 tracking-widest">${titleText}</h2>
      <p class="font-tactical text-xs text-on-surface-variant max-w-xs mx-auto mb-8">
        ${matchResult.won ? 'Il tuo nome riecheggia nei corridoi del Sanctum. Ecco il tuo bottino di guerra.' : 'Le tue difese sono crollate. Riorganizza il mazzo e riprova.'}
      </p>
      
      <div class="flex gap-4 justify-center mb-10">
        <div class="bg-surface-container-high border border-outline-variant px-6 py-4 rounded-xl flex flex-col items-center shadow-lg">
          <span class="material-symbols-outlined text-primary text-3xl mb-1">toll</span>
          <span class="font-tactical text-2xl font-bold text-on-surface">+${matchResult.rewardSilver}</span>
          <span class="font-tactical text-[8px] uppercase text-outline">Argento</span>
        </div>
        ${matchResult.rewardGems > 0 ? `
        <div class="bg-surface-container-high border border-secondary/50 px-6 py-4 rounded-xl flex flex-col items-center shadow-[0_0_15px_rgba(189,244,255,0.2)]">
          <span class="material-symbols-outlined text-secondary text-3xl mb-1">diamond</span>
          <span class="font-tactical text-2xl font-bold text-on-surface">+${matchResult.rewardGems}</span>
          <span class="font-tactical text-[8px] uppercase text-outline">Gemme</span>
        </div>` : ''}
      </div>

      <button id="returnLobbyBtn" class="w-full max-w-xs py-4 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-on-surface font-tactical font-bold rounded-xl active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2">
        <span class="material-symbols-outlined">meeting_room</span> TORNA AL SANCTUM
      </button>
    `;

    el.querySelector('#returnLobbyBtn').onclick = () => {
      viewState = 'lobby';
      updateUI();
    };

    return el;
  }

  updateUI();
  return container;
}