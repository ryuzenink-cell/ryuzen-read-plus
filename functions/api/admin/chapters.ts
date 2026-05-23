import { json, readJson, methodNotAllowed } from '../../_lib/http';
import { adminGuard, logAdminActivity, normalizeChapterPayload, workByIdOrSlug } from '../../_lib/editorial';
import { requireDb } from '../../_lib/auth';

export async function onRequestGet({ request, env }: any) {
  try {
    const { denied } = await adminGuard(request, env);
    if (denied) return denied;
    const db = requireDb(env);
    const url = new URL(request.url);
    const workId = url.searchParams.get('work_id') || '';
    const status = url.searchParams.get('publication_status') || '';
    const q = url.searchParams.get('q') || '';
    const binds: unknown[] = [];
    const where = ["works.type IN ('light_novel', 'webnovel')"];
    if (workId) { where.push('chapters.work_id = ?'); binds.push(workId); }
    if (status) { where.push('chapters.publication_status = ?'); binds.push(status); }
    if (q) { where.push('(chapters.title LIKE ? OR works.title LIKE ?)'); binds.push(`%${q}%`, `%${q}%`); }
    const { results = [] } = await db.prepare(`
      SELECT chapters.*, works.title AS work_title, works.slug AS work_slug
      FROM chapters
      INNER JOIN works ON works.id = chapters.work_id
      WHERE ${where.join(' AND ')}
      ORDER BY works.title ASC, chapters.volume_number ASC, chapters.order_index ASC, chapters.number ASC, chapters.created_at ASC
      LIMIT 500
    `).bind(...binds).all<any>();
    return json({ ok: true, items: results });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao carregar capítulos.' }, { status: 500 });
  }
}

export async function onRequestPost({ request, env }: any) {
  try {
    const { user, denied } = await adminGuard(request, env);
    if (denied) return denied;
    const db = requireDb(env);
    const body = await readJson<any>(request);
    const data = normalizeChapterPayload(body);
    const work = await workByIdOrSlug(db, data.work_id);
    if (!work) return json({ ok: false, message: 'Selecione uma obra válida para o capítulo.' }, { status: 400 });
    const duplicate = await db.prepare('SELECT id FROM chapters WHERE work_id = ? AND slug = ? LIMIT 1').bind(work.id, data.slug).first<any>();
    if (duplicate) return json({ ok: false, message: 'Essa obra já possui um capítulo com esse slug.' }, { status: 409 });
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await db.prepare(`
      INSERT INTO chapters (id, work_id, volume_id, volume_number, chapter_type, order_index, slug, number, title, excerpt, content, content_format, seo_title, seo_description, is_free, publication_status, published_at, scheduled_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, work.id, data.volume_id, data.volume_number, data.chapter_type, data.order_index, data.slug, data.number, data.title, data.excerpt, data.content, data.content_format, data.seo_title, data.seo_description, data.is_free, data.publication_status, data.published_at, data.scheduled_at, now, now).run();
    await db.prepare('UPDATE works SET updated_at = ? WHERE id = ?').bind(now, work.id).run();
    await logAdminActivity(db, user, data.publication_status === 'published' ? 'chapter_published' : 'chapter_created', 'chapter', id, `${work.title} — ${data.title}`);
    return json({ ok: true, message: 'Capítulo salvo com sucesso.', id, slug: data.slug }, { status: 201 });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao salvar capítulo.' }, { status: 500 });
  }
}
export function onRequestOptions() { return methodNotAllowed('GET, POST'); }
