import { json } from '../_lib/http';
import { requireDb } from '../_lib/auth';
import { publicWhere } from '../_lib/editorial';
export async function onRequestGet({ env }: any) {
  try {
    const db = requireDb(env);
    const { results = [] } = await db.prepare(`
      SELECT DISTINCT genres.id, genres.slug, genres.name
      FROM genres
      INNER JOIN work_genres ON work_genres.genre_id = genres.id
      INNER JOIN works ON works.id = work_genres.work_id
      WHERE ${publicWhere('works')}
      ORDER BY genres.name ASC
    `).all<any>();
    return json({ ok: true, items: results });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao carregar gêneros.', items: [] }, { status: 500 });
  }
}
