let safesData = [];

async function initSafe() {
  safesData = await loadJSON('data/safes.json');
  renderSafes();
}

function renderSafes() {
  const container = document.getElementById('safeList');
  const state = readState();
  const unlockedCount = getUnlockedSafeCount(state, safesData.length);
  const unlockStartDate = getSafeUnlockStartDate(state);
  container.innerHTML = '';

  safesData.forEach((safe, index) => {
    const isOpened = (state.openedSafes || []).includes(safe.id);
    const isUnlocked = isOpened || index < unlockedCount;
    const unlockDateText = formatUnlockDate(addDays(unlockStartDate, index));
    const card = document.createElement('article');
    card.className = `safe-card ${isUnlocked ? '' : 'locked'}`.trim();
    card.innerHTML = `
      <div class="safe-visual ${isOpened ? 'open' : ''}">${isOpened ? 'Abierta' : isUnlocked ? 'Cerrada' : 'Bloqueada'}</div>
      <p class="eyebrow">${safe.name}</p>
      ${isUnlocked ? `<p>${safe.clue}</p>` : `<p class="safe-locked-message">Se desbloquea el ${unlockDateText}</p>`}
      ${isUnlocked ? `
        <div class="safe-actions">
          <input class="safe-input" id="safe-input-${safe.id}" type="password" placeholder="Contraseña" ${isOpened ? 'disabled' : ''}>
          <button class="primary-btn" type="button" ${isOpened ? 'disabled' : ''} data-open-safe="${safe.id}">Abrir caja</button>
        </div>
      ` : ''}
    `;

    const openButton = card.querySelector('[data-open-safe]');
    if (openButton) {
      openButton.addEventListener('click', () => openSafe(safe));
    }

    container.appendChild(card);
  });
}

function openSafe(safe) {
  const input = document.getElementById(`safe-input-${safe.id}`);
  const state = readState();
  if ((state.openedSafes || []).includes(safe.id)) {
    return;
  }

  if (input.value.trim() !== safe.password) {
    input.value = '';
    input.placeholder = 'Contraseña incorrecta';
    return;
  }

  state.openedSafes = [...(state.openedSafes || []), safe.id];
  state.safesOpened += 1;
  writeState(state);
  incrementMission('safes', 1);
  openModal({
    eyebrow: safe.name,
    title: 'Carta desbloqueada',
    content: `<p>${safe.letter}</p>`,
  });
  renderSafes();
}

function getUnlockedSafeCount(state, totalSafes) {
  const startDate = getSafeUnlockStartDate(state);
  const today = parseDateKey(getDateKey());
  const elapsedDays = Math.max(0, dateDiffInDays(startDate, today));
  return clamp(elapsedDays + 1, 0, totalSafes);
}

function getSafeUnlockStartDate(state) {
  if (state.safeUnlockStartDate) {
    return parseDateKey(state.safeUnlockStartDate);
  }

  const todayKey = getDateKey();
  updateState({ safeUnlockStartDate: todayKey });
  return parseDateKey(todayKey);
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map((part) => Number(part));
  return new Date(year, month - 1, day);
}

function dateDiffInDays(startDate, endDate) {
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  const millisPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((end - start) / millisPerDay);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatUnlockDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}