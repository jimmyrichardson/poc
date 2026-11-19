/** Play buttons open a placeholder clip dialog; links whose content is still TBD say so instead of jumping. */
export function initDialogs() {
  const dialog = document.querySelector('.clip-dialog');
  const title = dialog?.querySelector('.clip-dialog__title');

  document.querySelectorAll('[data-clip]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!dialog) return;
      title.textContent = btn.dataset.clip;
      dialog.showModal();
    });
  });

  // click on the backdrop closes
  dialog?.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });

  const toast = document.querySelector('.toast');
  let timer = 0;
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-tbd]');
    if (!el || !toast) return;
    e.preventDefault();
    toast.textContent = 'Content TBD in the wireframe';
    toast.classList.add('is-visible');
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove('is-visible'), 1800);
  });
}
