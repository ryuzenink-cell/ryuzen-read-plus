# Rodada UI/UX Admin + opção com/sem banner

## Escopo realizado

Esta rodada focou na melhoria visual segura do painel administrativo da Ryuzen ReadPlus, mantendo a plataforma como MVP exclusivo para Light Novels/Webnovels e evitando refatorações perigosas no backend.

## Melhorias de interface

- Sidebar administrativa com indicação clara da seção ativa.
- Topbar interna do painel com alternância de tema.
- Dashboard com cards mais consistentes e hierarquia visual melhorada.
- Listagem de obras com tabela mais legível, hover, badges e coluna de mídia.
- Formulário de obra reorganizado visualmente, com cards de mídia e textos auxiliares.
- Preview de capa e banner mais claro, com mensagens amigáveis para URLs inválidas.
- Layout responsivo reforçado para admin em desktop e mobile.

## Obra com ou sem banner

A opção foi implementada sem nova migration e sem mudança estrutural no backend.

Regra usada:

- `banner_url` preenchido = a página pública exibe banner.
- `banner_url` vazio = a página pública não exibe banner e usa composição alternativa com capa, título, sinopse e capítulos.

No admin, a escolha aparece como:

- “Sim, exibir banner”
- “Não exibir banner”

Quando “Não exibir banner” está ativo, os campos de banner ficam ocultos/desativados e o payload enviado limpa `banner_url`, `banner_alt` e `banner_credit`.

## Backend

Não houve alteração estrutural de backend, migrations, autenticação, sessões ou banco. A implementação aproveitou os campos já existentes de banner.

## Dados de exemplo

Os arrays estáticos antigos em `src/data` foram neutralizados para evitar reintrodução de obras fictícias ou menções a mangás no MVP público. O conteúdo real continua vindo de D1/APIs.

## Testes recomendados pós-deploy

1. Criar obra sem banner e confirmar que a página pública não reserva espaço vazio.
2. Criar obra com banner e confirmar preview no admin + exibição pública.
3. Editar obra com banner para sem banner e confirmar que a página pública atualiza.
4. Editar obra sem banner para com banner e confirmar exibição.
5. Confirmar login/admin/biblioteca após deploy.
