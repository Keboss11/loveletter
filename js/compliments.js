let complimentData = [];
let selectedLetter = '';

async function initCompliments() {
  complimentData = await loadJSON('data/compliments.json');
  renderAlphabetButtons();
  renderInitialMessage();
}

function renderAlphabetButtons() {
  const lettersContainer = document.getElementById('alphabetLetters');
  const letters = [...new Set(complimentData.map((item) => item.letter))];
  letters.sort((a, b) => a.localeCompare(b, 'es'));

  lettersContainer.innerHTML = letters
    .map(
      (letter) =>
        `<button type="button" class="letter-btn" data-letter="${letter}" aria-label="Seleccionar letra ${letter}">${letter}</button>`
    )
    .join('');

  lettersContainer.querySelectorAll('.letter-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const letter = button.dataset.letter || '';
      setSelectedLetter(letter);
      renderCompliment(getComplimentByLetter(letter));
    });
  });
}

function setSelectedLetter(letter) {
  selectedLetter = letter;

  document.querySelectorAll('.letter-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.letter === selectedLetter);
  });
}

function getComplimentByLetter(letter) {
  const selectedGroup = complimentData.find((group) => group.letter === letter) || pickRandom(complimentData);
  return pickRandom(selectedGroup.items);
}

function renderInitialMessage() {
  const result = document.getElementById('complimentResult');
  result.innerHTML = '<p class="big-text">Elige una letra para descubrir un halago</p>';
}

function renderCompliment(text) {
  const result = document.getElementById('complimentResult');
  result.innerHTML = `<p class="big-text">${text}</p>`;
  incrementComplimentsViewed();
  incrementMission('compliments', 1);
}

function incrementComplimentsViewed() {
  const state = readState();
  state.complimentsViewed += 1;
  writeState(state);
}