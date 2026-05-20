export async function onRequestGet() {
  return Response.json({ ok: true, message: 'Admin de obras preparado para integração com D1.' });
}

export async function onRequestPost() {
  return Response.json({ ok: false, message: 'Criação de obra ainda não implementada.' }, { status: 501 });
}
