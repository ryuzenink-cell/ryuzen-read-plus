(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = (value) => String(value ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  const formatDate = (value) => {
    if (!value) return '';
    try { return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(value)); }
    catch { return ''; }
  };
  const typeLabel = (type) => ({ light_novel: 'Light Novel', webnovel: 'Webnovel' })[type] || 'Novel';
  const statusLabel = (status) => ({ ongoing: 'Em andamento', completed: 'Concluída', development: 'Em desenvolvimento', paused: 'Pausada' })[status] || 'Em andamento';
  const placeholder = '<div class="cover-placeholder" aria-hidden="true">R+</div>';
  const cover = (work) => work.cover_url
    ? `<img src="${esc(work.cover_url)}" alt="${esc(work.cover_alt || `Capa de ${work.title}`)}" loading="lazy">`
    : placeholder;
  const truncate = (text, limit = 155) => String(text || '').length > limit ? `${String(text).slice(0, limit).trim()}…` : String(text || '');

  function emptyState(title, message, actionHref = '/explorar/', actionLabel = 'Explorar catálogo') {
    return `<div class="surface empty-state"><h2>${esc(title)}</h2><p class="muted">${esc(message)}</p><div class="actions centered"><a class="btn primary" href="${esc(actionHref)}">${esc(actionLabel)}</a></div></div>`;
  }
  async function getJson(url) {
    const response = await fetch(url, { credentials: 'include' });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data || data.ok === false) throw new Error(data?.message || 'Não foi possível carregar os dados.');
    return data;
  }
  function workCard(work, compact = false) {
    const genres = Array.isArray(work.genres) ? work.genres : [];
    const description = work.short_description || work.description || '';
    return `
      <article class="work-card">
        <a class="work-card-cover" href="/obra/${esc(work.slug)}/" aria-label="Abrir ${esc(work.title)}">${cover(work)}</a>
        <div class="work-card-body">
          <div class="card-meta"><span class="chip primary">${typeLabel(work.type)}</span>${work.is_free ? '<span class="chip">Grátis</span>' : ''}</div>
          <h3><a href="/obra/${esc(work.slug)}/">${esc(work.title)}</a></h3>
          ${!compact && description ? `<p class="muted">${esc(truncate(description))}</p>` : ''}
          <div class="card-meta"><span class="tag">${statusLabel(work.status)}</span>${genres.slice(0, 2).map((genre) => `<span class="tag">${esc(genre)}</span>`).join('')}</div>
        </div>
      </article>`;
  }
  function recentChapterCard(chapter) {
    const thumbnail = chapter.work_cover_url
      ? `<img src="${esc(chapter.work_cover_url)}" alt="" loading="lazy">`
      : placeholder;
    return `<article class="recent-chapter-card surface">
      <a class="recent-chapter-cover" href="/obra/${esc(chapter.work_slug)}/${esc(chapter.slug)}/">${thumbnail}</a>
      <div class="recent-chapter-content">
        <span class="chip primary">Novo capítulo</span>
        <h3><a href="/obra/${esc(chapter.work_slug)}/${esc(chapter.slug)}/">${esc(chapter.title)}</a></h3>
        <p class="muted">${esc(chapter.work_title || 'Obra')} ${chapter.published_at ? `· ${esc(formatDate(chapter.published_at))}` : ''}</p>
        ${chapter.excerpt ? `<p>${esc(truncate(chapter.excerpt, 125))}</p>` : ''}
        <a class="btn soft" href="/obra/${esc(chapter.work_slug)}/${esc(chapter.slug)}/">Ler agora</a>
      </div>
    </article>`;
  }

  function initCarousel(banners) {
    const root = $('[data-home-carousel]');
    if (!root) return;
    if (!banners.length) {
      root.innerHTML = `<div class="carousel-empty">
        <span class="eyebrow">Ryuzen Read Plus</span>
        <h1>Descubra histórias feitas para continuar.</h1>
        <p class="lead">Novels e webnovels em capítulos para ler, acompanhar e guardar na memória.</p>
        <div class="actions"><a class="btn primary" href="/explorar/">Explorar catálogo</a><a class="btn soft" href="/gratuitos/">Começar gratuitamente</a></div>
      </div>`;
      return;
    }
    root.innerHTML = `
      <div class="carousel-track" data-carousel-track>
        ${banners.map((banner, index) => `<article class="carousel-slide ${index === 0 ? 'is-active' : ''}" data-carousel-slide aria-hidden="${index !== 0}">
          <picture>
            ${banner.mobile_image_url ? `<source media="(max-width: 620px)" srcset="${esc(banner.mobile_image_url)}">` : ''}
            <img src="${esc(banner.image_url)}" alt="${esc(banner.alt_text || banner.title)}" ${index === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}>
          </picture>
          <div class="carousel-shade"></div>
          <div class="carousel-content">
            <span class="eyebrow">${esc(banner.eyebrow || 'Em destaque')}</span>
            <h1>${esc(banner.title)}</h1>
            ${banner.description ? `<p class="lead">${esc(truncate(banner.description, 260))}</p>` : ''}
            <div class="actions"><a class="btn primary" href="${esc(banner.cta_url || '/explorar/')}">${esc(banner.cta_label || 'Começar leitura')}</a>${banner.work_slug ? `<a class="btn carousel-secondary" href="/obra/${esc(banner.work_slug)}/">Ver obra</a>` : ''}</div>
          </div>
        </article>`).join('')}
      </div>
      ${banners.length > 1 ? `<button class="carousel-arrow previous" type="button" data-carousel-prev aria-label="Banner anterior">‹</button><button class="carousel-arrow next" type="button" data-carousel-next aria-label="Próximo banner">›</button><div class="carousel-dots" role="tablist" aria-label="Banners">${banners.map((_, index) => `<button type="button" class="carousel-dot ${index === 0 ? 'is-active' : ''}" data-carousel-dot="${index}" aria-label="Mostrar banner ${index + 1}" aria-selected="${index === 0}"></button>`).join('')}</div>` : ''}`;
    if (banners.length < 2) return;
    const slides = $$('[data-carousel-slide]', root);
    const dots = $$('[data-carousel-dot]', root);
    let active = 0;
    let interval = null;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const show = (next) => {
      active = (next + slides.length) % slides.length;
      slides.forEach((slide, index) => { slide.classList.toggle('is-active', index === active); slide.setAttribute('aria-hidden', String(index !== active)); });
      dots.forEach((dot, index) => { dot.classList.toggle('is-active', index === active); dot.setAttribute('aria-selected', String(index === active)); });
    };
    const autoplay = () => {
      if (!reduceMotion) interval = window.setInterval(() => show(active + 1), 6500);
    };
    const restart = () => { if (interval) window.clearInterval(interval); autoplay(); };
    $('[data-carousel-prev]', root)?.addEventListener('click', () => { show(active - 1); restart(); });
    $('[data-carousel-next]', root)?.addEventListener('click', () => { show(active + 1); restart(); });
    dots.forEach((dot) => dot.addEventListener('click', () => { show(Number(dot.dataset.carouselDot)); restart(); }));
    root.addEventListener('mouseenter', () => interval && window.clearInterval(interval));
    root.addEventListener('mouseleave', autoplay);
    root.addEventListener('focusin', () => interval && window.clearInterval(interval));
    root.addEventListener('focusout', autoplay);
    autoplay();
  }

  function initContinueReading() {
    const section = $('[data-home-continue-section]');
    const root = $('[data-home-continue]');
    if (!section || !root) return;
    let history = [];
    try { history = JSON.parse(localStorage.getItem('rrp-reading-history') || '[]'); } catch { history = []; }
    history = Array.isArray(history) ? history.slice(0, 3) : [];
    if (!history.length) return;
    section.classList.remove('hidden');
    root.innerHTML = `<div class="continue-grid">${history.map((entry) => `
      <article class="surface continue-card">
        ${entry.coverUrl ? `<img src="${esc(entry.coverUrl)}" alt="" loading="lazy">` : ''}
        <div>
          <span class="chip">${Math.max(0, Math.min(100, Math.round(entry.percent || 0)))}% lido</span>
          <h3>${esc(entry.workTitle)}</h3>
          <p class="muted">${esc(entry.chapterTitle)}</p>
          <div class="reading-meter"><span style="width:${Math.max(2, Math.min(100, Number(entry.percent) || 0))}%"></span></div>
          <a class="btn primary" href="${esc(entry.path)}">Continuar leitura</a>
        </div>
      </article>`).join('')}</div>`;
  }

  async function initHome() {
    const root = $('[data-home-page]');
    if (!root) return;
    initContinueReading();
    const recent = $('[data-home-recent]');
    const featured = $('[data-home-featured]');
    const latest = $('[data-home-latest]');
    const free = $('[data-home-free]');
    const selection = $('[data-home-ranking]');
    const genres = $('[data-home-genres]');
    try {
      const data = await getJson('/api/home');
      initCarousel(data.carousel || []);
      const recentChapters = data.recentChapters || [];
      const featuredWorks = data.featuredWorks || [];
      const latestWorks = data.latestWorks || [];
      const freeWorks = data.freeWorks || [];
      const chosen = data.editorialSelection || data.ranking || [];
      const genreList = data.genres || [];
      recent.innerHTML = recentChapters.length ? `<div class="recent-chapter-grid">${recentChapters.slice(0, 4).map(recentChapterCard).join('')}</div>` : emptyState('Novos capítulos chegarão em breve.', 'Explore as obras já disponíveis e encontre sua próxima leitura.');
      featured.innerHTML = featuredWorks.length ? `<div class="featured-layout">${featuredWorks.map((work) => `<article class="surface featured-panel"><div class="cover-row"><a href="/obra/${esc(work.slug)}/">${cover(work)}</a><div><span class="eyebrow">${esc(work.featured_label || 'Destaque editorial')}</span><h3><a href="/obra/${esc(work.slug)}/">${esc(work.title)}</a></h3><p class="muted">${esc(truncate(work.short_description || work.description, 120))}</p><a class="btn primary" href="/obra/${esc(work.slug)}/">Começar leitura</a></div></div></article>`).join('')}</div>` : emptyState('Nossa próxima seleção está chegando.', 'Explore o catálogo para encontrar as histórias disponíveis hoje.');
      latest.innerHTML = latestWorks.length ? `<div class="work-grid compact-grid">${latestWorks.slice(0, 4).map((work) => workCard(work, true)).join('')}</div>` : emptyState('Novas obras serão publicadas em breve.', 'Acompanhe a Ryuzen para descobrir os próximos lançamentos.');
      free.innerHTML = freeWorks.length ? `<div class="work-grid compact-grid">${freeWorks.slice(0, 4).map((work) => workCard(work, true)).join('')}</div>` : emptyState('Leituras gratuitas em preparação.', 'Volte em breve para começar uma nova história sem cadastro.');
      selection.innerHTML = chosen.length ? `<div class="ranking-list">${chosen.slice(0, 5).map((work, index) => `<article class="ranking-item"><span class="rank-number">${index + 1}</span><div><strong><a href="/obra/${esc(work.slug)}/">${esc(work.title)}</a></strong><small>${esc(work.author_name || 'Ryuzen')} · ${typeLabel(work.type)}</small></div><a class="btn ghost" href="/obra/${esc(work.slug)}/">Ler</a></article>`).join('')}</div>` : emptyState('Seleções editoriais em breve.', 'Conheça o catálogo publicado e comece a leitura agora.');
      genres.innerHTML = genreList.length ? `<div class="genre-pills">${genreList.map((genre) => `<a class="tag" href="/explorar/?genre=${encodeURIComponent(genre.slug || genre.name)}">${esc(genre.name)}</a>`).join('')}</div>` : '<p class="muted">Novos gêneros aparecerão conforme as obras forem publicadas.</p>';
    } catch (error) {
      initCarousel([]);
      recent.innerHTML = emptyState('Não foi possível carregar as novidades.', 'Tente novamente em instantes ou explore o catálogo.', '/explorar/', 'Explorar catálogo');
      [featured, latest, free, selection, genres].forEach((target) => { if (target) target.innerHTML = ''; });
    }
  }

  async function initCatalog() {
    const root = $('[data-catalog-page]');
    if (!root) return;
    const grid = $('[data-catalog-grid]');
    const meta = $('[data-result-meta]');
    const genreSelect = $('[data-filter="genre"]');
    const filters = $$('[data-filter]');
    const clear = $('[data-clear-filters]');
    let works = [];
    const params = new URLSearchParams(window.location.search);
    const initial = { q: params.get('q') || '', type: params.get('type') || '', genre: params.get('genre') || '', status: params.get('status') || '', free: params.get('free') || '' };
    filters.forEach((input) => { if (Object.hasOwn(initial, input.dataset.filter)) input.value = initial[input.dataset.filter]; });
    const render = (updateUrl = true) => {
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
      if (updateUrl) {
        const next = new URLSearchParams();
        Object.entries(values).forEach(([key, value]) => { if (String(value || '').trim()) next.set(key, value); });
        history.replaceState({}, '', `${location.pathname}${next.toString() ? `?${next}` : ''}`);
      }
      const searchNote = values.q ? ` para “${values.q}”` : '';
      meta.innerHTML = `<strong>${visible.length}</strong> ${visible.length === 1 ? 'obra encontrada' : 'obras encontradas'}${esc(searchNote)}`;
      grid.innerHTML = visible.length ? `<div class="work-grid">${visible.map((work) => workCard(work)).join('')}</div>` : emptyState('Nenhuma obra encontrada.', 'Tente outro termo ou limpe os filtros para descobrir novas histórias.', '/explorar/', 'Limpar busca');
    };
    try {
      const [worksData, genresData] = await Promise.all([getJson('/api/works'), getJson('/api/genres').catch(() => ({ items: [] }))]);
      works = worksData.items || [];
      if (genreSelect && genresData.items?.length) {
        genreSelect.innerHTML = '<option value="">Todos</option>' + genresData.items.map((genre) => `<option value="${esc((genre.slug || genre.name).toLowerCase())}">${esc(genre.name)}</option>`).join('');
        genreSelect.value = initial.genre.toLowerCase();
      }
      filters.forEach((input) => input.addEventListener(input.tagName === 'INPUT' ? 'input' : 'change', () => render(true)));
      clear?.addEventListener('click', () => { filters.forEach((input) => { input.value = ''; }); render(true); });
      render(false);
    } catch (error) {
      grid.innerHTML = emptyState('Não foi possível carregar o catálogo.', 'Tente novamente em instantes.', '/contato/', 'Falar com a Ryuzen');
    }
  }
  async function initSimpleList(kind, selector, endpoint, renderer) {
    const root = $(selector);
    if (!root) return;
    try { root.innerHTML = renderer(await getJson(endpoint)); }
    catch { root.innerHTML = emptyState(`Não foi possível carregar ${kind}.`, 'Tente novamente em instantes.', '/explorar/', 'Explorar catálogo'); }
  }

  initHome();
  initCatalog();
  initSimpleList('as obras gratuitas', '[data-free-list]', '/api/works?free=true', (data) => data.items?.length ? `<div class="work-grid">${data.items.map((work) => workCard(work)).join('')}</div>` : emptyState('Nenhuma leitura gratuita disponível agora.', 'Novas histórias abertas serão adicionadas em breve.'));
  initSimpleList('as novidades', '[data-news-list]', '/api/home', (data) => data.recentChapters?.length ? `<div class="recent-chapter-grid">${data.recentChapters.map(recentChapterCard).join('')}</div>` : emptyState('Nenhum capítulo novo no momento.', 'Explore as obras publicadas enquanto novas atualizações são preparadas.'));
  initSimpleList('a seleção editorial', '[data-ranking-list]', '/api/home', (data) => (data.editorialSelection || []).length ? `<div class="work-grid">${data.editorialSelection.map((work) => workCard(work)).join('')}</div>` : emptyState('A seleção editorial será atualizada em breve.', 'Explore as histórias disponíveis e encontre sua próxima aventura.'));
})();
