import { json } from '../../_lib/http';
import { adminGuard } from '../../_lib/editorial';
import { requireDb } from '../../_lib/auth';

export async function onRequestGet({ request, env }: any) {
  try {
    const { denied } = await adminGuard(request, env);
    if (denied) return denied;
    const db = requireDb(env);
    const [works, published, drafts, chapters, recentWorks, recentChapters] = await Promise.all([
      db.prepare("SELECT COUNT(*) AS total FROM works WHERE type IN ('light_novel', 'webnovel')").first(),
      db.prepare("SELECT COUNT(*) AS total FROM works WHERE type IN ('light_novel', 'webnovel') AND publication_status = 'published'").first(),
      db.prepare("SELECT COUNT(*) AS total FROM works WHERE type IN ('light_novel', 'webnovel') AND publication_status = 'draft'").first(),
      db.prepare("SELECT COUNT(*) AS total FROM chapters INNER JOIN works ON works.id = chapters.work_id WHERE works.type IN ('light_novel', 'webnovel') AND chapters.publication_status = 'published'").first(),
      db.prepare("SELECT id, slug, title, publication_status, updated_at FROM works WHERE type IN ('light_novel', 'webnovel') ORDER BY updated_at DESC LIMIT 5").all<any>(),
      db.prepare("SELECT chapters.id, chapters.slug, chapters.title, chapters.updated_at, works.title AS work_title, works.slug AS work_slug FROM chapters INNER JOIN works ON works.id = chapters.work_id WHERE works.type IN ('light_novel', 'webnovel') ORDER BY chapters.updated_at DESC LIMIT 5").all<any>()
    ]);
    return json({ ok: true, stats: { works: works?.total || 0, published: published?.total || 0, drafts: drafts?.total || 0, chapters: chapters?.total || 0 }, recentWorks: recentWorks.results || [], recentChapters: recentChapters.results || [] });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao carregar visão geral.' }, { status: 500 });
  }
}
