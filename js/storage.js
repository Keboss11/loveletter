const storageKey = 'aniversario-state';

const defaultState = {
  lastAccessDate: null,
  dailyAnnouncementState: null,
  complimentsViewed: 0,
  questionsAnswered: 0,
  safesOpened: 0,
  weeklyState: null,
  rewardClaimed: false,
  dailyQuestionState: null,
  openedSafes: [],
  answeredQuestions: [],
};

function readState() {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? { ...defaultState, ...JSON.parse(raw) } : { ...defaultState };
  } catch {
    return { ...defaultState };
  }
}

function writeState(state) {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function updateState(patch) {
  const nextState = { ...readState(), ...patch };
  writeState(nextState);
  return nextState;
}

function resetIfNewDay() {
  const state = readState();
  const today = getDateKey();
  if (state.lastAccessDate !== today) {
    state.lastAccessDate = today;
    state.dailyAnnouncementState = null;
    state.dailyQuestionState = null;
    state.answeredQuestions = [];
    writeState(state);
  }
  return state;
}

function ensureWeeklyState(missions) {
  const today = new Date();
  const weekKey = getWeekKey(today);
  const state = readState();
  const cached = state.weeklyState;
  if (cached && cached.weekKey === weekKey) {
    return state;
  }

  const weeklyState = {
    weekKey,
    missions: missions.map((mission) => ({
      id: mission.id,
      label: mission.label,
      base: mission.base,
      bonus: (hashString(`${weekKey}-${mission.id}`) % 2) + 1,
      progress: 0,
    })),
  };

  state.weeklyState = weeklyState;
  state.rewardClaimed = false;
  writeState(state);
  return state;
}

function getMissionTarget(state, missionId) {
  const mission = state.weeklyState?.missions.find((entry) => entry.id === missionId);
  return mission ? mission.base + mission.bonus : 0;
}

function getMissionProgressValue(state, missionId) {
  const mission = state.weeklyState?.missions.find((entry) => entry.id === missionId);
  return mission ? mission.progress : 0;
}

function setMissionProgress(missionId, amount) {
  const state = readState();
  if (!state.weeklyState) {
    return state;
  }

  state.weeklyState.missions = state.weeklyState.missions.map((mission) => (
    mission.id === missionId
      ? { ...mission, progress: clamp(amount, 0, mission.base + mission.bonus) }
      : mission
  ));
  writeState(state);
  return state;
}

function incrementMission(missionId, amount = 1, state = readState()) {
  if (!state.weeklyState) {
    return state;
  }

  const mission = state.weeklyState.missions.find((entry) => entry.id === missionId);
  if (!mission) {
    return state;
  }

  mission.progress = clamp(mission.progress + amount, 0, mission.base + mission.bonus);
  return state;
}

function isRewardComplete(state) {
  return Boolean(state.weeklyState?.missions.length) && state.weeklyState.missions.every((mission) => mission.progress >= mission.base + mission.bonus);
}