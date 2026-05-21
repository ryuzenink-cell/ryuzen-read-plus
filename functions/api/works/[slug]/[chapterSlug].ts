import { json } from '../../../_lib/http';
import { requireDb } from '../../../_lib/auth';
import { publicWhere } from '../../../_lib/editorial';
export async function onRequestGet({ env, params }: any) {
  try {
    const db = requireDb(env);
    const work = await db.prepare(`SELECT * FROM works WHERE slug = ? AND ${publicWhere('works')} LIMIT 1`).bind(params.slug).first<any>();
    if (!work) return json({ ok: false, message: 'Obra não encontrada.' }, { status: 404 });
    const chapter = await db.prepare(`SELECT * FROM chapters WHERE work_id = ? AND slug = ? AND publication_status = 'published' LIMIT 1`).bind(work.id, params.chapterSlug).first<any>();
    if (!chapter) return json({ ok: false, message: 'Capítulo não encontrado.' }, { status: 404 });
    const { results: siblings = [] } = await db.prepare(`SELECT id, slug, number, title FROM chapters WHERE work_id = ? AND publication_status = 'published' ORDER BY number ASC, published_at ASC`).bind(work.id).all<any>();
    return json({ ok: true, work, chapter, siblings });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao carregar capítulo.' }, { status: 500 });
  }
}
