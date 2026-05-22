import { json, readJson, methodNotAllowed } from '../_lib/http';
import { getSessionUser, requireDb } from '../_lib/auth';
import { publicWhere, numberValue } from '../_lib/editorial';

export async function onRequestPost({ request, env }: any) {
  try {
    const user = await getSessionUser(env, request);
    if (!user) return json({ ok: false, authenticated: false }, { status: 401 });
    const db = requireDb(env);
    const body = await readJson<any>(request);
    const workId = String(body.work_id || '').trim();
    const chapterId = String(body.chapter_id || '').trim();
    const percent = Math.max(0, Math.min(100, numberValue(body.progress_percent, 0)));
    const chapter = await db.prepare(`
      SELECT chapters.id, chapters.work_id FROM chapters
      INNER JOIN works ON works.id = chapters.work_id
      WHERE chapters.id = ? AND chapters.work_id = ? AND chapters.publication_status = 'published' AND ${publicWhere('works')} LIMIT 1
    `).bind(chapterId, workId).first<any>();
    if (!chapter) return json({ ok: false, message: 'Capítulo não encontrado.' }, { status: 404 });
    const now = new Date().toISOString();
    await db.prepare(`
      INSERT INTO reading_progress (id, user_id, work_id, chapter_id, progress_percent, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, work_id, chapter_id) DO UPDATE SET progress_percent = excluded.progress_percent, updated_at = excluded.updated_at
    `).bind(crypto.randomUUID(), user.id, workId, chapterId, percent, now).run();
    await db.prepare(`UPDATE library_items SET status = 'reading', updated_at = ? WHERE user_id = ? AND work_id = ?`).bind(now, user.id, workId).run();
    return json({ ok: true, progress_percent: percent });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao salvar progresso.' }, { status: 500 });
  }
}
export function onRequestOptions() { return methodNotAllowed('POST'); }
