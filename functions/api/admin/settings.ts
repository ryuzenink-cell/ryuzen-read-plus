import { json, readJson, methodNotAllowed } from '../../_lib/http';
import { adminGuard, boolInt, logAdminActivity, nullableText } from '../../_lib/editorial';
import { requireDb } from '../../_lib/auth';
const KEYS = ['platform_name','institutional_text','banner_duration_ms','max_active_banners','featured_enabled'];
export async function onRequestGet({ request, env }: any) {
  try { const { denied } = await adminGuard(request, env); if (denied) return denied; const { results=[] } = await requireDb(env).prepare(`SELECT key, value FROM admin_settings WHERE key IN ('platform_name','institutional_text','banner_duration_ms','max_active_banners','featured_enabled')`).all<any>(); return json({ ok:true, items:Object.fromEntries(results.map((r:any)=>[r.key,r.value])) }); }
  catch (error) { return json({ ok:false, message:error instanceof Error ? error.message : 'Erro ao carregar configurações.' }, {status:500}); }
}
export async function onRequestPatch({ request, env }: any) {
  try {
    const { user, denied } = await adminGuard(request, env); if (denied) return denied;
    const body = await readJson<any>(request); const db = requireDb(env); const now = new Date().toISOString();
    const values: Record<string,string> = {
      platform_name: String(body.platform_name || 'Ryuzen Read Plus').trim().slice(0,100),
      institutional_text: String(body.institutional_text || '').trim().slice(0,240),
      banner_duration_ms: String(Math.max(3000, Math.min(30000, Number(body.banner_duration_ms) || 7000))),
      max_active_banners: String(Math.max(1, Math.min(6, Number(body.max_active_banners) || 6))),
      featured_enabled: boolInt(body.featured_enabled) ? 'true' : 'false'
    };
    for (const key of KEYS) await db.prepare('INSERT INTO admin_settings (key,value,updated_by,updated_at) VALUES (?,?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_by=excluded.updated_by,updated_at=excluded.updated_at').bind(key, values[key], user?.id || null, now).run();
    await logAdminActivity(db, user, 'settings_updated', 'settings', null, 'Configurações administrativas');
    return json({ ok:true, message:'Configurações atualizadas com sucesso.', items:values });
  } catch (error) { return json({ ok:false, message:error instanceof Error ? error.message : 'Erro ao atualizar configurações.' }, {status:400}); }
}
export function onRequestOptions() { return methodNotAllowed('GET, PATCH'); }
