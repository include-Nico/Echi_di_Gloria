import { gameState } from '../state.js';

export function renderProfileModal() {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-[70] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none';
  
  const currentCost = 10 * Math.pow(2, gameState.player.nameChangeCount);
  const avatarArt = gameState.player.avatarCard ? gameState.player.avatarCard.art : 'https://image.pollinations.ai/prompt/dark%20fantasy%20warrior%20silhouette%20profile%20avatar?width=200&height=200&nologo=true';
  const stats = gameState.player.stats;
  const winRate = stats.matches > 0 ? Math.round((stats.wins / stats.matches) * 100) : 0;

  modal.innerHTML = `
    <div class="w-full max-w-sm bg-surface-container-low border border-outline-variant p-5 rounded-xl shadow-2xl flex flex-col gap-5">
      <div class="flex justify-between items-start border-b border-outline-variant pb-3">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full overflow-hidden border-2 border-primary shadow-[0_0_10px_rgba(242,202,80,0.4)] shrink-0">
            <img src="${avatarArt}" class="w-full h-full object-cover" />
          </div>
          <div>
            <h2 class="font-display font-bold text-lg text-primary tracking-wide" id="profileUsername">${gameState.player.username}</h2>
            <p class="font-tactical text-[10px] text-on-surface-variant uppercase">Guerriero del Sanctum</p>
          </div>
        </div>
        <button class="close-modal text-outline hover:text-error transition-colors"><span class="material-symbols-outlined">close</span></button>
      </div>

      <!-- Statistiche Battaglia -->
      <div class="grid grid-cols-3 gap-2 text-center bg-surface-container-highest/50 p-3 rounded-lg border border-outline-variant/30">
        <div class="flex flex-col">
          <span class="font-tactical text-lg text-on-surface font-bold">${stats.matches}</span>
          <span class="font-tactical text-[8px] text-outline-variant uppercase">Partite</span>
        </div>
        <div class="flex flex-col border-x border-outline-variant/30">
          <span class="font-tactical text-lg text-[#4ade80] font-bold">${stats.wins}</span>
          <span class="font-tactical text-[8px] text-outline-variant uppercase">Vittorie</span>
        </div>
        <div class="flex flex-col">
          <span class="font-tactical text-lg text-primary font-bold">${winRate}%</span>
          <span class="font-tactical text-[8px] text-outline-variant uppercase">Win Rate</span>
        </div>
      </div>

      <!-- Sezione Cambio Nome -->
      <div class="flex flex-col gap-2">
        <label class="font-tactical text-[11px] text-outline tracking-wider">MODIFICA NOME BATTAGLIA</label>
        <div class="flex gap-2">
          <input type="text" id="newNameInput" placeholder="Nuovo Nome" maxlength="20" class="flex-1 bg-surface-container-highest border border-outline-variant text-on-surface font-tactical text-sm p-2.5 rounded outline-none focus:border-primary transition-colors" />
          <button id="btnChangeName" class="bg-primary hover:bg-primary-fixed-dim text-[#110d0a] font-tactical font-bold text-xs px-3 rounded shadow flex items-center gap-1 active:scale-95 transition-all">
            <span class="material-symbols-outlined text-[14px]">diamond</span> ${currentCost}
          </button>
        </div>
        <span class="font-body text-[9px] text-error hidden" id="nameErrorMsg">Gemme insufficienti o nome non valido.</span>
      </div>

      <!-- Zona Pericolo -->
      <div class="mt-2 pt-4 border-t border-error/30 flex flex-col gap-3">
        <span class="font-tactical text-[11px] text-error tracking-wider flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">warning</span> ZONA DI SACRIFICIO</span>
        <button id="btnDeleteAccount" class="w-full py-3 bg-transparent border border-error text-error hover:bg-error/20 font-tactical font-bold text-xs rounded active:scale-95 transition-all flex justify-center items-center gap-2">
          <span class="material-symbols-outlined text-[16px]">delete_forever</span> ELIMINA ACCOUNT
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('.close-modal').onclick = () => modal.remove();

  modal.querySelector('#btnChangeName').onclick = () => {
    const input = modal.querySelector('#newNameInput');
    const err = modal.querySelector('#nameErrorMsg');
    const newName = input.value.trim();

    if (newName.length < 3) {
      err.textContent = "Il nome deve avere almeno 3 caratteri.";
      err.classList.remove('hidden');
      return;
    }

    if (gameState.currencies.gems >= currentCost) {
      gameState.currencies.gems -= currentCost;
      gameState.player.username = newName;
      gameState.player.nameChangeCount++;
      
      document.getElementById('gemsCount').textContent = gameState.currencies.gems;
      modal.querySelector('#profileUsername').textContent = newName;
      
      const nextCost = 10 * Math.pow(2, gameState.player.nameChangeCount);
      modal.querySelector('#btnChangeName').innerHTML = `<span class="material-symbols-outlined text-[14px]">diamond</span> ${nextCost}`;
      
      input.value = '';
      err.classList.add('hidden');
      
      const evt = new CustomEvent('toast', { detail: "Nome aggiornato con successo!" });
      window.dispatchEvent(evt);
    } else {
      err.textContent = "Gemme insufficienti.";
      err.classList.remove('hidden');
    }
  };

  modal.querySelector('#btnDeleteAccount').onclick = () => {
    if (confirm("Sei sicuro di voler eliminare la tua anima dal database?")) {
      localStorage.clear();
      window.location.reload();
    }
  };
}