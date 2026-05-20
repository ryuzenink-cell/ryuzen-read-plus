import { getOrigin, json, readJson } from '../../_lib/http';
import { createPasswordResetToken, normalizeEmail, requireDb, validateEmail } from '../../_lib/auth';

export async function onRequestPost({ request, env }: any) {
  try {
    const db = requireDb(env);
    const body = await readJson<{ email?: string }>(request);
    const email = normalizeEmail(body.email);

    if (!validateEmail(email)) {
      return json({ ok: false, message: 'Informe um email válido.' }, { status: 400 });
    }

    const user = await db.prepare('SELECT id, email FROM users WHERE email = ? LIMIT 1').bind(email).first<{ id: string; email: string }>();
    let resetUrl = '';

    if (user) {
      const reset = await createPasswordResetToken(env, user.id, user.email, request);
      resetUrl = `${getOrigin(request)}/nova-senha/?token=${encodeURIComponent(reset.token)}`;
    }

    const canReturnLink = env.APP_ENV !== 'production' || env.RETURN_RESET_LINK === 'true';

    return json({
      ok: true,
      message: 'Se este email estiver cadastrado, enviaremos as instruções de recuperação.',
      resetUrl: canReturnLink && resetUrl ? resetUrl : undefined,
      note: canReturnLink && resetUrl ? 'Link retornado para teste interno do MVP. Desative RETURN_RESET_LINK em produção aberta.' : undefined
    });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao solicitar recuperação de senha.' }, { status: 500 });
  }
}
