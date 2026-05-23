import { json, readJson, methodNotAllowed } from '../../../_lib/http';
import { adminGuard, getWorkRelations, logAdminActivity, normalizeWorkPayload, notFound, syncTaxonomy, workByIdOrSlug } from '../../../_lib/editorial';
import { requireDb } from '../../../_lib/auth';

export async function onRequestGet({ request, env, params }: any) {
  try {
    const { denied } = await adminGuard(request, env);
    if (denied) return denied;
    const db = requireDb(env);
    const work = await workByIdOrSlug(db, params.id);
    if (!work) return notFound('Obra não encontrada.');
    const relations = await getWorkRelations(db, work.id);
    return json({ ok: true, item: { ...work, genres: relations.genres, tags: relations.tags } });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao carregar obra.' }, { status: 500 });
  }
}

async function updateWork({ request, env, params }: any) {
  try {
    const { user, denied } = await adminGuard(request, env);
    if (denied) return denied;
    const db = requireDb(env);
    const current = await workByIdOrSlug(db, params.id);
    if (!current) return notFound('Obra não encontrada.');
    const body = await readJson<any>(request);
    const data = normalizeWorkPayload(body, current);
    const duplicate = await db.prepare('SELECT id FROM works WHERE slug = ? AND id <> ? LIMIT 1').bind(data.slug, current.id).first<any>();
    if (duplicate) return json({ ok: false, message: 'Já existe outra obra usando esse slug.' }, { status: 409 });
    await db.prepare(`
      UPDATE works SET
        slug = ?, title = ?, subtitle = ?, alternate_title = ?, illustrator_name = ?, short_description = ?, description = ?, seo_title = ?, seo_description = ?,
        type = ?, status = ?, publication_status = ?, language = ?, age_rating = ?, content_warnings = ?, access_model = ?,
        cover_url = ?, cover_alt = ?, cover_credit = ?, banner_url = ?, mobile_banner_url = ?, social_image_url = ?, banner_alt = ?, banner_credit = ?,
        author_name = ?, editorial_notes = ?, is_free = ?, is_featured = ?, featured_priority = ?, featured_label = ?,
        featured_starts_at = ?, featured_ends_at = ?, external_url = ?, external_label = ?, published_at = ?, scheduled_at = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      data.slug, data.title, data.subtitle, data.alternate_title, data.illustrator_name, data.short_description, data.description, data.seo_title, data.seo_description,
      data.type, data.status, data.publication_status, data.language, data.age_rating, data.content_warnings, data.access_model,
      data.cover_url, data.cover_alt, data.cover_credit, data.banner_url, data.mobile_banner_url, data.social_image_url, data.banner_alt, data.banner_credit,
      data.author_name, data.editorial_notes, data.is_free, data.is_featured, data.featured_priority, data.featured_label,
      data.featured_starts_at, data.featured_ends_at, data.external_url, data.external_label, data.published_at, data.scheduled_at, new Date().toISOString(), current.id
    ).run();
    await syncTaxonomy(db, current.id, data.genres, 'genres', 'work_genres', 'genre_id');
    await syncTaxonomy(db, current.id, data.tags, 'tags', 'work_tags', 'tag_id');
    const action = current.publication_status !== data.publication_status
      ? (data.publication_status === 'published' ? 'work_published' : 'work_unpublished')
      : 'work_updated';
    await logAdminActivity(db, user, action, 'work', current.id, data.title);
    return json({ ok: true, message: 'Obra atualizada com sucesso.', id: current.id, slug: data.slug });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao atualizar obra.' }, { status: 500 });
  }
}

export const onRequestPatch = updateWork;
export const onRequestPut = updateWork;

export function onRequestOptions() { return methodNotAllowed('GET, PUT, PATCH'); }
