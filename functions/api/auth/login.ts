import { json, readJson } from '../../_lib/http';
import {
  createSession,
  makeSessionCookie,
  normalizeEmail,
  publicUser,
  requireDb,
  validateEmail,
  verifyPassword
} from '../../_lib/auth';

export async function onRequestPost({ request, env }: any) {
  try {
    const db = requireDb(env);
    const body = await readJson<{ email?: string; password?: string }>(request);
    const email = normalizeEmail(body.email);
    const password = String(body.password || '');

    if (!validateEmail(email) || !password) {
      return json({ ok: false, message: 'Email ou senha inválidos.' }, { status: 400 });
    }

    const user = await db.prepare(`
      SELECT id, name, email, password_hash, role, created_at
      FROM users
      WHERE email = ?
      LIMIT 1
    `).bind(email).first<any>();

    if (!user) {
      return json({ ok: false, message: 'Email ou senha inválidos.' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return json({ ok: false, message: 'Email ou senha inválidos.' }, { status: 401 });
    }

    const session = await createSession(env, request, user.id);
    const headers = new Headers();
    headers.set('set-cookie', makeSessionCookie(env, request, session.token, session.expires));

    return json({ ok: true, message: 'Login realizado com sucesso.', user: publicUser(user) }, { headers });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao entrar.' }, { status: 500 });
  }
}
