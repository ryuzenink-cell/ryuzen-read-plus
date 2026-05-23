import { json, readJson, methodNotAllowed } from '../../../_lib/http';
import { adminGuard, boolInt, logAdminActivity, notFound, nullableText, text } from '../../../_lib/editorial';
import { requireDb } from '../../../_lib/auth';
const TYPES = ['new_chapter', 'new_work', 'announcement', 'special_event', 'campaign', 'maintenance'];
const STATUSES = ['planned', 'confirmed', 'completed', 'cancelled'];
export async function onRequestPatch({ request, env, params }: any) {
  try {
    const { user, denied } = await adminGuard(request, env); if (denied) return denied;
    const db = requireDb(env); const current: any = await db.prepare('SELECT * FROM editorial_calendar_events WHERE id=?').bind(params.id).first();
    if (!current) return notFound('Evento editorial não encontrado.');
    const body = await readJson<any>(request);
    const title = text(body.title ?? current.title, 180); const scheduledAt = text(body.scheduled_at ?? current.scheduled_at, 40);
    if (!title || !scheduledAt) throw new Error('Informe título e data do evento.');
    const eventType = TYPES.includes(String(body.event_type ?? current.event_type)) ? String(body.event_type ?? current.event_type) : current.event_type;
    const status = STATUSES.includes(String(body.status ?? current.status)) ? String(body.status ?? current.status) : current.status;
    await db.prepare(`UPDATE editorial_calendar_events SET title=?,event_type=?,work_id=?,chapter_id=?,scheduled_at=?,description=?,status=?,future_public=?,future_home_highlight=?,updated_at=? WHERE id=?`).bind(title,eventType,nullableText(body.work_id ?? current.work_id,80),nullableText(body.chapter_id ?? current.chapter_id,80),scheduledAt,nullableText(body.description ?? current.description,400),status,boolInt(body.future_public ?? current.future_public),boolInt(body.future_home_highlight ?? current.future_home_highlight),new Date().toISOString(),current.id).run();
    await logAdminActivity(db, user, 'event_updated', 'event', current.id, title, { status });
    return json({ ok: true, message: 'Evento editorial atualizado com sucesso.' });
  } catch (error) { return json({ ok:false, message:error instanceof Error ? error.message : 'Erro ao editar evento.' }, { status:400 }); }
}
export const onRequestPut = onRequestPatch;
export function onRequestOptions() { return methodNotAllowed('PUT, PATCH'); }
