import { json, readJson, methodNotAllowed } from '../_lib/http';
import { getSessionUser, requireDb } from '../_lib/auth';
import { publicWhere } from '../_lib/editorial';

async function authenticated(request: Request, env: any) {
  const user = await getSessionUser(env, request);
  return user || null;
}
export async function onRequestGet({ request, env }: any) {
  try {
    const db = requireDb(env);
    const user = await authenticated(request, env);
    if (!user) return json({ ok: false, authenticated: false, message: 'Entre na sua conta para ver sua biblioteca.', items: [] }, { status: 401 });
    const { results = [] } = await db.prepare(`
      SELECT library_items.id, library_items.work_id, library_items.status, library_items.created_at, library_items.updated_at,
        works.slug, works.title, works.type, works.cover_url, works.cover_alt,
        progress.chapter_id AS last_chapter_id, progress.progress_percent,
        chapters.slug AS last_chapter_slug, chapters.title AS last_chapter_title
      FROM library_items
      INNER JOIN works ON works.id = library_items.work_id
      LEFT JOIN reading_progress AS progress ON progress.id = (
        SELECT rp.id FROM reading_progress rp
        WHERE rp.user_id = library_items.user_id AND rp.work_id = library_items.work_id
        ORDER BY rp.updated_at DESC LIMIT 1
      )
      LEFT JOIN chapters ON chapters.id = progress.chapter_id
      WHERE library_items.user_id = ? AND ${publicWhere('works')}
      ORDER BY COALESCE(progress.updated_at, library_items.updated_at) DESC
    `).bind(user.id).all<any>();
    return json({ ok: true, authenticated: true, user: { id: user.id, name: user.name, role: user.role }, items: results });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao carregar biblioteca.', items: [] }, { status: 500 });
  }
}
export async function onRequestPost({ request, env }: any) {
  try {
    const db = requireDb(env);
    const user = await authenticated(request, env);
    if (!user) return json({ ok: false, authenticated: false, message: 'Entre para adicionar obras à sua biblioteca.' }, { status: 401 });
    const body = await readJson<any>(request);
    const workId = String(body.work_id || body.workId || '').trim();
    if (!workId) return json({ ok: false, message: 'Obra não informada.' }, { status: 400 });
    const work = await db.prepare(`SELECT id, title FROM works WHERE id = ? AND ${publicWhere('works')} LIMIT 1`).bind(workId).first<any>();
    if (!work) return json({ ok: false, message: 'Obra não encontrada.' }, { status: 404 });
    const now = new Date().toISOString();
    await db.prepare(`
      INSERT INTO library_items (id, user_id, work_id, status, created_at, updated_at)
      VALUES (?, ?, ?, 'reading', ?, ?)
      ON CONFLICT(user_id, work_id) DO UPDATE SET status = 'reading', updated_at = excluded.updated_at
    `).bind(crypto.randomUUID(), user.id, work.id, now, now).run();
    return json({ ok: true, saved: true, message: 'Obra adicionada à sua biblioteca.' });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao salvar obra na biblioteca.' }, { status: 500 });
  }
}
export async function onRequestDelete({ request, env }: any) {
  try {
    const db = requireDb(env);
    const user = await authenticated(request, env);
    if (!user) return json({ ok: false, authenticated: false, message: 'Entre para gerenciar sua biblioteca.' }, { status: 401 });
    const body = await readJson<any>(request);
    const workId = String(body.work_id || body.workId || '').trim();
    if (!workId) return json({ ok: false, message: 'Obra não informada.' }, { status: 400 });
    await db.prepare('DELETE FROM library_items WHERE user_id = ? AND work_id = ?').bind(user.id, workId).run();
    return json({ ok: true, saved: false, message: 'Obra removida da sua biblioteca.' });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao remover obra da biblioteca.' }, { status: 500 });
  }
}
export function onRequestOptions() { return methodNotAllowed('GET, POST, DELETE'); }
