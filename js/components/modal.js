// ========== REUSABLE MODAL COMPONENT ==========

let activeModal = null;

// Show a modal with title and content
export function showModal(title, contentEl) {
  closeModal(); // close any existing

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:center;justify-content:center';
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.cssText = 'background:var(--bg1);border-radius:16px;padding:24px;max-width:600px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3)';

  // Header
  const header = document.createElement('div');
  header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:16px';

  const h3 = document.createElement('h3');
  h3.textContent = title;
  header.appendChild(h3);

  const closeBtn = document.createElement('button');
  closeBtn.style.cssText = 'background:none;border:none;font-size:20px;cursor:pointer;color:var(--text2);padding:4px 8px';
  closeBtn.textContent = '\u2715';
  closeBtn.addEventListener('click', () => closeModal());
  header.appendChild(closeBtn);

  modal.appendChild(header);

  // Content
  if (typeof contentEl === 'string') {
    const p = document.createElement('p');
    p.textContent = contentEl;
    modal.appendChild(p);
  } else if (contentEl instanceof HTMLElement) {
    modal.appendChild(contentEl);
  }

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  activeModal = overlay;

  // Close on Escape
  const onEsc = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', onEsc);
    }
  };
  document.addEventListener('keydown', onEsc);
}

// Close active modal
export function closeModal() {
  if (activeModal) {
    activeModal.remove();
    activeModal = null;
  }
}

// Convenience: show confirmation dialog
export function confirmModal(title, message) {
  return new Promise(resolve => {
    const content = document.createElement('div');
    const p = document.createElement('p');
    p.textContent = message;
    p.style.marginBottom = '20px';
    content.appendChild(p);

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:10px;justify-content:flex-end';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn';
    cancelBtn.textContent = 'ביטול';
    cancelBtn.addEventListener('click', () => { closeModal(); resolve(false); });
    btnRow.appendChild(cancelBtn);

    const okBtn = document.createElement('button');
    okBtn.className = 'btn btn-primary';
    okBtn.textContent = 'אישור';
    okBtn.addEventListener('click', () => { closeModal(); resolve(true); });
    btnRow.appendChild(okBtn);

    content.appendChild(btnRow);
    showModal(title, content);
  });
}
