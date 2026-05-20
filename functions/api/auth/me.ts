import { json } from '../../_lib/http';
import { getSessionUser, publicUser, requireDb } from '../../_lib/auth';

export async function onRequestGet({ request, env }: any) {
  try {
    requireDb(env);
    const user = await getSessionUser(env, request);

    if (!user) {
      return json({ ok: true, authenticated: false, user: null });
    }

    return json({ ok: true, authenticated: true, user: publicUser(user) });
  } catch (error) {
    return json({ ok: false, authenticated: false, message: error instanceof Error ? error.message : 'Erro ao verificar sessão.' }, { status: 500 });
  }
}
