import { requireDb } from '../_lib/auth';
import { escapeHtml, getWorkRelations, publicWhere } from '../_lib/editorial';
import { publicPage } from '../_lib/public-page';

const SITE = 'https://readplus.ryuzen.ink';
const typeLabel = (type: string) => type === 'webnovel' ? 'Webnovel' : 'Light Novel';
const statusLabel = (status: string) => ({ ongoing: 'Em andamento', completed: 'Concluída', paused: 'Pausada', development: 'Em desenvolvimento' } as Record<string, string>)[status] || 'Em andamento';
function readingMinutes(content: string | null) {
  return Math.max(1, Math.ceil(String(content || '').trim().split(/\s+/).filter(Boolean).length / 220));
}

export async function onRequestGet({ env, params }: any) {
  const path = `/obra/${String(params.slug || '')}/`;
  try {
    const db = requireDb(env);
    const work = await db.prepare(`SELECT * FROM works WHERE slug = ? AND ${publicWhere('works')} LIMIT 1`).bind(params.slug).first<any>();
    if (!work) return publicPage({ title: 'Obra não encontrada', path, body: `<section class="page-section"><div class="container"><div class="surface empty-state"><h1>Obra não encontrada</h1><p class="muted">Esta história não está disponível no momento.</p><div class="actions centered"><a class="btn primary" href="/explorar/">Explorar catálogo</a></div></div></div></section>` });

    const rel = await getWorkRelations(db, work.id);
    const { results: chapters = [] } = await db.prepare(`SELECT * FROM chapters WHERE work_id = ? AND publication_status = 'published' ORDER BY number ASC, published_at ASC`).bind(work.id).all<any>();
    const firstChapter = chapters[0];
    const genres = rel.genres.map((g: any) => `<a class="tag" href="/explorar/?genre=${encodeURIComponent(g.slug)}">${escapeHtml(g.name)}</a>`).join('');
    const tags = rel.tags.map((t: any) => `<span class="tag">${escapeHtml(t.name)}</span>`).join('');
    const cover = work.cover_url ? `<img class="work-cover-image" src="${escapeHtml(work.cover_url)}" alt="${escapeHtml(work.cover_alt || `Capa de ${work.title}`)}" loading="eager">` : `<div class="cover-placeholder work-cover-image">R+</div>`;
    const backdrop = work.banner_url
      ? `<div class="work-detail-backdrop"><img src="${escapeHtml(work.banner_url)}" alt="" aria-hidden="true" loading="eager"></div>`
      : `<div class="work-detail-backdrop work-detail-backdrop-empty" aria-hidden="true"></div>`;
    const bannerCredit = work.banner_url && work.banner_credit ? `<small class="work-banner-credit">Imagem de destaque: ${escapeHtml(work.banner_credit)}</small>` : '';
    const chapterList = chapters.length ? chapters.map((chapter: any, index: number) => `<a class="chapter-item work-chapter-row" href="/obra/${escapeHtml(work.slug)}/${escapeHtml(chapter.slug)}/"><div><div class="card-meta"><span class="chip">Capítulo ${escapeHtml(chapter.number)}</span>${chapter.is_free ? '<span class="chip primary">Grátis</span>' : ''}${index === chapters.length - 1 ? '<span class="chip new-chip">Mais recente</span>' : ''}</div><strong>${escapeHtml(chapter.title)}</strong>${chapter.excerpt ? `<p class="muted">${escapeHtml(chapter.excerpt)}</p>` : ''}<small>${chapter.published_at ? escapeHtml(new Date(chapter.published_at).toLocaleDateString('pt-BR')) : ''}</small></div><span class="btn ghost">Ler →</span></a>`).join('') : `<div class="surface empty-state"><h2>Capítulos em preparação</h2><p class="muted">Acompanhe esta obra para descobrir quando a leitura começar.</p></div>`;
    const start = firstChapter ? `<a class="btn primary" href="/obra/${escapeHtml(work.slug)}/${escapeHtml(firstChapter.slug)}/">${chapters.length === 1 ? 'Ler capítulo disponível' : 'Começar leitura'}</a>` : '';
    const minutes = firstChapter ? `${readingMinutes(firstChapter.content)} min de leitura inicial` : 'Capítulos em breve';
    const heroSummary = work.short_description || work.description || '';
    const longerDescription = work.short_description && work.description && String(work.short_description).trim() !== String(work.description).trim()
      ? `<section class="work-overview surface"><div><span class="eyebrow">Sinopse</span><h2>Sobre esta história</h2></div><p>${escapeHtml(work.description)}</p></section>`
      : '';

    const body = `<section class="work-detail-page ${work.banner_url ? 'work-page-has-banner' : 'work-page-no-banner'}">
      <header class="work-detail-hero">
        ${backdrop}<div class="work-detail-overlay" aria-hidden="true"></div>
        <div class="container work-detail-hero-inner">
          <aside class="work-detail-cover">${cover}${work.cover_credit ? `<small class="work-cover-credit">Capa: ${escapeHtml(work.cover_credit)}</small>` : ''}</aside>
          <article class="work-detail-info">
            <div class="card-meta"><span class="eyebrow">${escapeHtml(typeLabel(work.type))}</span>${work.is_free ? '<span class="chip primary">Leitura gratuita</span>' : ''}<span class="chip">${escapeHtml(statusLabel(work.status))}</span></div>
            <h1>${escapeHtml(work.title)}</h1>
            ${work.subtitle ? `<p class="lead">${escapeHtml(work.subtitle)}</p>` : ''}
            <div class="work-byline"><span>Por <strong>${escapeHtml(work.author_name || 'Ryuzen')}</strong></span><span aria-hidden="true">•</span><span>${escapeHtml(minutes)}</span>${work.age_rating ? `<span aria-hidden="true">•</span><span>${escapeHtml(work.age_rating)}</span>` : ''}</div>
            ${heroSummary ? `<p class="work-description">${escapeHtml(heroSummary)}</p>` : ''}
            <div class="genre-pills">${genres}${tags}</div>
            <div class="actions">${start}<button class="btn work-library-btn" type="button" data-library-toggle data-work-id="${escapeHtml(work.id)}" data-work-slug="${escapeHtml(work.slug)}">Adicionar à biblioteca</button><button class="btn work-share-btn" type="button" data-share-link data-share-title="${escapeHtml(work.title)}">Compartilhar</button>${work.external_url ? `<a class="btn work-share-btn" href="${escapeHtml(work.external_url)}" rel="nofollow noopener" target="_blank">${escapeHtml(work.external_label || 'Ver edição externa')}</a>` : ''}</div>
          </article>
          ${bannerCredit}
        </div>
      </header>
      <div class="container work-detail-content">
        ${longerDescription}
        <section class="work-chapters-section">
          <div class="section-header"><div><span class="eyebrow">Leitura</span><h2>Capítulos</h2><p>${chapters.length ? `${chapters.length} ${chapters.length === 1 ? 'capítulo disponível' : 'capítulos disponíveis'}` : 'A leitura será liberada em breve.'}</p></div></div>
          <div class="chapter-list">${chapterList}</div>
        </section>
      </div>
    </section>`;
    const jsonLd = [{ '@context': 'https://schema.org', '@type': 'Book', name: work.title, author: { '@type': 'Person', name: work.author_name || 'Ryuzen' }, description: work.short_description || work.description, image: work.cover_url || undefined, url: `${SITE}${path}`, inLanguage: work.language || 'pt-BR', genre: rel.genres.map((g: any) => g.name) }, { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Início', item: `${SITE}/` }, { '@type': 'ListItem', position: 2, name: 'Explorar', item: `${SITE}/explorar/` }, { '@type': 'ListItem', position: 3, name: work.title, item: `${SITE}${path}` }] }];
    return publicPage({ title: work.seo_title || work.title, description: work.seo_description || work.short_description || work.description, path, image: work.banner_url || work.cover_url || undefined, body, jsonLd, extraScripts: ['/assets/public-interactions.js'] });
  } catch {
    return publicPage({ title: 'Não foi possível carregar a obra', path, body: `<section class="page-section"><div class="container"><div class="surface empty-state"><h1>Não foi possível abrir esta obra</h1><p class="muted">Tente novamente em instantes.</p><div class="actions centered"><a class="btn primary" href="/explorar/">Explorar catálogo</a></div></div></div></section>` });
  }
}
