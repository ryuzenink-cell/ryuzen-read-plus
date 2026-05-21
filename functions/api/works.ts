import { json } from '../_lib/http';
import { requireDb } from '../_lib/auth';
import { getWorkRelations, publicWhere } from '../_lib/editorial';

export async function onRequestGet({ request, env }: any) {
  try {
    const db = requireDb(env);
    const url = new URL(request.url);
    const binds: unknown[] = [];
    const where = [publicWhere('works')];
    if (url.searchParams.get('free') === 'true') where.push('works.is_free = 1');
    if (url.searchParams.get('type')) { where.push('works.type = ?'); binds.push(url.searchParams.get('type')); }
    if (url.searchParams.get('status')) { where.push('works.status = ?'); binds.push(url.searchParams.get('status')); }
    if (url.searchParams.get('q')) {
      const q = `%${url.searchParams.get('q')}%`;
      where.push('(works.title LIKE ? OR works.author_name LIKE ? OR works.short_description LIKE ? OR works.description LIKE ?)');
      binds.push(q, q, q, q);
    }
    const { results = [] } = await db.prepare(`
      SELECT works.*
      FROM works
      WHERE ${where.join(' AND ')}
      ORDER BY works.is_featured DESC, works.featured_priority DESC, works.published_at DESC, works.updated_at DESC
      LIMIT 200
    `).bind(...binds).all<any>();
    const items = [];
    for (const work of results) {
      const rel = await getWorkRelations(db, work.id);
      items.push({ ...work, genres: rel.genres.map((g: any) => g.name), tags: rel.tags.map((t: any) => t.name) });
    }
    return json({ ok: true, items });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao carregar obras.', items: [] }, { status: 500 });
  }
}
