(() => {
  const shell = document.querySelector('[data-reader-shell]') || document.querySelector('.reader-shell');
  const progressBar = document.querySelector('[data-reading-progress-bar]');
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
  });
  if (!shell || !shell.dataset.workId || !shell.dataset.chapterId) return;
  let lastRemoteUpdate = 0;
  function percentage() {
    const story = shell.querySelector('.reader-content');
    if (!story) return 0;
    const start = story.offsetTop;
    const readable = Math.max(1, story.offsetHeight - window.innerHeight * 0.65);
    return Math.max(0, Math.min(100, Math.round(((window.scrollY - start + window.innerHeight * 0.35) / readable) * 100)));
  }
  function save(sendRemote = false) {
    const percent = percentage();
    if (progressBar) progressBar.style.width = `${percent}%`;
    const entry = { workId: shell.dataset.workId, workSlug: shell.dataset.workSlug, workTitle: shell.dataset.workTitle, coverUrl: shell.dataset.workCover, chapterId: shell.dataset.chapterId, chapterSlug: shell.dataset.chapterSlug, chapterTitle: shell.dataset.chapterTitle, path: location.pathname, percent, readAt: new Date().toISOString() };
    let history = [];
    try { history = JSON.parse(localStorage.getItem('rrp-reading-history') || '[]'); } catch { history = []; }
    history = Array.isArray(history) ? history.filter((item) => item.workId !== entry.workId) : [];
    history.unshift(entry);
    localStorage.setItem('rrp-reading-history', JSON.stringify(history.slice(0, 12)));
    if (sendRemote && Date.now() - lastRemoteUpdate > 12000) {
      lastRemoteUpdate = Date.now();
      fetch('/api/progress', { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ work_id: entry.workId, chapter_id: entry.chapterId, progress_percent: percent }) }).catch(() => null);
    }
  }
  let scheduled = false;
  const onScroll = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { save(true); scheduled = false; });
  };
  save(false);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('beforeunload', () => save(true));
})();
