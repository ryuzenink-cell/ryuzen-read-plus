import { json } from '../../_lib/http';

export async function onRequestGet({ env, params }: any) {
  try {
    if (!env.DB) {
      return json({ ok: false, message: 'Binding DB não configurado.' }, { status: 500 });
    }

    const work = await env.DB.prepare(`
      SELECT id, slug, title, subtitle, description, type, status, cover_url, banner_url, is_featured, is_free, created_at, updated_at
      FROM works
      WHERE slug = ?
      LIMIT 1
    `).bind(params.slug).first();

    if (!work) {
      return json({ ok: false, message: 'Obra não encontrada.' }, { status: 404 });
    }

    const { results = [] } = await env.DB.prepare(`
      SELECT id, slug, number, title, excerpt, is_free, published_at
      FROM chapters
      WHERE work_id = ?
      ORDER BY number ASC
    `).bind(work.id).all();

    return json({ ok: true, source: 'd1', work, chapters: results });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao buscar obra.' }, { status: 500 });
  }
}
