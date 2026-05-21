import { json } from './http';
import { requireDb, getSessionUser, requireAdminUser } from './auth';

export const NOVEL_TYPES = ['light_novel', 'webnovel'];
export const WORK_STATUSES = ['ongoing', 'completed', 'development', 'paused'];
export const PUBLICATION_STATUSES = ['draft', 'scheduled', 'published', 'hidden', 'archived'];
export const CONTENT_FORMATS = ['markdown', 'html', 'plain'];

export function nowIso() {
  return new Date().toISOString();
}

export function slugify(value: string) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 90);
}

export function text(value: unknown, max = 5000) {
  return String(value ?? '').trim().slice(0, max);
}

export function nullableText(value: unknown, max = 5000) {
  const clean = text(value, max);
  return clean || null;
}

export function boolInt(value: unknown) {
  return value === true || value === 'true' || value === 1 || value === '1' ? 1 : 0;
}

export function intValue(value: unknown, fallback = 0) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function numberValue(value: unknown, fallback = 0) {
  const parsed = Number(String(value ?? ''));
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parseList(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => text(item, 80)).filter(Boolean);
  return String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => text(item, 80));
}

export function assertImageUrl(value: string | null, label: string) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('invalid');
    return url.toString();
  } catch {
    throw new Error(`${label} precisa ser uma URL pública válida.`);
  }
}

export function assertExternalUrl(value: string | null, label: string) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (!['http:', 'https:', 'mailto:'].includes(url.protocol)) throw new Error('invalid');
    return url.toString();
  } catch {
    throw new Error(`${label} precisa ser uma URL válida.`);
  }
}

export function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function markdownToSafeHtml(markdown: string) {
  const blocks = String(markdown || '').replace(/\r\n/g, '\n').split(/\n{2,}/);
  return blocks.map((block) => {
    const raw = block.trim();
    if (!raw) return '';
    const escaped = escapeHtml(raw);
    if (escaped.startsWith('### ')) return `<h3>${inlineMarkdown(escaped.slice(4))}</h3>`;
    if (escaped.startsWith('## ')) return `<h2>${inlineMarkdown(escaped.slice(3))}</h2>`;
    if (escaped.startsWith('# ')) return `<h1>${inlineMarkdown(escaped.slice(2))}</h1>`;
    return `<p>${inlineMarkdown(escaped).replace(/\n/g, '<br>')}</p>`;
  }).join('\n');
}

function inlineMarkdown(value: string) {
  return value
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g, (_match, alt, url) => `<img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" loading="lazy">`)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_match, label, url) => `<a href="${escapeHtml(url)}" rel="nofollow noopener" target="_blank">${label}</a>`);
}

export async function adminGuard(request: Request, env: any) {
  const user = await getSessionUser(env, request);
  const denied = requireAdminUser(user);
  if (denied) return { user: null, denied };
  return { user, denied: null };
}

export function publicWhere(alias = 'works') {
  return `${alias}.type IN ('light_novel', 'webnovel') AND ${alias}.publication_status = 'published'`;
}

export async function getWorkRelations(db: any, workId: string) {
  const [{ results: genres = [] }, { results: tags = [] }] = await Promise.all([
    db.prepare(`SELECT genres.name, genres.slug FROM genres INNER JOIN work_genres ON work_genres.genre_id = genres.id WHERE work_genres.work_id = ? ORDER BY genres.name`).bind(workId).all(),
    db.prepare(`SELECT tags.name, tags.slug FROM tags INNER JOIN work_tags ON work_tags.tag_id = tags.id WHERE work_tags.work_id = ? ORDER BY tags.name`).bind(workId).all()
  ]);
  return { genres, tags };
}

export async function syncTaxonomy(db: any, workId: string, names: string[], table: 'genres' | 'tags', relationTable: 'work_genres' | 'work_tags', idColumn: 'genre_id' | 'tag_id') {
  await db.prepare(`DELETE FROM ${relationTable} WHERE work_id = ?`).bind(workId).run();
  const unique = [...new Set(names.map((name) => text(name, 80)).filter(Boolean))];
  for (const name of unique) {
    const slug = slugify(name);
    if (!slug) continue;
    const existing = await db.prepare(`SELECT id FROM ${table} WHERE slug = ? LIMIT 1`).bind(slug).first();
    const id = existing?.id || crypto.randomUUID();
    if (!existing) await db.prepare(`INSERT INTO ${table} (id, slug, name) VALUES (?, ?, ?)`).bind(id, slug, name).run();
    await db.prepare(`INSERT OR IGNORE INTO ${relationTable} (work_id, ${idColumn}) VALUES (?, ?)`).bind(workId, id).run();
  }
}

export async function workByIdOrSlug(db: any, idOrSlug: string) {
  return db.prepare(`SELECT * FROM works WHERE id = ? OR slug = ? LIMIT 1`).bind(idOrSlug, idOrSlug).first();
}

