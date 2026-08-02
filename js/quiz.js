let dailyQuestions = [];
const pendingSelections = {};

async function initQuiz() {
  const questions = await loadJSON('data/questions.json');
  dailyQuestions = getDailySelection(questions, 2, getDateKey());
  const state = readState();
  const currentDailyState = state.dailyQuestionState?.dateKey === getDateKey()
    ? {
      ...state.dailyQuestionState,
      answered: state.dailyQuestionState.answered || [],
      selections: state.dailyQuestionState.selections || {},
    }
    : { dateKey: getDateKey(), answered: [], selections: {} };
  updateState({ dailyQuestionState: currentDailyState });
  renderQuiz();
}

function renderQuiz() {
  const container = document.getElementById('quizList');
  const state = readState();
  const dailyState = state.dailyQuestionState || { answered: [], selections: {} };
  const answeredIds = dailyState.answered || [];
  const selections = dailyState.selections || {};

  container.innerHTML = '';
  dailyQuestions.forEach((question) => {
    const isAnswered = answeredIds.includes(question.id);
    const selectedIndex = isAnswered ? selections[question.id] : pendingSelections[question.id];
    const card = document.createElement('article');
    card.className = 'quiz-card';
    card.innerHTML = `
      <h2>${question.question}</h2>
      <div class="quiz-options">
        ${question.options.map((option, optionIndex) => {
          let optionClasses = 'quiz-option-btn';
          const isSelected = selectedIndex === optionIndex;
          if (isAnswered) {
            const isCorrectOption = question.correctIndex === optionIndex;
            if (isSelected && isCorrectOption) {
              optionClasses += ' is-selected is-correct';
            } else if (isSelected) {
              optionClasses += ' is-selected is-wrong';
            } else if (isCorrectOption) {
              optionClasses += ' is-correct';
            }
          } else if (isSelected) {
            optionClasses += ' is-selected';
          }
          return `<button type="button" class="${optionClasses}" data-option="${optionIndex}" ${isAnswered ? 'disabled' : ''}>${option}</button>`;
        }).join('')}
      </div>
      <button type="button" class="primary-btn quiz-check-btn" data-check-question="${question.id}" ${isAnswered || selectedIndex === undefined ? 'disabled' : ''}>Comprobar</button>
    `;

    card.querySelectorAll('[data-option]').forEach((button) => {
      button.addEventListener('click', () => {
        pendingSelections[question.id] = Number(button.dataset.option);
        renderQuiz();
      });
    });

    const checkButton = card.querySelector('[data-check-question]');
    if (checkButton) {
      checkButton.addEventListener('click', () => {
        const selectedOption = pendingSelections[question.id];
        answerQuestion(question, selectedOption);
      });
    }

    container.appendChild(card);
  });
}

function answerQuestion(question, selectedIndex) {
  if (typeof selectedIndex !== 'number' || Number.isNaN(selectedIndex)) {
    return;
  }

  const state = readState();
  const dailyState = state.dailyQuestionState || { dateKey: getDateKey(), answered: [], selections: {} };
  if (dailyState.answered.includes(question.id)) {
    return;
  }

  dailyState.selections = dailyState.selections || {};
  dailyState.selections[question.id] = selectedIndex;
  dailyState.answered.push(question.id);
  delete pendingSelections[question.id];
  state.dailyQuestionState = dailyState;
  state.questionsAnswered += 1;
  incrementMission('questions', 1, state);
  writeState(state);
  renderQuiz();
}