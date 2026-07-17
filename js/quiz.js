let dailyQuestions = [];

async function initQuiz() {
  const questions = await loadJSON('data/questions.json');
  dailyQuestions = getDailySelection(questions, 2, getDateKey());
  const state = readState();
  const currentDailyState = state.dailyQuestionState?.dateKey === getDateKey() ? state.dailyQuestionState : { dateKey: getDateKey(), answered: [] };
  updateState({ dailyQuestionState: currentDailyState });
  renderQuiz();
}

function renderQuiz() {
  const container = document.getElementById('quizList');
  const state = readState();
  const answeredIds = state.dailyQuestionState?.answered || [];

  container.innerHTML = '';
  dailyQuestions.forEach((question, index) => {
    const isAnswered = answeredIds.includes(question.id);
    const card = document.createElement('article');
    card.className = 'quiz-card';
    card.innerHTML = `
      <p class="eyebrow">Pregunta ${index + 1}</p>
      <h2>${question.question}</h2>
      <div class="quiz-options">
        ${question.options.map((option, optionIndex) => `<button type="button" data-option="${optionIndex}" ${isAnswered ? 'disabled' : ''}>${option}</button>`).join('')}
      </div>
      <div class="quiz-feedback" id="feedback-${question.id}">${isAnswered ? 'Respondida hoy' : ''}</div>
    `;

    card.querySelectorAll('[data-option]').forEach((button) => {
      button.addEventListener('click', () => answerQuestion(question, Number(button.dataset.option)));
    });

    container.appendChild(card);
  });
}

function answerQuestion(question, selectedIndex) {
  const state = readState();
  const dailyState = state.dailyQuestionState || { dateKey: getDateKey(), answered: [] };
  if (dailyState.answered.includes(question.id)) {
    return;
  }

  const isCorrect = selectedIndex === question.correctIndex;
  dailyState.answered.push(question.id);
  state.dailyQuestionState = dailyState;
  state.questionsAnswered += 1;
  incrementMission('questions', 1);
  writeState(state);

  const feedback = document.getElementById(`feedback-${question.id}`);
  feedback.textContent = isCorrect ? question.explanation || 'Respuesta correcta' : `Incorrecta. La respuesta era: ${question.options[question.correctIndex]}`;
  renderQuiz();
}