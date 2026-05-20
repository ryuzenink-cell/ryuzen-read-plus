# 10 — Segurança, LGPD e operação

## Dados mínimos coletados

Para o MVP:

- Email.
- Senha criptografada/hasheada.
- Obras na biblioteca.
- Progresso de leitura.
- Preferências de tema/notificação.

Evitar coletar:

- CPF.
- Endereço.
- Data de nascimento, salvo se houver conteúdo adulto no futuro.
- Dados sensíveis sem necessidade.

## Consentimento

Notificações devem ser opt-in. O usuário deve escolher receber:

- Atualizações de obras acompanhadas.
- Novidades da plataforma.
- Eventos/votações.
- Comunicação comercial.

Cada tipo pode virar uma preferência separada no futuro.

## Segurança de autenticação

- Hash de senha com Argon2id ou bcrypt.
- Rate limit em login.
- Proteção contra credential stuffing.
- Verificação de email no cadastro, se possível.
- Recuperação de senha com token expirável.
- Sessão em cookie HttpOnly/Secure/SameSite.

## Segurança do conteúdo

Como capítulos e sinopses podem ter HTML/markdown:

- Sanitizar HTML.
- Remover scripts.
- Controlar embeds.
- Validar URLs externas.
- Escapar campos de texto.

## Moderação editorial

No início, evitar auto-publicação irrestrita. Fluxo sugerido:

1. Autor envia proposta.
2. Equipe avalia.
3. Obra aprovada vira rascunho no admin.
4. Capítulos passam por revisão.
5. Publicação é feita por editor/admin.

## Backups

- Backup do banco pelo menos diário em produção.
- Backup de capas/arquivos.
- Exportação de obras e capítulos em formato portável.
- Histórico de alterações editoriais.

## Observabilidade

- Logs de erro.
- Métricas de acesso.
- Métricas de leitura.
- Alertas de falha em login/API.
- Monitoramento de links quebrados.

## Políticas públicas necessárias

- Termos de uso.
- Política de privacidade.
- Política editorial.
- Política de direitos autorais/takedown.
- Regras para autores.
- Regras de eventos e votações.
