function createModalRoot() {
  let root = document.getElementById('modalRoot');
  if (!root) {
    root = document.createElement('div');
    root.id = 'modalRoot';
    document.body.appendChild(root);
  }
  root.innerHTML = `
    <div class="modal-backdrop" id="appModalBackdrop" aria-hidden="true">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="appModalTitle">
        <div class="modal-header">
          <div>
            <p class="eyebrow" id="appModalEyebrow"></p>
            <h2 id="appModalTitle"></h2>
          </div>
          <button class="modal-close" type="button" data-modal-close aria-label="Cerrar modal">&times;</button>
        </div>
        <div id="appModalContent"></div>
      </div>
    </div>
  `;
}

function openModal({ eyebrow = '', title = '', content = '' }) {
  createModalRoot();
  document.getElementById('appModalEyebrow').textContent = eyebrow;
  document.getElementById('appModalTitle').textContent = title;
  const contentNode = document.getElementById('appModalContent');
  contentNode.innerHTML = content;
  const backdrop = document.getElementById('appModalBackdrop');
  backdrop.classList.add('open');
  backdrop.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  const backdrop = document.getElementById('appModalBackdrop');
  if (backdrop) {
    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
  }
}

document.addEventListener('click', (event) => {
  if (event.target.matches('[data-modal-close]') || event.target.id === 'appModalBackdrop') {
    closeModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeModal();
  }
});