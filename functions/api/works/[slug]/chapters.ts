import { json } from '../../../_lib/http';
import { requireDb } from '../../../_lib/auth';
import { publicWhere } from '../../../_lib/editorial';
export async function onRequestGet({ env, params }: any) {
  try {
    const db = requireDb(env);
    const work = await db.prepare(`SELECT id FROM works WHERE slug = ? AND ${publicWhere('works')} LIMIT 1`).bind(params.slug).first<any>();
    if (!work) return json({ ok: false, message: 'Obra não encontrada.' }, { status: 404 });
    const { results = [] } = await db.prepare(`SELECT id, slug, number, title, excerpt, is_free, published_at FROM chapters WHERE work_id = ? AND publication_status = 'published' ORDER BY number ASC`).bind(work.id).all<any>();
    return json({ ok: true, items: results });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao carregar capítulos.', items: [] }, { status: 500 });
  }
}
