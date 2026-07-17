const themes = ['stranger', 'pirates'];

function getThemeFromState() {
  const state = readState();
  return themes.includes(state.visualTheme) ? state.visualTheme : 'stranger';
}

function setThemeInState(theme) {
  if (!themes.includes(theme)) {
    return;
  }
  updateState({ visualTheme: theme });
}

function applyTheme(theme) {
  const nextTheme = themes.includes(theme) ? theme : 'stranger';
  document.body.dataset.theme = nextTheme;

  const pirateStylesheet = document.getElementById('themePiratesStylesheet');
  if (pirateStylesheet) {
    pirateStylesheet.disabled = nextTheme !== 'pirates';
  }

  document.querySelectorAll('[data-theme-option]').forEach((button) => {
    const isActive = button.dataset.themeOption === nextTheme;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function createThemeSwitcher() {
  const switcher = document.createElement('aside');
  switcher.className = 'theme-switcher';
  switcher.setAttribute('aria-label', 'Selector de tema visual');

  switcher.innerHTML = `
    <p class="theme-switcher-title">Bitacora visual</p>
    <div class="theme-switcher-actions">
      <button type="button" class="theme-chip" data-theme-option="stranger" aria-pressed="false">Stranger</button>
      <button type="button" class="theme-chip" data-theme-option="pirates" aria-pressed="false">Piratas</button>
    </div>
  `;

  switcher.querySelectorAll('[data-theme-option]').forEach((button) => {
    button.addEventListener('click', () => {
      const selectedTheme = button.dataset.themeOption;
      setThemeInState(selectedTheme);
      applyTheme(selectedTheme);
    });
  });

  document.body.appendChild(switcher);
}

async function bootApplication() {
  resetIfNewDay();
  const page = document.body.dataset.page;
  if (!page) {
    return;
  }

  const handler = window[`init${page.charAt(0).toUpperCase()}${page.slice(1)}`];
  if (typeof handler === 'function') {
    await handler();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  createThemeSwitcher();
  applyTheme(getThemeFromState());

  bootApplication().catch((error) => {
    console.error(error);
    const fallback = document.querySelector('[aria-live="polite"]');
    if (fallback) {
      fallback.textContent = 'No se pudieron cargar los datos. Abre el proyecto desde un servidor estático para permitir la lectura de JSON.';
    }
  });
});