import { json } from '../_lib/http';
import { getSessionUser, requireDb } from '../_lib/auth';

export async function onRequestGet({ request, env }: any) {
  try {
    const db = requireDb(env);
    const user = await getSessionUser(env, request);
    if (!user) return json({ ok: false, authenticated: false, message: 'Entre na sua conta para ver sua biblioteca.', items: [] }, { status: 401 });
    const { results = [] } = await db.prepare(`
      SELECT library_items.id, library_items.status, library_items.created_at, library_items.updated_at, works.slug, works.title, works.type, works.cover_url
      FROM library_items
      INNER JOIN works ON works.id = library_items.work_id
      WHERE library_items.user_id = ?
        AND works.type IN ('light_novel', 'webnovel')
        AND works.publication_status = 'published'
      ORDER BY library_items.updated_at DESC
    `).bind(user.id).all<any>();
    return json({ ok: true, authenticated: true, user: { id: user.id, name: user.name, role: user.role }, items: results });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao carregar biblioteca.', items: [] }, { status: 500 });
  }
}
