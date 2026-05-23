(() => {
  const accountRoot = document.querySelector('[data-reader-account]');
  const settingsRoot = document.querySelector('[data-reader-account-settings]');
  if (!accountRoot && !settingsRoot) return;

  const API = '/api/profile/';
  const GENRES = ['Fantasia', 'Comédia', 'Romance', 'Isekai', 'Mistério', 'Drama', 'Aventura', 'Sobrenatural', 'Ação', 'Slice of life'];
  const esc = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  const roleLabel = (role) => ({ reader: 'Leitor', author: 'Autor', editor: 'Editor', admin: 'Administrador' })[role] || 'Leitor';
  const labels = {
    theme: { dark: 'Escuro', light: 'Claro', system: 'Seguir sistema' },
    fontSize: { small: 'Pequena', medium: 'Média', large: 'Grande' },
    lineHeight: { compact: 'Compacto', normal: 'Normal', relaxed: 'Relaxado' },
    contentWidth: { comfortable: 'Confortável', wide: 'Ampla' }
  };
  const memberSince = (value) => value ? new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(value)) : '';
  const formattedDate = (value) => value ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(value)) : '';
  const applyPreferences = (preferences) => {
    if (!preferences) return;
    const pixels = { small: '17', medium: '19', large: '22' };
    localStorage.setItem('rrp-reader-theme', preferences.theme || 'dark');
    localStorage.setItem('rrp-reader-font-size', pixels[preferences.fontSize] || pixels.medium);
    localStorage.setItem('rrp-reader-line-height', preferences.lineHeight || 'normal');
    localStorage.setItem('rrp-reader-content-width', preferences.contentWidth || 'comfortable');
  };
  const guest = (root) => {
    root.innerHTML = `<div class="surface account-auth-state"><span class="eyebrow">Conta</span><h1>Entre na sua central de leitura</h1><p class="lead">Personalize seu perfil, salve histórias e continue lendo de onde parou.</p><div class="actions"><a class="btn primary" href="/login/?next=${encodeURIComponent(location.pathname)}">Entrar</a><a class="btn soft" href="/cadastro/">Criar conta</a></div></div>`;
  };
  const error = (root, message) => {
    root.innerHTML = `<div class="surface account-auth-state"><span class="eyebrow">Erro</span><h1>Não foi possível carregar sua conta</h1><p class="lead">${esc(message || 'Tente novamente em instantes.')}</p><div class="actions"><button class="btn primary" type="button" onclick="location.reload()">Tentar novamente</button></div></div>`;
  };

  function renderAccount(data) {
    const profile = data.profile;
    const library = data.library || { count: 0, news: [] };
    applyPreferences(profile.preferences);
    const genres = profile.favoriteGenres?.length ? profile.favoriteGenres.map((item) => `<span class="profile-tag">${esc(item)}</span>`).join('') : '<span class="profile-empty">Escolha seus gêneros favoritos.</span>';
    const bio = profile.bio ? esc(profile.bio) : '<span class="profile-empty">Adicione uma bio para personalizar seu perfil.</span>';
    const continueReading = library.continueReading ? `
      <div class="continue-reader-row">
        ${library.continueReading.cover_url ? `<img src="${esc(library.continueReading.cover_url)}" alt="" loading="lazy">` : ''}
        <div><strong>${esc(library.continueReading.title)}</strong><p>${esc(library.continueReading.chapter_title)} · ${Math.round(Number(library.continueReading.progress_percent || 0))}% lido</p><a class="btn primary compact" href="/obra/${encodeURIComponent(library.continueReading.work_slug)}/${encodeURIComponent(library.continueReading.chapter_slug)}/">Continuar leitura</a></div>
      </div>` : '<p class="muted">Sua próxima aventura começa quando você abrir um capítulo.</p><a class="btn soft compact" href="/explorar/">Explorar obras</a>';
    const news = library.news?.length ? library.news.map((item) => `<li><a href="/obra/${encodeURIComponent(item.work_slug)}/${encodeURIComponent(item.chapter_slug)}/"><strong>${esc(item.work_title)}</strong><span>${esc(item.chapter_title)}</span></a></li>`).join('') : '<li class="profile-empty">Nenhuma novidade disponível no momento. Salve obras para acompanhar atualizações.</li>';
    const admin = ['admin', 'editor'].includes(profile.role) ? `<section class="surface account-admin-card"><span class="eyebrow">Administração</span><h2>Painel editorial</h2><p>Você possui acesso ao painel editorial da Ryuzen ReadPlus.</p><a class="btn soft" href="/admin/">Abrir painel editorial</a></section>` : '';
    accountRoot.innerHTML = `
      <header class="surface profile-hero">
        <img class="profile-avatar-large" src="${esc(profile.avatarSrc)}" alt="Avatar selecionado de ${esc(profile.displayName)}">
        <div class="profile-intro">
          <span class="eyebrow">Central do leitor</span>
          <h1>Olá, ${esc(profile.displayName)}!</h1>
          <p class="profile-bio">${bio}</p>
          <div class="profile-tags" aria-label="Gêneros favoritos">${genres}</div>
          ${profile.createdAt ? `<p class="profile-member">Membro desde ${esc(memberSince(profile.createdAt))}</p>` : ''}
        </div>
        <div class="profile-hero-actions">
          <a class="btn primary" href="/conta/configuracoes/">Editar perfil</a>
          <a class="btn soft" href="/biblioteca/">Minha biblioteca</a>
        </div>
      </header>
      <div class="account-card-grid">
        <section class="surface account-feature-card"><span class="eyebrow">Retomar</span><h2>Continuar lendo</h2>${continueReading}</section>
        <section class="surface account-feature-card"><span class="eyebrow">Coleção</span><h2>Minha biblioteca</h2><div class="account-stat"><strong>${Number(library.count || 0)}</strong><span>${Number(library.count || 0) === 1 ? 'obra salva' : 'obras salvas'}</span></div>${Number(library.count || 0) ? '<a class="btn soft compact" href="/biblioteca/">Ver biblioteca</a>' : '<p class="muted">Salve obras para acompanhar novos capítulos.</p><a class="btn soft compact" href="/explorar/">Explorar obras</a>'}</section>
        <section class="surface account-feature-card"><span class="eyebrow">Atualizações</span><h2>Novidades para você</h2><ul class="profile-news">${news}</ul></section>
        <section class="surface account-feature-card"><span class="eyebrow">Atividade</span><h2>Minha atividade</h2><dl class="profile-metrics"><div><dt>Obras salvas</dt><dd>${Number(library.count || 0)}</dd></div><div><dt>Conta</dt><dd>${esc(roleLabel(profile.role))}</dd></div><div><dt>Membro desde</dt><dd>${esc(formattedDate(profile.createdAt) || '—')}</dd></div></dl></section>
      </div>
      <section class="surface preferences-summary"><div><span class="eyebrow">Leitura confortável</span><h2>Preferências de leitura</h2><p>${esc(labels.theme[profile.preferences.theme])} · Fonte ${esc(labels.fontSize[profile.preferences.fontSize].toLowerCase())} · Espaçamento ${esc(labels.lineHeight[profile.preferences.lineHeight].toLowerCase())} · Área ${esc(labels.contentWidth[profile.preferences.contentWidth].toLowerCase())}</p></div><a class="btn soft" href="/conta/configuracoes/#leitura">Ajustar preferências</a></section>
      ${admin}
      <details class="surface security-details"><summary>Segurança e dados da conta</summary><div class="security-grid"><div><strong>E-mail cadastrado</strong><span>${esc(profile.email)}</span></div><div><strong>Tipo de conta</strong><span>${esc(roleLabel(profile.role))}</span></div><p class="account-safe">Sua conta está protegida.</p><button class="btn ghost" type="button" data-profile-logout>Sair</button></div></details>`;
  }

  function renderSettings(data) {
    const profile = data.profile;
    applyPreferences(profile.preferences);
    const avatars = data.avatars || [];
    settingsRoot.innerHTML = `
      <div class="account-settings-head"><a class="back-link" href="/conta/">← Voltar para minha conta</a><span class="eyebrow">Personalização</span><h1>Configurações da conta</h1><p class="lead">Deixe seu perfil com a sua cara e ajuste a experiência de leitura.</p></div>
      <form class="profile-form" data-profile-form novalidate>
        <section class="surface settings-section"><h2>Perfil</h2><div class="settings-fields"><label class="field"><span>Nome de exibição</span><input name="display_name" value="${esc(profile.displayName)}" maxlength="40" required><small>Até 40 caracteres.</small></label><label class="field full"><span>Bio curta</span><textarea name="bio" rows="3" maxlength="160" data-bio-input>${esc(profile.bio)}</textarea><small><span data-bio-count>${String(profile.bio || '').length}</span>/160 caracteres</small></label></div><fieldset class="avatar-fieldset"><legend>Avatar oficial</legend><p class="muted">Escolha uma imagem oficial da Ryuzen ReadPlus.</p><div class="avatar-picker">${avatars.map((avatar) => `<label class="avatar-choice"><input type="radio" name="avatar_key" value="${esc(avatar.key)}" ${profile.avatarKey === avatar.key ? 'checked' : ''}><span><img src="${esc(avatar.src)}" alt="${esc(avatar.label)}"><small>${esc(avatar.label)}</small></span></label>`).join('')}</div></fieldset><fieldset class="genre-fieldset"><legend>Gêneros favoritos</legend><p class="muted">Escolha até 5.</p><div class="genre-picker">${GENRES.map((genre) => `<label class="genre-choice"><input type="checkbox" name="favorite_genres" value="${esc(genre)}" ${profile.favoriteGenres.includes(genre) ? 'checked' : ''}><span>${esc(genre)}</span></label>`).join('')}</div><p class="field-error" data-genres-error hidden>Escolha no máximo 5 gêneros favoritos.</p></fieldset></section>
        <section class="surface settings-section" id="leitura"><h2>Preferências de leitura</h2><div class="settings-fields prefs-grid"><label class="field"><span>Tema de leitura</span><select name="reading_theme"><option value="dark" ${profile.preferences.theme === 'dark' ? 'selected' : ''}>Escuro</option><option value="light" ${profile.preferences.theme === 'light' ? 'selected' : ''}>Claro</option><option value="system" ${profile.preferences.theme === 'system' ? 'selected' : ''}>Seguir sistema</option></select></label><label class="field"><span>Tamanho da fonte</span><select name="reading_font_size"><option value="small" ${profile.preferences.fontSize === 'small' ? 'selected' : ''}>Pequeno</option><option value="medium" ${profile.preferences.fontSize === 'medium' ? 'selected' : ''}>Médio</option><option value="large" ${profile.preferences.fontSize === 'large' ? 'selected' : ''}>Grande</option></select></label><label class="field"><span>Espaçamento entre linhas</span><select name="reading_line_height"><option value="compact" ${profile.preferences.lineHeight === 'compact' ? 'selected' : ''}>Compacto</option><option value="normal" ${profile.preferences.lineHeight === 'normal' ? 'selected' : ''}>Normal</option><option value="relaxed" ${profile.preferences.lineHeight === 'relaxed' ? 'selected' : ''}>Relaxado</option></select></label><label class="field"><span>Largura da área de leitura</span><select name="reading_content_width"><option value="comfortable" ${profile.preferences.contentWidth === 'comfortable' ? 'selected' : ''}>Confortável</option><option value="wide" ${profile.preferences.contentWidth === 'wide' ? 'selected' : ''}>Ampla</option></select></label></div><p class="muted">Essas preferências serão aplicadas ao leitor de capítulos neste dispositivo e salvas em sua conta.</p></section>
        <section class="surface settings-section"><h2>Comunicação</h2><label class="toggle-row"><input type="checkbox" name="email_updates_enabled" ${profile.emailUpdatesEnabled ? 'checked' : ''}><span>Desejo receber novidades editoriais da Ryuzen ReadPlus.</span></label><p class="muted">A preferência será salva; nenhum envio de e-mails é ativado nesta rodada.</p></section>
        <section class="surface settings-section subtle"><h2>Segurança e conta</h2><div class="security-grid"><div><strong>E-mail cadastrado</strong><span>${esc(profile.email)}</span></div><div><strong>Tipo de conta</strong><span>${esc(roleLabel(profile.role))}</span></div></div></section>
        <div class="profile-save-bar"><p class="notice" data-profile-notice hidden aria-live="polite"></p><button class="btn primary" type="submit" data-profile-submit>Salvar alterações</button></div>
      </form>`;
    bindForm();
  }

  function bindForm() {
    const form = settingsRoot.querySelector('[data-profile-form]');
    if (!form) return;
    const bio = form.querySelector('[data-bio-input]');
    const bioCount = form.querySelector('[data-bio-count]');
    bio.addEventListener('input', () => { bioCount.textContent = String(bio.value.length); });
    form.addEventListener('change', (event) => {
      if (event.target.name !== 'favorite_genres') return;
      const selected = [...form.querySelectorAll('input[name="favorite_genres"]:checked')];
      const warning = form.querySelector('[data-genres-error]');
      if (selected.length > 5) { event.target.checked = false; warning.hidden = false; }
      else warning.hidden = true;
    });
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const submit = form.querySelector('[data-profile-submit]');
      const notice = form.querySelector('[data-profile-notice]');
      const genres = [...form.querySelectorAll('input[name="favorite_genres"]:checked')].map((input) => input.value);
      if (genres.length > 5) { notice.className = 'notice error'; notice.textContent = 'Escolha no máximo 5 gêneros favoritos.'; notice.hidden = false; return; }
      const payload = {
        display_name: form.display_name.value,
        bio: form.bio.value,
        avatar_key: form.querySelector('input[name="avatar_key"]:checked')?.value,
        favorite_genres: genres,
        email_updates_enabled: form.email_updates_enabled.checked,
        reading_theme: form.reading_theme.value,
        reading_font_size: form.reading_font_size.value,
        reading_line_height: form.reading_line_height.value,
        reading_content_width: form.reading_content_width.value
      };
      submit.disabled = true;
      notice.hidden = true;
      try {
        const response = await fetch(API, { method: 'PATCH', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.ok) throw new Error(result.message || 'Não foi possível atualizar seu perfil. Tente novamente.');
        applyPreferences(result.profile.preferences);
        notice.className = 'notice success'; notice.textContent = result.message; notice.hidden = false;
      } catch (err) { notice.className = 'notice error'; notice.textContent = err.message || 'Não foi possível atualizar seu perfil. Tente novamente.'; notice.hidden = false; }
      finally { submit.disabled = false; }
    });
  }

  async function init() {
    const root = accountRoot || settingsRoot;
    try {
      const response = await fetch(API, { credentials: 'include' });
      if (response.status === 401) return guest(root);
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) return error(root, data?.message);
      if (accountRoot) renderAccount(data); else renderSettings(data);
    } catch (err) { error(root, err.message); }
  }
  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-profile-logout]');
    if (!button) return;
    button.disabled = true;
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => null);
    location.href = '/';
  });
  init();
})();
