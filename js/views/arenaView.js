import { gameState, saveGameState } from '../state.js';

export function renderArena() {
  const container = document.createElement('div');
  container.className = 'flex flex-col w-full h-full select-none overflow-hidden relative bg-surface';

  let viewState = 'lobby'; 
  let botDifficulty = 'Facile';
  let selectedHandIndex = null;
  let selectedFriendlySlot = null;
  let matchResult = { won: false, rewardSilver: 0 };

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
    } else if (viewState === 'battle') {
      container.appendChild(renderBattleBoard());
      attachBattleListeners();
    } else if (viewState === 'reward') {
      container.appendChild(renderRewardScreen());
    }
  }

  // LOBBY ARENA
  function renderLobby() {
    const el = document.createElement('div');
    el.className = 'flex flex-col p-4 max-w-md mx-auto w-full h-full justify-between pb-20';
    
    el.innerHTML = `
      <div class="text-center mt-6">
        <span class="material-symbols-outlined text-4xl text-primary drop-shadow">swords</span>
        <h2 class="font-display font-bold text-2xl text-on-surface tracking-widest mt-1">IL SANCTUM</h2>
        <p class="font-tactical text-[11px] text-primary uppercase">Duello contro l'Intelligenza Artificiale</p>
      </div>

      <div class="grid grid-cols-2 gap-3 my-auto">
        <div class="diff-card p-4 rounded-xl cursor-pointer border text-center transition-all ${botDifficulty === 'Facile' ? 'bg-surface-container-high border-[#4ade80] shadow-[0_0_15px_rgba(74,222,128,0.2)]' : 'bg-surface-container-lowest border-outline-variant/40'}" data-diff="Facile">
          <span class="font-display font-bold text-[#4ade80] block text-sm">FACILE</span>
          <span class="font-tactical text-[10px] text-outline mt-1 block">Premio: 15 Arg</span>
        </div>
        <div class="diff-card p-4 rounded-xl cursor-pointer border text-center transition-all ${botDifficulty === 'Medio' ? 'bg-surface-container-high border-[#60a5fa] shadow-[0_0_15px_rgba(96,165,250,0.2)]' : 'bg-surface-container-lowest border-outline-variant/40'}" data-diff="Medio">
          <span class="font-display font-bold text-[#60a5fa] block text-sm">MEDIO</span>
          <span class="font-tactical text-[10px] text-outline mt-1 block">Premio: 30 Arg</span>
        </div>
        <div class="diff-card p-4 rounded-xl cursor-pointer border text-center transition-all ${botDifficulty === 'Difficile' ? 'bg-surface-container-high border-[#f87171] shadow-[0_0_15px_rgba(248,113,113,0.2)]' : 'bg-surface-container-lowest border-outline-variant/40'}" data-diff="Difficile">
          <span class="font-display font-bold text-[#f87171] block text-sm">DIFFICILE</span>
          <span class="font-tactical text-[10px] text-outline mt-1 block">Premio: 50 Arg</span>
        </div>
        <div class="diff-card p-4 rounded-xl cursor-pointer border text-center transition-all ${botDifficulty === 'Boss' ? 'bg-surface-container-high border-primary shadow-[0_0_20px_rgba(242,202,80,0.3)]' : 'bg-surface-container-lowest border-outline-variant/40'}" data-diff="Boss">
          <span class="font-display font-bold text-primary block text-sm">BOSS</span>
          <span class="font-tactical text-[10px] text-outline mt-1 block">+100 Arg</span>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <span class="font-tactical text-[10px] text-center text-on-surface-variant">Carte nel Mazzo: ${gameState.player.deck.length}/30</span>
        <button id="startBattleBtn" class="w-full py-4 bg-primary text-[#110d0a] font-tactical text-sm font-bold rounded-xl shadow-lg active:scale-95 flex justify-center items-center gap-2">
          INIZIA BATTAGLIA
        </button>
      </div>
    `;
    return el;
  }

  function attachLobbyListeners() {
    container.querySelectorAll('.diff-card').forEach(card => card.addEventListener('click', () => {
      botDifficulty = card.dataset.diff;
      updateUI();
    }));

    container.querySelector('#startBattleBtn').addEventListener('click', () => {
      initBattle();
      viewState = 'battle';
      updateUI();
    });
  }

  // INIZIALIZZAZIONE COMBATTIMENTO
  function initBattle() {
    gameState.turn = 1;
    gameState.player.hp = 30;
    gameState.player.mana = 1;
    gameState.player.maxMana = 1;
    gameState.player.board = [null, null, null, null, null];
    gameState.player.hand = [];

    // Carica le carte reali del giocatore
    let physicalDeck = gameState.player.deck.map(id => gameState.player.collection.find(c => c.id === id)).filter(Boolean);
    if (physicalDeck.length === 0) {
      physicalDeck = gameState.databases.cards.slice(0, 10);
    }

    gameState.player.matchDeck = [...physicalDeck].sort(() => Math.random() - 0.5);
    
    // Pesca 4 carte
    for (let i = 0; i < 4; i++) {
      if (gameState.player.matchDeck.length > 0) {
        const c = gameState.player.matchDeck.pop();
        gameState.player.hand.push({ ...c, currentDef: c.defense, canAttack: false });
      }
    }

    // Nemico IA
    gameState.opponent.hp = 30;
    gameState.opponent.mana = 1;
    gameState.opponent.maxMana = 1;
    gameState.opponent.board = [null, null, null, null, null];
    gameState.opponent.matchDeck = [...gameState.databases.cards].sort(() => Math.random() - 0.5);
  }

  // TAVOLO DA GIOCO
  function renderBattleBoard() {
    const p = gameState.player;
    const o = gameState.opponent;
    const el = document.createElement('div');
    el.className = 'flex flex-col w-full h-full bg-surface justify-between p-2';

    el.innerHTML = `
      <!-- ZONA AVVERSARIO -->
      <div class="bg-surface-container-low rounded-xl p-2.5 border border-outline-variant/30 flex flex-col gap-2 shadow">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-error text-2xl">smart_toy</span>
            <span class="font-display font-bold text-xs text-on-surface">IA ${botDifficulty}</span>
          </div>
          <!-- Bersaglio PV Nemico -->
          <button id="enemyHeroTarget" class="flex items-center gap-1.5 px-3 py-1.5 bg-error-container/30 border border-error rounded-full active:scale-95">
            <span class="material-symbols-outlined text-error text-sm">favorite</span>
            <span class="font-tactical text-error font-bold text-sm">${o.hp}</span>
          </button>
        </div>

        <!-- 5 SLOT NEMICO -->
        <div class="grid grid-cols-5 gap-1.5" id="opponentBoard">
          ${o.board.map((card, idx) => renderBoardCard(card, idx, true)).join('')}
        </div>
      </div>

      <!-- LOG CENTRALE -->
      <div class="bg-surface-container-highest px-3 py-1.5 rounded-lg flex items-center justify-between border border-outline-variant/20 shadow-inner">
        <span class="font-display text-[10px] text-primary font-bold uppercase">TURNO ${gameState.turn}</span>
        <span id="battleLog" class="font-body text-[10px] text-on-surface-variant truncate max-w-[65%]">Tocca a te.</span>
      </div>

      <!-- ZONA GIOCATORE -->
      <div class="bg-surface-container-low rounded-xl p-2.5 border border-outline-variant/30 flex flex-col gap-2 shadow">
        <!-- 5 SLOT GIOCATORE -->
        <div class="grid grid-cols-5 gap-1.5" id="playerBoard">
          ${p.board.map((card, idx) => renderBoardCard(card, idx, false)).join('')}
        </div>

        <!-- PV E MANA -->
        <div class="flex justify-between items-center pt-1 border-t border-outline-variant/20">
          <div class="flex items-center gap-1.5 px-3 py-1 bg-primary/20 border border-primary rounded-full">
            <span class="material-symbols-outlined text-primary text-sm">favorite</span>
            <span class="font-tactical text-primary font-bold text-sm">${p.hp}</span>
          </div>
          <span class="font-tactical text-xs text-secondary font-bold">MANA ${p.mana}/${p.maxMana}</span>
        </div>

        <!-- MANO SCORREVOLE MOBILE -->
        <div class="flex gap-2 overflow-x-auto w-full py-1 no-scrollbar" id="playerHand">
          ${p.hand.map((card, idx) => renderHandCard(card, idx, p.mana)).join('')}
        </div>

        <!-- CONTROLLI IN BASSO -->
        <div class="flex gap-2 pt-1">
          <button id="surrenderBtn" class="flex-1 py-2.5 bg-surface-container border border-outline-variant text-outline rounded-lg font-tactical text-xs">RESA</button>
          <button id="endTurnBtn" class="flex-[2] py-2.5 bg-primary text-[#110d0a] rounded-lg font-tactical font-bold text-xs shadow active:scale-95">PASSA TURNO</button>
        </div>
      </div>
    `;
    return el;
  }

  // Carta sul terreno
  function renderBoardCard(card, idx, isOpponent) {
    if (!card) {
      return `<div class="aspect-[4/5] rounded-lg bg-surface-container-lowest/40 border border-dashed border-outline-variant/30 flex items-center justify-center cursor-pointer" ${!isOpponent ? `data-action="deploy" data-slot="${idx}"` : ''}></div>`;
    }

    const isSelected = selectedFriendlySlot === idx && !isOpponent;
    const canAttack = card.canAttack && !isOpponent;
    const action = !isOpponent ? `data-action="selectFriendly" data-slot="${idx}"` : `data-action="attackTarget" data-slot="${idx}"`;

    return `
      <div class="aspect-[4/5] rounded-lg bg-surface-container-highest border ${isSelected ? 'border-primary ring-2 ring-primary' : 'border-outline-variant/50'} flex flex-col justify-between p-1 relative shadow cursor-pointer ${!canAttack && !isOpponent ? 'opacity-70 grayscale' : ''}" ${action}>
        <span class="font-display font-bold text-[8px] text-on-surface text-center truncate leading-tight">${card.name}</span>
        <div class="flex justify-between items-center text-[10px] font-tactical font-bold bg-black/60 rounded px-1">
          <span class="text-error">⚔${card.attack}</span>
          <span class="text-secondary">🛡${card.currentDef}</span>
        </div>
      </div>
    `;
  }

  // Carta nella mano (Touch Friendly)
  function renderHandCard(card, idx, currentMana) {
    const canPlay = currentMana >= card.cost;
    const isSelected = selectedHandIndex === idx;

    return `
      <div class="w-16 aspect-[4/5] shrink-0 rounded-lg bg-surface-container-highest border ${isSelected ? 'border-primary ring-2 ring-primary -translate-y-1' : 'border-outline-variant'} p-1 flex flex-col justify-between shadow active:scale-95 ${canPlay ? 'cursor-pointer' : 'opacity-40'}" data-action="${canPlay ? 'selectHand' : ''}" data-index="${idx}">
        <div class="flex justify-between items-center">
          <span class="font-tactical text-[8px] text-on-surface-variant truncate">${card.faction.substring(0,3)}</span>
          <span class="w-4 h-4 rounded-full bg-secondary text-[#110d0a] font-tactical text-[9px] font-bold flex items-center justify-center">${card.cost}</span>
        </div>
        <span class="font-display font-bold text-[8px] text-center leading-tight truncate text-on-surface">${card.name}</span>
        <div class="flex justify-between text-[9px] font-tactical font-bold bg-black/40 rounded px-1">
          <span class="text-error">⚔${card.attack}</span>
          <span class="text-secondary">🛡${card.defense}</span>
        </div>
      </div>
    `;
  }

  function attachBattleListeners() {
    container.querySelector('#surrenderBtn').onclick = () => {
      matchResult = { won: false, rewardSilver: 5 };
      endMatch();
    };

    container.querySelector('#endTurnBtn').onclick = () => {
      executeBotTurn();
    };

    container.querySelector('#enemyHeroTarget').onclick = () => {
      if (selectedFriendlySlot !== null) {
        const hasDefenders = gameState.opponent.board.some(c => c !== null);
        if (hasDefenders) {
          logMsg("Distruggi prima le creature a difesa!", true);
        } else {
          resolveAttack(selectedFriendlySlot, 'hero');
        }
      }
    };

    container.onclick = (e) => {
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
        logMsg(`Evocato: ${card.name}`);
        updateUI();
      }
      else if (action === 'selectFriendly') {
        const idx = parseInt(target.dataset.slot);
        const card = gameState.player.board[idx];
        if (card.canAttack) {
          selectedFriendlySlot = selectedFriendlySlot === idx ? null : idx;
          selectedHandIndex = null;
          updateUI();
        } else {
          logMsg("Creatura esausta.", true);
        }
      }
      else if (action === 'attackTarget' && selectedFriendlySlot !== null) {
        resolveAttack(selectedFriendlySlot, parseInt(target.dataset.slot));
      }
    };
  }

  function resolveAttack(attackerSlotIdx, defenderTarget) {
    const attacker = gameState.player.board[attackerSlotIdx];
    attacker.canAttack = false;

    if (defenderTarget === 'hero') {
      gameState.opponent.hp -= attacker.attack;
      logMsg(`${attacker.name} colpisce l'Eroe per ${attacker.attack}!`);
    } else {
      const defender = gameState.opponent.board[defenderTarget];
      const excess = attacker.attack - defender.currentDef;

      if (attacker.attack >= defender.currentDef) {
        gameState.opponent.board[defenderTarget] = null;
        if (excess > 0) gameState.opponent.hp -= excess;
        logMsg(`Eliminato ${defender.name}! (${excess > 0 ? excess + ' a PV' : ''})`);
      } else {
        defender.currentDef -= attacker.attack;
        logMsg(`Danno inflitto a ${defender.name}.`);
      }
    }

    selectedFriendlySlot = null;
    checkWin();
  }

  function executeBotTurn() {
    logMsg("Il nemico attacca...");
    selectedHandIndex = null;
    selectedFriendlySlot = null;
    updateUI();

    setTimeout(() => {
      // 1. Il Bot attacca se ha creature
      gameState.opponent.board.forEach((bCard, idx) => {
        if (bCard) {
          const playerDefIdx = gameState.player.board.findIndex(c => c !== null);
          if (playerDefIdx !== -1) {
            const pCard = gameState.player.board[playerDefIdx];
            if (bCard.attack >= pCard.currentDef) {
              gameState.player.board[playerDefIdx] = null;
              logMsg(`L'IA distrugge il tuo ${pCard.name}!`, true);
            } else {
              pCard.currentDef -= bCard.attack;
            }
          } else {
            gameState.player.hp -= bCard.attack;
            logMsg(`L'IA ti attacca direttamente: -${bCard.attack}!`, true);
          }
        }
      });

      // 2. Il Bot evoca una carta a caso
      const emptySlot = gameState.opponent.board.findIndex(c => c === null);
      if (emptySlot !== -1 && gameState.opponent.matchDeck.length > 0) {
        const card = gameState.opponent.matchDeck.pop();
        gameState.opponent.board[emptySlot] = { ...card, currentDef: card.defense, canAttack: false };
      }

      // 3. Ripristina il turno del giocatore
      gameState.turn++;
      gameState.player.maxMana = Math.min(10, gameState.player.maxMana + 1);
      gameState.player.mana = gameState.player.maxMana;
      gameState.player.board.forEach(c => { if(c) c.canAttack = true; });

      // Pesca 1 carta
      if (gameState.player.matchDeck.length > 0 && gameState.player.hand.length < 5) {
        const newCard = gameState.player.matchDeck.pop();
        gameState.player.hand.push({ ...newCard, currentDef: newCard.defense, canAttack: false });
      }

      checkWin();
    }, 1200);
  }

  function checkWin() {
    if (gameState.opponent.hp <= 0) {
      matchResult = { won: true, rewardSilver: botDifficulty === 'Boss' ? 60 : 25 };
      endMatch();
    } else if (gameState.player.hp <= 0) {
      matchResult = { won: false, rewardSilver: 5 };
      endMatch();
    } else {
      updateUI();
    }
  }

  function logMsg(msg, isErr = false) {
    const el = document.getElementById('battleLog');
    if (el) {
      el.textContent = msg;
      el.className = `font-body text-[10px] truncate max-w-[65%] ${isErr ? 'text-error' : 'text-on-surface-variant'}`;
    }
  }

  function endMatch() {
    if (matchResult.won) {
      gameState.player.stats.wins++;
      gameState.currencies.silver += matchResult.rewardSilver;
    } else {
      gameState.player.stats.losses++;
      gameState.currencies.silver += matchResult.rewardSilver;
    }
    gameState.player.stats.matches++;
    saveGameState();

    viewState = 'reward';
    updateUI();
  }

  function renderRewardScreen() {
    const el = document.createElement('div');
    el.className = 'flex flex-col items-center justify-center w-full h-full bg-surface p-6 text-center';
    el.innerHTML = `
      <span class="material-symbols-outlined text-6xl ${matchResult.won ? 'text-primary' : 'text-error'} mb-2">
        ${matchResult.won ? 'emoji_events' : 'skull'}
      </span>
      <h2 class="font-display font-bold text-3xl ${matchResult.won ? 'text-primary' : 'text-error'} mb-1">
        ${matchResult.won ? 'VITTORIA' : 'SCONFITTA'}
      </h2>
      <p class="font-tactical text-xs text-on-surface-variant mb-8">Premio Battaglia: +${matchResult.rewardSilver} Argento</p>
      <button id="returnBtn" class="w-full max-w-xs py-3.5 bg-primary text-[#110d0a] font-tactical font-bold text-xs rounded-xl shadow-lg active:scale-95">
        TORNA ALL'ARENA
      </button>
    `;
    el.querySelector('#returnBtn').onclick = () => {
      viewState = 'lobby';
      updateUI();
    };
    return el;
  }

  updateUI();
  return container;
}