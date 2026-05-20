export async function onRequestGet(context: EventContext<Env, string, unknown>) {
  const slug = context.params.slug;
  return Response.json({
    source: 'mock',
    slug,
    message: 'Endpoint de detalhe de obra preparado para futura consulta D1.'
  });
}

interface Env {
  DB?: D1Database;
  RRP_ASSETS?: R2Bucket;
}
