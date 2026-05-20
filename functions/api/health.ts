import { json } from '../_lib/http';

export async function onRequestGet({ env }: any) {
  const payload: Record<string, unknown> = {
    ok: true,
    service: 'ryuzen-read-plus',
    status: 'healthy',
    d1: Boolean(env.DB)
  };

  if (env.DB) {
    try {
      const row = await env.DB.prepare('SELECT 1 AS ok').first();
      payload.database = row ? 'connected' : 'unknown';
    } catch (error) {
      payload.ok = false;
      payload.status = 'degraded';
      payload.database = error instanceof Error ? error.message : 'connection-error';
    }
  }

  return json(payload, { status: payload.ok ? 200 : 500 });
}
