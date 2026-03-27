// Modal System Module

function showModal(title, content, actions = []) {
  const container = document.getElementById('modal-container');
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fade-in';
  modal.id = 'active-modal';

  const actionButtons = actions.map((action, i) => {
    const btnClass = action.primary
      ? 'bg-accent hover:bg-accent/80'
      : 'bg-white/10 hover:bg-white/20';
    return `<button onclick="${action.onClick}" class="px-4 py-2 ${btnClass} rounded-xl text-sm font-medium transition-all">${action.label}</button>`;
  }).join('');

  modal.innerHTML = `
    <div class="glass-dark rounded-2xl w-full max-w-lg animate-scale-in">
      <div class="p-6 border-b border-white/10">
        <h3 class="text-lg font-semibold">${title}</h3>
      </div>
      <div class="p-6">
        ${content}
      </div>
      <div class="p-4 border-t border-white/10 flex justify-end gap-2">
        <button onclick="closeModal()" class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-all">Cancel</button>
        ${actionButtons}
      </div>
    </div>
  `;

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  container.appendChild(modal);
}

function closeModal() {
  const modal = document.getElementById('active-modal');
  if (modal) {
    modal.classList.add('animate-fade-out');
    setTimeout(() => modal.remove(), 200);
  }
}
