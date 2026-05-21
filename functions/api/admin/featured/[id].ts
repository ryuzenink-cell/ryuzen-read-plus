import { json, readJson, methodNotAllowed } from '../../../_lib/http';
import { adminGuard, intValue, nullableText, boolInt, notFound } from '../../../_lib/editorial';
import { requireDb } from '../../../_lib/auth';

export async function onRequestPatch({ request, env, params }: any) {
  try {
    const { denied } = await adminGuard(request, env);
    if (denied) return denied;
    const db = requireDb(env);
    const current = await db.prepare('SELECT * FROM featured_slots WHERE id = ? LIMIT 1').bind(params.id).first<any>();
    if (!current) return notFound('Destaque não encontrado.');
    const body = await readJson<any>(request);
    await db.prepare(`UPDATE featured_slots SET slot_key = ?, label = ?, priority = ?, starts_at = ?, ends_at = ?, active = ?, updated_at = ? WHERE id = ?`).bind(
      nullableText(body.slot_key || body.slotKey || current.slot_key, 80), nullableText(body.label || current.label, 80), intValue(body.priority ?? current.priority, 0), nullableText(body.starts_at || body.startsAt || current.starts_at, 40) || '1970-01-01T00:00:00.000Z', nullableText(body.ends_at || body.endsAt || current.ends_at, 40) || '2999-12-31T23:59:59.000Z', boolInt(body.active ?? current.active), new Date().toISOString(), current.id
    ).run();
    return json({ ok: true, message: 'Destaque atualizado com sucesso.' });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao atualizar destaque.' }, { status: 500 });
  }
}
export const onRequestPut = onRequestPatch;

export async function onRequestDelete({ request, env, params }: any) {
  try {
    const { denied } = await adminGuard(request, env);
    if (denied) return denied;
    const db = requireDb(env);
    const current = await db.prepare('SELECT * FROM featured_slots WHERE id = ? LIMIT 1').bind(params.id).first<any>();
    if (!current) return notFound('Destaque não encontrado.');
    await db.prepare('DELETE FROM featured_slots WHERE id = ?').bind(current.id).run();
    return json({ ok: true, message: 'Destaque removido com sucesso.' });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao remover destaque.' }, { status: 500 });
  }
}
export function onRequestOptions() { return methodNotAllowed('PUT, PATCH, DELETE'); }
