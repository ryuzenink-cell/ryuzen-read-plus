export function json(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(data), { ...init, headers });
}

export async function readJson<T = Record<string, unknown>>(request: Request): Promise<T> {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('Envie os dados em JSON.');
  }

  try {
    return (await request.json()) as T;
  } catch {
    throw new Error('JSON inválido.');
  }
}

export function methodNotAllowed(methods = 'GET, POST') {
  return json({ ok: false, message: 'Método não permitido.' }, {
    status: 405,
    headers: { allow: methods }
  });
}

export function getOrigin(request: Request) {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}
