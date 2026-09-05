import { gameState } from '../state.js';

export function renderArena() {
  const container = document.createElement('div');
  container.className = 'flex flex-col w-full h-full select-none overflow-hidden relative bg-surface';

  let viewState = 'lobby'; 
  let botDifficulty = 'Facile';
  
  let currentPhase = 'mulligan';
  let selectedHandIndex = null;
  let selectedFriendlySlot = null;
  let matchResult = { won: false, rewardSilver: 0, rewardGems: 0 };

  function toggleFullScreenMode(isFullScreen) {
    const header = document.querySelector('header');
    const nav = document.querySelector('nav');
    const appRoot = document.getElementById('appRoot');
    if (isFullScreen) {
      if(header) header.classList.add('hidden');
      if(nav) nav.classList.add('hidden');
      if(appRoot) appRoot.className = 'absolute top-0 bottom-0 left-0 right-0 w-full max-w-4xl mx-auto overflow-hidden bg-surface';
    } else {
      if(header) header.classList.remove('hidden');
      if(nav) nav.classList.remove('hidden');
      if(appRoot) appRoot.className = 'absolute top-16 bottom-16 left-0 right-0 w-full max-w-4xl mx-auto overflow-y-auto bg-surface/50 border-x border-surface-container-high/30';
    }
  }

  function updateUI() {
    container.innerHTML = '';
    toggleFullScreenMode(viewState !== 'lobby');

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
        <div class="text-center mt-4 mb-4">
          <span class="material-symbols-outlined text-4xl text-primary drop-shadow-[0_0_15px_rgba(242,202,80,0.8)]">fort</span>
          <h2 class="font-display font-bold text-3xl text-on-surface tracking-widest mt-1">IL SANCTUM</h2>
          <p class="font-tactical text-[11px] text-primary tracking-widest uppercase mt-1">Scegli la Battaglia</p>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="diff-card p-4 rounded-xl cursor-pointer transition-all border ${botDifficulty === 'Facile' ? 'bg-surface-container-high border-[#4ade80] shadow-[0_0_15px_rgba(74,222,128,0.2)]' : 'bg-surface-container-lowest border-outline-variant/50'}" data-diff="Facile">
            <span class="font-display font-bold text-[#4ade80] block text-center mb-1">FACILE</span>
            <span class="block text-center font-tactical text-[10px] text-outline">Premio: 10 Arg</span>
          </div>
          <div class="diff-card p-4 rounded-xl cursor-pointer transition-all border ${botDifficulty === 'Medio' ? 'bg-surface-container-high border-[#60a5fa] shadow-[0_0_15px_rgba(96,165,250,0.2)]' : 'bg-surface-container-lowest border-outline-variant/50'}" data-diff="Medio">
            <span class="font-display font-bold text-[#60a5fa] block text-center mb-1">MEDIO</span>
            <span class="block text-center font-tactical text-[10px] text-outline">Premio: 20 Arg</span>
          </div>
          <div class="diff-card p-4 rounded-xl cursor-pointer transition-all border ${botDifficulty === 'Difficile' ? 'bg-surface-container-high border-[#f87171] shadow-[0_0_15px_rgba(248,113,113,0.2)]' : 'bg-surface-container-lowest border-outline-variant/50'}" data-diff="Difficile">
            <span class="font-display font-bold text-[#f87171] block text-center mb-1">DIFFICILE</span>
            <span class="block text-center font-tactical text-[10px] text-outline">Premio: 30 Arg</span>
          </div>
          <div class="diff-card p-4 rounded-xl cursor-pointer transition-all border ${botDifficulty === 'Boss' ? 'bg-surface-container-high border-primary shadow-[0_0_20px_rgba(242,202,80,0.3)]' : 'bg-surface-container-lowest border-outline-variant/50'}" data-diff="Boss">
            <span class="font-display font-bold text-primary block text-center mb-1">BOSS</span>
            <span class="block text-center font-tactical text-[10px] text-outline text-primary">+50 Arg & Gemme</span>
          </div>
        </div>
        
        <button id="startBotBtn" class="mt-4 w-full py-4 bg-primary hover:bg-primary-fixed-dim text-[#110d0a] font-tactical text-sm font-bold rounded-xl active:scale-95 shadow-lg flex justify-center items-center gap-2">
          <span class="material-symbols-outlined text-[20px]">swords</span> COMBATTI COL TUO DECK
        </button>
      </div>
    `;
    return el;
  }

  function attachLobbyListeners() {
    container.querySelectorAll('.diff-card').forEach(card => card.addEventListener('click', () => { botDifficulty = card.dataset.diff; updateUI(); }));
    container.querySelector('#startBotBtn').addEventListener('click', () => { initMatchState(); viewState = 'loading'; updateUI(); });
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function drawCard(targetObj, amount = 1) {
    for (let i = 0; i < amount; i++) {
      if (targetObj.matchDeck.length > 0 && targetObj.hand.length < 10) {
        const card = targetObj.matchDeck.pop();
        targetObj.hand.push({ ...card, currentDef: card.defense, canAttack: false }); 
      }
    }
  }

  function initMatchState() {
    const FULL_CARD_DB = gameState.databases.cards || [];
    const isPlayerFirst = Math.random() < 0.5;
    
    gameState.turn = 1;
    gameState.activePlayer = isPlayerFirst ? 'player' : 'opponent';

    // Se il giocatore non ha carte nel Deck, gliene creiamo uno fittizio base per evitare crash
    let playerPhysicalDeck = [];
    if (gameState.player.deck.length > 0 && gameState.player.collection.length > 0) {
      playerPhysicalDeck = gameState.player.deck.map(id => gameState.player.collection.find(c => c.id === id)).filter(Boolean);
    } else {
      playerPhysicalDeck = FULL_CARD_DB.slice(0, 15); // Fallback salvavita
    }

    gameState.player.maxMana = isPlayerFirst ? 1 : 0;
    gameState.player.mana = gameState.player.maxMana;
    gameState.player.hp = 30;
    gameState.player.board = [null, null, null, null, null];
    gameState.player.hand = [];
    gameState.player.matchDeck = shuffleArray([...playerPhysicalDeck]); // Usa il VERO mazzo
    
    gameState.opponent.hp = 30;
    gameState.opponent.maxMana = !isPlayerFirst ? 1 : 0;
    gameState.opponent.mana = gameState.opponent.maxMana;
    gameState.opponent.board = [null, null, null, null, null];
    gameState.opponent.hand = [];
    gameState.opponent.matchDeck = shuffleArray([...FULL_CARD_DB, ...FULL_CARD_DB]).slice(0, 30); // Bot misto

    drawCard(gameState.player, 4);
    drawCard(gameState.opponent, 4);
    currentPhase = 'mulligan';
  }

  function renderLoading() {
    const el = document.createElement('div');
    el.className = 'flex flex-col items-center justify-center w-full h-full bg-surface-container-lowest z-50 absolute inset-0 text-center';
    el.innerHTML = `<span class="material-symbols-outlined text-6xl text-primary animate-spin mb-4">settings</span><h2 class="font-display font-bold text-xl text-primary">MISCHIAMENTO MAZZI...</h2>`;
    setTimeout(() => { viewState = 'battle'; updateUI(); }, 1200);
    return el;
  }

  function renderBattleBoard() {
    const p = gameState.player;
    const o = gameState.opponent;
    const el = document.createElement('div');
    el.className = 'flex flex-col w-full h-full bg-surface relative';

    if (currentPhase === 'mulligan') {
      el.innerHTML = `
        <div class="absolute inset-0 bg-surface-container-lowest z-[60] flex flex-col items-center justify-center p-4">
          <h2 class="font-display font-bold text-primary text-3xl mb-2">LA TUA MANO</h2>
          <p class="font-body text-xs text-on-surface-variant mb-6 text-center max-w-sm">Puoi accettare questa mano, o rimescolarla nel mazzo e pescare 4 nuove carte.</p>
          <div class="flex gap-2 w-full overflow-x-auto justify-center mb-8 px-2">
            ${p.hand.map(c => `<img src="${c.art}" class="w-20 aspect-[5/7] rounded border border-outline-variant object-cover shadow-lg shrink-0" />`).join('')}
          </div>
          <div class="flex flex-col w-full max-w-xs gap-3">
            <button id="btnKeepHand" class="w-full py-4 bg-primary text-[#110d0a] font-tactical rounded shadow font-bold text-sm">ACCETTA E COMBATTI</button>
            <button id="btnMulligan" class="w-full py-4 bg-transparent border border-error text-error font-tactical rounded shadow text-sm">SCARTA TUTTO E RIPESCA</button>
          </div>
        </div>
      `;
      setTimeout(() => {
        el.querySelector('#btnMulligan').onclick = () => {
          p.matchDeck = shuffleArray([...p.matchDeck, ...p.hand]);
          p.hand = [];
          drawCard(p, 4);
          startTurn();
        };
        el.querySelector('#btnKeepHand').onclick = () => startTurn();
      }, 0);
      return el;
    }

    el.innerHTML = `
      <!-- ZONA AVVERSARIO (SEMPLIFICATA MOBILE) -->
      <section class="px-2 pt-2 pb-2 bg-surface-container-low border-b border-outline-variant/30 flex flex-col shrink-0 shadow-md">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-error text-3xl">smart_toy</span>
            <div class="flex flex-col">
              <span class="font-display font-bold text-sm text-on-surface">IA ${botDifficulty}</span>
              <span class="font-tactical text-[9px] text-on-surface-variant">Deck: ${o.matchDeck.length}</span>
            </div>
          </div>
          <button id="enemyHeroTarget" class="flex flex-col items-center justify-center w-12 h-12 bg-error-container/20 border border-error/50 rounded-full shadow cursor-crosshair active:scale-95">
            <span class="font-tactical text-base text-error font-bold">${o.hp}</span>
            <span class="material-symbols-outlined text-error text-[10px]" style="font-variation-settings: 'FILL' 1;">favorite</span>
          </button>
        </div>
        <div class="grid grid-cols-5 gap-1.5" id="opponentBoard">
          ${o.board.map((card, idx) => renderBoardSlot(card, idx, true)).join('')}
        </div>
      </section>

      <!-- LOG TURNO CENTRALE -->
      <div class="bg-surface-container-highest/80 px-2 py-1 flex items-center justify-between shadow-inner shrink-0 z-10 border-y border-outline-variant/20">
        <span class="font-display text-[9px] ${gameState.activePlayer === 'player' ? 'text-primary' : 'text-error'} font-bold tracking-widest uppercase">${gameState.activePlayer === 'player' ? 'TUO TURNO' : 'TURNO NEMICO'} ${gameState.turn}</span>
        <div id="battleLog" class="text-[9px] text-on-surface-variant font-body italic truncate px-2 max-w-[60%]">In attesa...</div>
      </div>

      <!-- ZONA GIOCATORE -->
      <section class="px-2 pt-2 flex flex-col flex-1 pb-2">
        <div class="grid grid-cols-5 gap-1.5 mb-auto" id="playerBoard">
          ${p.board.map((card, idx) => renderBoardSlot(card, idx, false)).join('')}
        </div>

        <div class="flex items-center justify-between px-2 mt-4 mb-2">
          <div class="flex flex-col items-center justify-center w-12 h-12 bg-primary/10 border border-primary/50 rounded-full shadow">
            <span class="font-tactical text-base text-primary font-bold">${p.hp}</span>
            <span class="material-symbols-outlined text-primary text-[10px]" style="font-variation-settings: 'FILL' 1;">favorite</span>
          </div>
          <div class="flex flex-col items-end">
            <div class="flex gap-1 mb-1">${renderManaCrystals(p.mana, p.maxMana)}</div>
            <span class="font-tactical text-[10px] text-secondary font-bold">MANA ${p.mana}/${p.maxMana}</span>
          </div>
        </div>

        <!-- MANO (SCORRIMENTO ORIZZONTALE MOBILE FRIENDLY) -->
        <div class="flex gap-2 overflow-x-auto w-full pb-2 px-1 no-scrollbar snap-x snap-mandatory" id="playerHand">
           ${p.hand.map((card, idx) => renderHandCard(card, idx, p.mana)).join('')}
        </div>
        
        <div class="flex gap-2 mt-2">
          <button id="surrenderBtn" class="py-3 px-4 border border-outline-variant text-outline hover:text-error rounded-xl font-tactical text-xs flex-1">RITIRATA</button>
          <button id="endTurnBtn" class="py-3 px-4 bg-primary text-[#110d0a] font-bold rounded-xl shadow-lg active:scale-95 font-tactical text-xs flex-[2] ${gameState.activePlayer !== 'player' ? 'opacity-50 pointer-events-none' : ''}">FINE TURNO</button>
        </div>
      </section>
    `;
    return el;
  }

  function renderManaCrystals(current, max) {
    let html = '';
    for (let i = 0; i < max; i++) html += `<div class="w-3 h-3 rounded-full ${i < current ? 'bg-secondary shadow-[0_0_6px_rgba(189,244,255,0.8)]' : 'bg-surface-container border border-outline-variant'}"></div>`;
    return html;
  }

  // Visualizzazione slot ultra-semplificata per leggibilità su smartphone
  function renderBoardSlot(card, idx, isOpponent) {
    const isSelected = selectedFriendlySlot === idx && !isOpponent;
    const ring = isSelected ? 'ring-2 ring-primary -translate-y-1 shadow-lg' : '';
    const exhausted = (card && !card.canAttack && !isOpponent) ? 'grayscale opacity-70' : '';
    
    if (!card) {
      return `<div class="relative rounded bg-surface-container-lowest/50 aspect-[5/7] border border-dashed border-outline-variant/30 cursor-pointer ${!isOpponent && selectedHandIndex !== null ? `border-primary bg-primary/10` : ''}" ${!isOpponent ? `data-action="deploy" data-slot="${idx}"` : ''}></div>`;
    }

    const clickAction = !isOpponent ? `data-action="selectFriendly" data-slot="${idx}"` : `data-action="attackTarget" data-slot="${idx}"`;
    const targetClass = (isOpponent && selectedFriendlySlot !== null) ? 'cursor-crosshair ring-1 hover:ring-error' : 'cursor-pointer';

    return `
      <div class="relative flex flex-col bg-surface-container-high rounded p-0.5 shadow-md aspect-[5/7] transition-all border border-outline-variant/50 ${ring} ${exhausted} ${targetClass}" ${clickAction}>
        <div class="relative w-full h-full rounded overflow-hidden">
          <img class="w-full h-full object-cover" src="${card.art}" />
          <!-- Barra info in basso invece del testo per non sprecare spazio -->
          <div class="absolute bottom-0 inset-x-0 bg-black/80 flex justify-between px-1 py-0.5">
            <span class="font-tactical text-[9px] text-error font-bold flex items-center gap-0.5"><span class="material-symbols-outlined text-[8px]">swords</span>${card.attack}</span>
            <span class="font-tactical text-[9px] text-secondary font-bold flex items-center gap-0.5"><span class="material-symbols-outlined text-[8px]">shield</span>${card.currentDef}</span>
          </div>
        </div>
      </div>
    `;
  }

  // Carta in mano, scorrevole e pulita
  function renderHandCard(card, idx, currentMana) {
    const canPlay = currentMana >= card.cost;
    const isSelected = selectedHandIndex === idx;
    const style = canPlay ? 'cursor-pointer hover:-translate-y-2 shadow-md' : 'opacity-50 grayscale';
    const selected = isSelected ? '-translate-y-4 ring-2 ring-primary z-40 shadow-xl scale-105' : '';

    return `
      <div class="relative w-20 aspect-[5/7] bg-surface-container-high rounded-md p-1 transition-all border border-outline-variant shrink-0 snap-center ${style} ${selected}" data-action="${canPlay ? 'selectHand' : ''}" data-index="${idx}">
        <div class="absolute -top-1 -right-1 z-10 w-5 h-5 rounded-full ${canPlay ? 'bg-secondary text-[#110d0a]' : 'bg-surface-container-highest text-outline'} flex items-center justify-center font-tactical text-[10px] font-bold shadow">${card.cost}</div>
        <img class="w-full h-full object-cover rounded-sm" src="${card.art}" />
        <div class="absolute bottom-1 inset-x-1 bg-black/80 flex justify-between px-1 py-0.5 rounded">
          <span class="font-tactical text-[9px] text-error font-bold">${card.attack}</span>
          <span class="font-tactical text-[9px] text-secondary font-bold">${card.defense}</span>
        </div>
      </div>
    `;
  }

  function startTurn() {
    currentPhase = 'play';
    const p = gameState.activePlayer === 'player' ? gameState.player : gameState.opponent;
    p.maxMana = Math.min(10, p.maxMana + 1);
    p.mana = p.maxMana;
    p.board.forEach(c => { if(c) c.canAttack = true; });

    if (gameState.turn > 1 || gameState.activePlayer === 'opponent') drawCard(p, 1);

    if (gameState.activePlayer === 'opponent') {
      executeBotTurn();
    } else {
      logMsg("Tocca a te! Gioca carte o attacca.");
      updateUI();
    }
  }

  function attachBattleListeners() {
    container.querySelector('#surrenderBtn').addEventListener('click', () => {
      if(confirm("Vuoi davvero fuggire dal Sanctum? La sconfitta sarà segnata.")){
        gameState.opponent.hp = 0; // Trigger sconfitta visiva
        matchResult = { won: false, rewardSilver: 0, rewardGems: 0 };
        endMatch();
      }
    });

    container.querySelector('#endTurnBtn').addEventListener('click', () => {
      gameState.activePlayer = 'opponent';
      startTurn();
    });
    
    container.querySelector('#enemyHeroTarget').addEventListener('click', () => {
      const hasDefenders = gameState.opponent.board.some(c => c !== null);
      if (selectedFriendlySlot !== null) {
        if (hasDefenders) logMsg("Devi prima distruggere le sue creature!", true);
        else resolveAttack(selectedFriendlySlot, 'hero');
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
        const card = gameState.player.board[idx];
        if (card.canAttack) {
          selectedFriendlySlot = selectedFriendlySlot === idx ? null : idx;
          selectedHandIndex = null;
          updateUI();
        } else logMsg("Guerriero stanco, non può attaccare.", true);
      }
      else if (action === 'attackTarget' && selectedFriendlySlot !== null) {
        resolveAttack(selectedFriendlySlot, parseInt(target.dataset.slot));
      }
    });
  }

  function resolveAttack(attackerSlotIdx, defenderTarget) {
    const attacker = gameState.player.board[attackerSlotIdx];
    attacker.canAttack = false;
    
    if (defenderTarget === 'hero') {
      gameState.opponent.hp -= attacker.attack;
      logMsg(`${attacker.name} colpisce l'IA: ${attacker.attack} danni!`);
    } else {
      const defender = gameState.opponent.board[defenderTarget];
      let excess = attacker.attack - defender.currentDef;

      if (attacker.attack >= defender.currentDef) {
        logMsg(`Distrutto ${defender.name}! ${excess > 0 ? `+${excess} all'Eroe` : ''}`);
        gameState.opponent.board[defenderTarget] = null;
        if (excess > 0) gameState.opponent.hp -= excess;
      } else {
        defender.currentDef -= attacker.attack;
        logMsg(`Colpito. Difesa ridotta a ${defender.currentDef}.`);
      }
    }

    selectedFriendlySlot = null;
    checkWinCondition();
  }

  function executeBotTurn() {
    updateUI(); 
    setTimeout(() => {
      const hasPlayerDefenders = gameState.player.board.some(c => c !== null);
      
      gameState.opponent.board.forEach((botCard, idx) => {
        if (botCard && botCard.canAttack) {
          botCard.canAttack = false;
          if (hasPlayerDefenders) {
            const targetIdx = gameState.player.board.findIndex(c => c !== null);
            if (targetIdx !== -1) {
              const pCard = gameState.player.board[targetIdx];
              let excess = botCard.attack - pCard.currentDef;
              if (botCard.attack >= pCard.currentDef) {
                gameState.player.board[targetIdx] = null;
                if(excess > 0) gameState.player.hp -= excess;
                logMsg(`Il Bot annienta ${pCard.name}!`, true);
              } else {
                pCard.currentDef -= botCard.attack;
                logMsg(`Il Bot attacca ${pCard.name}.`, true);
              }
            }
          } else {
            gameState.player.hp -= botCard.attack;
            logMsg(`Subisci ${botCard.attack} danni diretti!`, true);
          }
        }
      });

      if (gameState.opponent.hand.length > 0) {
        const playableCardIdx = gameState.opponent.hand.findIndex(c => c.cost <= gameState.opponent.mana);
        const emptySlotIdx = gameState.opponent.board.findIndex(c => c === null);
        if (playableCardIdx !== -1 && emptySlotIdx !== -1) {
          const card = gameState.opponent.hand[playableCardIdx];
          gameState.opponent.mana -= card.cost;
          gameState.opponent.board[emptySlotIdx] = card;
          gameState.opponent.hand.splice(playableCardIdx, 1);
          logMsg(`Il Bot schiera una creatura.`);
        }
      }

      checkWinCondition();
      if(gameState.opponent.hp > 0 && gameState.player.hp > 0) {
        gameState.turn++;
        gameState.activePlayer = 'player';
        startTurn();
      }
    }, 1200);
  }

  function checkWinCondition() {
    if (gameState.opponent.hp <= 0) {
      gameState.opponent.hp = 0;
      matchResult = { won: true, rewardSilver: botDifficulty === 'Boss' ? 50 : 20, rewardGems: botDifficulty === 'Boss' ? 5 : 0 };
      endMatch();
    } else if (gameState.player.hp <= 0) {
      gameState.player.hp = 0;
      matchResult = { won: false, rewardSilver: 5, rewardGems: 0 };
      endMatch();
    } else updateUI();
  }

  function logMsg(msg, isError = false) {
    const logEl = document.getElementById('battleLog');
    if (logEl) {
      logEl.textContent = msg;
      logEl.className = `text-[10px] font-body italic truncate px-2 max-w-[70%] ${isError ? 'text-error' : 'text-on-surface-variant'}`;
    }
  }

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
      <span class="material-symbols-outlined text-7xl ${isWin ? 'text-primary' : 'text-error'} mb-4 drop-shadow-[0_0_20px_rgba(242,202,80,0.5)]">${isWin ? 'emoji_events' : 'skull'}</span>
      <h2 class="font-display font-bold text-4xl ${isWin ? 'text-primary' : 'text-error'} mb-2 tracking-widest">${isWin ? 'VITTORIA' : 'SCONFITTA'}</h2>
      <p class="font-body text-xs text-on-surface-variant mb-10 max-w-xs mx-auto">${isWin ? "Il tuo valore cresce. Ecco la tua ricompensa del Sanctum." : "I nemici sono stati più forti. Non arrenderti, rafforza il tuo deck."}</p>
      
      <div class="flex gap-4 mb-10">
        <div class="bg-surface-container-high px-6 py-4 rounded-xl border border-outline-variant flex flex-col items-center shadow-lg">
          <span class="text-primary text-2xl font-bold">+${matchResult.rewardSilver}</span>
          <span class="text-[9px] uppercase text-outline mt-1 font-tactical">Argento</span>
        </div>
        ${matchResult.rewardGems > 0 ? `
        <div class="bg-surface-container-high px-6 py-4 rounded-xl border border-secondary/50 flex flex-col items-center shadow-[0_0_15px_rgba(189,244,255,0.2)]">
          <span class="text-secondary text-2xl font-bold">+${matchResult.rewardGems}</span>
          <span class="text-[9px] uppercase text-outline mt-1 font-tactical">Gemme</span>
        </div>` : ''}
      </div>
      
      <button id="returnLobbyBtn" class="w-full max-w-xs py-4 bg-primary text-[#110d0a] font-tactical text-sm font-bold rounded-xl shadow-lg active:scale-95 transition-all">RITORNA AL SANCTUM</button>
    `;
    el.querySelector('#returnLobbyBtn').onclick = () => { viewState = 'lobby'; updateUI(); };
    return el;
  }

  updateUI();
  return container;
}