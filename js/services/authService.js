// Inserisci qui l'URL generato dalla Distribuzione Web App di Google Apps Script
export const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyJ0DuoTExY9VvCve7iV_vJW-SPUEtHO-YzvcyhHT_4tP8saxX5KXSsfYH0llFmQipl_g/exec";

export async function callBackend(payload) {
  try {
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      // text/plain evita la pre-flight request OPTIONS non supportata nativamente da GAS
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    return await response.json();
  } catch (error) {
    console.error("Errore di rete verso Google Sheets:", error);
    return { success: false, message: "Errore di connessione al database cloud." };
  }
}

export function saveSession(user, token) {
  localStorage.setItem("edg_token", token);
  localStorage.setItem("edg_user", JSON.stringify(user));
}

export function getSession() {
  const token = localStorage.getItem("edg_token");
  const user = localStorage.getItem("edg_user");
  if (!token || !user) return null;
  return { token, user: JSON.parse(user) };
}

export function clearSession() {
  localStorage.removeItem("edg_token");
  localStorage.removeItem("edg_user");
}