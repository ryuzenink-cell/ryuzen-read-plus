import { json, readJson, methodNotAllowed } from '../../_lib/http';
import { adminGuard, normalizeChapterPayload, workByIdOrSlug } from '../../_lib/editorial';
import { requireDb } from '../../_lib/auth';

export async function onRequestGet({ request, env }: any) {
  try {
    const { denied } = await adminGuard(request, env);
    if (denied) return denied;
    const db = requireDb(env);
    const url = new URL(request.url);
    const workId = url.searchParams.get('work_id') || url.searchParams.get('workId');
    const binds: unknown[] = [];
    const where = ["works.type IN ('light_novel', 'webnovel')"];
    if (workId) { where.push('chapters.work_id = ?'); binds.push(workId); }
    const { results = [] } = await db.prepare(`
      SELECT chapters.*, works.title AS work_title, works.slug AS work_slug
      FROM chapters
      INNER JOIN works ON works.id = chapters.work_id
      WHERE ${where.join(' AND ')}
      ORDER BY works.title ASC, chapters.number ASC, chapters.created_at ASC
      LIMIT 500
    `).bind(...binds).all<any>();
    return json({ ok: true, items: results });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao carregar capítulos.' }, { status: 500 });
  }
}

export async function onRequestPost({ request, env }: any) {
  try {
    const { denied } = await adminGuard(request, env);
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
      INSERT INTO chapters (id, work_id, volume_id, slug, number, title, excerpt, content, content_format, seo_title, seo_description, is_free, publication_status, published_at, scheduled_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, work.id, data.volume_id, data.slug, data.number, data.title, data.excerpt, data.content, data.content_format, data.seo_title, data.seo_description, data.is_free, data.publication_status, data.published_at, data.scheduled_at, now, now).run();
    await db.prepare('UPDATE works SET updated_at = ? WHERE id = ?').bind(now, work.id).run();
    return json({ ok: true, message: 'Capítulo salvo com sucesso.', id, slug: data.slug }, { status: 201 });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao salvar capítulo.' }, { status: 500 });
  }
}

export function onRequestOptions() { return methodNotAllowed('GET, POST'); }
