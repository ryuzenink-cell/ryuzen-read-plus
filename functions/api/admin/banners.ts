import { json, readJson, methodNotAllowed } from '../../_lib/http';
import { adminGuard, assertImageUrl, nullableText, text, intValue, boolInt, publicWhere } from '../../_lib/editorial';
import { requireDb } from '../../_lib/auth';

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

async function normalizeBanner(db: any, body: any) {
  const sourceType = body.source_type === 'work' ? 'work' : 'external';
  const workId = nullableText(body.work_id, 80);
  let work: any = null;
  if (sourceType === 'work') {
    if (!workId) throw new Error('Selecione uma obra publicada para reutilizar seu banner.');
    work = await db.prepare(`SELECT * FROM works WHERE id = ? AND ${publicWhere('works')} LIMIT 1`).bind(workId).first();
    if (!work) throw new Error('A obra selecionada não foi encontrada ou ainda não está publicada.');
    if (!work.banner_url) throw new Error('A obra selecionada ainda não possui banner cadastrado.');
  }
  const imageUrl = sourceType === 'work'
    ? work.banner_url
    : assertImageUrl(nullableText(body.image_url, 2000), 'A URL do banner');
  if (!imageUrl) throw new Error('Informe a URL de uma imagem de banner.');
  const mobileImageUrl = assertImageUrl(nullableText(body.mobile_image_url, 2000), 'A URL mobile do banner');
  const title = text(body.title || work?.title, 180);
  if (!title) throw new Error('Informe o título exibido no banner.');
  return {
    source_type: sourceType,
    work_id: sourceType === 'work' ? work.id : null,
    image_url: imageUrl,
    mobile_image_url: mobileImageUrl,
    alt_text: nullableText(body.alt_text, 280) || `Banner de ${title}`,
    eyebrow: nullableText(body.eyebrow, 80) || (sourceType === 'work' ? 'Destaque da Ryuzen' : 'Em destaque'),
    title,
    description: nullableText(body.description || work?.short_description || work?.description, 360),
    cta_label: nullableText(body.cta_label, 60) || (sourceType === 'work' ? 'Começar leitura' : 'Conhecer'),
    cta_url: safeCtaUrl(body.cta_url) || (work ? `/obra/${work.slug}/` : '/explorar/'),
    priority: intValue(body.priority, 0),
    active: boolInt(body.active ?? true),
    starts_at: nullableText(body.starts_at, 40),
    ends_at: nullableText(body.ends_at, 40)
  };
}

async function assertActiveLimit(db: any, requestedActive: number) {
  if (!requestedActive) return;
  const row = await db.prepare('SELECT COUNT(*) AS total FROM home_banners WHERE active = 1').first();
  if (Number(row?.total || 0) >= MAX_ACTIVE_BANNERS) {
    throw new Error('O carrossel permite no máximo 6 banners ativos. Desative um banner antes de adicionar outro.');
  }
}

export async function onRequestGet({ request, env }: any) {
  try {
    const { denied } = await adminGuard(request, env);
    if (denied) return denied;
    const db = requireDb(env);
    const [{ results: items = [] }, { results: publishedWorks = [] }] = await Promise.all([
      db.prepare(`
        SELECT home_banners.*, works.title AS work_title, works.slug AS work_slug, works.banner_url AS work_banner_url
        FROM home_banners
        LEFT JOIN works ON works.id = home_banners.work_id
        ORDER BY home_banners.active DESC, home_banners.priority DESC, home_banners.updated_at DESC
        LIMIT 100
      `).all(),
      db.prepare(`
        SELECT id, title, slug, banner_url, banner_alt, short_description, description
        FROM works
        WHERE ${publicWhere('works')} AND banner_url IS NOT NULL AND banner_url <> ''
        ORDER BY updated_at DESC
        LIMIT 100
      `).all()
    ]);
    return json({ ok: true, maxActive: MAX_ACTIVE_BANNERS, items, publishedWorks });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao carregar banners.' }, { status: 500 });
  }
}

export async function onRequestPost({ request, env }: any) {
  try {
    const { denied } = await adminGuard(request, env);
    if (denied) return denied;
    const db = requireDb(env);
    const body = await readJson<any>(request);
    const data = await normalizeBanner(db, body);
    await assertActiveLimit(db, data.active);
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await db.prepare(`
      INSERT INTO home_banners
      (id, source_type, work_id, image_url, mobile_image_url, alt_text, eyebrow, title, description, cta_label, cta_url, priority, active, starts_at, ends_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, data.source_type, data.work_id, data.image_url, data.mobile_image_url, data.alt_text,
      data.eyebrow, data.title, data.description, data.cta_label, data.cta_url,
      data.priority, data.active, data.starts_at, data.ends_at, now, now
    ).run();
    return json({ ok: true, id, message: 'Banner adicionado ao carrossel com sucesso.' }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao salvar banner.';
    return json({ ok: false, message }, { status: message.includes('máximo') ? 409 : 400 });
  }
}

export function onRequestOptions() { return methodNotAllowed('GET, POST'); }
