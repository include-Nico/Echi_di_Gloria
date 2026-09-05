export function renderCampaign() {
  const container = document.createElement('div');
  container.className = 'flex flex-col w-full pb-12 px-3 pt-4 gap-4 select-none';

  container.innerHTML = `
    <!-- Header Campagna -->
    <div class="relative overflow-hidden rounded-xl bg-surface-container-high shadow-xl p-4 flex flex-col gap-1">
      <div class="absolute -right-6 -bottom-6 opacity-10 pointer-events-none text-primary">
        <span class="material-symbols-outlined text-[120px]" style="font-variation-settings: 'FILL' 1;">military_tech</span>
      </div>
      <div class="flex items-center gap-1 z-10">
        <span class="material-symbols-outlined text-primary text-sm" style="font-variation-settings: 'FILL' 1;">auto_stories</span>
        <span class="font-tactical text-[10px] text-primary tracking-widest uppercase">Cronache degli Imperi</span>
      </div>
      <h1 class="font-display font-bold text-xl text-on-surface tracking-wide z-10">Campagna delle 4 Ere</h1>
      
      <div class="mt-2 pt-2 flex flex-col gap-1 z-10">
        <div class="flex justify-between items-center">
          <span class="font-tactical text-[10px] text-on-surface">Progresso Globale</span>
          <span class="font-tactical text-[10px] text-primary">17 / 40 Conquiste</span>
        </div>
        <div class="h-1.5 w-full bg-surface-container-lowest rounded-full overflow-hidden flex">
          <div class="h-full bg-primary rounded-full" style="width: 42.5%;"></div>
        </div>
      </div>
    </div>

    <!-- Carosello Capitoli -->
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <span class="font-display font-bold text-sm text-on-surface tracking-wide">I Quattro Regni</span>
        <span class="font-tactical text-[9px] text-on-surface-variant">Scorri per esplorare</span>
      </div>
      
      <div class="flex gap-2 overflow-x-auto py-1 -mx-3 px-3 snap-x snap-mandatory no-scrollbar">
        <!-- Capitolo 1: Completato -->
        <div class="snap-center shrink-0 w-60 rounded-xl bg-surface-container-low shadow-md overflow-hidden relative opacity-80">
          <div class="h-24 w-full bg-cover bg-center relative" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCyDLB4VB9HCmbKjd0ad0_KtpRtqWH7BnAliMV9jk94sLEWNdbR_z1y3y4oImOlTUX2OpBI0IMwY5wz_fVl9cPxpfmL_0FhduS-qViQdA9RTBlYYqOhh45tQno2_g_360omYkXNWq0iRfkf010mrxkXGYsBvb5EPbGkbprUc8HSeWPRd-iEaL3TdemlyEKT-tXD9vBGk2Lr3rFn4MjHw4sc8GXb-C0JvCdqIk2vygiU47eTEi0LtjaFoA')">
            <div class="absolute inset-0 bg-gradient-to-t from-surface-container-low to-transparent"></div>
            <div class="absolute top-2 right-2 bg-surface-container-lowest/90 px-1.5 py-0.5 rounded flex items-center gap-1">
              <span class="material-symbols-outlined text-primary text-[12px]" style="font-variation-settings: 'FILL' 1;">workspace_premium</span>
              <span class="font-tactical text-[9px] text-primary">10/10</span>
            </div>
          </div>
          <div class="p-2 flex flex-col">
            <span class="font-tactical text-[9px] text-secondary uppercase">Capitolo 1</span>
            <h3 class="font-display font-bold text-xs text-on-surface truncate">Le Rupi dei Vichinghi</h3>
          </div>
        </div>

        <!-- Capitolo 2: Attivo -->
        <div class="snap-center shrink-0 w-60 rounded-xl bg-surface-container-high shadow-xl overflow-hidden relative ring-1 ring-primary">
          <div class="h-24 w-full bg-cover bg-center relative" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCycQOE7SZgvCT--F3pniLJA2s_zXwPM925xlsQ98A_1xrhx744RXX2L-hCw3nXuewgm3o6jg7hFrZ28Ejp07TfnQEn77xtEPQAB9RpCNTH9UYu7i7FY81qFqyFVx3p9iMqPM-GvEDk1Of7OpbsTvdQo6bqc8NJeD5945Kbi2m5de4f5pUYyBKK4c3jx7to_3EAFYy66airTsjZOIFplvpeBaAEzUINs_byDi8GrLAOQGEYIzNoUE72Cw')">
            <div class="absolute inset-0 bg-gradient-to-t from-surface-container-high to-transparent"></div>
            <div class="absolute top-2 left-2 bg-primary text-on-primary px-1.5 py-0.5 rounded font-tactical text-[9px] uppercase">In Corso</div>
            <div class="absolute top-2 right-2 bg-surface-container-lowest/90 px-1.5 py-0.5 rounded flex items-center gap-1">
              <span class="material-symbols-outlined text-primary text-[12px]">swords</span>
              <span class="font-tactical text-[9px] text-on-surface">Liv. 7/10</span>
            </div>
          </div>
          <div class="p-2 flex flex-col">
            <span class="font-tactical text-[9px] text-primary uppercase">Capitolo 2 • Medioevo</span>
            <h3 class="font-display font-bold text-xs text-primary truncate">La Crociata delle Cattedrali</h3>
          </div>
        </div>
        
        <!-- Capitolo 3: Bloccato -->
        <div class="snap-center shrink-0 w-60 rounded-xl bg-surface-container-lowest opacity-75 shadow-md overflow-hidden relative">
          <div class="h-24 w-full bg-cover bg-center relative grayscale contrast-125" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCeJD4v9UqKdx2or-9aWlXtUcQsb9haap9ZWf07f3NhAfX5QVH2KeJ5NSEJ8mAkrlPgcpADMPRUE7niv7urGh8kl5pPMjZcLX8QDchEOwdNStfvipAVUYgCHWeexUXfm3sTR6BiBulaIdrLdJNYyAQDJNv-rthvvZY07qKYrH_fEjuU9C3u5w7TXsxyJ-0x65qhZ5eUsOLEK8vX97g-BpbtF_z9hP7ByFtTCBiXJilEPHtzXX_jl_JmEg')">
            <div class="absolute inset-0 bg-surface-container-lowest/70 flex items-center justify-center">
              <div class="bg-surface-container-high/90 p-1.5 rounded-full shadow"><span class="material-symbols-outlined text-outline text-[18px]">lock</span></div>
            </div>
          </div>
          <div class="p-2 flex flex-col">
            <span class="font-tactical text-[9px] text-outline uppercase">Capitolo 3 • Giapponesi</span>
            <h3 class="font-display font-bold text-xs text-on-surface-variant truncate">L'Onore dello Shogun</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- Dossier Boss Attivo -->
    <div class="relative rounded-xl bg-surface-container shadow-xl overflow-hidden flex flex-col mt-2">
      <div class="relative h-40 w-full bg-cover bg-center" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBcKqGKRNdih4zkbGx4btkr5paX12i8_UYqFmZAcFxWp-2IFae0uhFDlz7m5swU--Y1ZunWb17CPRIM1dZBlG0RtWuTqG_6EZQ4nOqSdlEpp3rpkHgaXenqKuLfddENWH_89Bf3AuJ9e9vFDtrYSCJfeNqdLw5Vq7WhVP-v-P0S8erGZAEkGJT-mi3M6nR9_Z1yqUOcA3KAOeveU4Wds1uXfRbuAgn35U7La2fOUW0IEj64LkRjR_vb7g')">
        <div class="absolute inset-0 bg-gradient-to-t from-surface-container to-transparent"></div>
        <div class="absolute top-2 left-2 flex gap-1">
          <span class="bg-error-container/90 text-on-error-container font-tactical text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1"><span class="material-symbols-outlined text-[10px]">warning</span> Difficile</span>
        </div>
        <div class="absolute bottom-2 left-2 right-2 flex justify-between items-end">
          <div class="flex flex-col">
            <span class="font-tactical text-[9px] text-primary uppercase">Custode del Santuario</span>
            <h2 class="font-display font-bold text-base text-on-surface leading-tight">Inquisitore Baldwin</h2>
          </div>
          <div class="flex items-center gap-1 bg-surface-container-lowest/90 px-2 py-1 rounded shadow">
            <span class="material-symbols-outlined text-error text-[14px]" style="font-variation-settings: 'FILL' 1;">favorite</span>
            <span class="font-tactical text-sm text-on-surface">35 <span class="text-[9px] font-normal">PV</span></span>
          </div>
        </div>
      </div>
      
      <div class="p-3 flex flex-col gap-3">
        <div class="bg-surface-container-low p-2 rounded-lg flex flex-col gap-1">
          <div class="flex items-center gap-1 text-primary">
            <span class="material-symbols-outlined text-[14px]">psychology</span>
            <span class="font-tactical text-[10px] uppercase">Tattica IA</span>
          </div>
          <p class="font-body text-[10px] text-on-surface-variant leading-relaxed">
            Sfrutta attivamente le sinergie <strong class="text-primary font-bold">Scudo Sacro & Benedizione</strong>. Rafforza i templari in retroguardia.
          </p>
        </div>

        <button id="startBossMatchBtn" class="w-full relative overflow-hidden bg-primary hover:bg-primary-fixed-dim text-on-primary font-tactical font-bold py-3 rounded-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
          <span class="material-symbols-outlined text-[18px]">swords</span>
          <span class="tracking-wider">SFIDA IL LIVELLO 7</span>
        </button>
      </div>
    </div>
  `;

  container.querySelector('#startBossMatchBtn').addEventListener('click', () => {
    // Simula transizione verso l'Arena contro il Bot
    window.navigate('arena');
  });

  return container;
}