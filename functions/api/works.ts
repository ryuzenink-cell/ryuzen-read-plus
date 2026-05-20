import { json } from '../_lib/http';

export async function onRequestGet({ env }: any) {
  try {
    if (!env.DB) {
      return json({ ok: true, source: 'static-fallback', items: [] });
    }

    const { results = [] } = await env.DB.prepare(`
      SELECT id, slug, title, subtitle, description, type, status, cover_url, banner_url, is_featured, is_free, created_at, updated_at
      FROM works
      ORDER BY is_featured DESC, updated_at DESC
      LIMIT 100
    `).all();

    return json({ ok: true, source: 'd1', items: results });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao buscar obras.', items: [] }, { status: 500 });
  }
}
