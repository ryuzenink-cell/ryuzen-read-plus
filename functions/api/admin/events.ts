import { json, readJson, methodNotAllowed } from '../../_lib/http';
import { adminGuard, boolInt, logAdminActivity, nullableText, text } from '../../_lib/editorial';
import { requireDb } from '../../_lib/auth';

const EVENT_TYPES = ['new_chapter', 'new_work', 'announcement', 'special_event', 'campaign', 'maintenance'];
const EVENT_STATUSES = ['planned', 'confirmed', 'completed', 'cancelled'];

function normalized(body: any) {
  const title = text(body.title, 180);
  const eventType = EVENT_TYPES.includes(String(body.event_type)) ? String(body.event_type) : 'announcement';
  const status = EVENT_STATUSES.includes(String(body.status)) ? String(body.status) : 'planned';
  const scheduledAt = text(body.scheduled_at, 40);
  if (title.length < 2) throw new Error('Informe o título do evento.');
  if (!scheduledAt) throw new Error('Informe a data do evento.');
  return { title, event_type: eventType, status, scheduled_at: scheduledAt, work_id: nullableText(body.work_id, 80), chapter_id: nullableText(body.chapter_id, 80), description: nullableText(body.description, 400), future_public: boolInt(body.future_public), future_home_highlight: boolInt(body.future_home_highlight) };
}
export async function onRequestGet({ request, env }: any) {
  try {
    const { denied } = await adminGuard(request, env); if (denied) return denied;
    const db = requireDb(env); const url = new URL(request.url); const type = url.searchParams.get('event_type') || ''; const future = url.searchParams.get('future') === '1';
    const where = ['1=1']; const binds: unknown[] = [];
    if (type) { where.push('e.event_type = ?'); binds.push(type); }
    if (future) { where.push("e.scheduled_at >= datetime('now') AND e.status NOT IN ('completed','cancelled')"); }
    const { results = [] } = await db.prepare(`SELECT e.*, works.title AS work_title, chapters.title AS chapter_title FROM editorial_calendar_events e LEFT JOIN works ON works.id=e.work_id LEFT JOIN chapters ON chapters.id=e.chapter_id WHERE ${where.join(' AND ')} ORDER BY e.scheduled_at ASC LIMIT 300`).bind(...binds).all<any>();
    return json({ ok: true, items: results });
  } catch (error) { return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao carregar calendário.' }, { status: 500 }); }
}
export async function onRequestPost({ request, env }: any) {
  try {
    const { user, denied } = await adminGuard(request, env); if (denied) return denied;
    const db = requireDb(env); const data = normalized(await readJson<any>(request)); const id = crypto.randomUUID(); const now = new Date().toISOString();
    await db.prepare(`INSERT INTO editorial_calendar_events (id,title,event_type,work_id,chapter_id,scheduled_at,description,status,future_public,future_home_highlight,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(id,data.title,data.event_type,data.work_id,data.chapter_id,data.scheduled_at,data.description,data.status,data.future_public,data.future_home_highlight,user?.id || null,now,now).run();
    await logAdminActivity(db, user, 'event_created', 'event', id, data.title);
    return json({ ok: true, id, message: 'Evento editorial criado com sucesso.' }, { status: 201 });
  } catch (error) { return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao salvar evento.' }, { status: 400 }); }
}
export function onRequestOptions() { return methodNotAllowed('GET, POST'); }
