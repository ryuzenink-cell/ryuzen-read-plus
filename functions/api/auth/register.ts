import { json, readJson } from '../../_lib/http';
import {
  createSession,
  decideNewUserRole,
  hashPassword,
  makeSessionCookie,
  normalizeEmail,
  publicUser,
  requireDb,
  validateEmail,
  validatePassword
} from '../../_lib/auth';

export async function onRequestPost({ request, env }: any) {
  try {
    const db = requireDb(env);
    const body = await readJson<{ name?: string; email?: string; password?: string }>(request);
    const name = String(body.name || '').trim().replace(/\s+/g, ' ');
    const email = normalizeEmail(body.email);
    const password = String(body.password || '');

    if (name.length < 2) {
      return json({ ok: false, message: 'Informe um nome com pelo menos 2 caracteres.' }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return json({ ok: false, message: 'Informe um email válido.' }, { status: 400 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return json({ ok: false, message: passwordError }, { status: 400 });
    }

    const existing = await db.prepare('SELECT id FROM users WHERE email = ? LIMIT 1').bind(email).first<{ id: string }>();
    if (existing) {
      return json({ ok: false, message: 'Já existe uma conta usando este email.' }, { status: 409 });
    }

    const id = crypto.randomUUID();
    const passwordHash = await hashPassword(password);
    const role = await decideNewUserRole(env, email);

    await db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role)
      VALUES (?, ?, ?, ?, ?)
    `).bind(id, name, email, passwordHash, role).run();

    const user = await db.prepare(`
      SELECT id, name, email, role, created_at
      FROM users
      WHERE id = ?
      LIMIT 1
    `).bind(id).first<any>();

    const session = await createSession(env, request, id);
    const headers = new Headers();
    headers.set('set-cookie', makeSessionCookie(env, request, session.token, session.expires));

    return json({ ok: true, message: 'Conta criada com sucesso.', user: publicUser(user) }, { status: 201, headers });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao criar conta.' }, { status: 500 });
  }
}
