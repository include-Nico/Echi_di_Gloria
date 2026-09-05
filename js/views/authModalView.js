import { callBackend, saveSession } from '../services/authService.js';
import { gameState } from '../state.js';

export function renderAuthModal(onSuccessCallback) {
  const existingModal = document.getElementById('authModal');
  if (existingModal) existingModal.remove();

  const container = document.createElement('div');
  container.id = 'authModal';
  container.className = 'fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md overflow-y-auto select-none';

  container.innerHTML = `
    <div class="relative w-full max-w-md bg-surface-container-low border border-outline-variant p-5 rounded-xl shadow-2xl flex flex-col gap-4 font-body text-on-surface my-auto">
      <!-- Header Modale -->
      <div class="flex items-center justify-between border-b border-outline-variant pb-3">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-2xl">shield_person</span>
          <div>
            <h2 id="authTitle" class="font-display font-bold text-base text-primary tracking-wide">REGISTRAZIONE GUERRIERO</h2>
            <p id="authSubtitle" class="font-tactical text-[11px] text-on-surface-variant">Forgia la tua Carta Avatar e accedi al Sanctum</p>
          </div>
        </div>
      </div>

      <!-- Step 1: Form Login / Registrazione -->
      <div id="authStepForm" class="flex flex-col gap-3">
        <!-- Campo Nome Battaglia -->
        <div id="usernameField" class="flex flex-col gap-1">
          <label class="text-[11px] text-on-surface-variant font-tactical tracking-wider">NOME DEL GUERRIERO</label>
          <input id="authUsername" type="text" placeholder="Es. Ragnar_IlRosso" maxlength="20" class="w-full bg-surface-container-lowest border border-outline-variant rounded px-3 py-2 text-sm text-on-surface outline-none focus:border-primary transition-colors" />
        </div>

        <!-- Faction Selector per Carta Avatar (visibile solo in Registrazione) -->
        <div id="factionSelectorField" class="flex flex-col gap-1.5">
          <div class="flex justify-between items-center">
            <label class="text-[11px] text-on-surface-variant font-tactical tracking-wider">SCEGLI LA TUA FAZIONE</label>
            <span id="factionBonusBadge" class="text-[10px] font-tactical text-primary font-bold">COSTO 3 • ATK 3 • DEF 2</span>
          </div>
          <div class="grid grid-cols-2 gap-2" id="factionButtonGroup">
            <button type="button" class="faction-opt p-2 rounded border border-primary bg-surface-container text-primary font-tactical text-xs font-bold text-left flex items-center justify-between" data-faction="Vichinghi" data-cost="3" data-atk="3" data-def="2" data-desc="+Attacco (Furia)">
              <span>❄️ Vichinghi</span>
              <span class="material-symbols-outlined text-xs">check_circle</span>
            </button>
            <button type="button" class="faction-opt p-2 rounded border border-outline-variant bg-surface-container-lowest text-on-surface-variant font-tactical text-xs font-bold text-left flex items-center justify-between" data-faction="Medioevo" data-cost="3" data-atk="2" data-def="4" data-desc="+Difesa (Scudo)">
              <span>🛡️ Medioevo</span>
              <span class="material-symbols-outlined text-xs hidden">check_circle</span>
            </button>
            <button type="button" class="faction-opt p-2 rounded border border-outline-variant bg-surface-container-lowest text-on-surface-variant font-tactical text-xs font-bold text-left flex items-center justify-between" data-faction="Giapponesi" data-cost="2" data-atk="3" data-def="1" data-desc="Attacco Rapido">
              <span>🗡️ Giapponesi</span>
              <span class="material-symbols-outlined text-xs hidden">check_circle</span>
            </button>
            <button type="button" class="faction-opt p-2 rounded border border-outline-variant bg-surface-container-lowest text-on-surface-variant font-tactical text-xs font-bold text-left flex items-center justify-between" data-faction="Nativi" data-cost="2" data-atk="2" data-def="2" data-desc="Spirito dei Totem">
              <span>🪶 Nativi</span>
              <span class="material-symbols-outlined text-xs hidden">check_circle</span>
            </button>
          </div>

          <!-- Card Preview Miniature -->
          <div id="avatarPreviewBox" class="flex items-center gap-3 bg-surface-container-lowest border border-outline-variant/60 p-2.5 rounded-lg mt-1">
            <div class="w-12 h-16 rounded overflow-hidden relative bg-surface-container-high shrink-0 border border-primary/40">
              <img id="avatarPreviewImg" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpiMSftlbBYWJIGEuY_7L4pvuxvz8QaCn04mqLYn3TaFbX8_hR1QDLKn0UCnf3n92Mti1LHwfU442UI72CbyPLAPdUHZ6Vzs5SzThWbO4_dX2T-1_CSvKljwp3pHzATMzDbDspV8cc1cx-0BHCSVHdZf7nPunoJYq_hpDhMVhnHrEV9X8tU3gSEkvrSFM9MjLbkINf9g8IfPHy1ZCPaZlDHH4l2Z3LrpsmYcVqhWlstpKBedpzuImWCA" alt="Avatar"/>
              <div id="avatarPreviewCost" class="absolute top-0 left-0 bg-surface-container-lowest/90 px-1 font-tactical text-[9px] text-secondary font-bold">3</div>
            </div>
            <div class="flex flex-col min-w-0 flex-1">
              <div class="flex items-center justify-between">
                <span id="avatarPreviewName" class="font-display font-bold text-xs text-primary truncate">Guerriero</span>
                <span class="font-tactical text-[9px] text-primary-fixed bg-surface-container px-1 rounded">CARTA UNICA</span>
              </div>
              <span id="avatarPreviewPerk" class="font-body text-[11px] text-on-surface-variant truncate mt-0.5">Sinergia: +Attacco (Furia)</span>
              <div class="flex items-center gap-2 mt-1 font-tactical text-[10px]">
                <span class="text-error font-bold flex items-center gap-0.5"><span class="material-symbols-outlined text-[10px]">swords</span> <span id="avatarPreviewAtk">3</span></span>
                <span class="text-secondary font-bold flex items-center gap-0.5"><span class="material-symbols-outlined text-[10px]">shield</span> <span id="avatarPreviewDef">2</span></span>
                <span class="text-outline text-[9px]">Livello 1</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Campo Email -->
        <div class="flex flex-col gap-1">
          <label class="text-[11px] text-on-surface-variant font-tactical tracking-wider">EMAIL PER CONFERMA SIGILLO</label>
          <input id="authEmail" type="email" placeholder="combattente@gmail.com" class="w-full bg-surface-container-lowest border border-outline-variant rounded px-3 py-2 text-sm text-on-surface outline-none focus:border-primary transition-colors" />
        </div>

        <!-- Campo Password -->
        <div class="flex flex-col gap-1">
          <label class="text-[11px] text-on-surface-variant font-tactical tracking-wider">PAROLA D'ORDINE (PASSWORD)</label>
          <input id="authPassword" type="password" placeholder="••••••••" class="w-full bg-surface-container-lowest border border-outline-variant rounded px-3 py-2 text-sm text-on-surface outline-none focus:border-primary transition-colors" />
        </div>

        <!-- Pulsante Principale -->
        <button id="btnPrimaryAuth" class="w-full mt-2 bg-primary hover:bg-primary-fixed-dim text-on-primary font-tactical font-bold py-2.5 rounded shadow-lg active:scale-95 transition-all">
          CONSACRA AVATAR E INVIA CODICE
        </button>

        <!-- Switch Modalità -->
        <button id="btnToggleAuthMode" type="button" class="text-xs text-on-surface-variant hover:text-primary transition-colors mt-1 underline text-center">
          Hai già un grimorio? Accedi al tuo account
        </button>
      </div>

      <!-- Step 2: Inserimento Codice OTP inviato via Email -->
      <div id="authStepOTP" class="hidden flex flex-col gap-3 text-center">
        <div class="flex justify-center">
          <span class="material-symbols-outlined text-4xl text-secondary animate-pulse">mark_email_read</span>
        </div>
        <div class="flex flex-col gap-1">
          <span class="font-display font-bold text-sm text-on-surface">INSERISCI IL CODICE DI CONFERMA</span>
          <p class="text-xs text-on-surface-variant">Abbiamo inviato un sigillo runico a 6 cifre all'indirizzo indicato.</p>
        </div>

        <input id="authOtpInput" type="text" maxlength="6" inputmode="numeric" placeholder="000000" class="text-center font-tactical tracking-widest text-2xl bg-surface-container-lowest border border-primary rounded py-2.5 text-primary outline-none focus:ring-1 focus:ring-primary" />

        <button id="btnVerifyOTP" class="w-full bg-primary hover:bg-primary-fixed-dim text-on-primary font-tactical font-bold py-2.5 rounded shadow-lg active:scale-95 transition-all">
          VERIFICA E ACCEDI ALL'ARENA
        </button>

        <button id="btnBackToForm" type="button" class="text-xs text-outline hover:text-on-surface transition-colors underline">
          Modifica email o reinvia codice
        </button>
      </div>

      <!-- Banner Errore / Feedback -->
      <div id="authErrorMsg" class="hidden text-xs text-error text-center font-tactical bg-error-container/40 border border-error/50 py-2 px-3 rounded"></div>
    </div>
  `;

  document.body.appendChild(container);

  // LOGICA E INTERAZIONI FORM
  let isRegisterMode = true;
  let selectedFaction = "Vichinghi";

  const titleEl = container.querySelector('#authTitle');
  const subtitleEl = container.querySelector('#authSubtitle');
  const userFieldEl = container.querySelector('#usernameField');
  const factionFieldEl = container.querySelector('#factionSelectorField');
  const btnPrimary = container.querySelector('#btnPrimaryAuth');
  const btnToggle = container.querySelector('#btnToggleAuthMode');
  const btnBack = container.querySelector('#btnBackToForm');
  const stepForm = container.querySelector('#authStepForm');
  const stepOTP = container.querySelector('#authStepOTP');
  const errorMsg = container.querySelector('#authErrorMsg');

  // Preview elements
  const inputUsername = container.querySelector('#authUsername');
  const previewName = container.querySelector('#avatarPreviewName');
  const previewImg = container.querySelector('#avatarPreviewImg');
  const previewCost = container.querySelector('#avatarPreviewCost');
  const previewAtk = container.querySelector('#avatarPreviewAtk');
  const previewDef = container.querySelector('#avatarPreviewDef');
  const previewPerk = container.querySelector('#avatarPreviewPerk');
  const factionBadge = container.querySelector('#factionBonusBadge');

  const factionArts = {
    "Vichinghi": "https://lh3.googleusercontent.com/aida-public/AB6AXuDpiMSftlbBYWJIGEuY_7L4pvuxvz8QaCn04mqLYn3TaFbX8_hR1QDLKn0UCnf3n92Mti1LHwfU442UI72CbyPLAPdUHZ6Vzs5SzThWbO4_dX2T-1_CSvKljwp3pHzATMzDbDspV8cc1cx-0BHCSVHdZf7nPunoJYq_hpDhMVhnHrEV9X8tU3gSEkvrSFM9MjLbkINf9g8IfPHy1ZCPaZlDHH4l2Z3LrpsmYcVqhWlstpKBedpzuImWCA",
    "Medioevo": "https://lh3.googleusercontent.com/aida-public/AB6AXuA0C5LMqAmqkr4WDknoWSJE0Cz__qdsbRDLa0i922VXOS9OmCdwOwV_HwU5yO_Cr9H0QlMd7n-9yeoik0liA6cSLM1qF_CQq5coJGS7B4tJZixvDiJys1IGbpDCz9nFmU48whiKd14Qd6wKF0eUcbM_8b8CjHYHOEHpM37MRZutv5_-W-M7DKfiUietsGeuezdPbaMbcy4U9Yo4aac3E0YfOd7O3Uk500C39-vEOI8Wsi-7QwKH54_XgQ",
    "Giapponesi": "https://lh3.googleusercontent.com/aida-public/AB6AXuC38-XIFKSVChpxmXZg0keFEMKjRKGWwtPM9oBYh4VVJq-dJ0c4q1-vU3iwPkX1d4nl2RoKCPuBS3aTJiNNpqhub8xOJRpzp6ITu0T7o3VN1fmfrvKm_AfKqcjD7vzHQHcq7Y-_3ji1tLbbke98NFHQYgnHNYoY_6ECDKny6DnSsyGhpTA3oJZaAsaTFoLu1S9Q_kamI6Z8ILSRk0gEnn4Ebap6442kzSdJ-4C6k9YrrMQw7X7-P0G-7w",
    "Nativi": "https://lh3.googleusercontent.com/aida-public/AB6AXuD_r7cYtNiag3ya5OawcWvIKXMBN00-bi-PHXio5_Ev2yCMSw3PN5-xFRsqe6uDbcH-Y42j3DHYbuzlgZJIGn5pSCheQxMoWNoUwe4izfwhoJnHaZeZOkKJ-olqPkKpF7QEkQ451N2eVRxveQWkEDqlr8PqxyHO1bnsKOlT3ooZi7byjObfyvzSDbssDcaI_21b3XgV0dfregHf7XkAYT2NsdTetCpn4o6FyubTtYFxGTtv9djLwUYzNg"
  };

  inputUsername.addEventListener('input', (e) => {
    previewName.textContent = e.target.value.trim() || "Guerriero";
  });

  // Gestione click selezione fazione
  container.querySelectorAll('.faction-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.faction-opt').forEach(b => {
        b.className = 'faction-opt p-2 rounded border border-outline-variant bg-surface-container-lowest text-on-surface-variant font-tactical text-xs font-bold text-left flex items-center justify-between';
        b.querySelector('.material-symbols-outlined').classList.add('hidden');
      });

      btn.className = 'faction-opt p-2 rounded border border-primary bg-surface-container text-primary font-tactical text-xs font-bold text-left flex items-center justify-between';
      btn.querySelector('.material-symbols-outlined').classList.remove('hidden');

      selectedFaction = btn.dataset.faction;
      const cost = btn.dataset.cost;
      const atk = btn.dataset.atk;
      const def = btn.dataset.def;
      const desc = btn.dataset.desc;

      factionBadge.textContent = `COSTO ${cost} • ATK ${atk} • DEF ${def}`;
      previewCost.textContent = cost;
      previewAtk.textContent = atk;
      previewDef.textContent = def;
      previewPerk.textContent = `Sinergia: ${desc}`;
      previewImg.src = factionArts[selectedFaction];
    });
  });

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.remove('hidden');
  }

  btnToggle.addEventListener('click', () => {
    isRegisterMode = !isRegisterMode;
    errorMsg.classList.add('hidden');

    if (isRegisterMode) {
      titleEl.textContent = "REGISTRAZIONE GUERRIERO";
      subtitleEl.textContent = "Forgia la tua Carta Avatar e accedi al Sanctum";
      userFieldEl.classList.remove('hidden');
      factionFieldEl.classList.remove('hidden');
      btnPrimary.textContent = "CONSACRA AVATAR E INVIA CODICE";
      btnToggle.textContent = "Hai già un grimorio? Accedi al tuo account";
    } else {
      titleEl.textContent = "ACCESSO AL REGNO";
      subtitleEl.textContent = "Inserisci le tue credenziali per rientrare in battaglia";
      userFieldEl.classList.add('hidden');
      factionFieldEl.classList.add('hidden');
      btnPrimary.textContent = "ACCEDI ALL'ARENA";
      btnToggle.textContent = "Nuovo combattente? Registrati e crea la tua carta";
    }
  });

  btnBack.addEventListener('click', () => {
    stepOTP.classList.add('hidden');
    stepForm.classList.remove('hidden');
    errorMsg.classList.add('hidden');
  });

  // Invio Form Iniziale (Registrazione o Login)
  btnPrimary.addEventListener('click', async () => {
    const email = container.querySelector('#authEmail').value.trim();
    const pass = container.querySelector('#authPassword').value.trim();
    const username = inputUsername.value.trim();

    errorMsg.classList.add('hidden');

    if (!email || !pass || (isRegisterMode && !username)) {
      showError("Compila tutti i campi richiesti.");
      return;
    }

    btnPrimary.disabled = true;
    btnPrimary.textContent = "Contattando il Sanctum...";

    if (isRegisterMode) {
      const res = await callBackend({
        action: "REGISTER_REQUEST",
        email,
        username,
        password: pass,
        faction: selectedFaction
      });

      btnPrimary.disabled = false;
      btnPrimary.textContent = "CONSACRA AVATAR E INVIA CODICE";

      if (res.success) {
        stepForm.classList.add('hidden');
        stepOTP.classList.remove('hidden');
      } else {
        showError(res.message || "Impossibile registrare il guerriero.");
      }
    } else {
      const res = await callBackend({
        action: "LOGIN",
        email,
        password: pass
      });

      btnPrimary.disabled = false;
      btnPrimary.textContent = "ACCEDI ALL'ARENA";

      if (res.success) {
        saveSession(res.user, res.token);
        gameState.currencies.silver = res.user.silver;
        gameState.currencies.gems = res.user.gems;
        gameState.player.avatarCard = res.user.playerCard;
        container.remove();
        if (onSuccessCallback) onSuccessCallback(res.user);
      } else if (res.requireVerification) {
        stepForm.classList.add('hidden');
        stepOTP.classList.remove('hidden');
      } else {
        showError(res.message || "Credenziali errate.");
      }
    }
  });

  // Conferma OTP a 6 cifre
  container.querySelector('#btnVerifyOTP').addEventListener('click', async () => {
    const email = container.querySelector('#authEmail').value.trim();
    const code = container.querySelector('#authOtpInput').value.trim();
    const btnVerify = container.querySelector('#btnVerifyOTP');

    if (code.length !== 6) {
      showError("Inserisci tutte le 6 cifre del codice.");
      return;
    }

    btnVerify.disabled = true;
    btnVerify.textContent = "Verifica del sigillo...";

    const res = await callBackend({
      action: "VERIFY_CODE",
      email,
      code
    });

    btnVerify.disabled = false;
    btnVerify.textContent = "VERIFICA E ACCEDI ALL'ARENA";

    if (res.success) {
      saveSession(res.user, res.token);
      gameState.currencies.silver = res.user.silver;
      gameState.currencies.gems = res.user.gems;
      gameState.player.avatarCard = res.user.playerCard;
      container.remove();
      if (onSuccessCallback) onSuccessCallback(res.user);
    } else {
      showError(res.message || "Codice non valido o scaduto.");
    }
  });
}