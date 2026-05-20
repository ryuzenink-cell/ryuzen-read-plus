export async function onRequestPost() {
  return Response.json({
    ok: false,
    message: 'Cadastro ainda não implementado. Nunca armazene senha em texto puro; use hash seguro e validação de email.'
  }, { status: 501 });
}