export function normalizeWorkPayload(body: any, current?: any) {
  const title = text(body.title ?? current?.title, 220);
  const slug = slugify(text(body.slug ?? current?.slug ?? title, 120));
  const type = NOVEL_TYPES.includes(String(body.type ?? current?.type)) ? String(body.type ?? current?.type) : 'light_novel';
  const status = WORK_STATUSES.includes(String(body.status ?? current?.status)) ? String(body.status ?? current?.status) : 'development';
  const publicationStatus = PUBLICATION_STATUSES.includes(String(body.publication_status ?? body.publicationStatus ?? current?.publication_status)) ? String(body.publication_status ?? body.publicationStatus ?? current?.publication_status) : 'draft';
  const description = text(body.description ?? current?.description, 20000);
  const shortDescription = nullableText(body.short_description ?? body.shortDescription ?? current?.short_description, 500);
  const seoTitle = nullableText(body.seo_title ?? body.seoTitle ?? current?.seo_title, 70);
  const seoDescription = nullableText(body.seo_description ?? body.seoDescription ?? current?.seo_description, 170);
  const coverUrl = assertImageUrl(nullableText(body.cover_url ?? body.coverUrl ?? current?.cover_url, 2000), 'A URL da capa');
  const bannerUrl = assertImageUrl(nullableText(body.banner_url ?? body.bannerUrl ?? current?.banner_url, 2000), 'A URL do banner');
  const externalUrl = assertExternalUrl(nullableText(body.external_url ?? body.externalUrl ?? current?.external_url, 2000), 'O link externo');
  if (title.length < 2) throw new Error('Informe um título válido.');
  if (!slug) throw new Error('Informe um slug válido.');
  if ((publicationStatus === 'published' || publicationStatus === 'scheduled') && description.length < 20) throw new Error('Para publicar, informe uma sinopse com pelo menos 20 caracteres.');
  return {
    title,
    slug,
    subtitle: nullableText(body.subtitle ?? current?.subtitle, 220),
    short_description: shortDescription,
    description,
    seo_title: seoTitle,
    seo_description: seoDescription,
    type,
    status,
    publication_status: publicationStatus,
    language: nullableText(body.language ?? current?.language, 20) || 'pt-BR',
    age_rating: nullableText(body.age_rating ?? body.ageRating ?? current?.age_rating, 30),
    cover_url: coverUrl,
    cover_alt: nullableText(body.cover_alt ?? body.coverAlt ?? current?.cover_alt, 300),
    cover_credit: nullableText(body.cover_credit ?? body.coverCredit ?? current?.cover_credit, 500),
    banner_url: bannerUrl,
    banner_alt: nullableText(body.banner_alt ?? body.bannerAlt ?? current?.banner_alt, 300),
    banner_credit: nullableText(body.banner_credit ?? body.bannerCredit ?? current?.banner_credit, 500),
    author_name: text(body.author_name ?? body.authorName ?? current?.author_name ?? 'Ryuzen', 220),
    editorial_notes: nullableText(body.editorial_notes ?? body.editorialNotes ?? current?.editorial_notes, 5000),
    is_free: boolInt(body.is_free ?? body.isFree ?? current?.is_free ?? 1),
    is_featured: boolInt(body.is_featured ?? body.isFeatured ?? current?.is_featured ?? 0),
    featured_priority: intValue(body.featured_priority ?? body.featuredPriority ?? current?.featured_priority, 0),
    featured_label: nullableText(body.featured_label ?? body.featuredLabel ?? current?.featured_label, 80),
    featured_starts_at: nullableText(body.featured_starts_at ?? body.featuredStartsAt ?? current?.featured_starts_at, 40),
    featured_ends_at: nullableText(body.featured_ends_at ?? body.featuredEndsAt ?? current?.featured_ends_at, 40),
    external_url: externalUrl,
    external_label: nullableText(body.external_label ?? body.externalLabel ?? current?.external_label, 80),
    published_at: nullableText(body.published_at ?? body.publishedAt ?? current?.published_at, 40) || (publicationStatus === 'published' ? nowIso() : null),
    scheduled_at: nullableText(body.scheduled_at ?? body.scheduledAt ?? current?.scheduled_at, 40),
    genres: parseList(body.genres ?? []),
    tags: parseList(body.tags ?? [])
  };
}

export function normalizeChapterPayload(body: any, current?: any) {
  const title = text(body.title ?? current?.title, 220);
  const slug = slugify(text(body.slug ?? current?.slug ?? title, 120));
  const publicationStatus = PUBLICATION_STATUSES.includes(String(body.publication_status ?? body.publicationStatus ?? current?.publication_status)) ? String(body.publication_status ?? body.publicationStatus ?? current?.publication_status) : 'draft';
  const contentFormat = CONTENT_FORMATS.includes(String(body.content_format ?? body.contentFormat ?? current?.content_format)) ? String(body.content_format ?? body.contentFormat ?? current?.content_format) : 'markdown';
  const content = String(body.content ?? current?.content ?? '').trim();
  if (title.length < 2) throw new Error('Informe um título válido para o capítulo.');
  if (!slug) throw new Error('Informe um slug válido para o capítulo.');
  if (publicationStatus === 'published' && content.length < 20) throw new Error('Para publicar, o capítulo precisa ter conteúdo.');
  return {
    work_id: text(body.work_id ?? body.workId ?? current?.work_id, 80),
    volume_id: nullableText(body.volume_id ?? body.volumeId ?? current?.volume_id, 80),
    number: numberValue(body.number ?? current?.number, 1),
    title,
    slug,
    excerpt: nullableText(body.excerpt ?? current?.excerpt, 500),
    content,
    content_format: contentFormat,
    seo_title: nullableText(body.seo_title ?? body.seoTitle ?? current?.seo_title, 70),
    seo_description: nullableText(body.seo_description ?? body.seoDescription ?? current?.seo_description, 170),
    is_free: boolInt(body.is_free ?? body.isFree ?? current?.is_free ?? 1),
    publication_status: publicationStatus,
    published_at: nullableText(body.published_at ?? body.publishedAt ?? current?.published_at, 40) || (publicationStatus === 'published' ? nowIso() : null),
    scheduled_at: nullableText(body.scheduled_at ?? body.scheduledAt ?? current?.scheduled_at, 40)
  };
}

export function notFound(message = 'Registro não encontrado.') {
  return json({ ok: false, message }, { status: 404 });
}
