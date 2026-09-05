import { gameState } from '../state.js';

export function renderQuestsModal() {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-[70] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none';
  
  const quests = gameState.quests;

  modal.innerHTML = `
    <div class="w-full max-w-md bg-surface-container border border-outline-variant p-5 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] flex flex-col gap-4 max-h-[90vh] overflow-y-auto no-scrollbar">
      <div class="flex justify-between items-start border-b border-outline-variant pb-3 sticky top-0 bg-surface-container z-10">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-2xl">assignment</span>
          <div>
            <h2 class="font-display font-bold text-lg text-primary tracking-wide">REGISTRO MISSIONI</h2>
            <p class="font-tactical text-[10px] text-on-surface-variant uppercase">Ricompense dell'Arena</p>
          </div>
        </div>
        <button class="close-modal text-outline hover:text-on-surface transition-colors"><span class="material-symbols-outlined">close</span></button>
      </div>

      <!-- Presenza al Sanctum (Login) -->
      <div class="flex flex-col bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-3 shadow-md gap-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1">
            <span class="material-symbols-outlined text-primary text-[18px]">calendar_today</span>
            <span class="font-display font-bold text-sm text-on-surface">Accesso Giornaliero</span>
          </div>
          <span class="font-tactical text-[10px] text-primary font-bold">Giorno ${quests.loginStreak} / 7</span>
        </div>
        
        <div class="grid grid-cols-7 gap-1 w-full mt-1">
          ${[1,2,3,4,5,6,7].map(day => `
            <div class="h-10 rounded ${day < quests.loginStreak ? 'bg-surface-container-highest opacity-50' : (day === quests.loginStreak ? 'bg-primary text-on-primary shadow-[0_0_8px_rgba(242,202,80,0.5)]' : 'bg-surface-container-high')} flex flex-col items-center justify-center relative">
              ${day === 7 ? '<span class="material-symbols-outlined text-[14px]">stars</span>' : `<span class="font-tactical text-[10px] ${day === quests.loginStreak ? 'font-bold' : ''}">${day === 4 ? '<span class="material-symbols-outlined text-[12px]">style</span>' : (day * 10)}</span>`}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Sfide del Giorno -->
      <div class="flex flex-col gap-2 mt-2">
        <span class="font-tactical text-[11px] text-secondary tracking-widest border-b border-secondary/30 pb-1">SFIDE DEL GIORNO</span>
        ${quests.daily.map(q => renderQuestItem(q)).join('')}
      </div>

      <!-- Missioni Settimanali -->
      <div class="flex flex-col gap-2 mt-2">
        <span class="font-tactical text-[11px] text-tertiary tracking-widest border-b border-tertiary/30 pb-1">MISSIONI SETTIMANALI</span>
        ${quests.weekly.map(q => renderQuestItem(q)).join('')}
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.querySelector('.close-modal').onclick = () => modal.remove();

  function renderQuestItem(q) {
    const percent = Math.min(100, (q.progress / q.target) * 100);
    const isDone = q.completed || percent === 100;
    
    return `
      <div class="flex items-center gap-3 bg-surface-container-low border border-outline-variant/30 p-2.5 rounded-lg ${isDone ? 'opacity-60 grayscale' : ''}">
        <div class="w-10 h-10 rounded-full ${isDone ? 'bg-primary/20 text-primary' : 'bg-surface-container-highest text-outline'} flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-[20px]">${isDone ? 'done_all' : 'flag'}</span>
        </div>
        <div class="flex flex-col flex-1">
          <span class="font-tactical text-[11px] font-bold text-on-surface leading-tight">${q.title}</span>
          <span class="font-body text-[9px] text-primary mt-0.5">Premio: ${q.reward}</span>
          
          <div class="flex items-center gap-2 mt-1.5">
            <div class="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
              <div class="h-full bg-secondary" style="width: ${percent}%;"></div>
            </div>
            <span class="font-tactical text-[9px] text-on-surface-variant shrink-0">${q.progress}/${q.target}</span>
          </div>
        </div>
      </div>
    `;
  }
}