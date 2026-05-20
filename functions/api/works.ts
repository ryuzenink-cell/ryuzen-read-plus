export async function onRequestGet() {
  // Futuro: buscar obras no binding D1: context.env.DB.prepare('SELECT ...')
  return Response.json({
    source: 'mock',
    message: 'Endpoint preparado para Cloudflare D1. O catálogo público ainda usa src/data/works.ts.',
    items: []
  });
}
