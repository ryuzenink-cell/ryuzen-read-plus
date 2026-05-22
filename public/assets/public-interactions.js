(() => {
  const buttons = [...document.querySelectorAll('[data-library-toggle]')];
  const esc = (value) => String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  let library = null;
  async function loadLibrary() {
    if (library) return library;
    const response = await fetch('/api/library', { credentials: 'include' });
    if (response.status === 401) return null;
    const data = await response.json().catch(() => null);
    library = data?.ok ? new Set((data.items || []).map((item) => item.work_id)) : null;
    return library;
  }
  function updateButton(button, saved) {
    button.dataset.saved = String(saved);
    button.textContent = saved ? 'Remover da biblioteca' : 'Adicionar à biblioteca';
    button.classList.toggle('is-saved', saved);
  }
  if (buttons.length) {
    loadLibrary().then((saved) => { if (saved) buttons.forEach((button) => updateButton(button, saved.has(button.dataset.workId))); }).catch(() => null);
  }
  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-library-toggle]');
    if (button) {
      const workId = button.dataset.workId;
      button.disabled = true;
      try {
        const savedSet = await loadLibrary();
        if (!savedSet) {
          window.location.href = `/login/?next=${encodeURIComponent(location.pathname)}`;
          return;
        }
        const isSaved = savedSet.has(workId);
        const response = await fetch('/api/library', {
          method: isSaved ? 'DELETE' : 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ work_id: workId })
        });
        const data = await response.json().catch(() => ({}));
        if (response.status === 401) {
          window.location.href = `/login/?next=${encodeURIComponent(location.pathname)}`;
          return;
        }
        if (!response.ok || !data.ok) throw new Error(data.message || 'Não foi possível atualizar sua biblioteca.');
        if (isSaved) savedSet.delete(workId); else savedSet.add(workId);
        document.querySelectorAll(`[data-library-toggle][data-work-id="${CSS.escape(workId)}"]`).forEach((item) => updateButton(item, !isSaved));
        announce(data.message);
      } catch (error) { announce(error.message || 'Não foi possível concluir a ação.', 'error'); }
      finally { button.disabled = false; }
    }
    const share = event.target.closest('[data-share-link]');
    if (share) {
      const shareData = { title: share.dataset.shareTitle || document.title, url: location.href };
      try {
        if (navigator.share) await navigator.share(shareData);
        else { await navigator.clipboard.writeText(location.href); announce('Link copiado para compartilhar.'); }
      } catch { /* Compartilhamento cancelado pelo leitor. */ }
    }
  });
  function announce(text, kind = 'success') {
    let notice = document.querySelector('[data-public-notice]');
    if (!notice) {
      notice = document.createElement('div');
      notice.dataset.publicNotice = '';
      notice.className = 'public-toast';
      document.body.appendChild(notice);
    }
    notice.className = `public-toast ${kind}`;
    notice.innerHTML = esc(text);
    notice.hidden = false;
    clearTimeout(notice._timeout);
    notice._timeout = setTimeout(() => { notice.hidden = true; }, 3500);
  }
})();
