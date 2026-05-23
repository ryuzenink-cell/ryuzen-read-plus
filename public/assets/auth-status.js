(() => {
  const roots = [...document.querySelectorAll('[data-auth-status]')];
  if (!roots.length) return;
  const esc = (value) => String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  const initials = (name) => esc(String(name || 'Conta').trim().slice(0, 1).toUpperCase() || 'C');
  const renderGuest = (root) => {
    root.innerHTML = '<a class="btn header-btn ghost" href="/login/">Entrar</a><a class="btn header-btn soft" href="/cadastro/">Criar conta</a>';
  };
  const renderUser = (root, user) => {
    const canEdit = ['admin', 'editor'].includes(user.role);
    root.innerHTML = `<a class="btn header-btn ghost" href="/biblioteca/">Biblioteca</a>${canEdit ? '<a class="btn header-btn soft" href="/admin/">Admin</a>' : ''}<details class="account-menu"><summary class="btn header-btn account-summary" aria-label="Abrir menu da conta"><span class="account-avatar" aria-hidden="true">${initials(user.name)}</span><span class="account-name">${esc(user.name || 'Conta')}</span></summary><div class="account-dropdown" role="menu"><a href="/conta/" role="menuitem">Minha conta</a><a href="/biblioteca/" role="menuitem">Minha biblioteca</a><a href="/conta/configuracoes/" role="menuitem">Configurações</a>${canEdit ? '<a href="/admin/" role="menuitem">Painel editorial</a>' : ''}<button type="button" data-auth-logout role="menuitem">Sair</button></div></details>`;
  };
  fetch('/api/auth/me', { credentials: 'include' })
    .then((response) => response.ok ? response.json() : null)
    .then((data) => roots.forEach((root) => data?.authenticated && data.user ? renderUser(root, data.user) : renderGuest(root)))
    .catch(() => roots.forEach(renderGuest));
  document.addEventListener('click', async (event) => {
    const logout = event.target.closest('[data-auth-logout]');
    if (logout) {
      logout.disabled = true;
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => null);
      window.location.href = '/';
      return;
    }
    document.querySelectorAll('.account-menu[open]').forEach((menu) => { if (!menu.contains(event.target)) menu.removeAttribute('open'); });
  });
})();
