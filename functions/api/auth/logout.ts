import { json } from '../../_lib/http';
import { destroyCurrentSession, makeClearCookie } from '../../_lib/auth';

export async function onRequestPost({ request, env }: any) {
  try {
    await destroyCurrentSession(env, request);
    const headers = new Headers();
    headers.set('set-cookie', makeClearCookie(env, request));
    return json({ ok: true, message: 'Você saiu da sua conta.' }, { headers });
  } catch (error) {
    const headers = new Headers();
    headers.set('set-cookie', makeClearCookie(env, request));
    return json({ ok: false, message: error instanceof Error ? error.message : 'Erro ao sair.' }, { status: 500, headers });
  }
}
