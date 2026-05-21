import { requireDb } from '../../_lib/auth';
import { escapeHtml, markdownToSafeHtml, publicWhere } from '../../_lib/editorial';

function page(title: string, description: string, body: string, image?: string) {
  const fullTitle = `${escapeHtml(title)} | Ryuzen Read Plus`;
  const desc = escapeHtml(description || 'Leia capítulos de light novels e webnovels na Ryuzen Read Plus.');
  const img = image ? escapeHtml(image) : '/favicon.png';
  return new Response(`<!doctype html><html lang="pt-BR" data-theme="light"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${fullTitle}</title><meta name="description" content="${desc}"><meta property="og:title" content="${fullTitle}"><meta property="og:description" content="${desc}"><meta property="og:image" content="${img}"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="/favicon.ico"><link rel="stylesheet" href="/assets/rrp.css"><script>(()=>{try{const s=localStorage.getItem('rrp-theme');document.documentElement.dataset.theme=s==='dark'?'dark':'light'}catch{}})()</script></head><body><div class="reader-topbar"><div class="container reader-topbar-inner"><a class="brand" href="/"><img src="/icons/favicon-32x32.png" alt=""><span>Ryuzen Read Plus<small>Leitor</small></span></a><div class="reader-actions"><button class="btn ghost" type="button" data-reader-size="down">A-</button><button class="btn ghost" type="button" data-reader-size="up">A+</button><button class="theme-toggle" type="button" data-theme-toggle>☀ / 🌙</button></div></div></div><main>${body}</main><script src="/assets/reader-controls.js" defer></script></body></html>`, { headers: { 'content-type': 'text/html; charset=utf-8' } });
}

export async function onRequestGet({ env, params }: any) {
  try {
    const db = requireDb(env);
    const work = await db.prepare(`SELECT * FROM works WHERE slug = ? AND ${publicWhere('works')} LIMIT 1`).bind(params.slug).first<any>();
    if (!work) return page('Obra não encontrada', 'Obra não encontrada.', `<section class="reader-shell"><div class="surface empty-state"><h1>Obra não encontrada</h1><p class="muted">Esta novel não está publicada ou foi removida.</p><div class="actions centered"><a class="btn primary" href="/explorar/">Voltar ao catálogo</a></div></div></section>`);
    const chapter = await db.prepare(`SELECT * FROM chapters WHERE work_id = ? AND slug = ? AND publication_status = 'published' LIMIT 1`).bind(work.id, params.chapter).first<any>();
    if (!chapter) return page('Capítulo não encontrado', 'Capítulo não encontrado.', `<section class="reader-shell"><div class="surface empty-state"><h1>Capítulo não encontrado</h1><p class="muted">Este capítulo não está publicado ou foi removido.</p><div class="actions centered"><a class="btn primary" href="/obra/${escapeHtml(work.slug)}/">Voltar à obra</a></div></div></section>`);
    const { results: siblings = [] } = await db.prepare(`SELECT id, slug, number, title FROM chapters WHERE work_id = ? AND publication_status = 'published' ORDER BY number ASC, published_at ASC`).bind(work.id).all<any>();
    const index = siblings.findIndex((item: any) => item.id === chapter.id);
    const prev = siblings[index - 1];
    const next = siblings[index + 1];
    const content = chapter.content_format === 'html' ? markdownToSafeHtml(chapter.content) : markdownToSafeHtml(chapter.content || '');
    const body = `<section class="reader-shell" data-reader-shell><article class="reader-content"><p class="muted"><a href="/obra/${escapeHtml(work.slug)}/">← ${escapeHtml(work.title)}</a></p><h1>${escapeHtml(chapter.title)}</h1>${chapter.excerpt ? `<p class="lead">${escapeHtml(chapter.excerpt)}</p>` : ''}${content}</article><nav class="reader-nav" aria-label="Navegação entre capítulos">${prev ? `<a class="btn ghost" href="/obra/${escapeHtml(work.slug)}/${escapeHtml(prev.slug)}/">← Capítulo anterior</a>` : '<span></span>'}<a class="btn soft" href="/obra/${escapeHtml(work.slug)}/">Voltar à obra</a>${next ? `<a class="btn primary" href="/obra/${escapeHtml(work.slug)}/${escapeHtml(next.slug)}/">Próximo capítulo →</a>` : '<span></span>'}</nav></section>`;
    return page(`${work.title} — ${chapter.title}`, chapter.seo_description || chapter.excerpt || work.description, body, work.cover_url || undefined);
  } catch (error) {
    return page('Erro ao carregar capítulo', 'Erro ao carregar capítulo.', `<section class="reader-shell"><div class="surface empty-state"><h1>Não foi possível carregar o capítulo</h1><p class="muted">${escapeHtml(error instanceof Error ? error.message : 'Tente novamente em instantes.')}</p></div></section>`);
  }
}
