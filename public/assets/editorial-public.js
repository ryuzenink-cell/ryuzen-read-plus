(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const formatDate = (value) => {
    if (!value) return 'Sem data';
    try { return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(value)); }
    catch { return 'Sem data'; }
  };

  const typeLabel = (type) => ({ light_novel: 'Light Novel', webnovel: 'Webnovel' })[type] || esc(type || 'Novel');
  const statusLabel = (status) => ({ ongoing: 'Em andamento', completed: 'Concluída', development: 'Em desenvolvimento', paused: 'Pausada' })[status] || esc(status || 'Em andamento');
  const placeholder = '<div class="cover-placeholder" aria-hidden="true">R+</div>';
  const cover = (work, extra = '') => work.cover_url
    ? `<img src="${esc(work.cover_url)}" alt="${esc(work.cover_alt || `Capa de ${work.title}`)}" loading="lazy" ${extra}>`
    : placeholder;

  function workCard(work, compact = false) {
    const genres = Array.isArray(work.genres) ? work.genres : String(work.genres || '').split(',').filter(Boolean);
    const tags = Array.isArray(work.tags) ? work.tags : String(work.tags || '').split(',').filter(Boolean);
    const description = work.short_description || work.description || '';
    return `
      <article class="work-card" data-work-card data-type="${esc(work.type)}" data-status="${esc(work.status)}" data-free="${String(Boolean(work.is_free))}" data-genres="${esc(genres.join(',').toLowerCase())}" data-title="${esc(String(work.title || '').toLowerCase())}">
        <a class="work-card-cover" href="/obra/${esc(work.slug)}/" aria-label="Abrir ${esc(work.title)}">${cover(work)}</a>
        <div class="work-card-body">
          <div class="card-meta"><span class="chip primary">${typeLabel(work.type)}</span>${work.is_free ? '<span class="chip">Grátis</span>' : ''}</div>
          <h3><a href="/obra/${esc(work.slug)}/">${esc(work.title)}</a></h3>
          ${!compact && description ? `<p class="muted">${esc(description).slice(0, 150)}${description.length > 150 ? '...' : ''}</p>` : ''}
          <div class="card-meta"><span class="tag">${statusLabel(work.status)}</span>${genres.slice(0, 2).map((genre) => `<span class="tag">${esc(genre)}</span>`).join('')}</div>
        </div>
      </article>`;
  }

  function emptyState(title, message, actionHref = '/admin/obras/nova/', actionLabel = 'Publicar primeira obra') {
    return `<div class="surface empty-state"><h2>${esc(title)}</h2><p class="muted">${esc(message)}</p><div class="actions centered"><a class="btn primary" href="${esc(actionHref)}">${esc(actionLabel)}</a></div></div>`;
  }

  async function getJson(url) {
    const response = await fetch(url, { credentials: 'include' });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data || data.ok === false) throw new Error(data?.message || 'Não foi possível carregar os dados.');
    return data;
  }

  function setLoading(target, text = 'Carregando...') {
    if (target) target.innerHTML = `<div class="surface empty-state"><h2>${esc(text)}</h2><p class="muted">Buscando as publicações mais recentes.</p></div>`;
  }

  async function initHome() {
    const root = $('[data-home-page]');
    if (!root) return;
    const recent = $('[data-home-recent]');
    const featured = $('[data-home-featured]');
    const latest = $('[data-home-latest]');
    const free = $('[data-home-free]');
    const ranking = $('[data-home-ranking]');
    const genres = $('[data-home-genres]');
    setLoading(recent, 'Carregando capítulos recentes...');
    try {
      const data = await getJson('/api/home');
      const recentChapters = data.recentChapters || [];
      const featuredWorks = data.featuredWorks || [];
      const latestWorks = data.latestWorks || [];
      const freeWorks = data.freeWorks || [];
      const rankingWorks = data.ranking || [];
      const genreList = data.genres || [];

      recent.innerHTML = recentChapters.length ? recentChapters.map((chapter) => `
        <a class="chapter-item" href="/obra/${esc(chapter.work_slug)}/${esc(chapter.slug)}/">
          <div><strong>${esc(chapter.title)}</strong><small>${esc(chapter.work_title || 'Obra')} · ${formatDate(chapter.published_at)}</small><p class="muted">${esc(chapter.excerpt || '')}</p></div>
        </a>`).join('') : emptyState('Nenhum capítulo publicado ainda.', 'Quando você publicar o primeiro capítulo no painel admin, ele aparecerá aqui.', '/admin/capitulos/', 'Cadastrar capítulo');

      featured.innerHTML = featuredWorks.length ? `<div class="featured-layout">${featuredWorks.map((work) => `
        <article class="surface featured-panel"><div class="cover-row"><a href="/obra/${esc(work.slug)}/">${cover(work)}</a><div><span class="eyebrow">${esc(work.featured_label || 'Destaque editorial')}</span><h3><a href="/obra/${esc(work.slug)}/">${esc(work.title)}</a></h3><p class="muted">${esc(work.short_description || work.description || '')}</p><a class="btn primary" href="/obra/${esc(work.slug)}/">Começar leitura</a></div></div></article>`).join('')}</div>` : emptyState('Nenhum destaque definido.', 'Marque uma obra publicada como destaque para preencher esta seção.', '/admin/destaques/', 'Gerenciar destaques');

      latest.innerHTML = latestWorks.length ? `<div class="work-grid">${latestWorks.map((work) => workCard(work, true)).join('')}</div>` : emptyState('Nenhuma obra publicada ainda.', 'O catálogo será atualizado assim que a primeira novel for publicada.', '/admin/obras/nova/', 'Publicar obra');
      free.innerHTML = freeWorks.length ? `<div class="work-grid">${freeWorks.map((work) => workCard(work, true)).join('')}</div>` : emptyState('Nenhuma obra gratuita disponível.', 'Marque uma obra como gratuita no painel admin para ela aparecer aqui.', '/admin/obras/', 'Gerenciar obras');
      ranking.innerHTML = rankingWorks.length ? `<div class="ranking-list">${rankingWorks.map((work, index) => `<article class="ranking-item"><span class="rank-number">${index + 1}</span><div><strong><a href="/obra/${esc(work.slug)}/">${esc(work.title)}</a></strong><small>${esc(work.author_name || 'Ryuzen')} · ${typeLabel(work.type)}</small></div><span class="chip">${statusLabel(work.status)}</span></article>`).join('')}</div>` : emptyState('Ranking ainda não disponível.', 'O ranking editorial será preenchido com obras reais publicadas.', '/admin/destaques/', 'Criar ranking');
      genres.innerHTML = genreList.length ? `<div class="genre-pills">${genreList.map((genre) => `<a class="tag" href="/explorar/?genre=${encodeURIComponent(genre.slug || genre.name)}">${esc(genre.name)}</a>`).join('')}</div>` : emptyState('Nenhum gênero cadastrado.', 'Os gêneros serão exibidos após a publicação de obras reais.', '/admin/obras/nova/', 'Cadastrar obra');
    } catch (error) {
      recent.innerHTML = emptyState('Não foi possível carregar a home.', error.message || 'Tente novamente em alguns instantes.', '/contato/', 'Contato');
      if (featured) featured.innerHTML = '';
      if (latest) latest.innerHTML = '';
      if (free) free.innerHTML = '';
      if (ranking) ranking.innerHTML = '';
      if (genres) genres.innerHTML = '';
    }
  }

  async function initCatalog() {
    const root = $('[data-catalog-page]');
    if (!root) return;
    const grid = $('[data-catalog-grid]');
    const genreSelect = $('[data-filter="genre"]');
    const filters = $$('[data-filter]');
    let works = [];

    const render = () => {
      const values = Object.fromEntries(filters.map((el) => [el.dataset.filter, el.value]));
      const q = String(values.q || '').trim().toLowerCase();
      const visible = works.filter((work) => {
        const genres = (work.genres || []).map((item) => String(item).toLowerCase());
        const tags = (work.tags || []).map((item) => String(item).toLowerCase());
        return (!values.type || work.type === values.type)
          && (!values.status || work.status === values.status)
          && (!values.free || String(Boolean(work.is_free)) === values.free)
          && (!values.genre || genres.includes(values.genre.toLowerCase()) || tags.includes(values.genre.toLowerCase()))
          && (!q || String(work.title || '').toLowerCase().includes(q) || String(work.author_name || '').toLowerCase().includes(q) || genres.join(' ').includes(q) || tags.join(' ').includes(q));
      });
      grid.innerHTML = visible.length ? `<div class="work-grid">${visible.map((work) => workCard(work)).join('')}</div>` : emptyState('Nenhuma obra publicada ainda.', 'O catálogo será preenchido automaticamente quando você publicar uma novel pelo painel admin.');
    };

    try {
      const [worksData, genresData] = await Promise.all([getJson('/api/works'), getJson('/api/genres').catch(() => ({ items: [] }))]);
      works = worksData.items || [];
      if (genreSelect && genresData.items?.length) {
        genreSelect.innerHTML = '<option value="">Todos</option>' + genresData.items.map((genre) => `<option value="${esc((genre.slug || genre.name).toLowerCase())}">${esc(genre.name)}</option>`).join('');
      }
      filters.forEach((input) => input.addEventListener(input.tagName === 'INPUT' ? 'input' : 'change', render));
      render();
    } catch (error) {
      grid.innerHTML = emptyState('Não foi possível carregar o catálogo.', error.message || 'Verifique a configuração do banco e tente novamente.', '/contato/', 'Contato');
    }
  }

  async function initSimpleList(kind, selector, endpoint, renderer) {
    const root = $(selector);
    if (!root) return;
    setLoading(root);
    try {
      const data = await getJson(endpoint);
      root.innerHTML = renderer(data);
    } catch (error) {
      root.innerHTML = emptyState(`Não foi possível carregar ${kind}.`, error.message || 'Tente novamente em instantes.', '/contato/', 'Contato');
    }
  }

  initHome();
  initCatalog();
  initSimpleList('as obras gratuitas', '[data-free-list]', '/api/works?free=true', (data) => data.items?.length ? `<div class="work-grid">${data.items.map((work) => workCard(work)).join('')}</div>` : emptyState('Nenhuma obra gratuita publicada ainda.', 'Marque uma obra como gratuita no painel admin para ela aparecer aqui.'));
  initSimpleList('as novidades', '[data-news-list]', '/api/home', (data) => data.recentChapters?.length ? `<div class="chapter-list">${data.recentChapters.map((chapter) => `<article class="chapter-item"><div><strong><a href="/obra/${esc(chapter.work_slug)}/${esc(chapter.slug)}/">${esc(chapter.title)}</a></strong><small>${esc(chapter.work_title || 'Obra')} · ${formatDate(chapter.published_at)}</small><p class="muted">${esc(chapter.excerpt || '')}</p></div><a class="btn soft" href="/obra/${esc(chapter.work_slug)}/${esc(chapter.slug)}/">Ler agora</a></article>`).join('')}</div>` : emptyState('Nenhuma novidade publicada ainda.', 'Os capítulos aparecerão aqui após serem publicados pelo painel admin.'));
  initSimpleList('os rankings', '[data-ranking-list]', '/api/home', (data) => data.ranking?.length ? `<div class="ranking-list">${data.ranking.map((work, index) => `<article class="ranking-item"><span class="rank-number">${index + 1}</span><div><strong><a href="/obra/${esc(work.slug)}/">${esc(work.title)}</a></strong><small>${esc(work.author_name || 'Ryuzen')} · ${typeLabel(work.type)}</small></div><span class="chip">${statusLabel(work.status)}</span></article>`).join('')}</div>` : emptyState('Ranking editorial vazio.', 'Defina destaques ou prioridades editoriais para preencher esta área.', '/admin/destaques/', 'Gerenciar destaques'));
})();
