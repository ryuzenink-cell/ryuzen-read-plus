(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  const slugify = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '').slice(0, 90);
  const typeLabel = (type) => ({ light_novel: 'Light Novel', webnovel: 'Webnovel' })[type] || esc(type || 'Novel');
  const statusLabel = (value) => ({ ongoing: 'Em andamento', completed: 'Concluída', development: 'Em desenvolvimento', paused: 'Pausada', draft: 'Rascunho', scheduled: 'Agendada', published: 'Publicada', hidden: 'Oculta', archived: 'Arquivada' })[value] || esc(value || '');
  const formatDate = (value) => value ? new Date(value).toLocaleString('pt-BR') : 'Sem data';

  function showMessage(target, text, type = 'info') {
    if (!target) return;
    target.textContent = text;
    target.className = `notice ${type}`;
    target.hidden = false;
  }
  async function getJson(url) {
    const response = await fetch(url, { credentials: 'include' });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data || data.ok === false) throw new Error(data?.message || 'Não foi possível carregar dados.');
    return data;
  }
  async function sendJson(url, method, payload) {
    const response = await fetch(url, { method, credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data || data.ok === false) throw new Error(data?.message || 'Não foi possível salvar.');
    return data;
  }
  const value = (form, name) => form.elements[name]?.value?.trim() || '';
  const checked = (form, name) => Boolean(form.elements[name]?.checked);

  function setPreview(input, target) {
    const url = input?.value?.trim();
    if (!target) return;
    const isBanner = input?.name?.includes('banner');
    if (!url) { target.innerHTML = `<p class="muted">Cole uma URL para visualizar ${isBanner ? 'o banner' : 'a capa'}.</p>`; return; }
    target.innerHTML = `<img class="${isBanner ? 'banner-preview' : 'image-preview'}" src="${esc(url)}" alt="Preview" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('p'),{className:'muted',textContent:'Não foi possível carregar esta imagem. Verifique se a URL é pública e direta.'}))">`;
  }

  function syncBannerFields(form) {
    if (!form) return;
    const yes = form.querySelector('input[name="show_banner"][value="yes"]');
    const fields = $('[data-banner-fields]', form);
    const enabled = Boolean(yes?.checked);
    fields?.classList.toggle('is-disabled', !enabled);
    form.banner_url && (form.banner_url.disabled = !enabled);
    form.banner_alt && (form.banner_alt.disabled = !enabled);
    form.banner_credit && (form.banner_credit.disabled = !enabled);
    if (!enabled) setPreview(form.banner_url, $('[data-banner-preview]'));
  }

  function markdownPreview(value) {
    return String(value || '').split(/\n{2,}/).map((block) => block.trim()).filter(Boolean).map((block) => `<p>${esc(block).replace(/\n/g, '<br>')}</p>`).join('');
  }

  async function initOverview() {
    const root = $('[data-admin-overview]');
    if (!root) return;
    try {
      const data = await getJson('/api/admin/overview');
      $('[data-stat-works]', root).textContent = data.stats.works;
      $('[data-stat-published]', root).textContent = data.stats.published;
      $('[data-stat-drafts]', root).textContent = data.stats.drafts;
      $('[data-stat-chapters]', root).textContent = data.stats.chapters;
      $('[data-recent-works]', root).innerHTML = data.recentWorks.length ? data.recentWorks.map((work) => `<article class="chapter-item"><div><strong>${esc(work.title)}</strong><small>${statusLabel(work.publication_status)} · ${formatDate(work.updated_at)}</small></div><a class="btn soft" href="/admin/obras/nova/?id=${esc(work.id)}">Editar</a></article>`).join('') : '<div class="surface empty-state"><h2>Nenhuma obra cadastrada.</h2><p class="muted">Publique sua primeira novel pelo painel.</p></div>';
      $('[data-recent-chapters]', root).innerHTML = data.recentChapters.length ? data.recentChapters.map((chapter) => `<article class="chapter-item"><div><strong>${esc(chapter.title)}</strong><small>${esc(chapter.work_title)} · ${formatDate(chapter.updated_at)}</small></div><a class="btn soft" href="/admin/capitulos/?id=${esc(chapter.id)}">Editar</a></article>`).join('') : '<div class="surface empty-state"><h2>Nenhum capítulo cadastrado.</h2><p class="muted">Crie capítulos depois de cadastrar uma obra.</p></div>';
    } catch (error) {
      showMessage($('[data-admin-overview-message]', root), error.message, 'error');
    }
  }

  async function initWorksList() {
    const root = $('[data-admin-works-list]');
    if (!root) return;
    const body = $('[data-works-body]', root);
    const message = $('[data-works-message]', root);
    const filters = $$('[data-work-filter]', root);
    let works = [];
    const render = () => {
      const q = ($('[data-work-filter="q"]', root)?.value || '').toLowerCase();
      const status = $('[data-work-filter="publication_status"]', root)?.value || '';
      const visible = works.filter((work) => (!q || `${work.title} ${work.author_name} ${work.slug}`.toLowerCase().includes(q)) && (!status || work.publication_status === status));
      if (!visible.length) {
        body.innerHTML = `<tr><td colspan="9"><div class="empty-state"><h2>Nenhuma obra encontrada.</h2><p class="muted">Cadastre uma obra real pelo botão “Nova obra”.</p></div></td></tr>`;
        return;
      }
      body.innerHTML = visible.map((work) => `<tr>
        <td><div class="admin-table-title">${work.cover_url ? `<img class="admin-mini-cover" src="${esc(work.cover_url)}" alt="">` : '<span class="admin-mini-cover cover-placeholder">R+</span>'}<div><strong>${esc(work.title)}</strong><small>${esc(work.slug)}</small></div></div></td>
        <td>${esc(work.author_name || '')}</td><td>${typeLabel(work.type)}</td><td><span class="status-pill ${esc(work.publication_status)}">${statusLabel(work.publication_status)}</span></td><td><span class="media-badge ${work.banner_url ? 'has-banner' : 'no-banner'}">${work.banner_url ? 'Com banner' : 'Sem banner'}</span></td><td>${esc(work.chapter_count || 0)}</td><td>${work.is_featured ? 'Sim' : 'Não'}</td><td>${formatDate(work.updated_at)}</td>
        <td><div class="table-actions"><a class="btn soft" href="/admin/obras/nova/?id=${esc(work.id)}">Editar</a>${work.publication_status === 'published' ? `<a class="btn ghost" href="/obra/${esc(work.slug)}/" target="_blank">Ver</a>` : ''}<button class="btn ghost" type="button" data-delete-work="${esc(work.id)}">Excluir</button></div></td>
      </tr>`).join('');
    };
    try {
      const data = await getJson('/api/admin/works');
      works = data.items || [];
      render();
      filters.forEach((input) => input.addEventListener(input.tagName === 'INPUT' ? 'input' : 'change', render));
      root.addEventListener('click', async (event) => {
        const btn = event.target.closest('[data-delete-work]');
        if (!btn) return;
        if (!confirm('Excluir esta obra também removerá seus capítulos. Deseja continuar?')) return;
        try { await sendJson(`/api/admin/works/${btn.dataset.deleteWork}`, 'DELETE', {}); works = works.filter((work) => work.id !== btn.dataset.deleteWork); render(); showMessage(message, 'Obra excluída com sucesso.', 'success'); }
        catch (error) { showMessage(message, error.message, 'error'); }
      });
    } catch (error) { showMessage(message, error.message, 'error'); }
  }

  function workPayload(form, publicationStatus) {
    return {
      title: value(form, 'title'), subtitle: value(form, 'subtitle'), slug: value(form, 'slug'), author_name: value(form, 'author_name'), type: value(form, 'type'), status: value(form, 'status'), publication_status: publicationStatus || value(form, 'publication_status'), language: value(form, 'language'), age_rating: value(form, 'age_rating'), short_description: value(form, 'short_description'), description: value(form, 'description'), editorial_notes: value(form, 'editorial_notes'), cover_url: value(form, 'cover_url'), cover_alt: value(form, 'cover_alt'), cover_credit: value(form, 'cover_credit'), banner_url: value(form, 'show_banner') === 'yes' ? value(form, 'banner_url') : '', banner_alt: value(form, 'show_banner') === 'yes' ? value(form, 'banner_alt') : '', banner_credit: value(form, 'show_banner') === 'yes' ? value(form, 'banner_credit') : '', genres: value(form, 'genres'), tags: value(form, 'tags'), is_free: checked(form, 'is_free'), is_featured: checked(form, 'is_featured'), featured_priority: value(form, 'featured_priority'), featured_label: value(form, 'featured_label'), featured_starts_at: value(form, 'featured_starts_at'), featured_ends_at: value(form, 'featured_ends_at'), external_url: value(form, 'external_url'), external_label: value(form, 'external_label'), seo_title: value(form, 'seo_title'), seo_description: value(form, 'seo_description'), published_at: value(form, 'published_at'), scheduled_at: value(form, 'scheduled_at')
    };
  }

  async function initWorkForm() {
    const form = $('[data-admin-work-form]');
    if (!form) return;
    const message = $('[data-work-form-message]');
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const title = $('[data-work-form-title]');
    const coverPreview = $('[data-cover-preview]');
    const bannerPreview = $('[data-banner-preview]');
    form.cover_url?.addEventListener('input', () => setPreview(form.cover_url, coverPreview));
    form.banner_url?.addEventListener('input', () => setPreview(form.banner_url, bannerPreview));
    form.querySelectorAll('input[name="show_banner"]').forEach((radio) => radio.addEventListener('change', () => syncBannerFields(form)));
    syncBannerFields(form);
    form.title?.addEventListener('input', () => { if (!id && !form.slug.value) form.slug.value = slugify(form.title.value); });
    if (id) {
      try {
        const data = await getJson(`/api/admin/works/${id}`);
        const work = data.item;
        if (title) title.textContent = 'Editar obra';
        Object.entries({ title: work.title, subtitle: work.subtitle, slug: work.slug, author_name: work.author_name, type: work.type, status: work.status, publication_status: work.publication_status, language: work.language, age_rating: work.age_rating, short_description: work.short_description, description: work.description, editorial_notes: work.editorial_notes, cover_url: work.cover_url, cover_alt: work.cover_alt, cover_credit: work.cover_credit, banner_url: work.banner_url, banner_alt: work.banner_alt, banner_credit: work.banner_credit, genres: (work.genres || []).map((g) => g.name || g).join(', '), tags: (work.tags || []).map((t) => t.name || t).join(', '), featured_priority: work.featured_priority, featured_label: work.featured_label, featured_starts_at: work.featured_starts_at, featured_ends_at: work.featured_ends_at, external_url: work.external_url, external_label: work.external_label, seo_title: work.seo_title, seo_description: work.seo_description, published_at: work.published_at, scheduled_at: work.scheduled_at }).forEach(([key, val]) => { if (form.elements[key]) form.elements[key].value = val || ''; });
        form.is_free.checked = Boolean(work.is_free);
        form.is_featured.checked = Boolean(work.is_featured);
        const bannerChoice = form.querySelector(`input[name="show_banner"][value="${work.banner_url ? 'yes' : 'no'}"]`);
        if (bannerChoice) bannerChoice.checked = true;
        syncBannerFields(form);
        setPreview(form.cover_url, coverPreview); setPreview(form.banner_url, bannerPreview);
        $('[data-public-preview]')?.setAttribute('href', `/obra/${work.slug}/`);
        $('[data-public-preview]')?.removeAttribute('hidden');
      } catch (error) { showMessage(message, error.message, 'error'); }
    }
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const submitter = event.submitter;
      const desiredStatus = submitter?.dataset?.publicationStatus;
      submitter.disabled = true;
      try {
        const data = await sendJson(id ? `/api/admin/works/${id}` : '/api/admin/works', id ? 'PATCH' : 'POST', workPayload(form, desiredStatus));
        showMessage(message, data.message || 'Obra salva com sucesso.', 'success');
        if (!id && data.id) window.history.replaceState(null, '', `/admin/obras/nova/?id=${encodeURIComponent(data.id)}`);
      } catch (error) { showMessage(message, error.message, 'error'); }
      finally { submitter.disabled = false; }
    });
  }

  async function loadWorksOptions(select) {
    const data = await getJson('/api/admin/works');
    select.innerHTML = '<option value="">Selecione uma obra</option>' + (data.items || []).map((work) => `<option value="${esc(work.id)}">${esc(work.title)}</option>`).join('');
    return data.items || [];
  }

  function chapterPayload(form, publicationStatus) {
    return { work_id: value(form, 'work_id'), number: value(form, 'number'), title: value(form, 'title'), slug: value(form, 'slug'), excerpt: value(form, 'excerpt'), content: value(form, 'content'), content_format: value(form, 'content_format') || 'markdown', is_free: checked(form, 'is_free'), publication_status: publicationStatus || value(form, 'publication_status'), published_at: value(form, 'published_at'), scheduled_at: value(form, 'scheduled_at'), seo_title: value(form, 'seo_title'), seo_description: value(form, 'seo_description') };
  }

  async function initChapters() {
    const root = $('[data-admin-chapters]');
    if (!root) return;
    const form = $('[data-chapter-form]', root);
    const body = $('[data-chapters-body]', root);
    const message = $('[data-chapter-message]', root);
    const select = form.work_id;
    const params = new URLSearchParams(location.search);
    let editingId = params.get('id');
    let chapters = [];
    const render = () => {
      body.innerHTML = chapters.length ? chapters.map((chapter) => `<tr><td>${esc(chapter.number)}</td><td><strong>${esc(chapter.title)}</strong><br><small>${esc(chapter.slug)}</small></td><td>${esc(chapter.work_title)}</td><td><span class="status-pill ${esc(chapter.publication_status)}">${statusLabel(chapter.publication_status)}</span></td><td>${chapter.is_free ? 'Sim' : 'Não'}</td><td>${formatDate(chapter.updated_at)}</td><td><div class="table-actions"><button class="btn soft" type="button" data-edit-chapter="${esc(chapter.id)}">Editar</button>${chapter.publication_status === 'published' ? `<a class="btn ghost" href="/obra/${esc(chapter.work_slug)}/${esc(chapter.slug)}/" target="_blank">Ver</a>` : ''}<button class="btn ghost" type="button" data-delete-chapter="${esc(chapter.id)}">Excluir</button></div></td></tr>`).join('') : '<tr><td colspan="7"><div class="empty-state"><h2>Nenhum capítulo cadastrado.</h2><p class="muted">Cadastre uma obra primeiro e depois publique o primeiro capítulo.</p></div></td></tr>';
    };
    async function reloadChapters() { const data = await getJson('/api/admin/chapters'); chapters = data.items || []; render(); }
    function fillChapter(chapter) {
      editingId = chapter.id;
      Object.entries({ work_id: chapter.work_id, number: chapter.number, title: chapter.title, slug: chapter.slug, excerpt: chapter.excerpt, content: chapter.content, content_format: chapter.content_format, publication_status: chapter.publication_status, published_at: chapter.published_at, scheduled_at: chapter.scheduled_at, seo_title: chapter.seo_title, seo_description: chapter.seo_description }).forEach(([key, val]) => { if (form.elements[key]) form.elements[key].value = val || ''; });
      form.is_free.checked = Boolean(chapter.is_free);
      $('[data-chapter-form-title]', root).textContent = 'Editar capítulo';
      $('[data-chapter-preview]', root).innerHTML = markdownPreview(form.content.value) || '<p class="muted">Preview vazio.</p>';
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    try {
      await loadWorksOptions(select);
      await reloadChapters();
      if (editingId) { const data = await getJson(`/api/admin/chapters/${editingId}`); fillChapter(data.item); }
      form.title?.addEventListener('input', () => { if (!editingId && !form.slug.value) form.slug.value = slugify(form.title.value); });
      form.content?.addEventListener('input', () => { $('[data-chapter-preview]', root).innerHTML = markdownPreview(form.content.value) || '<p class="muted">Preview vazio.</p>'; });
      root.addEventListener('click', async (event) => {
        const edit = event.target.closest('[data-edit-chapter]');
        const del = event.target.closest('[data-delete-chapter]');
        if (edit) { const data = await getJson(`/api/admin/chapters/${edit.dataset.editChapter}`); fillChapter(data.item); }
        if (del) { if (!confirm('Excluir este capítulo?')) return; try { await sendJson(`/api/admin/chapters/${del.dataset.deleteChapter}`, 'DELETE', {}); await reloadChapters(); showMessage(message, 'Capítulo excluído com sucesso.', 'success'); } catch (error) { showMessage(message, error.message, 'error'); } }
      });
      $('[data-new-chapter]', root)?.addEventListener('click', () => { editingId = ''; form.reset(); form.is_free.checked = true; $('[data-chapter-form-title]', root).textContent = 'Novo capítulo'; $('[data-chapter-preview]', root).innerHTML = '<p class="muted">Preview vazio.</p>'; });
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const submitter = event.submitter;
        const desiredStatus = submitter?.dataset?.publicationStatus;
        submitter.disabled = true;
        try { const data = await sendJson(editingId ? `/api/admin/chapters/${editingId}` : '/api/admin/chapters', editingId ? 'PATCH' : 'POST', chapterPayload(form, desiredStatus)); showMessage(message, data.message || 'Capítulo salvo com sucesso.', 'success'); await reloadChapters(); if (!editingId && data.id) editingId = data.id; }
        catch (error) { showMessage(message, error.message, 'error'); }
        finally { submitter.disabled = false; }
      });
    } catch (error) { showMessage(message, error.message, 'error'); }
  }

  async function initFeatured() {
    const root = $('[data-admin-featured]');
    if (!root) return;
    const form = $('[data-featured-form]', root);
    const list = $('[data-featured-list]', root);
    const message = $('[data-featured-message]', root);
    const select = form.work_id;
    async function reloadFeatured() {
      const data = await getJson('/api/admin/featured');
      list.innerHTML = data.items?.length ? data.items.map((slot) => `<article class="chapter-item"><div><strong>${esc(slot.title)}</strong><small>${esc(slot.slot_key)} · ${esc(slot.label || 'Destaque')} · prioridade ${esc(slot.priority)}</small></div><div class="table-actions"><a class="btn soft" href="/admin/obras/nova/?id=${esc(slot.work_id)}">Editar obra</a><button class="btn ghost" type="button" data-delete-featured="${esc(slot.id)}">Remover</button></div></article>`).join('') : '<div class="surface empty-state"><h2>Nenhum destaque ativo.</h2><p class="muted">Selecione uma obra publicada para destacar na home.</p></div>';
    }
    try {
      const works = await loadWorksOptions(select);
      select.innerHTML = '<option value="">Selecione uma obra</option>' + works.filter((work) => work.publication_status === 'published').map((work) => `<option value="${esc(work.id)}">${esc(work.title)}</option>`).join('');
      await reloadFeatured();
      form.addEventListener('submit', async (event) => { event.preventDefault(); const submitter = event.submitter; submitter.disabled = true; try { await sendJson('/api/admin/featured', 'POST', { work_id: value(form, 'work_id'), slot_key: value(form, 'slot_key'), label: value(form, 'label'), priority: value(form, 'priority'), starts_at: value(form, 'starts_at'), ends_at: value(form, 'ends_at'), active: checked(form, 'active') }); showMessage(message, 'Destaque salvo com sucesso.', 'success'); form.reset(); form.active.checked = true; await reloadFeatured(); } catch (error) { showMessage(message, error.message, 'error'); } finally { submitter.disabled = false; } });
      root.addEventListener('click', async (event) => { const btn = event.target.closest('[data-delete-featured]'); if (!btn) return; if (!confirm('Remover este destaque?')) return; try { await sendJson(`/api/admin/featured/${btn.dataset.deleteFeatured}`, 'DELETE', {}); showMessage(message, 'Destaque removido com sucesso.', 'success'); await reloadFeatured(); } catch (error) { showMessage(message, error.message, 'error'); } });
    } catch (error) { showMessage(message, error.message, 'error'); }
  }

  initOverview();
  initWorksList();
  initWorkForm();
  initChapters();
  initFeatured();
})();
