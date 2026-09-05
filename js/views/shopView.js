export function renderShop() {
  const container = document.createElement('div');
  container.className = 'flex flex-col w-full px-3 py-4 text-center';
  container.innerHTML = `
    <span class="material-symbols-outlined text-4xl text-primary mb-2">storefront</span>
    <h2 class="font-display font-bold text-lg text-primary">Emporio e PvP</h2>
    <p class="font-body text-xs text-on-surface-variant">Sezione in allestimento.</p>
  `;
  return container;
}