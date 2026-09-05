import { callBackend, saveSession } from '../services/authService.js';
import { gameState } from '../state.js';

export function renderAuthModal(onSuccessCallback) {
  const container = document.createElement('div');
  container.id = 'authModal';
  container.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md';

  container.innerHTML = `
    <div class="relative w-full max-w-sm bg-[#1f1b17] border border-[#4d4635] p-6 rounded-xl shadow-2xl flex flex-col gap-4 font-body text-on-surface">
      <div class="flex items-center justify-between border-b border-[#4d4635] pb-3">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[#f2ca50]">shield_person</span>
          <h2 id="authTitle" class="font-display font-bold text-lg text-[#f2ca50]">ACCESSO GUERRIERO</h2>
        </div>
      </div>

      <!-- Step 1: Login / Register Form -->
      <div id="authStepForm" class="flex flex-col gap-3">
        <div id="usernameField" class="flex flex-col gap-1">
          <label class="text-xs text-[#d0c5af] font-tactical">NOME BATTAGLIA</label>
          <input id="authUsername" type="text" placeholder="GuerrieroDelNord" class="w-full bg-[#110d0a] border border-[#4d4635] rounded px-3 py-2 text-sm text-on-surface outline-none focus:border-[#f2ca50]" />
        </div>
        
        <div class="flex flex-col gap-1">
          <label class="text-xs text-[#d0c5af] font-tactical">EMAIL PER VERIFICA</label>
          <input id="authEmail" type="email" placeholder="guerriero@gmail.com" class="w-full bg-[#110d0a] border border-[#4d4635] rounded px-3 py-2 text-sm text-on-surface outline-none focus:border-[#f2ca50]" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs text-[#d0c5af] font-tactical">PASSWORD</label>
          <input id="authPassword" type="password" placeholder="••••••••" class="w-full bg-[#110d0a] border border-[#4d4635] rounded px-3 py-2 text-sm text-on-surface outline-none focus:border-[#f2ca50]" />
        </div>

        <button id="btnPrimaryAuth" class="w-full mt-2 bg-[#f2ca50] text-[#3c2f00] font-tactical font-bold py-2.5 rounded shadow-lg hover:brightness-110 active:scale-95 transition-all">
          REGISTRATI E INVIA CODICE
        </button>

        <button id="btnToggleAuthMode" class="text-xs text-[#d0c5af] hover:text-[#f2ca50] transition-colors mt-1 underline">
          Hai già un account? Accedi qui
        </button>
      </div>

      <!-- Step 2: Inserimento Codice OTP inviato via email -->
      <div id="authStepOTP" class="hidden flex flex-col gap-3 text-center">
        <span class="material-symbols-outlined text-4xl text-[#bdf4ff]">mark_email_read</span>
        <p class="text-xs text-[#d0c5af]">Abbiamo inviato un sigillo a 6 cifre al tuo indirizzo email. Inseriscilo qui sotto:</p>
        <input id="authOtpInput" type="text" maxlength="6" placeholder="000000" class="text-center font-tactical tracking-widest text-2xl bg-[#110d0a] border border-[#d4af37] rounded py-2 text-[#f2ca50] outline-none" />
        <button id="btnVerifyOTP" class="w-full bg-[#f2ca50] text-[#3c2f00] font-tactical font-bold py-2.5 rounded shadow-lg hover:brightness-110 active:scale-95 transition-all">
          CONFERMA E ACCEDI
        </button>
      </div>

      <div id="authErrorMsg" class="hidden text-xs text-[#ffb4ab] text-center font-tactical bg-[#93000a]/20 py-1.5 px-2 rounded"></div>
    </div>
  `;

  document.body.appendChild(container);

  let isRegisterMode = true;

  const titleEl = container.querySelector('#authTitle');
  const userFieldEl = container.querySelector('#usernameField');
  const btnPrimary = container.querySelector('#btnPrimaryAuth');
  const btnToggle = container.querySelector('#btnToggleAuthMode');
  const stepForm = container.querySelector('#authStepForm');
  const stepOTP = container.querySelector('#authStepOTP');
  const errorMsg = container.querySelector('#authErrorMsg');

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.remove('hidden');
  }

  btnToggle.addEventListener('click', () => {
    isRegisterMode = !isRegisterMode;
    errorMsg.classList.add('hidden');
    if (isRegisterMode) {
      titleEl.textContent = "REGISTRAZIONE GUERRIERO";
      userFieldEl.classList.remove('hidden');
      btnPrimary.textContent = "REGISTRATI E INVIA CODICE";
      btnToggle.textContent = "Hai già un account? Accedi qui";
    } else {
      titleEl.textContent = "ACCESSO AL REGNO";
      userFieldEl.classList.add('hidden');
      btnPrimary.textContent = "ACCEDI";
      btnToggle.textContent = "Nuovo combattente? Registrati ora";
    }
  });

  btnPrimary.addEventListener('click', async () => {
    const email = container.querySelector('#authEmail').value.trim();
    const pass = container.querySelector('#authPassword').value.trim();
    const user = container.querySelector('#authUsername').value.trim();

    if (!email || !pass || (isRegisterMode && !user)) {
      showError("Compila tutti i campi richiesti.");
      return;
    }

    btnPrimary.disabled = true;
    btnPrimary.textContent = "Contattando il Sanctum...";

    if (isRegisterMode) {
      const res = await callBackend({
        action: "REGISTER_REQUEST",
        email,
        username: user,
        password: pass
      });

      btnPrimary.disabled = false;
      btnPrimary.textContent = "REGISTRATI E INVIA CODICE";

      if (res.success) {
        stepForm.classList.add('hidden');
        stepOTP.classList.remove('hidden');
        titleEl.textContent = "VERIFICA EMAIL";
      } else {
        showError(res.message || "Errore durante la registrazione.");
      }
    } else {
      const res = await callBackend({
        action: "LOGIN",
        email,
        password: pass
      });

      btnPrimary.disabled = false;
      btnPrimary.textContent = "ACCEDI";

      if (res.success) {
        saveSession(res.user, res.token);
        gameState.currencies.silver = res.user.silver;
        gameState.currencies.gems = res.user.gems;
        container.remove();
        if (onSuccessCallback) onSuccessCallback(res.user);
      } else if (res.requireVerification) {
        stepForm.classList.add('hidden');
        stepOTP.classList.remove('hidden');
        titleEl.textContent = "VERIFICA EMAIL";
      } else {
        showError(res.message || "Credenziali non corrette.");
      }
    }
  });

  container.querySelector('#btnVerifyOTP').addEventListener('click', async () => {
    const email = container.querySelector('#authEmail').value.trim();
    const code = container.querySelector('#authOtpInput').value.trim();

    if (code.length !== 6) {
      showError("Inserisci il codice completo a 6 cifre.");
      return;
    }

    const res = await callBackend({
      action: "VERIFY_CODE",
      email,
      code
    });

    if (res.success) {
      saveSession(res.user, res.token);
      gameState.currencies.silver = res.user.silver;
      gameState.currencies.gems = res.user.gems;
      container.remove();
      if (onSuccessCallback) onSuccessCallback(res.user);
    } else {
      showError(res.message || "Codice non valido.");
    }
  });
}