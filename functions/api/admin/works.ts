import { json, readJson, methodNotAllowed } from '../../_lib/http';
import { adminGuard, logAdminActivity, normalizeWorkPayload, syncTaxonomy, workByIdOrSlug } from '../../_lib/editorial';
import { requireDb } from '../../_lib/auth';

export async function onRequestGet({ request, env }: any) {
  try {
    const { denied } = await adminGuard(request, env);
    if (denied) return denied;
    const db = requireDb(env);
    const url = new URL(request.url);
    const publication = url.searchParams.get('publication_status') || '';
    const editorialStatus = url.searchParams.get('status') || '';
    const type = url.searchParams.get('type') || '';
    const order = url.searchParams.get('order') || 'recent';
    const clauses = ["works.type IN ('light_novel', 'webnovel')"];
    const binds: unknown[] = [];
    if (publication) { clauses.push('works.publication_status = ?'); binds.push(publication); }
    if (editorialStatus) { clauses.push('works.status = ?'); binds.push(editorialStatus); }
    if (type) { clauses.push('works.type = ?'); binds.push(type); }
    if (url.searchParams.get('q')) {
      const search = `%${url.searchParams.get('q')}%`;
      clauses.push('(works.title LIKE ? OR works.author_name LIKE ? OR works.slug LIKE ? OR works.alternate_title LIKE ?)');
      binds.push(search, search, search, search);
    }
    const orderBy = order === 'oldest' ? 'works.updated_at ASC' : order === 'alpha' ? 'works.title ASC' : 'works.updated_at DESC';
    const { results = [] } = await db.prepare(`
      SELECT works.*, COUNT(DISTINCT chapters.id) AS chapter_count,
        SUM(CASE WHEN chapters.publication_status = 'published' THEN 1 ELSE 0 END) AS published_chapter_count,
        MAX(CASE WHEN home_banners.active = 1 THEN 1 ELSE 0 END) AS has_active_banner
      FROM works
      LEFT JOIN chapters ON chapters.work_id = works.id
      LEFT JOIN home_banners ON home_banners.work_id = works.id
      WHERE ${clauses.join(' AND ')}
      GROUP BY works.id
      ORDER BY ${orderBy}
      LIMIT 300
    `).bind(...binds).all<any>();
    return json({ ok: true, items: results });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao carregar obras.' }, { status: 500 });
  }
}

export async function onRequestPost({ request, env }: any) {
  try {
    const { user, denied } = await adminGuard(request, env);
    if (denied) return denied;
    const db = requireDb(env);
    const body = await readJson<any>(request);
    const data = normalizeWorkPayload(body);
    const duplicate = await workByIdOrSlug(db, data.slug);
    if (duplicate) return json({ ok: false, message: 'Já existe uma obra usando esse slug.' }, { status: 409 });
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await db.prepare(`
      INSERT INTO works (
        id, slug, title, subtitle, alternate_title, illustrator_name, short_description, description, seo_title, seo_description,
        type, status, publication_status, language, age_rating, content_warnings, access_model,
        cover_url, cover_alt, cover_credit, banner_url, mobile_banner_url, social_image_url, banner_alt, banner_credit,
        author_name, editorial_notes, is_free, is_featured, featured_priority, featured_label,
        featured_starts_at, featured_ends_at, external_url, external_label, published_at, scheduled_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, data.slug, data.title, data.subtitle, data.alternate_title, data.illustrator_name, data.short_description, data.description, data.seo_title, data.seo_description,
      data.type, data.status, data.publication_status, data.language, data.age_rating, data.content_warnings, data.access_model,
      data.cover_url, data.cover_alt, data.cover_credit, data.banner_url, data.mobile_banner_url, data.social_image_url, data.banner_alt, data.banner_credit,
      data.author_name, data.editorial_notes, data.is_free, data.is_featured, data.featured_priority, data.featured_label,
      data.featured_starts_at, data.featured_ends_at, data.external_url, data.external_label, data.published_at, data.scheduled_at, now, now
    ).run();
    await syncTaxonomy(db, id, data.genres, 'genres', 'work_genres', 'genre_id');
    await syncTaxonomy(db, id, data.tags, 'tags', 'work_tags', 'tag_id');
    await logAdminActivity(db, user, data.publication_status === 'published' ? 'work_published' : 'work_created', 'work', id, data.title);
    return json({ ok: true, message: 'Obra salva com sucesso.', id, slug: data.slug }, { status: 201 });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao salvar obra.' }, { status: 500 });
  }
}

export function onRequestOptions() { return methodNotAllowed('GET, POST'); }
