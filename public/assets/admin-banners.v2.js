(() => {
  const root = document.querySelector('[data-admin-banners]');
  if (!root) return;
  const $ = (selector) => root.querySelector(selector);
  const esc = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  const form = $('[data-banner-form]');
  const list = $('[data-banner-list]');
  const message = $('[data-banner-message]');
  const workSelect = form.elements.work_id;
  const preview = $('[data-banner-preview]');
  const activeCount = $('[data-banner-active-count]');
  const workCount = $('[data-banner-work-count]');
  const cancelButton = $('[data-banner-cancel]');
  let editingId = null;
  let items = [];
  let works = [];

  const showMessage = (text, kind = 'success') => {
    message.textContent = text;
    message.className = `notice ${kind}`;
    message.classList.remove('hidden');
  };
  const fetchJson = async (url, options = {}) => {
    const response = await fetch(url, { credentials: 'include', ...options });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) throw new Error(data.message || 'Não foi possível concluir a ação.');
    return data;
  };
  const dateLabel = (value) => value ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(value)) : 'Sempre';
  const toIsoDateTime = (value) => {
    if (!value) return '';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString();
  };
  const toLocalDateTimeInput = (value) => {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return String(value).slice(0, 16);
    const local = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  };
  const source = () => form.elements.source_type.value;
  const selectedWork = () => works.find((work) => work.id === workSelect.value);
  const previewUrl = () => source() === 'work' ? selectedWork()?.banner_url : form.elements.image_url.value.trim();

  function syncSource() {
    const usingWork = source() === 'work';
    $('[data-work-source-fields]').classList.toggle('hidden', !usingWork);
    $('[data-external-source-fields]').classList.toggle('hidden', usingWork);
    workSelect.required = usingWork;
    form.elements.image_url.required = !usingWork;
    if (usingWork && selectedWork() && !form.elements.title.value) form.elements.title.value = selectedWork().title;
    renderPreview();
  }
  function renderPreview() {
    const url = previewUrl();
    if (!url) {
      preview.innerHTML = '<p class="muted">Selecione uma obra ou informe uma URL para visualizar o banner.</p>';
      return;
    }
    preview.innerHTML = `<img src="${esc(url)}" alt="Preview do banner" class="banner-preview" loading="lazy"><p class="muted">Pré-visualização do banner da home</p>`;
    preview.querySelector('img').addEventListener('error', () => {
      preview.innerHTML = '<p class="muted">Não foi possível carregar esta imagem. Confirme se a URL é pública e direta.</p>';
    }, { once: true });
  }
  function resetForm() {
    editingId = null;
    form.reset();
    form.elements.source_type.value = 'work';
    form.elements.active.checked = true;
    form.elements.cta_label.value = 'Começar leitura';
    form.elements.priority.value = '0';
    $('[data-banner-form-title]').textContent = 'Novo banner';
    cancelButton.classList.add('hidden');
    syncSource();
  }
  function fillForm(item) {
    editingId = item.id;
    form.elements.source_type.value = item.source_type || 'external';
    form.elements.work_id.value = item.work_id || '';
    ['image_url', 'mobile_image_url', 'alt_text', 'eyebrow', 'title', 'description', 'cta_label', 'cta_url', 'priority'].forEach((field) => {
      form.elements[field].value = item[field] || '';
    });
    form.elements.starts_at.value = toLocalDateTimeInput(item.starts_at);
    form.elements.ends_at.value = toLocalDateTimeInput(item.ends_at);
    form.elements.active.checked = Boolean(item.active);
    $('[data-banner-form-title]').textContent = 'Editar banner';
    cancelButton.classList.remove('hidden');
    syncSource();
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function renderList() {
    const active = items.filter((item) => Boolean(item.active));
    activeCount.textContent = String(active.length);
    workCount.textContent = String(works.length);
    if (!items.length) {
      list.innerHTML = '<div class="surface empty-state"><h2>Nenhum banner configurado.</h2><p class="muted">Adicione o primeiro banner para apresentar uma obra na página inicial.</p></div>';
      return;
    }
    list.innerHTML = items.map((item) => `
      <article class="surface banner-admin-card">
        <img class="banner-admin-image" src="${esc(item.display_image_url || item.image_url)}" alt="${esc(item.alt_text || item.title)}" loading="lazy">
        <div class="banner-admin-body">
          <div class="card-meta"><span class="chip ${item.active ? 'primary' : ''}">${item.active ? 'Ativo' : 'Inativo'}</span><span class="chip">${item.source_type === 'work' ? 'Obra' : 'URL externa'}</span><span class="chip">Prioridade ${esc(item.priority)}</span></div>
          <h3>${esc(item.title)}</h3>
          <p class="muted">${esc(item.description || 'Sem texto de apoio.')}</p>
          <small class="muted">Período: ${esc(dateLabel(item.starts_at))} — ${esc(item.ends_at ? dateLabel(item.ends_at) : 'sem término')}</small>
          <div class="actions">
            <button type="button" class="btn soft" data-edit-banner="${esc(item.id)}">Editar</button>
            <button type="button" class="btn ghost" data-toggle-banner="${esc(item.id)}" data-next-active="${item.active ? '0' : '1'}">${item.active ? 'Desativar' : 'Ativar'}</button>
            <button type="button" class="btn ghost danger-link" data-delete-banner="${esc(item.id)}">Excluir</button>
          </div>
        </div>
      </article>`).join('');
  }
  async function reload() {
    const data = await fetchJson('/api/admin/banners');
    items = data.items || [];
    works = data.publishedWorks || [];
    workSelect.innerHTML = '<option value="">Selecione uma obra</option>' + works.map((work) => `<option value="${esc(work.id)}">${esc(work.title)}</option>`).join('');
    renderList();
    syncSource();
  }
  function payload() {
    return {
      source_type: source(),
      work_id: form.elements.work_id.value,
      image_url: form.elements.image_url.value,
      mobile_image_url: form.elements.mobile_image_url.value,
      alt_text: form.elements.alt_text.value,
      eyebrow: form.elements.eyebrow.value,
      title: form.elements.title.value,
      description: form.elements.description.value,
      cta_label: form.elements.cta_label.value,
      cta_url: form.elements.cta_url.value,
      priority: form.elements.priority.value,
      active: form.elements.active.checked,
      starts_at: toIsoDateTime(form.elements.starts_at.value),
      ends_at: toIsoDateTime(form.elements.ends_at.value)
    };
  }

  form.querySelectorAll('input[name="source_type"]').forEach((radio) => radio.addEventListener('change', syncSource));
  workSelect.addEventListener('change', () => {
    const work = selectedWork();
    if (work) {
      if (!form.elements.title.value) form.elements.title.value = work.title;
      if (!form.elements.description.value) form.elements.description.value = work.short_description || work.description || '';
      if (!form.elements.alt_text.value) form.elements.alt_text.value = work.banner_alt || `Banner de ${work.title}`;
      if (!form.elements.cta_url.value) form.elements.cta_url.value = `/obra/${work.slug}/`;
    }
    renderPreview();
  });
  form.elements.image_url.addEventListener('input', renderPreview);
  cancelButton.addEventListener('click', resetForm);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = event.submitter;
    button.disabled = true;
    try {
      const data = await fetchJson(editingId ? `/api/admin/banners/${editingId}` : '/api/admin/banners', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload())
      });
      showMessage(data.message || 'Banner salvo com sucesso.');
      resetForm();
      await reload();
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      button.disabled = false;
    }
  });
  list.addEventListener('click', async (event) => {
    const edit = event.target.closest('[data-edit-banner]');
    const toggle = event.target.closest('[data-toggle-banner]');
    const remove = event.target.closest('[data-delete-banner]');
    if (edit) return fillForm(items.find((item) => item.id === edit.dataset.editBanner));
    if (toggle) {
      try {
        const data = await fetchJson(`/api/admin/banners/${toggle.dataset.toggleBanner}`, {
          method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ active: toggle.dataset.nextActive === '1' })
        });
        showMessage(data.message);
        await reload();
      } catch (error) { showMessage(error.message, 'error'); }
    }
    if (remove && confirm('Excluir este banner do carrossel?')) {
      try {
        const data = await fetchJson(`/api/admin/banners/${remove.dataset.deleteBanner}`, { method: 'DELETE' });
        showMessage(data.message);
        await reload();
      } catch (error) { showMessage(error.message, 'error'); }
    }
  });
  reload().catch((error) => showMessage(error.message, 'error'));
})();
