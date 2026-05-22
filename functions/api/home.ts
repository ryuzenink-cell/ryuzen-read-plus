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

async function homeCarousel(db: any) {
  try {
    const { results = [] } = await db.prepare(`
      SELECT home_banners.*, works.slug AS work_slug, works.title AS work_title, works.cover_url AS work_cover_url
      FROM home_banners
      LEFT JOIN works ON works.id = home_banners.work_id
      WHERE home_banners.active = 1
        AND (home_banners.starts_at IS NULL OR home_banners.starts_at = '' OR datetime(home_banners.starts_at) <= datetime('now'))
        AND (home_banners.ends_at IS NULL OR home_banners.ends_at = '' OR datetime(home_banners.ends_at) >= datetime('now'))
        AND (home_banners.work_id IS NULL OR (${publicWhere('works')}))
      ORDER BY home_banners.priority DESC, home_banners.updated_at DESC
      LIMIT 6
    `).all();
    const configured = await db.prepare('SELECT COUNT(*) AS total FROM home_banners').first();
    if (Number((configured as any)?.total || 0) > 0) return results;
  } catch {
    // Compatibilidade temporária: o deploy pode ocorrer antes da aplicação da nova migration.
  }
  const { results = [] } = await db.prepare(`
    SELECT id, id AS work_id, 'work' AS source_type, banner_url AS image_url, banner_alt AS alt_text,
      COALESCE(featured_label, 'Destaque da Ryuzen') AS eyebrow, title,
      COALESCE(short_description, description) AS description, 'Começar leitura' AS cta_label,
      '/obra/' || slug || '/' AS cta_url, featured_priority AS priority, slug AS work_slug,
      cover_url AS work_cover_url
    FROM works
    WHERE ${publicWhere('works')} AND banner_url IS NOT NULL AND banner_url <> ''
    ORDER BY is_featured DESC, featured_priority DESC, updated_at DESC
    LIMIT 6
  `).all();
  return results;
}

export async function onRequestGet({ env }: any) {
  try {
    const db = requireDb(env);
    const activeSlotWindow = `(featured_slots.starts_at IS NULL OR featured_slots.starts_at <= datetime('now')) AND (featured_slots.ends_at IS NULL OR featured_slots.ends_at >= datetime('now'))`;
    const [carousel, featuredRaw, latestRaw, freeRaw, editorialRaw, chaptersRaw, genresRaw] = await Promise.all([
      homeCarousel(db),
      db.prepare(`
        SELECT works.*, COALESCE(featured_slots.label, works.featured_label) AS featured_label
        FROM works
        LEFT JOIN featured_slots ON featured_slots.work_id = works.id AND featured_slots.active = 1 AND ${activeSlotWindow}
        WHERE ${publicWhere('works')} AND (works.is_featured = 1 OR featured_slots.id IS NOT NULL)
        GROUP BY works.id
        ORDER BY COALESCE(featured_slots.priority, works.featured_priority, 0) DESC, works.updated_at DESC
        LIMIT 6
      `).all(),
      db.prepare(`SELECT * FROM works WHERE ${publicWhere('works')} ORDER BY published_at DESC, updated_at DESC LIMIT 12`).all(),
      db.prepare(`SELECT * FROM works WHERE ${publicWhere('works')} AND is_free = 1 ORDER BY published_at DESC, updated_at DESC LIMIT 8`).all(),
      db.prepare(`SELECT * FROM works WHERE ${publicWhere('works')} ORDER BY is_featured DESC, featured_priority DESC, updated_at DESC LIMIT 10`).all(),
      db.prepare(`
        SELECT chapters.*, works.title AS work_title, works.slug AS work_slug, works.cover_url AS work_cover_url,
          works.cover_alt AS work_cover_alt
        FROM chapters
        INNER JOIN works ON works.id = chapters.work_id
        WHERE ${publicWhere('works')} AND chapters.publication_status = 'published'
        ORDER BY chapters.published_at DESC, chapters.updated_at DESC
        LIMIT 10
      `).all(),
      db.prepare(`
        SELECT DISTINCT genres.id, genres.slug, genres.name
        FROM genres
        INNER JOIN work_genres ON work_genres.genre_id = genres.id
        INNER JOIN works ON works.id = work_genres.work_id
        WHERE ${publicWhere('works')}
        ORDER BY genres.name ASC
        LIMIT 50
      `).all()
    ]);
    return json({
      ok: true,
      carousel,
      featuredWorks: await decorate(db, featuredRaw.results || []),
      latestWorks: await decorate(db, latestRaw.results || []),
      freeWorks: await decorate(db, freeRaw.results || []),
      editorialSelection: await decorate(db, editorialRaw.results || []),
      ranking: await decorate(db, editorialRaw.results || []),
      recentChapters: chaptersRaw.results || [],
      genres: genresRaw.results || []
    });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao carregar a página inicial.' }, { status: 500 });
  }
}
