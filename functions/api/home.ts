import { json } from '../_lib/http';
import { requireDb } from '../_lib/auth';
import { getWorkRelations, publicWhere } from '../_lib/editorial';

async function decorate(db: any, rows: any[]) {
  const items = [];
  for (const row of rows) {
    try {
      const rel = await getWorkRelations(db, row.id);
      items.push({ ...row, genres: rel.genres.map((g: any) => g.name), tags: rel.tags.map((t: any) => t.name) });
    } catch {
      // A taxonomia nunca deve impedir que uma obra publicada seja mostrada na home.
      items.push({ ...row, genres: [], tags: [] });
    }
  }
  return items;
}

async function rowsOrEmpty(query: Promise<any>) {
  try {
    const result = await query;
    return result?.results || [];
  } catch {
    // Uma seção secundária com problema não deve derrubar o carrossel nem a home inteira.
    return [];
  }
}

async function homeCarousel(db: any) {
  try {
    const { results = [] } = await db.prepare(`
      SELECT home_banners.id, home_banners.source_type, home_banners.work_id,
        CASE
          WHEN home_banners.source_type = 'work' AND works.banner_url IS NOT NULL AND works.banner_url <> '' THEN works.banner_url
          ELSE home_banners.image_url
        END AS image_url,
        home_banners.mobile_image_url,
        CASE
          WHEN home_banners.source_type = 'work' AND works.banner_alt IS NOT NULL AND works.banner_alt <> '' THEN works.banner_alt
          ELSE home_banners.alt_text
        END AS alt_text,
        home_banners.eyebrow, home_banners.title, home_banners.description,
        home_banners.cta_label, home_banners.cta_url, home_banners.priority,
        home_banners.active, home_banners.starts_at, home_banners.ends_at,
        works.slug AS work_slug, works.title AS work_title, works.cover_url AS work_cover_url
      FROM home_banners
      LEFT JOIN works ON works.id = home_banners.work_id
      WHERE home_banners.active = 1
        AND (home_banners.starts_at IS NULL OR home_banners.starts_at = '' OR datetime(home_banners.starts_at) <= datetime('now'))
        AND (home_banners.ends_at IS NULL OR home_banners.ends_at = '' OR datetime(home_banners.ends_at) >= datetime('now'))
        AND (
          home_banners.source_type = 'external'
          OR (home_banners.source_type = 'work' AND (${publicWhere('works')}) AND works.banner_url IS NOT NULL AND works.banner_url <> '')
        )
        AND (
          (home_banners.source_type = 'external' AND home_banners.image_url IS NOT NULL AND home_banners.image_url <> '')
          OR (home_banners.source_type = 'work' AND works.banner_url IS NOT NULL AND works.banner_url <> '')
        )
      ORDER BY home_banners.priority DESC, home_banners.updated_at DESC
      LIMIT 6
    `).all();

    // Se o administrador configurou o carrossel, respeitamos sua seleção e agenda.
    // Caso haja banners elegíveis, eles são apresentados imediatamente.
    if (results.length) return results;
    const configured = await db.prepare('SELECT COUNT(*) AS total FROM home_banners').first();
    if (Number((configured as any)?.total || 0) > 0) return [];
  } catch {
    // Compatibilidade: enquanto a tabela de carrossel ainda não existir, usa banners das obras.
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

    // O carrossel é o conteúdo prioritário da primeira dobra: carregue-o sem depender
    // do sucesso de seções secundárias como gêneros, ranking ou capítulos recentes.
    const carousel = await homeCarousel(db);
    const [featuredRows, latestRows, freeRows, editorialRows, chaptersRows, genresRows] = await Promise.all([
      rowsOrEmpty(db.prepare(`
        SELECT works.*, COALESCE(featured_slots.label, works.featured_label) AS featured_label
        FROM works
        LEFT JOIN featured_slots ON featured_slots.work_id = works.id AND featured_slots.active = 1 AND ${activeSlotWindow}
        WHERE ${publicWhere('works')} AND (works.is_featured = 1 OR featured_slots.id IS NOT NULL)
        GROUP BY works.id
        ORDER BY COALESCE(featured_slots.priority, works.featured_priority, 0) DESC, works.updated_at DESC
        LIMIT 6
      `).all()),
      rowsOrEmpty(db.prepare(`SELECT * FROM works WHERE ${publicWhere('works')} ORDER BY published_at DESC, updated_at DESC LIMIT 12`).all()),
      rowsOrEmpty(db.prepare(`SELECT * FROM works WHERE ${publicWhere('works')} AND is_free = 1 ORDER BY published_at DESC, updated_at DESC LIMIT 8`).all()),
      rowsOrEmpty(db.prepare(`SELECT * FROM works WHERE ${publicWhere('works')} ORDER BY is_featured DESC, featured_priority DESC, updated_at DESC LIMIT 10`).all()),
      rowsOrEmpty(db.prepare(`
        SELECT chapters.*, works.title AS work_title, works.slug AS work_slug, works.cover_url AS work_cover_url,
          works.cover_alt AS work_cover_alt
        FROM chapters
        INNER JOIN works ON works.id = chapters.work_id
        WHERE ${publicWhere('works')} AND chapters.publication_status = 'published'
        ORDER BY chapters.published_at DESC, chapters.updated_at DESC
        LIMIT 10
      `).all()),
      rowsOrEmpty(db.prepare(`
        SELECT DISTINCT genres.id, genres.slug, genres.name
        FROM genres
        INNER JOIN work_genres ON work_genres.genre_id = genres.id
        INNER JOIN works ON works.id = work_genres.work_id
        WHERE ${publicWhere('works')}
        ORDER BY genres.name ASC
        LIMIT 50
      `).all())
    ]);

    return json({
      ok: true,
      carousel,
      featuredWorks: await decorate(db, featuredRows),
      latestWorks: await decorate(db, latestRows),
      freeWorks: await decorate(db, freeRows),
      editorialSelection: await decorate(db, editorialRows),
      ranking: await decorate(db, editorialRows),
      recentChapters: chaptersRows,
      genres: genresRows
    });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao carregar a página inicial.' }, { status: 500 });
  }
}
