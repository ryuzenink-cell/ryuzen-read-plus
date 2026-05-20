import { json, readJson } from '../_lib/http';
import { normalizeEmail, requireDb, validateEmail } from '../_lib/auth';

export async function onRequestPost({ request, env }: any) {
  try {
    const db = requireDb(env);
    const body = await readJson<{ name?: string; email?: string; title?: string; type?: string; pitch?: string }>(request);
    const name = String(body.name || '').trim().replace(/\s+/g, ' ');
    const email = normalizeEmail(body.email);
    const title = String(body.title || '').trim();
    const type = String(body.type || '').trim();
    const pitch = String(body.pitch || '').trim();

    if (name.length < 2) return json({ ok: false, message: 'Informe seu nome ou pseudônimo.' }, { status: 400 });
    if (!validateEmail(email)) return json({ ok: false, message: 'Informe um email válido.' }, { status: 400 });
    if (title.length < 2) return json({ ok: false, message: 'Informe o título da obra.' }, { status: 400 });
    if (!['Light Novel', 'Mangá', 'Webnovel', 'light_novel', 'manga', 'webnovel'].includes(type)) return json({ ok: false, message: 'Escolha um tipo de obra válido.' }, { status: 400 });
    if (pitch.length < 30) return json({ ok: false, message: 'Escreva uma proposta com pelo menos 30 caracteres.' }, { status: 400 });

    const id = crypto.randomUUID();
    await db.prepare(`
      INSERT INTO author_submissions (id, name, email, title, type, pitch)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(id, name, email, title, type, pitch).run();

    return json({ ok: true, message: 'Obra enviada para análise editorial. Entraremos em contato pelo email informado.', id }, { status: 201 });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao enviar obra.' }, { status: 500 });
  }
}
