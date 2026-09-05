import { gameState } from '../state.js';

export function renderArena() {
  const container = document.createElement('div');
  container.className = 'flex flex-col w-full h-full select-none overflow-hidden relative bg-surface';

  let viewState = 'lobby'; 
  let botDifficulty = 'Facile';
  let lobbyTab = 'ia'; 
  
  // Stato interattivo del combattimento
  let currentPhase = 'mulligan'; // mulligan -> play -> attack -> end
  let selectedHandIndex = null;
  let selectedFriendlySlot = null;
  let matchResult = { won: false, rewardSilver: 0, rewardGems: 0 };

  // Helper per Fullscreen
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
  // 1. LOBBY
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
          <button id="tabIaBtn" class="flex-1 py-2.5 rounded-lg font-tactical text-xs font-bold transition-all flex items-center justify-center gap-2 ${lobbyTab === 'ia' ? 'bg-primary text-[#110d0a] shadow-lg' : 'text-on-surface-variant hover:text-on-surface'}"><span class="material-symbols-outlined text-[16px]">smart_toy</span> IA & ALLENAMENTO</button>
          <button id="tabPvpBtn" class="flex-1 py-2.5 rounded-lg font-tactical text-xs font-bold transition-all flex items-center justify-center gap-2 ${lobbyTab === 'pvp' ? 'bg-secondary text-[#110d0a] shadow-lg' : 'text-on-surface-variant hover:text-on-surface'}"><span class="material-symbols-outlined text-[16px]">group</span> DUELLO PVP</button>
        </div>
        <!-- TAB IA -->
        <div id="contentIa" class="flex flex-col gap-4 ${lobbyTab === 'ia' ? '' : 'hidden'}">
          <div class="grid grid-cols-2 gap-3">
            <div class="diff-card p-3 rounded-xl border cursor-pointer transition-all ${botDifficulty === 'Facile' ? 'bg-surface-container-high border-[#4ade80] shadow-[0_0_15px_rgba(74,222,128,0.2)] scale-105' : 'bg-surface-container-lowest border-outline-variant/50 hover:border-outline-variant'}" data-diff="Facile">
              <div class="flex items-center gap-1 mb-1"><span class="material-symbols-outlined text-[#4ade80] text-[16px]">eco</span><span class="font-display font-bold text-xs text-[#4ade80]">FACILE</span></div>
            </div>
            <div class="diff-card p-3 rounded-xl border cursor-pointer transition-all ${botDifficulty === 'Medio' ? 'bg-surface-container-high border-[#60a5fa] shadow-[0_0_15px_rgba(96,165,250,0.2)] scale-105' : 'bg-surface-container-lowest border-outline-variant/50 hover:border-outline-variant'}" data-diff="Medio">
              <div class="flex items-center gap-1 mb-1"><span class="material-symbols-outlined text-[#60a5fa] text-[16px]">shield</span><span class="font-display font-bold text-xs text-[#60a5fa]">MEDIO</span></div>
            </div>
            <div class="diff-card p-3 rounded-xl border cursor-pointer transition-all ${botDifficulty === 'Difficile' ? 'bg-surface-container-high border-[#f87171] shadow-[0_0_15px_rgba(248,113,113,0.2)] scale-105' : 'bg-surface-container-lowest border-outline-variant/50 hover:border-outline-variant'}" data-diff="Difficile">
              <div class="flex items-center gap-1 mb-1"><span class="material-symbols-outlined text-[#f87171] text-[16px]">local_fire_department</span><span class="font-display font-bold text-xs text-[#f87171]">DIFFICILE</span></div>
            </div>
            <div class="diff-card p-3 rounded-xl border cursor-pointer transition-all ${botDifficulty === 'Boss' ? 'bg-surface-container-high border-primary shadow-[0_0_20px_rgba(242,202,80,0.3)] scale-105' : 'bg-surface-container-lowest border-outline-variant/50 hover:border-outline-variant'}" data-diff="Boss">
              <div class="flex items-center gap-1 mb-1"><span class="material-symbols-outlined text-primary text-[16px]">stars</span><span class="font-display font-bold text-xs text-primary">BOSS</span></div>
            </div>
          </div>
          <button id="startBotBtn" class="mt-4 w-full py-4 bg-primary hover:bg-primary-fixed-dim text-[#110d0a] font-tactical text-sm font-bold rounded-xl active:scale-95 transition-all flex justify-center gap-2"><span class="material-symbols-outlined text-[20px]">swords</span> ENTRA NELL'ARENA</button>
        </div>
      </div>
    `;
    return el;
  }

  function attachLobbyListeners() {
    container.querySelector('#tabIaBtn').addEventListener('click', () => { lobbyTab = 'ia'; updateUI(); });
    container.querySelector('#tabPvpBtn').addEventListener('click', () => { lobbyTab = 'pvp'; updateUI(); });
    if (lobbyTab === 'ia') {
      container.querySelectorAll('.diff-card').forEach(card => card.addEventListener('click', () => { botDifficulty = card.dataset.diff; updateUI(); }));
      container.querySelector('#startBotBtn').addEventListener('click', () => { initMatchState(); viewState = 'loading'; updateUI(); });
    }
  }

  // ==========================================
  // 2. MOTORE DELLA PARTITA (REGOLE)
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
      if (targetObj.deck.length > 0 && targetObj.hand.length < 10) { // Max 10 in hand
        const card = targetObj.deck.pop();
        // Aggiungiamo currentDef e canAttack (false all'ingresso in campo)
        targetObj.hand.push({ ...card, currentDef: card.defense, canAttack: false }); 
      }
    }
  }

  function initMatchState() {
    const FULL_CARD_DB = gameState.databases.cards || [];
    if(FULL_CARD_DB.length === 0) return;
    
    // Sorteggio
    const isPlayerFirst = Math.random() < 0.5;
    
    gameState.turn = 1;
    gameState.activePlayer = isPlayerFirst ? 'player' : 'opponent';

    // Player Init
    gameState.player.maxMana = isPlayerFirst ? 1 : 0;
    gameState.player.mana = gameState.player.maxMana;
    gameState.player.hp = 30;
    gameState.player.board = [null, null, null, null, null];
    gameState.player.fieldCard = null; // CARTA CAMPO
    gameState.player.hand = [];
    gameState.player.deck = shuffleArray([...FULL_CARD_DB, ...FULL_CARD_DB]).slice(0, 30);
    
    // Opponent Init
    gameState.opponent.isBot = true;
    gameState.opponent.name = `Guerriero IA`;
    gameState.opponent.hp = 30;
    gameState.opponent.maxMana = !isPlayerFirst ? 1 : 0;
    gameState.opponent.mana = gameState.opponent.maxMana;
    gameState.opponent.board = [null, null, null, null, null];
    gameState.opponent.fieldCard = null; // CARTA CAMPO
    gameState.opponent.hand = [];
    gameState.opponent.deck = shuffleArray([...FULL_CARD_DB]).slice(0, 30);

    // Pescata iniziale (4 carte ciascuno)
    drawCard(gameState.player, 4);
    drawCard(gameState.opponent, 4);

    currentPhase = 'mulligan';
    gameState.player.stats.matches++;
  }

  function renderLoading() {
    const el = document.createElement('div');
    el.className = 'flex flex-col items-center justify-center w-full h-full bg-surface-container-lowest z-50 absolute inset-0 text-center';
    el.innerHTML = `<h2 class="font-display font-bold text-xl text-primary animate-pulse">MISCHIAMENTO MAZZI...</h2>`;
    setTimeout(() => { viewState = 'battle'; updateUI(); }, 1000);
    return el;
  }

  // ==========================================
  // 3. RENDER ARENA
  // ==========================================
  function renderBattleBoard() {
    const p = gameState.player;
    const o = gameState.opponent;
    const el = document.createElement('div');
    el.className = 'flex flex-col w-full h-full bg-surface relative';

    // Gestione visuale del Mulligan iniziale
    if (currentPhase === 'mulligan') {
      el.innerHTML = `
        <div class="absolute inset-0 bg-black/90 z-[60] flex flex-col items-center justify-center p-4">
          <h2 class="font-display font-bold text-primary text-2xl mb-2">MANO INIZIALE</h2>
          <p class="font-body text-xs text-on-surface-variant mb-6 text-center max-w-sm">Puoi scartare questa mano e pescare 4 nuove carte una sola volta (Mulligan).</p>
          <div class="flex gap-2 mb-8">
            ${p.hand.map(c => `<img src="${c.art}" class="w-16 rounded border border-outline-variant" />`).join('')}
          </div>
          <div class="flex gap-4">
            <button id="btnMulligan" class="px-4 py-2 bg-surface-container border border-error text-error font-tactical rounded shadow">SCARTA E RIPESCA</button>
            <button id="btnKeepHand" class="px-4 py-2 bg-primary text-[#110d0a] font-tactical rounded shadow font-bold">TIENI QUESTA MANO</button>
          </div>
        </div>
      `;
      // Listener temporanei per questa vista
      setTimeout(() => {
        el.querySelector('#btnMulligan').onclick = () => {
          // Rimette nel mazzo, mescola, pesca 4
          p.deck = shuffleArray([...p.deck, ...p.hand]);
          p.hand = [];
          drawCard(p, 4);
          startTurn();
        };
        el.querySelector('#btnKeepHand').onclick = () => startTurn();
      }, 0);
      return el;
    }

    el.innerHTML = `
      <!-- ZONA AVVERSARIO -->
      <section class="relative px-2 pt-2 pb-2 bg-gradient-to-b from-surface-container-lowest to-surface-container-low border-b border-outline-variant/30 flex flex-col">
        <div class="flex items-center justify-between mb-2">
          <!-- Info IA -->
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 rounded-full border border-error overflow-hidden"><img src="https://image.pollinations.ai/prompt/dark%20fantasy%20shadow%20knight?width=100&height=100" /></div>
            <div class="flex flex-col">
              <span class="font-display font-bold text-sm text-on-surface">${o.name}</span>
              <span class="font-tactical text-[9px] text-on-surface-variant">Carte Deck: ${o.deck.length} | Mano: ${o.hand.length}</span>
            </div>
          </div>
          
          <!-- CARTA CAMPO AVVERSARIO -->
          <div class="flex flex-col items-center justify-center w-12 h-16 border border-dashed border-error/50 rounded bg-error/5 shrink-0 opacity-80" title="CARTA CAMPO">
            ${o.fieldCard ? `<img src="${o.fieldCard.art}" class="w-full h-full object-cover rounded"/>` : `<span class="material-symbols-outlined text-error/50 text-[10px]">landscape</span>`}
          </div>

          <!-- TARGET EROE (Clickabile) -->
          <button id="enemyHeroTarget" class="flex flex-col items-center justify-center w-14 h-14 bg-error-container/20 border border-error/50 rounded-full shadow cursor-crosshair hover:bg-error-container/40">
            <span class="font-tactical text-lg text-error font-bold">${o.hp}</span>
            <span class="material-symbols-outlined text-error text-[10px]" style="font-variation-settings: 'FILL' 1;">favorite</span>
          </button>
        </div>

        <div class="grid grid-cols-5 gap-1.5" id="opponentBoard">
          ${o.board.map((card, idx) => renderBoardSlot(card, idx, true)).join('')}
        </div>
      </section>

      <!-- LOG TURNO -->
      <div class="bg-surface-container-highest/50 px-2 py-1 flex items-center justify-between shadow-inner shrink-0 z-10 border-y border-outline-variant/20">
        <span class="font-display text-[9px] text-primary font-bold tracking-widest">TURNO ${gameState.turn} - ${gameState.activePlayer === 'player' ? 'Tuo Turno' : 'Turno Avversario'}</span>
        <div id="battleLog" class="text-[9px] text-on-surface-variant font-body italic truncate px-2">Combattimento iniziato...</div>
      </div>

      <!-- ZONA GIOCATORE -->
      <section class="relative px-2 pt-2 flex flex-col flex-1 pb-4">
        <div class="grid grid-cols-5 gap-1.5" id="playerBoard">
          ${p.board.map((card, idx) => renderBoardSlot(card, idx, false)).join('')}
        </div>

        <div class="flex items-center justify-between mt-auto mb-2 px-1">
          <!-- TARGET EROE PLAYER -->
          <div class="flex flex-col items-center justify-center w-14 h-14 bg-primary/10 border border-primary/50 rounded-full shadow">
            <span class="font-tactical text-lg text-primary font-bold">${p.hp}</span>
            <span class="material-symbols-outlined text-primary text-[10px]" style="font-variation-settings: 'FILL' 1;">favorite</span>
          </div>

          <!-- CARTA CAMPO PLAYER -->
          <div class="flex flex-col items-center justify-center w-12 h-16 border border-dashed border-primary/50 rounded bg-primary/5 shrink-0" data-action="deployField">
            ${p.fieldCard ? `<img src="${p.fieldCard.art}" class="w-full h-full object-cover rounded"/>` : `<span class="material-symbols-outlined text-primary/50 text-[10px]">landscape</span>`}
          </div>

          <!-- MANA PLAYER -->
          <div class="flex flex-col items-end">
            <div class="flex gap-0.5">${renderManaCrystals(p.mana, p.maxMana)}</div>
            <span class="font-tactical text-[9px] text-secondary font-bold">${p.mana} / ${p.maxMana} MANA</span>
          </div>
        </div>

        <!-- MANO E CONTROLLI -->
        <div class="relative flex items-end justify-between h-24">
          <div class="flex items-end flex-1 overflow-x-auto no-scrollbar relative" id="playerHand">
            <div class="absolute -left-1 bottom-2 w-10 aspect-[5/7] bg-surface-container-highest border border-outline-variant rounded flex items-center justify-center opacity-50 shrink-0">
               <span class="font-tactical text-[8px]">${p.deck.length}</span>
            </div>
            <div class="ml-10 flex items-end -space-x-4">
               ${p.hand.map((card, idx) => renderHandCard(card, idx, p.mana)).join('')}
            </div>
          </div>
          <button id="endTurnBtn" class="shrink-0 ml-2 flex flex-col items-center justify-center w-16 h-16 bg-primary text-[#110d0a] rounded-xl shadow-lg active:scale-95 ${gameState.activePlayer !== 'player' ? 'opacity-50 pointer-events-none' : ''}">
            <span class="material-symbols-outlined text-xl">hourglass_top</span>
            <span class="font-display text-[8px] font-bold">PASSA</span>
          </button>
        </div>
      </section>
    `;

    return el;
  }

  function renderManaCrystals(current, max) {
    let html = '';
    for (let i = 0; i < max; i++) html += `<div class="w-2 h-2 rounded-full ${i < current ? 'bg-secondary shadow-[0_0_6px_rgba(189,244,255,0.8)]' : 'bg-surface-container border border-outline-variant'}"></div>`;
    return html;
  }

  function renderBoardSlot(card, idx, isOpponent) {
    const isSelected = selectedFriendlySlot === idx && !isOpponent;
    const ring = isSelected ? 'ring-2 ring-primary -translate-y-2 shadow-lg' : '';
    const exhausted = (card && !card.canAttack && !isOpponent) ? 'grayscale opacity-70' : '';
    
    if (!card) {
      return `<div class="relative rounded bg-surface-container-lowest/50 aspect-[5/7] border border-dashed border-outline-variant/30 cursor-pointer ${!isOpponent ? `hover:bg-primary/20` : ''}" ${!isOpponent ? `data-action="deploy" data-slot="${idx}"` : ''}></div>`;
    }

    const clickAction = !isOpponent ? `data-action="selectFriendly" data-slot="${idx}"` : `data-action="attackTarget" data-slot="${idx}"`;
    const targetClass = (isOpponent && selectedFriendlySlot !== null) ? 'cursor-crosshair hover:ring-2 hover:ring-error' : 'cursor-pointer';

    return `
      <div class="relative flex flex-col bg-surface-container-high rounded p-1 shadow-md aspect-[5/7] transition-all border border-outline-variant/50 ${ring} ${exhausted} ${targetClass}" ${clickAction}>
        <div class="relative w-full h-[50%] rounded overflow-hidden">
          <img class="w-full h-full object-cover" src="${card.art}" />
        </div>
        <div class="flex flex-col justify-between flex-1 mt-0.5">
          <span class="font-display font-bold text-[6px] text-on-surface text-center leading-tight overflow-hidden">${card.name}</span>
          <div class="flex justify-between px-0.5 mt-auto bg-surface-container-lowest rounded">
            <span class="font-tactical text-[8px] text-error font-bold">${card.attack}</span>
            <span class="font-tactical text-[8px] text-secondary font-bold">${card.currentDef}</span>
          </div>
        </div>
      </div>
    `;
  }

  function renderHandCard(card, idx, currentMana) {
    const canPlay = currentMana >= card.cost;
    const isSelected = selectedHandIndex === idx;
    const style = canPlay ? 'hover:-translate-y-3 cursor-pointer' : 'opacity-60 cursor-not-allowed';
    const selected = isSelected ? '-translate-y-6 ring-2 ring-primary z-40' : '';

    return `
      <div class="relative w-14 aspect-[5/7] bg-surface-container rounded p-0.5 transition-all border border-outline-variant ${style} ${selected}" data-action="${canPlay ? 'selectHand' : ''}" data-index="${idx}">
        <div class="absolute -top-1 -right-1 z-10 w-4 h-4 rounded-full ${canPlay ? 'bg-secondary text-[#110d0a]' : 'bg-surface-container-highest text-outline'} flex items-center justify-center font-tactical text-[8px] font-bold">${card.cost}</div>
        <img class="w-full h-full object-cover rounded-sm" src="${card.art}" />
      </div>
    `;
  }

  // ==========================================
  // 4. LOGICA FLUSSO TURNO
  // ==========================================
  function startTurn() {
    currentPhase = 'play';
    const p = gameState.activePlayer === 'player' ? gameState.player : gameState.opponent;
    
    // 1. Rigenera e Aumenta Mana
    p.maxMana = Math.min(10, p.maxMana + 1);
    p.mana = p.maxMana;
    
    // 2. Risveglia Creature sul board
    p.board.forEach(c => { if(c) c.canAttack = true; });

    // 3. Pesca Carta (dal turno 2 in poi)
    if (gameState.turn > 1 || gameState.activePlayer === 'opponent') {
      drawCard(p, 1);
    }

    if (gameState.activePlayer === 'opponent') {
      executeBotTurn();
    } else {
      logMsg("È il tuo turno! Gioca carte o attacca.");
      updateUI();
    }
  }

  function endPlayerTurn() {
    gameState.activePlayer = 'opponent';
    startTurn();
  }

  function attachBattleListeners() {
    container.querySelector('#endTurnBtn').addEventListener('click', endPlayerTurn);
    
    container.querySelector('#enemyHeroTarget').addEventListener('click', () => {
      // Regola: Non puoi attaccare l'eroe se ci sono creature vive in campo (Semplificazione del Provocazione)
      const hasDefenders = gameState.opponent.board.some(c => c !== null);
      
      if (selectedFriendlySlot !== null) {
        if (hasDefenders) {
          logMsg("Devi prima distruggere le difese nemiche!", true);
        } else {
          resolveAttack(selectedFriendlySlot, 'hero');
        }
      }
    });

    container.addEventListener('click', (e) => {
      if (gameState.activePlayer !== 'player') return;

      const target = e.target.closest('[data-action]');
      if (!target) return;
      const action = target.dataset.action;

      if (action === 'selectHand') {
        const idx = parseInt(target.dataset.index);
        selectedHandIndex = selectedHandIndex === idx ? null : idx;
        selectedFriendlySlot = null;
        updateUI();
      } 
      else if (action === 'deployField') {
        if (selectedHandIndex !== null) {
          const card = gameState.player.hand[selectedHandIndex];
          if (card.desc && card.desc.includes("CARTA CAMPO")) {
            gameState.player.mana -= card.cost;
            gameState.player.fieldCard = card;
            gameState.player.hand.splice(selectedHandIndex, 1);
            selectedHandIndex = null;
            logMsg(`Campo mutato in: ${card.name}.`);
            updateUI();
          } else {
            logMsg("Questa non è una Carta Campo.", true);
          }
        }
      }
      else if (action === 'deploy') {
        if (selectedHandIndex !== null) {
          const slotIdx = parseInt(target.dataset.slot);
          const card = gameState.player.hand[selectedHandIndex];
          
          if (card.desc && card.desc.includes("CARTA CAMPO")) {
            logMsg("Le Carte Campo vanno nell'apposito slot a sinistra.", true);
            return;
          }

          gameState.player.mana -= card.cost;
          gameState.player.board[slotIdx] = card;
          gameState.player.hand.splice(selectedHandIndex, 1);
          selectedHandIndex = null;
          logMsg(`Evocato: ${card.name}.`);
          updateUI();
        }
      } 
      else if (action === 'selectFriendly') {
        const idx = parseInt(target.dataset.slot);
        const card = gameState.player.board[idx];
        if (card.canAttack) {
          selectedFriendlySlot = selectedFriendlySlot === idx ? null : idx;
          selectedHandIndex = null;
          updateUI();
        } else {
          logMsg("Questa creatura è esausta. Deve riposare.", true);
        }
      }
      else if (action === 'attackTarget' && selectedFriendlySlot !== null) {
        resolveAttack(selectedFriendlySlot, parseInt(target.dataset.slot));
      }
    });
  }

  // Risoluzione Combattimento con Trafittura
  function resolveAttack(attackerSlotIdx, defenderTarget) {
    const attacker = gameState.player.board[attackerSlotIdx];
    attacker.canAttack = false; // Si stanca dopo aver attaccato
    
    if (defenderTarget === 'hero') {
      gameState.opponent.hp -= attacker.attack;
      logMsg(`${attacker.name} trafigge l'IA: ${attacker.attack} danni!`);
    } else {
      const defender = gameState.opponent.board[defenderTarget];
      let damageToDef = attacker.attack;
      let excessDamage = damageToDef - defender.currentDef;

      if (damageToDef >= defender.currentDef) {
        logMsg(`${attacker.name} annienta ${defender.name}! ${excessDamage > 0 ? `(${excessDamage} danni collaterali all'IA)` : ''}`);
        gameState.opponent.board[defenderTarget] = null;
        if (excessDamage > 0) gameState.opponent.hp -= excessDamage;
      } else {
        defender.currentDef -= damageToDef;
        logMsg(`${attacker.name} colpisce. ${defender.name} regge a ${defender.currentDef} dif.`);
      }
    }

    selectedFriendlySlot = null;
    checkWinCondition();
  }

  function checkWinCondition() {
    if (gameState.opponent.hp <= 0) {
      gameState.opponent.hp = 0;
      matchResult = { won: true, rewardSilver: 20, rewardGems: botDifficulty === 'Boss' ? 5 : 0 };
      endMatch();
    } else if (gameState.player.hp <= 0) {
      gameState.player.hp = 0;
      matchResult = { won: false, rewardSilver: 5, rewardGems: 0 };
      endMatch();
    } else {
      updateUI();
    }
  }

  // Bot IA (Aggiornata per la trafittura)
  function executeBotTurn() {
    updateUI(); // Renderizza stato stanco/pescata

    setTimeout(() => {
      // 1. Attacco
      const hasPlayerDefenders = gameState.player.board.some(c => c !== null);
      
      gameState.opponent.board.forEach((botCard, idx) => {
        if (botCard && botCard.canAttack) {
          botCard.canAttack = false;
          
          if (hasPlayerDefenders) {
            // Attacca la prima creatura trovata
            const targetIdx = gameState.player.board.findIndex(c => c !== null);
            if (targetIdx !== -1) {
              const pCard = gameState.player.board[targetIdx];
              let excess = botCard.attack - pCard.currentDef;
              if (botCard.attack >= pCard.currentDef) {
                gameState.player.board[targetIdx] = null;
                if(excess > 0) gameState.player.hp -= excess;
                logMsg(`Il Bot annienta il tuo ${pCard.name}!`, true);
              } else {
                pCard.currentDef -= botCard.attack;
                logMsg(`Il Bot attacca ${pCard.name}.`, true);
              }
            }
          } else {
            // Nessuna difesa, attacca l'Eroe
            gameState.player.hp -= botCard.attack;
            logMsg(`Il Bot ti colpisce direttamente per ${botCard.attack} danni.`, true);
          }
        }
      });

      // 2. Gioca Carte dalla mano
      if (gameState.opponent.hand.length > 0) {
        const playableCardIdx = gameState.opponent.hand.findIndex(c => c.cost <= gameState.opponent.mana);
        const emptySlotIdx = gameState.opponent.board.findIndex(c => c === null);
        if (playableCardIdx !== -1 && emptySlotIdx !== -1) {
          const card = gameState.opponent.hand[playableCardIdx];
          gameState.opponent.mana -= card.cost;
          gameState.opponent.board[emptySlotIdx] = card;
          gameState.opponent.hand.splice(playableCardIdx, 1);
          logMsg(`L'IA schiera ${card.name}.`);
        }
      }

      checkWinCondition();
      if(gameState.opponent.hp > 0 && gameState.player.hp > 0) {
        gameState.turn++;
        gameState.activePlayer = 'player';
        startTurn();
      }
    }, 1500);
  }

  function logMsg(msg, isError = false) {
    const logEl = document.getElementById('battleLog');
    if (logEl) logEl.textContent = msg;
  }

  // ==========================================
  // 5. SCHERMATA RICOMPENSE
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
    
    const isWin = matchResult.won;
    el.innerHTML = `
      <span class="material-symbols-outlined text-6xl ${isWin ? 'text-primary' : 'text-error'} mb-2">${isWin ? 'emoji_events' : 'skull'}</span>
      <h2 class="font-display font-bold text-3xl ${isWin ? 'text-primary' : 'text-error'} mb-6">${isWin ? 'VITTORIA' : 'SCONFITTA'}</h2>
      <div class="flex gap-4">
        <div class="bg-surface-container px-4 py-2 rounded-lg border border-outline-variant flex flex-col items-center"><span class="text-primary text-xl font-bold">+${matchResult.rewardSilver}</span><span class="text-[8px] uppercase">Argento</span></div>
        ${matchResult.rewardGems > 0 ? `<div class="bg-surface-container px-4 py-2 rounded-lg border border-secondary/50 flex flex-col items-center"><span class="text-secondary text-xl font-bold">+${matchResult.rewardGems}</span><span class="text-[8px] uppercase">Gemme</span></div>` : ''}
      </div>
      <button id="returnLobbyBtn" class="mt-8 px-6 py-3 bg-primary text-[#110d0a] font-tactical font-bold rounded-lg shadow-lg active:scale-95">RITORNA AL SANCTUM</button>
    `;
    el.querySelector('#returnLobbyBtn').onclick = () => { viewState = 'lobby'; updateUI(); };
    return el;
  }

  updateUI();
  return container;
}