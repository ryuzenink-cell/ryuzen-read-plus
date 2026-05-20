import { json, readJson } from '../../_lib/http';
import { getSessionUser, requireAdminUser, requireDb } from '../../_lib/auth';

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 80);
}

export async function onRequestGet({ request, env }: any) {
  try {
    const db = requireDb(env);
    const user = await getSessionUser(env, request);
    const denied = requireAdminUser(user);
    if (denied) return denied;

    const { results = [] } = await db.prepare(`
      SELECT id, slug, title, type, status, is_featured, is_free, created_at, updated_at
      FROM works
      ORDER BY updated_at DESC
      LIMIT 200
    `).all<any>();

    return json({ ok: true, items: results });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao carregar obras.' }, { status: 500 });
  }
}

export async function onRequestPost({ request, env }: any) {
  try {
    const db = requireDb(env);
    const user = await getSessionUser(env, request);
    const denied = requireAdminUser(user);
    if (denied) return denied;

    const body = await readJson<{
      title?: string;
      slug?: string;
      description?: string;
      type?: string;
      status?: string;
      isFree?: boolean;
      isFeatured?: boolean;
    }>(request);

    const title = String(body.title || '').trim();
    const slug = slugify(String(body.slug || title));
    const description = String(body.description || '').trim();
    const type = ['light_novel', 'manga', 'webnovel'].includes(String(body.type)) ? String(body.type) : 'light_novel';
    const status = ['ongoing', 'completed', 'development', 'soon', 'paused'].includes(String(body.status)) ? String(body.status) : 'development';

    if (title.length < 2) return json({ ok: false, message: 'Informe um título válido.' }, { status: 400 });
    if (!slug) return json({ ok: false, message: 'Informe um slug válido.' }, { status: 400 });
    if (description.length < 10) return json({ ok: false, message: 'A descrição precisa ter pelo menos 10 caracteres.' }, { status: 400 });

    const id = crypto.randomUUID();
    await db.prepare(`
      INSERT INTO works (id, slug, title, description, type, status, is_free, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, slug, title, description, type, status, body.isFree === false ? 0 : 1, body.isFeatured ? 1 : 0).run();

    return json({ ok: true, message: 'Obra criada no D1.', id, slug }, { status: 201 });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao criar obra.' }, { status: 500 });
  }
}
