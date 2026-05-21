(() => {
  const shell = document.querySelector('[data-reader-shell]') || document.querySelector('.reader-shell');
  const applySize = (size) => {
    if (!shell) return;
    const next = Math.min(26, Math.max(16, Number(size) || 19));
    shell.style.setProperty('--reader-font-size', `${next}px`);
    localStorage.setItem('rrp-reader-font-size', String(next));
  };
  applySize(localStorage.getItem('rrp-reader-font-size') || 19);
  document.addEventListener('click', (event) => {
    const sizeBtn = event.target.closest('[data-reader-size]');
    if (sizeBtn) {
      const current = Number(localStorage.getItem('rrp-reader-font-size') || 19);
      applySize(current + (sizeBtn.dataset.readerSize === 'up' ? 1 : -1));
    }
    const themeBtn = event.target.closest('[data-theme-toggle]');
    if (themeBtn) {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      localStorage.setItem('rrp-theme', next);
    }
  });
})();
