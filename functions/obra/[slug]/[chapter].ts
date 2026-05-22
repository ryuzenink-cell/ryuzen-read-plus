import { requireDb } from '../../_lib/auth';
import { escapeHtml, markdownToSafeHtml, publicWhere } from '../../_lib/editorial';
import { readerPage } from '../../_lib/public-page';

const SITE = 'https://readplus.ryuzen.ink';
function readingMinutes(content: string | null) {
  return Math.max(1, Math.ceil(String(content || '').trim().split(/\s+/).filter(Boolean).length / 220));
}
export async function onRequestGet({ env, params }: any) {
  const path = `/obra/${String(params.slug || '')}/${String(params.chapter || '')}/`;
  try {
    const db = requireDb(env);
    const work = await db.prepare(`SELECT * FROM works WHERE slug = ? AND ${publicWhere('works')} LIMIT 1`).bind(params.slug).first<any>();
    if (!work) return readerPage({ title: 'Obra não encontrada', path, body: `<section class="reader-shell"><div class="surface empty-state"><h1>Obra não encontrada</h1><p class="muted">Esta história não está disponível no momento.</p><div class="actions centered"><a class="btn primary" href="/explorar/">Explorar catálogo</a></div></div></section>` });
    const chapter = await db.prepare(`SELECT * FROM chapters WHERE work_id = ? AND slug = ? AND publication_status = 'published' LIMIT 1`).bind(work.id, params.chapter).first<any>();
    if (!chapter) return readerPage({ title: 'Capítulo não encontrado', path, body: `<section class="reader-shell"><div class="surface empty-state"><h1>Capítulo não encontrado</h1><p class="muted">Este capítulo ainda não está disponível.</p><div class="actions centered"><a class="btn primary" href="/obra/${escapeHtml(work.slug)}/">Voltar à obra</a></div></div></section>` });
    const { results: siblings = [] } = await db.prepare(`SELECT id, slug, number, title FROM chapters WHERE work_id = ? AND publication_status = 'published' ORDER BY number ASC, published_at ASC`).bind(work.id).all<any>();
    const index = siblings.findIndex((item: any) => item.id === chapter.id);
    const prev = siblings[index - 1];
    const next = siblings[index + 1];
    const minutes = readingMinutes(chapter.content);
    const content = markdownToSafeHtml(chapter.content || '');
    const endCta = next ? `<h2>Continue a história</h2><p class="muted">O próximo capítulo já está disponível.</p><div class="actions centered"><a class="btn primary" href="/obra/${escapeHtml(work.slug)}/${escapeHtml(next.slug)}/">Ler próximo capítulo →</a><button class="btn soft" type="button" data-library-toggle data-work-id="${escapeHtml(work.id)}">Acompanhar obra</button></div>` : `<h2>Você chegou ao capítulo mais recente</h2><p class="muted">Adicione a obra à sua biblioteca para encontrá-la facilmente quando voltar.</p><div class="actions centered"><button class="btn primary" type="button" data-library-toggle data-work-id="${escapeHtml(work.id)}">Adicionar à biblioteca</button><button class="btn soft" type="button" data-share-link data-share-title="${escapeHtml(work.title)}">Compartilhar</button></div>`;
    const body = `<section class="reader-shell" data-reader-shell data-work-id="${escapeHtml(work.id)}" data-work-slug="${escapeHtml(work.slug)}" data-work-title="${escapeHtml(work.title)}" data-work-cover="${escapeHtml(work.cover_url || '')}" data-chapter-id="${escapeHtml(chapter.id)}" data-chapter-slug="${escapeHtml(chapter.slug)}" data-chapter-title="${escapeHtml(chapter.title)}"><article class="reader-content"><nav class="reader-breadcrumb"><a href="/obra/${escapeHtml(work.slug)}/">← ${escapeHtml(work.title)}</a></nav><div class="reader-meta"><span class="chip">Capítulo ${escapeHtml(chapter.number)}</span>${chapter.is_free ? '<span class="chip primary">Grátis</span>' : ''}<span class="chip">${minutes} min de leitura</span></div><h1>${escapeHtml(chapter.title)}</h1>${chapter.excerpt ? `<p class="lead">${escapeHtml(chapter.excerpt)}</p>` : ''}<div class="reader-story">${content}</div></article><nav class="reader-nav" aria-label="Navegação entre capítulos">${prev ? `<a class="btn ghost" href="/obra/${escapeHtml(work.slug)}/${escapeHtml(prev.slug)}/">← Capítulo anterior</a>` : '<span></span>'}<a class="btn soft" href="/obra/${escapeHtml(work.slug)}/">Sumário</a>${next ? `<a class="btn primary" href="/obra/${escapeHtml(work.slug)}/${escapeHtml(next.slug)}/">Próximo capítulo →</a>` : '<span></span>'}</nav><aside class="surface chapter-end-cta">${endCta}</aside></section>`;
    const jsonLd = [{ '@context': 'https://schema.org', '@type': 'Article', headline: chapter.title, isPartOf: { '@type': 'Book', name: work.title, url: `${SITE}/obra/${work.slug}/` }, author: { '@type': 'Person', name: work.author_name || 'Ryuzen' }, datePublished: chapter.published_at || undefined, description: chapter.seo_description || chapter.excerpt || undefined, url: `${SITE}${path}`, image: work.cover_url || undefined }];
    return readerPage({ title: `${work.title} — ${chapter.title}`, description: chapter.seo_description || chapter.excerpt || work.description, path, image: work.cover_url || undefined, body, jsonLd });
  } catch {
    return readerPage({ title: 'Não foi possível carregar o capítulo', path, body: `<section class="reader-shell"><div class="surface empty-state"><h1>Não foi possível abrir o capítulo</h1><p class="muted">Tente novamente em instantes.</p><div class="actions centered"><a class="btn primary" href="/explorar/">Explorar catálogo</a></div></div></section>` });
  }
}
