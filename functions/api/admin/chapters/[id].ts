import { json, readJson, methodNotAllowed } from '../../../_lib/http';
import { adminGuard, logAdminActivity, normalizeChapterPayload, notFound, workByIdOrSlug } from '../../../_lib/editorial';
import { requireDb } from '../../../_lib/auth';

async function chapterById(db: any, id: string) {
  return db.prepare(`SELECT chapters.*, works.title AS work_title, works.slug AS work_slug FROM chapters INNER JOIN works ON works.id = chapters.work_id WHERE chapters.id = ? LIMIT 1`).bind(id).first();
}
export async function onRequestGet({ request, env, params }: any) {
  try {
    const { denied } = await adminGuard(request, env);
    if (denied) return denied;
    const item = await chapterById(requireDb(env), params.id);
    return item ? json({ ok: true, item }) : notFound('Capítulo não encontrado.');
  } catch (error) { return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao carregar capítulo.' }, { status: 500 }); }
}
async function updateChapter({ request, env, params }: any) {
  try {
    const { user, denied } = await adminGuard(request, env);
    if (denied) return denied;
    const db = requireDb(env);
    const current = await chapterById(db, params.id);
    if (!current) return notFound('Capítulo não encontrado.');
    const data = normalizeChapterPayload(await readJson<any>(request), current);
    const work = await workByIdOrSlug(db, data.work_id || current.work_id);
    if (!work) return json({ ok: false, message: 'Selecione uma obra válida para o capítulo.' }, { status: 400 });
    const duplicate = await db.prepare('SELECT id FROM chapters WHERE work_id = ? AND slug = ? AND id <> ? LIMIT 1').bind(work.id, data.slug, current.id).first();
    if (duplicate) return json({ ok: false, message: 'Essa obra já possui outro capítulo com esse slug.' }, { status: 409 });
    const now = new Date().toISOString();
    await db.prepare(`
      UPDATE chapters SET work_id = ?, volume_id = ?, volume_number = ?, chapter_type = ?, order_index = ?, slug = ?, number = ?, title = ?, excerpt = ?, content = ?, content_format = ?, seo_title = ?, seo_description = ?, is_free = ?, publication_status = ?, published_at = ?, scheduled_at = ?, updated_at = ?
      WHERE id = ?
    `).bind(work.id, data.volume_id, data.volume_number, data.chapter_type, data.order_index, data.slug, data.number, data.title, data.excerpt, data.content, data.content_format, data.seo_title, data.seo_description, data.is_free, data.publication_status, data.published_at, data.scheduled_at, now, current.id).run();
    await db.prepare('UPDATE works SET updated_at = ? WHERE id = ?').bind(now, work.id).run();
    const action = current.publication_status !== data.publication_status && data.publication_status === 'published' ? 'chapter_published' : 'chapter_updated';
    await logAdminActivity(db, user, action, 'chapter', current.id, `${work.title} — ${data.title}`);
    return json({ ok: true, message: 'Capítulo atualizado com sucesso.', id: current.id, slug: data.slug });
  } catch (error) { return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao atualizar capítulo.' }, { status: 500 }); }
}
export const onRequestPatch = updateChapter;
export const onRequestPut = updateChapter;
export function onRequestOptions() { return methodNotAllowed('GET, PUT, PATCH'); }
