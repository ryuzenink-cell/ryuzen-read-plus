export async function onRequestPost() {
  return Response.json({
    ok: false,
    message: 'Login ainda não implementado. Implementar com hash seguro de senha, sessão via cookie HttpOnly/Secure/SameSite e proteção contra brute force.'
  }, { status: 501 });
}
