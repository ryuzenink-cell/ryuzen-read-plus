import { json, readJson, methodNotAllowed } from '../../../_lib/http';
import { adminGuard, assertImageUrl, nullableText, text, intValue, boolInt, notFound, publicWhere } from '../../../_lib/editorial';
import { requireDb } from '../../../_lib/auth';

const MAX_ACTIVE_BANNERS = 6;

function safeCtaUrl(value: unknown) {
  const url = nullableText(value, 2000);
  if (!url) return null;
  if (url.startsWith('/')) return url;
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('invalid');
    return parsed.toString();
  } catch {
    throw new Error('O link do botão precisa ser uma URL válida ou uma rota interna iniciada por /.');
  }
}

async function normalizeBanner(db: any, body: any, current: any) {
  const sourceType = body.source_type === 'work' ? 'work' : body.source_type === 'external' ? 'external' : current.source_type;
  const workId = nullableText(body.work_id ?? current.work_id, 80);
  let work: any = null;
  if (sourceType === 'work') {
    if (!workId) throw new Error('Selecione uma obra publicada para reutilizar seu banner.');
    work = await db.prepare(`SELECT * FROM works WHERE id = ? AND ${publicWhere('works')} LIMIT 1`).bind(workId).first();
    if (!work || !work.banner_url) throw new Error('A obra selecionada não possui um banner público disponível.');
  }
  const imageUrl = sourceType === 'work'
    ? work.banner_url
    : assertImageUrl(nullableText(body.image_url ?? current.image_url, 2000), 'A URL do banner');
  if (!imageUrl) throw new Error('Informe a URL de uma imagem de banner.');
  const title = text(body.title ?? current.title ?? work?.title, 180);
  if (!title) throw new Error('Informe o título exibido no banner.');
  return {
    source_type: sourceType,
    work_id: sourceType === 'work' ? work.id : null,
    image_url: imageUrl,
    mobile_image_url: assertImageUrl(nullableText(body.mobile_image_url ?? current.mobile_image_url, 2000), 'A URL mobile do banner'),
    alt_text: nullableText(body.alt_text ?? current.alt_text, 280) || `Banner de ${title}`,
    eyebrow: nullableText(body.eyebrow ?? current.eyebrow, 80) || 'Em destaque',
    title,
    description: nullableText(body.description ?? current.description ?? work?.short_description ?? work?.description, 360),
    cta_label: nullableText(body.cta_label ?? current.cta_label, 60) || 'Começar leitura',
    cta_url: safeCtaUrl(body.cta_url ?? current.cta_url) || (work ? `/obra/${work.slug}/` : '/explorar/'),
    priority: intValue(body.priority ?? current.priority, 0),
    active: boolInt(body.active ?? current.active),
    starts_at: nullableText(body.starts_at ?? current.starts_at, 40),
    ends_at: nullableText(body.ends_at ?? current.ends_at, 40)
  };
}

async function activeCount(db: any) {
  const row = await db.prepare('SELECT COUNT(*) AS total FROM home_banners WHERE active = 1').first();
  return Number(row?.total || 0);
}

export async function onRequestPatch({ request, env, params }: any) {
  try {
    const { denied } = await adminGuard(request, env);
    if (denied) return denied;
    const db = requireDb(env);
    const current = await db.prepare('SELECT * FROM home_banners WHERE id = ? LIMIT 1').bind(params.id).first();
    if (!current) return notFound('Banner não encontrado.');
    const body = await readJson<any>(request);
    const data = await normalizeBanner(db, body, current);
    const count = await activeCount(db);
    if (!current.active && data.active && count >= MAX_ACTIVE_BANNERS) {
      return json({ ok: false, message: 'O carrossel permite no máximo 6 banners ativos.' }, { status: 409 });
    }
    if (current.active && !data.active && count <= 1) {
      return json({ ok: false, message: 'Mantenha pelo menos 1 banner ativo no carrossel. Adicione outro antes de desativar este.' }, { status: 409 });
    }
    await db.prepare(`
      UPDATE home_banners SET source_type = ?, work_id = ?, image_url = ?, mobile_image_url = ?, alt_text = ?, eyebrow = ?,
        title = ?, description = ?, cta_label = ?, cta_url = ?, priority = ?, active = ?, starts_at = ?, ends_at = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      data.source_type, data.work_id, data.image_url, data.mobile_image_url, data.alt_text, data.eyebrow,
      data.title, data.description, data.cta_label, data.cta_url, data.priority, data.active,
      data.starts_at, data.ends_at, new Date().toISOString(), current.id
    ).run();
    return json({ ok: true, message: 'Banner atualizado com sucesso.' });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao atualizar banner.' }, { status: 400 });
  }
}
export const onRequestPut = onRequestPatch;

export async function onRequestDelete({ request, env, params }: any) {
  try {
    const { denied } = await adminGuard(request, env);
    if (denied) return denied;
    const db = requireDb(env);
    const current = await db.prepare('SELECT * FROM home_banners WHERE id = ? LIMIT 1').bind(params.id).first();
    if (!current) return notFound('Banner não encontrado.');
    if (current.active && await activeCount(db) <= 1) {
      return json({ ok: false, message: 'O carrossel precisa manter ao menos 1 banner ativo. Adicione outro antes de excluir este.' }, { status: 409 });
    }
    await db.prepare('DELETE FROM home_banners WHERE id = ?').bind(current.id).run();
    return json({ ok: true, message: 'Banner removido com sucesso.' });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao remover banner.' }, { status: 500 });
  }
}
export function onRequestOptions() { return methodNotAllowed('PUT, PATCH, DELETE'); }
