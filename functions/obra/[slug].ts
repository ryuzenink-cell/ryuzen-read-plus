import { requireDb } from '../_lib/auth';
import { escapeHtml, getWorkRelations, publicWhere } from '../_lib/editorial';

function page(title: string, description: string, body: string, image?: string) {
  const fullTitle = `${escapeHtml(title)} | Ryuzen Read Plus`;
  const desc = escapeHtml(description || 'Leia light novels e webnovels autorais na Ryuzen Read Plus.');
  const img = image ? escapeHtml(image) : '/favicon.png';
  return new Response(`<!doctype html><html lang="pt-BR" data-theme="light"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${fullTitle}</title><meta name="description" content="${desc}"><meta property="og:title" content="${fullTitle}"><meta property="og:description" content="${desc}"><meta property="og:image" content="${img}"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="/favicon.ico"><link rel="stylesheet" href="/assets/rrp.css"><script>(()=>{try{const s=localStorage.getItem('rrp-theme');document.documentElement.dataset.theme=s==='dark'?'dark':'light'}catch{}})()</script></head><body><a class="skip-link" href="#main">Ir para o conteúdo</a><main id="main">${body}</main><script src="/assets/reader-controls.js" defer></script></body></html>`, { headers: { 'content-type': 'text/html; charset=utf-8' } });
}

export async function onRequestGet({ env, params }: any) {
  try {
    const db = requireDb(env);
    const work = await db.prepare(`SELECT * FROM works WHERE slug = ? AND ${publicWhere('works')} LIMIT 1`).bind(params.slug).first<any>();
    if (!work) return page('Obra não encontrada', 'Obra não encontrada.', `<section class="page-section"><div class="container"><div class="surface empty-state"><h1>Obra não encontrada</h1><p class="muted">Esta novel não está publicada ou foi removida.</p><div class="actions centered"><a class="btn primary" href="/explorar/">Voltar ao catálogo</a></div></div></div></section>`);
    const rel = await getWorkRelations(db, work.id);
    const { results: chapters = [] } = await db.prepare(`SELECT * FROM chapters WHERE work_id = ? AND publication_status = 'published' ORDER BY number ASC, published_at ASC`).bind(work.id).all<any>();
    const genres = rel.genres.map((g: any) => `<span class="tag">${escapeHtml(g.name)}</span>`).join('');
    const tags = rel.tags.map((t: any) => `<span class="tag">${escapeHtml(t.name)}</span>`).join('');
    const cover = work.cover_url ? `<img src="${escapeHtml(work.cover_url)}" alt="${escapeHtml(work.cover_alt || `Capa de ${work.title}`)}" style="border-radius: var(--radius-md); border: 1px solid var(--color-border); object-fit: contain; width:100%; max-height: 620px; background: var(--color-surface-muted);">` : `<div class="cover-placeholder" style="aspect-ratio:5/7;border-radius:var(--radius-md);">R+</div>`;
    const chapterList = chapters.length ? chapters.map((chapter: any) => `<a class="chapter-item" href="/obra/${escapeHtml(work.slug)}/${escapeHtml(chapter.slug)}/"><div><strong>Capítulo ${escapeHtml(chapter.number)} — ${escapeHtml(chapter.title)}</strong><small>${chapter.is_free ? 'Grátis' : 'Leitura especial'}${chapter.published_at ? ' · ' + escapeHtml(new Date(chapter.published_at).toLocaleDateString('pt-BR')) : ''}</small><p class="muted">${escapeHtml(chapter.excerpt || '')}</p></div></a>`).join('') : `<div class="surface empty-state"><h2>Ainda não há capítulos disponíveis.</h2><p class="muted">A obra está publicada, mas seus capítulos ainda não foram liberados.</p></div>`;
    const startButton = chapters[0] ? `<a class="btn primary" href="/obra/${escapeHtml(work.slug)}/${escapeHtml(chapters[0].slug)}/">Começar leitura</a>` : '';
    return page(work.seo_title || work.title, work.seo_description || work.short_description || work.description, `<section class="page-section"><div class="container"><p class="muted"><a href="/">Início</a> / <a href="/explorar/">Explorar</a> / ${escapeHtml(work.title)}</p><div class="two-column"><article class="prose"><span class="eyebrow">${escapeHtml(work.type === 'webnovel' ? 'Webnovel' : 'Light Novel')}</span><h1>${escapeHtml(work.title)}</h1>${work.subtitle ? `<p class="lead">${escapeHtml(work.subtitle)}</p>` : ''}<p>${escapeHtml(work.description || '')}</p><div class="genre-pills">${genres}${tags}</div><div class="actions">${startButton}<a class="btn soft" href="/biblioteca/">Salvar na biblioteca</a></div><h2>Capítulos</h2><div class="chapter-list">${chapterList}</div></article><aside class="surface info-card">${cover}<p><strong>Autor:</strong> ${escapeHtml(work.author_name || 'Ryuzen')}</p><p><strong>Status:</strong> ${escapeHtml(work.status || 'Em andamento')}</p><p><strong>Classificação:</strong> ${escapeHtml(work.age_rating || 'Não informada')}</p>${work.cover_credit ? `<p class="muted"><strong>Crédito da capa:</strong> ${escapeHtml(work.cover_credit)}</p>` : ''}</aside></div></div></section>`, work.cover_url || undefined);
  } catch (error) {
    return page('Erro ao carregar obra', 'Erro ao carregar obra.', `<section class="page-section"><div class="container"><div class="surface empty-state"><h1>Não foi possível carregar a obra</h1><p class="muted">${escapeHtml(error instanceof Error ? error.message : 'Tente novamente em instantes.')}</p><div class="actions centered"><a class="btn primary" href="/explorar/">Voltar ao catálogo</a></div></div></div></section>`);
  }
}
