import { json } from '../_lib/http';
import { requireDb } from '../_lib/auth';
import { getWorkRelations, publicWhere } from '../_lib/editorial';

async function decorate(db: any, rows: any[]) {
  const items = [];
  for (const row of rows) {
    const rel = await getWorkRelations(db, row.id);
    items.push({ ...row, genres: rel.genres.map((g: any) => g.name), tags: rel.tags.map((t: any) => t.name) });
  }
  return items;
}

export async function onRequestGet({ env }: any) {
  try {
    const db = requireDb(env);
    const activeSlotWindow = `(featured_slots.starts_at IS NULL OR featured_slots.starts_at <= datetime('now')) AND (featured_slots.ends_at IS NULL OR featured_slots.ends_at >= datetime('now'))`;
    const [featuredRaw, latestRaw, freeRaw, rankingRaw, chaptersRaw, genresRaw] = await Promise.all([
      db.prepare(`
        SELECT works.*, COALESCE(featured_slots.label, works.featured_label) AS featured_label
        FROM works
        LEFT JOIN featured_slots ON featured_slots.work_id = works.id AND featured_slots.active = 1 AND ${activeSlotWindow}
        WHERE ${publicWhere('works')} AND (works.is_featured = 1 OR featured_slots.id IS NOT NULL)
        GROUP BY works.id
        ORDER BY COALESCE(featured_slots.priority, works.featured_priority, 0) DESC, works.updated_at DESC
        LIMIT 6
      `).all<any>(),
      db.prepare(`SELECT * FROM works WHERE ${publicWhere('works')} ORDER BY published_at DESC, updated_at DESC LIMIT 12`).all<any>(),
      db.prepare(`SELECT * FROM works WHERE ${publicWhere('works')} AND is_free = 1 ORDER BY published_at DESC, updated_at DESC LIMIT 8`).all<any>(),
      db.prepare(`SELECT * FROM works WHERE ${publicWhere('works')} ORDER BY featured_priority DESC, updated_at DESC LIMIT 10`).all<any>(),
      db.prepare(`
        SELECT chapters.*, works.title AS work_title, works.slug AS work_slug
        FROM chapters
        INNER JOIN works ON works.id = chapters.work_id
        WHERE ${publicWhere('works')} AND chapters.publication_status = 'published'
        ORDER BY chapters.published_at DESC, chapters.updated_at DESC
        LIMIT 10
      `).all<any>(),
      db.prepare(`
        SELECT DISTINCT genres.id, genres.slug, genres.name
        FROM genres
        INNER JOIN work_genres ON work_genres.genre_id = genres.id
        INNER JOIN works ON works.id = work_genres.work_id
        WHERE ${publicWhere('works')}
        ORDER BY genres.name ASC
        LIMIT 50
      `).all<any>()
    ]);
    return json({
      ok: true,
      featuredWorks: await decorate(db, featuredRaw.results || []),
      latestWorks: await decorate(db, latestRaw.results || []),
      freeWorks: await decorate(db, freeRaw.results || []),
      ranking: await decorate(db, rankingRaw.results || []),
      recentChapters: chaptersRaw.results || [],
      genres: genresRaw.results || []
    });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao carregar a página inicial.' }, { status: 500 });
  }
}
