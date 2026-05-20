export async function onRequestGet() {
  return Response.json({
    ok: true,
    source: 'mock',
    message: 'Biblioteca preparada para D1: favoritos, progresso de leitura e histórico serão retornados aqui.',
    items: []
  });
}
