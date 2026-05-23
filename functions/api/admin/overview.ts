import { json } from '../../_lib/http';
import { adminGuard } from '../../_lib/editorial';
import { requireDb } from '../../_lib/auth';

export async function onRequestGet({ request, env }: any) {
  try {
    const { denied } = await adminGuard(request, env); if (denied) return denied;
    const db = requireDb(env);
    const [works, published, drafts, chapters, scheduledChapters, activeBanners, futureEvents, worksWithoutChapters, recentWorks, recentChapters, upcoming, activity, pendingWorks, pendingDraftChapters] = await Promise.all([
      db.prepare("SELECT COUNT(*) AS total FROM works WHERE type IN ('light_novel','webnovel')").first(),
      db.prepare("SELECT COUNT(*) AS total FROM works WHERE type IN ('light_novel','webnovel') AND publication_status='published'").first(),
      db.prepare("SELECT COUNT(*) AS total FROM works WHERE type IN ('light_novel','webnovel') AND publication_status='draft'").first(),
      db.prepare("SELECT COUNT(*) AS total FROM chapters c INNER JOIN works w ON w.id=c.work_id WHERE w.type IN ('light_novel','webnovel') AND c.publication_status='published'").first(),
      db.prepare("SELECT COUNT(*) AS total FROM chapters c INNER JOIN works w ON w.id=c.work_id WHERE w.type IN ('light_novel','webnovel') AND c.publication_status='scheduled'").first(),
      db.prepare("SELECT COUNT(*) AS total FROM home_banners WHERE active=1").first(),
      db.prepare("SELECT COUNT(*) AS total FROM editorial_calendar_events WHERE scheduled_at >= datetime('now') AND status NOT IN ('completed','cancelled')").first(),
      db.prepare("SELECT COUNT(*) AS total FROM works w WHERE w.type IN ('light_novel','webnovel') AND w.publication_status='published' AND NOT EXISTS (SELECT 1 FROM chapters c WHERE c.work_id=w.id AND c.publication_status='published')").first(),
      db.prepare("SELECT id, slug, title, publication_status, updated_at FROM works WHERE type IN ('light_novel','webnovel') ORDER BY updated_at DESC LIMIT 5").all<any>(),
      db.prepare("SELECT c.id,c.slug,c.title,c.publication_status,c.updated_at,w.title AS work_title,w.slug AS work_slug FROM chapters c INNER JOIN works w ON w.id=c.work_id WHERE w.type IN ('light_novel','webnovel') ORDER BY c.updated_at DESC LIMIT 5").all<any>(),
      db.prepare("SELECT e.id,e.title,e.event_type,e.scheduled_at,e.status,w.title AS work_title FROM editorial_calendar_events e LEFT JOIN works w ON w.id=e.work_id WHERE e.scheduled_at >= datetime('now') AND e.status NOT IN ('completed','cancelled') ORDER BY e.scheduled_at ASC LIMIT 5").all<any>(),
      db.prepare("SELECT action,entity_type,entity_title,actor_email,created_at FROM admin_activity ORDER BY created_at DESC LIMIT 6").all<any>(),
      db.prepare(`SELECT w.id,w.title,w.slug,w.cover_url,w.short_description,w.banner_url,w.mobile_banner_url,
        SUM(CASE WHEN c.publication_status='published' THEN 1 ELSE 0 END) AS published_chapters
        FROM works w LEFT JOIN chapters c ON c.work_id=w.id
        WHERE w.type IN ('light_novel','webnovel') AND w.publication_status='published'
        GROUP BY w.id ORDER BY w.updated_at DESC LIMIT 100`).all<any>(),
      db.prepare(`SELECT c.id,c.title,w.title AS work_title FROM chapters c INNER JOIN works w ON w.id=c.work_id WHERE w.type IN ('light_novel','webnovel') AND c.publication_status='draft' ORDER BY c.updated_at DESC LIMIT 8`).all<any>()
    ]);
    const pendencies: any[] = [];
    for (const work of pendingWorks.results || []) {
      if (!Number(work.published_chapters || 0)) pendencies.push({ level:'high', label:`${work.title} está publicada sem capítulo publicado.`, href:`/admin/capitulos/?work_id=${encodeURIComponent(work.id)}` });
      if (!work.cover_url) pendencies.push({ level:'medium', label:`${work.title} está publicada sem capa.`, href:`/admin/obras/nova/?id=${encodeURIComponent(work.id)}` });
      if (!work.short_description) pendencies.push({ level:'medium', label:`${work.title} não possui texto promocional curto.`, href:`/admin/obras/nova/?id=${encodeURIComponent(work.id)}` });
      if (work.banner_url && !work.mobile_banner_url) pendencies.push({ level:'medium', label:`${work.title} possui banner sem versão mobile.`, href:`/admin/obras/nova/?id=${encodeURIComponent(work.id)}` });
    }
    if (!Number(activeBanners?.total || 0)) pendencies.push({ level:'high', label:'Nenhum banner ativo na página inicial.', href:'/admin/banners/' });
    if (!Number(futureEvents?.total || 0)) pendencies.push({ level:'low', label:'Nenhum evento editorial futuro cadastrado.', href:'/admin/calendario/' });
    for (const chapter of pendingDraftChapters.results || []) pendencies.push({ level:'low', label:`${chapter.work_title}: “${chapter.title}” permanece em rascunho.`, href:`/admin/capitulos/?id=${encodeURIComponent(chapter.id)}` });
    return json({ ok:true, stats:{ works:works?.total||0,published:published?.total||0,drafts:drafts?.total||0,chapters:chapters?.total||0,scheduledChapters:scheduledChapters?.total||0,activeBanners:activeBanners?.total||0,futureEvents:futureEvents?.total||0,worksWithoutChapters:worksWithoutChapters?.total||0 }, recentWorks:recentWorks.results||[], recentChapters:recentChapters.results||[], upcoming:upcoming.results||[], activity:activity.results||[], pendencies:pendencies.slice(0,14) });
  } catch (error) { return json({ ok:false, message:error instanceof Error ? error.message : 'Erro ao carregar visão geral.' }, {status:500}); }
}
