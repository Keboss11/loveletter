async function initHome() {
  const announcements = await loadJSON('data/announcements.json');
  const grid = document.getElementById('announcementsGrid');
  const state = readState();
  const dateKey = getDateKey();
  const selection = getDailyAnnouncementSelection(announcements, state, dateKey);
  const layouts = getDailyAnnouncementLayouts(dateKey, selection.length);

  grid.innerHTML = '';

  selection.forEach((announcement, index) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'announcement-card';
    applyAnnouncementLayout(card, layouts[index]);
    card.innerHTML = `
      <div class="announcement-text">
        <strong>${announcement.title}</strong>
      </div>
    `;
    card.addEventListener('click', () => {
      openModal({
        title: announcement.title,
        content: `<p class="modal-note-text">${announcement.content}</p>`,
      });
    });
    grid.appendChild(card);
  });
}

function getDailyAnnouncementLayouts(dateKey, count) {
  const layoutPool = [
    { top: '4%', left: '4%', tilt: '-6deg' },
    { top: '26%', left: '34%', tilt: '3deg' },
    { top: '10%', left: '62%', tilt: '-2deg' },
    { top: '46%', left: '9%', tilt: '4deg' },
    { top: '50%', left: '49%', tilt: '-4deg' },
    { top: '30%', left: '68%', tilt: '5deg' },
  ];

  return seededShuffle(layoutPool, `${dateKey}-board-layout`).slice(0, count);
}

function applyAnnouncementLayout(card, layout) {
  if (!layout) {
    return;
  }

  card.style.setProperty('--note-top', layout.top);
  card.style.setProperty('--note-left', layout.left);
  card.style.setProperty('--note-tilt', layout.tilt);
}

function getDailyAnnouncementSelection(announcements, state, dateKey) {
  const saved = state.dailyAnnouncementState;
  if (saved?.dateKey === dateKey) {
    return announcements.filter((announcement) => saved.ids.includes(announcement.id));
  }

  const count = 1 + (hashString(dateKey) % 3);
  const chosen = seededShuffle(announcements, dateKey).slice(0, Math.min(count, announcements.length));
  state.dailyAnnouncementState = {
    dateKey,
    ids: chosen.map((announcement) => announcement.id),
  };
  writeState(state);
  return chosen;
}