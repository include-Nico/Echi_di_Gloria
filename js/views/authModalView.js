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
      <div class="flex items-center justify-between border-b border-outline-variant pb-3">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-2xl">shield_person</span>
          <div>
            <h2 id="authTitle" class="font-display font-bold text-base text-primary tracking-wide">REGISTRAZIONE GUERRIERO</h2>
            <p id="authSubtitle" class="font-tactical text-[11px] text-on-surface-variant">Forgia la tua Carta Avatar e accedi al Sanctum</p>
          </div>
        </div>
      </div>

      <div id="authStepForm" class="flex flex-col gap-3">
        <div id="usernameField" class="flex flex-col gap-1">
          <label class="text-[11px] text-on-surface-variant font-tactical tracking-wider">NOME DEL GUERRIERO</label>
          <input id="authUsername" type="text" placeholder="Es. Ragnar_IlRosso" maxlength="20" class="w-full bg-surface-container-lowest border border-outline-variant rounded px-3 py-2 text-sm text-on-surface outline-none focus:border-primary transition-colors" />
        </div>

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

          <div id="genderSelectorField" class="flex flex-col gap-1 mt-1">
            <label class="text-[11px] text-on-surface-variant font-tactical tracking-wider">GENERE AVATAR</label>
            <div class="flex gap-2">
              <button type="button" class="gender-opt flex-1 p-2 rounded border border-primary bg-surface-container text-primary font-tactical text-xs font-bold transition-all" data-gender="Uomo">Uomo</button>
              <button type="button" class="gender-opt flex-1 p-2 rounded border border-outline-variant bg-surface-container-lowest text-on-surface-variant font-tactical text-xs font-bold transition-all" data-gender="Donna">Donna</button>
            </div>
          </div>

          <div id="avatarPreviewBox" class="flex items-center gap-3 bg-surface-container-lowest border border-outline-variant/60 p-2.5 rounded-lg mt-1">
            <div class="w-12 h-16 rounded overflow-hidden relative bg-surface-container-high shrink-0 border border-primary/40">
              <img id="avatarPreviewImg" class="w-full h-full object-cover" src="https://image.pollinations.ai/prompt/dark%20fantasy%20male%20viking%20warrior%20portrait%20card%20art?width=400&height=560&nologo=true" alt="Avatar"/>
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

        <div class="flex flex-col gap-1">
          <label class="text-[11px] text-on-surface-variant font-tactical tracking-wider">EMAIL PER CONFERMA SIGILLO</label>
          <input id="authEmail" type="email" placeholder="combattente@gmail.com" class="w-full bg-surface-container-lowest border border-outline-variant rounded px-3 py-2 text-sm text-on-surface outline-none focus:border-primary transition-colors" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-[11px] text-on-surface-variant font-tactical tracking-wider">PAROLA D'ORDINE (PASSWORD)</label>
          <input id="authPassword" type="password" placeholder="••••••••" class="w-full bg-surface-container-lowest border border-outline-variant rounded px-3 py-2 text-sm text-on-surface outline-none focus:border-primary transition-colors" />
        </div>

        <button id="btnPrimaryAuth" class="w-full mt-2 bg-primary hover:bg-primary-fixed-dim text-on-primary font-tactical font-bold py-2.5 rounded shadow-lg active:scale-95 transition-all">
          CONSACRA AVATAR E INVIA CODICE
        </button>

        <button id="btnToggleAuthMode" type="button" class="text-xs text-on-surface-variant hover:text-primary transition-colors mt-1 underline text-center">
          Hai già un grimorio? Accedi al tuo account
        </button>
      </div>

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

      <div id="authErrorMsg" class="hidden text-xs text-error text-center font-tactical bg-error-container/40 border border-error/50 py-2 px-3 rounded"></div>
    </div>
  `;

  document.body.appendChild(container);

  let isRegisterMode = true;
  let selectedFaction = "Vichinghi";
  let selectedGender = "Uomo";

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

  const inputUsername = container.querySelector('#authUsername');
  const previewName = container.querySelector('#avatarPreviewName');
  const previewImg = container.querySelector('#avatarPreviewImg');
  const previewCost = container.querySelector('#avatarPreviewCost');
  const previewAtk = container.querySelector('#avatarPreviewAtk');
  const previewDef = container.querySelector('#avatarPreviewDef');
  const previewPerk = container.querySelector('#avatarPreviewPerk');
  const factionBadge = container.querySelector('#factionBonusBadge');

  const avatarArts = {
    "Vichinghi": {
      "Uomo": "https://image.pollinations.ai/prompt/dark%20fantasy%20male%20viking%20warrior%20portrait%20card%20art?width=400&height=560&nologo=true",
      "Donna": "https://image.pollinations.ai/prompt/dark%20fantasy%20female%20viking%20shieldmaiden%20portrait%20card%20art?width=400&height=560&nologo=true"
    },
    "Medioevo": {
      "Uomo": "https://image.pollinations.ai/prompt/dark%20fantasy%20male%20medieval%20crusader%20knight%20portrait?width=400&height=560&nologo=true",
      "Donna": "https://image.pollinations.ai/prompt/dark%20fantasy%20female%20medieval%20knight%20paladin%20portrait?width=400&height=560&nologo=true"
    },
    "Giapponesi": {
      "Uomo": "https://image.pollinations.ai/prompt/dark%20fantasy%20male%20samurai%20ronin%20portrait%20card%20art?width=400&height=560&nologo=true",
      "Donna": "https://image.pollinations.ai/prompt/dark%20fantasy%20female%20samurai%20onna-musha%20portrait?width=400&height=560&nologo=true"
    },
    "Nativi": {
      "Uomo": "https://image.pollinations.ai/prompt/dark%20fantasy%20male%20native%20american%20tribal%20chief%20portrait?width=400&height=560&nologo=true",
      "Donna": "https://image.pollinations.ai/prompt/dark%20fantasy%20female%20native%20american%20shaman%20portrait?width=400&height=560&nologo=true"
    }
  };

  function updatePreview() {
    previewImg.src = avatarArts[selectedFaction][selectedGender];
  }

  inputUsername.addEventListener('input', (e) => {
    previewName.textContent = e.target.value.trim() || "Guerriero";
  });

  container.querySelectorAll('.gender-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.gender-opt').forEach(b => b.className = 'gender-opt flex-1 p-2 rounded border border-outline-variant bg-surface-container-lowest text-on-surface-variant font-tactical text-xs font-bold transition-all');
      btn.className = 'gender-opt flex-1 p-2 rounded border border-primary bg-surface-container text-primary font-tactical text-xs font-bold transition-all';
      selectedGender = btn.dataset.gender;
      updatePreview();
    });
  });

  container.querySelectorAll('.faction-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.faction-opt').forEach(b => {
        b.className = 'faction-opt p-2 rounded border border-outline-variant bg-surface-container-lowest text-on-surface-variant font-tactical text-xs font-bold text-left flex items-center justify-between';
        b.querySelector('.material-symbols-outlined').classList.add('hidden');
      });

      btn.className = 'faction-opt p-2 rounded border border-primary bg-surface-container text-primary font-tactical text-xs font-bold text-left flex items-center justify-between';
      btn.querySelector('.material-symbols-outlined').classList.remove('hidden');

      selectedFaction = btn.dataset.faction;
      factionBadge.textContent = `COSTO ${btn.dataset.cost} • ATK ${btn.dataset.atk} • DEF ${btn.dataset.def}`;
      previewCost.textContent = btn.dataset.cost;
      previewAtk.textContent = btn.dataset.atk;
      previewDef.textContent = btn.dataset.def;
      previewPerk.textContent = `Sinergia: ${btn.dataset.desc}`;
      updatePreview();
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
        faction: selectedFaction,
        gender: selectedGender
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