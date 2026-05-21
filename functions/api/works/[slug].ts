import { json } from '../../_lib/http';
import { requireDb } from '../../_lib/auth';
import { getWorkRelations, publicWhere } from '../../_lib/editorial';

export async function onRequestGet({ env, params }: any) {
  try {
    const db = requireDb(env);
    const work = await db.prepare(`SELECT * FROM works WHERE slug = ? AND ${publicWhere('works')} LIMIT 1`).bind(params.slug).first<any>();
    if (!work) return json({ ok: false, message: 'Obra não encontrada.' }, { status: 404 });
    const rel = await getWorkRelations(db, work.id);
    const { results: chapters = [] } = await db.prepare(`
      SELECT id, slug, number, title, excerpt, is_free, publication_status, published_at
      FROM chapters
      WHERE work_id = ? AND publication_status = 'published'
      ORDER BY number ASC, published_at ASC
    `).bind(work.id).all<any>();
    return json({ ok: true, work: { ...work, genres: rel.genres.map((g: any) => g.name), tags: rel.tags.map((t: any) => t.name) }, chapters });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao carregar obra.' }, { status: 500 });
  }
}
