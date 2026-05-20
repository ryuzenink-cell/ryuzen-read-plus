export async function onRequestGet() {
  return Response.json({ ok: true, service: 'ryuzen-read-plus', status: 'healthy' });
}
