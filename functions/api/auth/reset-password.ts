import { json, readJson } from '../../_lib/http';
import { hashPassword, hashToken, requireDb, validatePassword } from '../../_lib/auth';

export async function onRequestPost({ request, env }: any) {
  try {
    const db = requireDb(env);
    const body = await readJson<{ token?: string; password?: string }>(request);
    const token = String(body.token || '').trim();
    const password = String(body.password || '');

    if (!token) {
      return json({ ok: false, message: 'Token de recuperação ausente.' }, { status: 400 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return json({ ok: false, message: passwordError }, { status: 400 });
    }

    const tokenHash = await hashToken(token);
    const now = new Date().toISOString();
    const reset = await db.prepare(`
      SELECT id, user_id, expires_at, used_at
      FROM password_resets
      WHERE token_hash = ?
        AND used_at IS NULL
        AND expires_at > ?
      LIMIT 1
    `).bind(tokenHash, now).first<{ id: string; user_id: string }>();

    if (!reset) {
      return json({ ok: false, message: 'Token inválido, expirado ou já utilizado.' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    await db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(passwordHash, reset.user_id).run();
    await db.prepare('UPDATE password_resets SET used_at = CURRENT_TIMESTAMP WHERE id = ?').bind(reset.id).run();
    await db.prepare('DELETE FROM sessions WHERE user_id = ?').bind(reset.user_id).run();

    return json({ ok: true, message: 'Senha atualizada. Entre novamente com a nova senha.' });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao redefinir senha.' }, { status: 500 });
  }
}
