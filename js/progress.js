async function initProgress() {
  const missions = await loadJSON('data/missions.json');
  const state = ensureWeeklyState(missions);
  renderMissions(state);
  renderReward(state);
}

function renderMissions(state) {
  const container = document.getElementById('missionList');
  container.innerHTML = '';

  state.weeklyState.missions.forEach((mission) => {
    const target = mission.base + mission.bonus;
    const progress = mission.progress;
    const card = document.createElement('article');
    card.className = 'mission-card';
    card.innerHTML = `
      <div class="mission-top">
        <div>
          <strong>${mission.label}</strong>
          <p class="muted">Objetivo: ${target}</p>
        </div>
        <strong>${formatRatio(progress, target)}</strong>
      </div>
      <div class="progress-bar"><span style="width:${target === 0 ? 0 : (progress / target) * 100}%"></span></div>
    `;
    container.appendChild(card);
  });
}

function renderReward(state) {
  const container = document.getElementById('rewardStatus');
  const completed = isRewardComplete(state);
  if (completed) {
    updateState({ rewardClaimed: true });
    container.innerHTML = `
      <div class="reward-visual">
        <div>
          <h3>Recompensa desbloqueada</h3>
          <p>Las tres misiones están completadas.</p>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="reward-visual">
      <div>
        <h3>Recompensa bloqueada</h3>
        <p>Completa todas las misiones para revelar la imagen final.</p>
      </div>
    </div>
  `;
}