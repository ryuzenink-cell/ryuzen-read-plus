import { json, readJson, methodNotAllowed } from '../../_lib/http';
import { adminGuard, intValue, nullableText, boolInt } from '../../_lib/editorial';
import { requireDb } from '../../_lib/auth';

export async function onRequestGet({ request, env }: any) {
  try {
    const { denied } = await adminGuard(request, env);
    if (denied) return denied;
    const db = requireDb(env);
    const { results = [] } = await db.prepare(`
      SELECT featured_slots.*, works.title, works.slug, works.cover_url, works.publication_status
      FROM featured_slots
      INNER JOIN works ON works.id = featured_slots.work_id
      WHERE works.type IN ('light_novel', 'webnovel')
      ORDER BY featured_slots.priority DESC, featured_slots.updated_at DESC
      LIMIT 200
    `).all<any>();
    return json({ ok: true, items: results });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao carregar destaques.' }, { status: 500 });
  }
}

export async function onRequestPost({ request, env }: any) {
  try {
    const { denied } = await adminGuard(request, env);
    if (denied) return denied;
    const db = requireDb(env);
    const body = await readJson<any>(request);
    const workId = String(body.work_id || body.workId || '').trim();
    if (!workId) return json({ ok: false, message: 'Selecione uma obra.' }, { status: 400 });
    const work = await db.prepare(`SELECT id FROM works WHERE id = ? AND type IN ('light_novel', 'webnovel') LIMIT 1`).bind(workId).first<any>();
    if (!work) return json({ ok: false, message: 'Obra não encontrada.' }, { status: 404 });
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await db.prepare(`INSERT INTO featured_slots (id, work_id, slot_key, label, priority, starts_at, ends_at, active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
      id, work.id, nullableText(body.slot_key || body.slotKey, 80) || 'home_featured', nullableText(body.label, 80) || 'Destaque editorial', intValue(body.priority, 0), nullableText(body.starts_at || body.startsAt, 40) || '1970-01-01T00:00:00.000Z', nullableText(body.ends_at || body.endsAt, 40) || '2999-12-31T23:59:59.000Z', boolInt(body.active ?? 1), now, now
    ).run();
    await db.prepare('UPDATE works SET is_featured = 1, featured_priority = MAX(featured_priority, ?), updated_at = ? WHERE id = ?').bind(intValue(body.priority, 0), now, work.id).run();
    return json({ ok: true, message: 'Destaque salvo com sucesso.', id }, { status: 201 });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao salvar destaque.' }, { status: 500 });
  }
}
export function onRequestOptions() { return methodNotAllowed('GET, POST'); }
