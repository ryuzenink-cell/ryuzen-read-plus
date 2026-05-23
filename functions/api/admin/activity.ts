import { json } from '../../_lib/http';
import { adminGuard } from '../../_lib/editorial';
import { requireDb } from '../../_lib/auth';

export async function onRequestGet({ request, env }: any) {
  try {
    const { denied } = await adminGuard(request, env); if (denied) return denied;
    const db = requireDb(env);
    const { results = [] } = await db.prepare(`SELECT id, action, entity_type, entity_id, entity_title, actor_email, created_at FROM admin_activity ORDER BY created_at DESC LIMIT 100`).all<any>();
    return json({ ok: true, items: results });
  } catch (error) { return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao carregar atividades.' }, { status: 500 }); }
}
