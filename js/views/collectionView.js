import { gameState, saveGameState } from '../state.js';

// Helper per generare grafica araldica nitida senza dipendere da URL esterni lenti
function getFactionBadge(faction) {
  switch(faction) {
    case 'Vichinghi': return { icon: 'tsunami', color: 'from-blue-900 to-slate-900', border: 'border-cyan-500/40' };
    case 'Medioevo': return { icon: 'shield', color: 'from-amber-950 to-stone-900', border: 'border-amber-500/40' };
    case 'Giapponesi': return { icon: 'swords', color: 'from-rose-950 to-neutral-900', border: 'border-rose-500/40' };
    case 'Nativi': return { icon: 'nature', color: 'from-emerald-950 to-stone-900', border: 'border-emerald-500/40' };
    default: return { icon: 'token', color: 'from-neutral-900 to-black', border: 'border-outline-variant' };
  }
}

export function renderCollection() {
  const container = document.createElement('div');
  container.className = 'flex flex-col w-full h-full bg-surface select-none relative pb-20';

  let currentTab = 'collection'; // 'collection' | 'deck'

  function updateUI() {
    container.innerHTML = `
      <div class="flex flex-col h-full">
        
        <!-- HEADER GRIMORIO -->
        <div class="p-3 bg-surface-container-lowest border-b border-outline-variant/30 shrink-0">
          <div class="flex justify-between items-center mb-2">
            <h2 class="font-display font-bold text-lg text-primary tracking-wide flex items-center gap-1.5">
              <span class="material-symbols-outlined text-primary text-xl">auto_stories</span> GRIMORIO
            </h2>
            <span class="font-tactical text-[11px] text-on-surface-variant font-bold bg-surface-container px-2 py-0.5 rounded">
              Carte: ${gameState.player.collection.length}
            </span>
          </div>

          <!-- TABS -->
          <div class="flex bg-surface-container-highest/60 rounded-lg p-1 border border-outline-variant/30">
            <button id="tabColBtn" class="flex-1 py-1.5 rounded font-tactical text-xs font-bold transition-all ${currentTab === 'collection' ? 'bg-primary text-[#110d0a] shadow' : 'text-on-surface-variant'}">
              TUTTE (${gameState.player.collection.length})
            </button>
            <button id="tabDeckBtn" class="flex-1 py-1.5 rounded font-tactical text-xs font-bold transition-all ${currentTab === 'deck' ? 'bg-secondary text-[#110d0a] shadow' : 'text-on-surface-variant'}">
              MAZZO (${gameState.player.deck.length}/30)
            </button>
          </div>
        </div>

        <!-- LISTA CARTE -->
        <div class="flex-1 overflow-y-auto p-3">
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3" id="cardsGrid">
            ${currentTab === 'collection' ? renderCollectionList() : renderDeckList()}
          </div>
        </div>
      </div>
    `;

    container.querySelector('#tabColBtn').onclick = () => { currentTab = 'collection'; updateUI(); };
    container.querySelector('#tabDeckBtn').onclick = () => { currentTab = 'deck'; updateUI(); };

    if (currentTab === 'collection') {
      // Listener Inserimento / Rimozione dal Mazzo
      container.querySelectorAll('.toggle-deck-btn').forEach(btn => {
        btn.onclick = (e) => {
          const cardId = e.currentTarget.dataset.id;
          const index = gameState.player.deck.indexOf(cardId);
          if (index !== -1) {
            gameState.player.deck.splice(index, 1);
          } else {
            if (gameState.player.deck.length < 30) {
              gameState.player.deck.push(cardId);
            } else {
              alert("Mazzo pieno! Massimo 30 carte.");
            }
          }
          saveGameState();
          updateUI();
        };
      });

      // Listener Fusione / Potenziamento Carte
      container.querySelectorAll('.upgrade-card-btn').forEach(btn => {
        btn.onclick = (e) => {
          const cardId = e.currentTarget.dataset.id;
          const card = gameState.player.collection.find(c => c.id === cardId);
          if (card && card.copies >= card.copiesNeeded) {
            card.copies -= card.copiesNeeded;
            card.level = (card.level || 1) + 1;
            card.attack = (card.attack || 0) + 1;
            card.defense = (card.defense || 0) + 1;
            card.copiesNeeded = Math.floor(card.copiesNeeded * 1.5) + 1;
            saveGameState();
            updateUI();
          }
        };
      });
    } else {
      // Rimozione rapida da Mazzo
      container.querySelectorAll('.remove-deck-btn').forEach(btn => {
        btn.onclick = (e) => {
          const index = parseInt(e.currentTarget.dataset.index);
          gameState.player.deck.splice(index, 1);
          saveGameState();
          updateUI();
        };
      });
    }
  }

  function renderCardBox(card, inDeckCount = 0, isDeckView = false, deckIndex = 0) {
    const badge = getFactionBadge(card.faction);
    const canUpgrade = card.copies >= (card.copiesNeeded || 3);

    return `
      <div class="flex flex-col bg-surface-container rounded-xl p-2 border ${badge.border} shadow-md relative overflow-hidden">
        
        <!-- SFONDO ARALDICO (SEMPRE VISIBILE E NITIDO) -->
        <div class="relative w-full aspect-[4/5] rounded-lg overflow-hidden bg-gradient-to-b ${badge.color} flex flex-col justify-between p-2 shadow-inner border border-white/10">
          
          <!-- Intestazione Carta: Fazione e Costo -->
          <div class="flex justify-between items-start">
            <span class="inline-flex items-center gap-1 font-tactical text-[9px] uppercase tracking-wider text-on-surface/80 bg-black/40 px-1.5 py-0.5 rounded">
              <span class="material-symbols-outlined text-[11px] text-primary">${badge.icon}</span> ${card.faction}
            </span>
            <div class="w-6 h-6 rounded-full bg-secondary text-[#110d0a] font-tactical text-xs font-bold flex items-center justify-center shadow-lg">
              ${card.cost}
            </div>
          </div>

          <!-- Centro: Nome e Icona -->
          <div class="text-center py-2">
            <span class="font-display font-bold text-xs text-on-surface block leading-tight truncate drop-shadow-md">${card.name}</span>
            <span class="font-tactical text-[9px] text-primary block mt-0.5">Livello ${card.level || 1}</span>
          </div>

          <!-- Statistiche in Basso -->
          <div class="flex justify-between items-center bg-black/60 backdrop-blur rounded px-2 py-1">
            <div class="flex items-center gap-1 text-error font-tactical font-bold text-xs">
              <span class="material-symbols-outlined text-[13px]">swords</span> ${card.attack}
            </div>
            <div class="flex items-center gap-1 text-secondary font-tactical font-bold text-xs">
              <span class="material-symbols-outlined text-[13px]">shield</span> ${card.defense}
            </div>
          </div>
        </div>

        <!-- CONTROLLI E FUSIONE -->
        ${!isDeckView ? `
          <div class="mt-2 flex flex-col gap-1.5">
            <!-- Barra Copie -->
            <div class="flex justify-between items-center font-tactical text-[10px]">
              <span class="text-on-surface-variant">Copie:</span>
              <span class="${canUpgrade ? 'text-[#4ade80] font-bold' : 'text-on-surface'}">${card.copies || 1}/${card.copiesNeeded || 3}</span>
            </div>

            ${canUpgrade ? `
              <button class="upgrade-card-btn w-full py-1.5 bg-[#4ade80] text-[#110d0a] font-tactical text-[10px] font-bold rounded shadow-lg active:scale-95 animate-pulse" data-id="${card.id}">
                FONDI (+1 STATS)
              </button>
            ` : ''}

            <button class="toggle-deck-btn w-full py-1.5 ${inDeckCount > 0 ? 'bg-secondary/20 border border-secondary text-secondary' : 'bg-surface-container-highest border border-outline-variant text-on-surface'} font-tactical text-[10px] font-bold rounded active:scale-95" data-id="${card.id}">
              ${inDeckCount > 0 ? `NEL MAZZO (${inDeckCount})` : '+ AGGIUNGI'}
            </button>
          </div>
        ` : `
          <button class="remove-deck-btn mt-2 w-full py-1.5 bg-error/20 border border-error/50 text-error font-tactical text-[10px] font-bold rounded active:scale-95" data-index="${deckIndex}">
            RIMUOVI
          </button>
        `}
      </div>
    `;
  }

  function renderCollectionList() {
    if (gameState.player.collection.length === 0) {
      return `<div class="col-span-2 text-center text-on-surface-variant py-12 font-body text-xs">Il tuo grimorio è vuoto. Ottieni carte nel Negozio!</div>`;
    }
    return gameState.player.collection.map(card => {
      const inDeckCount = gameState.player.deck.filter(id => id === card.id).length;
      return renderCardBox(card, inDeckCount, false);
    }).join('');
  }

  function renderDeckList() {
    if (gameState.player.deck.length === 0) {
      return `<div class="col-span-2 text-center text-on-surface-variant py-12 font-body text-xs">Nessuna carta nel mazzo. Aggiungine dalla Collezione!</div>`;
    }
    return gameState.player.deck.map((cardId, idx) => {
      const card = gameState.player.collection.find(c => c.id === cardId);
      if (!card) return '';
      return renderCardBox(card, 0, true, idx);
    }).join('');
  }

  updateUI();
  return container;
}