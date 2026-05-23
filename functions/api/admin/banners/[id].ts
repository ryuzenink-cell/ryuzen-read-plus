import { json, readJson, methodNotAllowed } from '../../../_lib/http';
import { adminGuard, assertImageUrl, nullableText, text, intValue, boolInt, logAdminActivity, notFound, publicWhere } from '../../../_lib/editorial';
import { requireDb } from '../../../_lib/auth';
const MAX_ACTIVE_BANNERS = 6;
function safeUrl(value: unknown) { const url = nullableText(value, 2000); if (!url) return null; if (url.startsWith('/')) return url; try { const p = new URL(url); if (!['http:', 'https:'].includes(p.protocol)) throw new Error(); return p.toString(); } catch { throw new Error('Informe uma URL válida ou rota interna para o botão.'); } }
async function activeCount(db: any) { const row = await db.prepare('SELECT COUNT(*) AS total FROM home_banners WHERE active = 1').first(); return Number(row?.total || 0); }
export async function onRequestPatch({ request, env, params }: any) {
  try {
    const { user, denied } = await adminGuard(request, env); if (denied) return denied;
    const db = requireDb(env); const current: any = await db.prepare('SELECT * FROM home_banners WHERE id = ? LIMIT 1').bind(params.id).first();
    if (!current) return notFound('Banner não encontrado.');
    const body = await readJson<any>(request);
    const sourceType = body.source_type === 'work' ? 'work' : body.source_type === 'external' ? 'external' : current.source_type;
    const workId = nullableText(body.work_id ?? current.work_id, 80); let work: any = null;
    if (sourceType === 'work') { work = await db.prepare(`SELECT * FROM works WHERE id = ? AND ${publicWhere('works')} LIMIT 1`).bind(workId).first(); if (!work?.banner_url) throw new Error('A obra selecionada não possui banner público disponível.'); }
    const imageUrl = sourceType === 'work' ? work.banner_url : assertImageUrl(nullableText(body.image_url ?? current.image_url, 2000), 'A URL do banner');
    const title = text(body.title ?? current.title ?? work?.title, 180); if (!imageUrl || !title) throw new Error('Informe imagem e título do banner.');
    const active = boolInt(body.active ?? current.active); const count = await activeCount(db);
    if (!current.active && active && count >= MAX_ACTIVE_BANNERS) return json({ ok: false, message: 'O carrossel permite no máximo 6 banners ativos.' }, { status: 409 });
    const now = new Date().toISOString();
    await db.prepare(`UPDATE home_banners SET source_type=?, work_id=?, image_url=?, mobile_image_url=?, alt_text=?, eyebrow=?, title=?, description=?, cta_label=?, cta_url=?, secondary_cta_label=?, secondary_cta_url=?, priority=?, active=?, starts_at=?, ends_at=?, duration_ms=?, updated_at=? WHERE id=?`).bind(
      sourceType, sourceType === 'work' ? work.id : null, imageUrl,
      assertImageUrl(nullableText(body.mobile_image_url ?? current.mobile_image_url ?? work?.mobile_banner_url, 2000), 'A URL mobile do banner'),
      nullableText(body.alt_text ?? current.alt_text, 280) || `Banner de ${title}`, nullableText(body.eyebrow ?? current.eyebrow, 80) || 'Em destaque',
      title, nullableText(body.description ?? current.description ?? work?.short_description, 180),
      nullableText(body.cta_label ?? current.cta_label, 60) || 'Começar leitura', safeUrl(body.cta_url ?? current.cta_url) || (work ? `/obra/${work.slug}/` : '/explorar/'),
      nullableText(body.secondary_cta_label ?? current.secondary_cta_label, 60), safeUrl(body.secondary_cta_url ?? current.secondary_cta_url),
      intValue(body.priority ?? current.priority, 0), active, nullableText(body.starts_at ?? current.starts_at, 40), nullableText(body.ends_at ?? current.ends_at, 40),
      body.duration_ms || current.duration_ms ? Math.max(3000, Math.min(30000, intValue(body.duration_ms ?? current.duration_ms, 7000))) : null, now, current.id
    ).run();
    await logAdminActivity(db, user, current.active !== active ? (active ? 'banner_activated' : 'banner_deactivated') : 'banner_updated', 'banner', current.id, title);
    return json({ ok: true, message: 'Banner atualizado com sucesso.' });
  } catch (error) { return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao atualizar banner.' }, { status: 400 }); }
}
export const onRequestPut = onRequestPatch;
export function onRequestOptions() { return methodNotAllowed('PUT, PATCH'); }
