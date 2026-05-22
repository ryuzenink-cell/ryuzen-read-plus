# Redesign da página pública da obra — hero com banner

## Objetivo

Corrigir a composição visual da página de uma light novel/webnovel publicada. A página anterior exibia o breadcrumb e o banner como um bloco separado acima da capa, produzindo uma hierarquia pobre e pouco imersiva.

## Alterações realizadas

- Removido da interface visual o breadcrumb `Início / Explorar / Obra`, pois a navegação principal já está disponível no cabeçalho.
- Mantidos dados estruturados de breadcrumb no HTML para SEO, sem exibição redundante ao leitor.
- Banner da obra passou a funcionar como plano de fundo do hero principal.
- Capa vertical reposicionada à esquerda do título, sinopse e ações principais.
- Adicionado overlay para garantir leitura do texto independentemente das cores do banner.
- Obras sem banner recebem um fundo editorial discreto, sem área quebrada.
- Sinopse longa, quando diferente da apresentação curta, aparece em bloco próprio abaixo do hero.
- Lista de capítulos permanece logo abaixo da apresentação, com leitura facilitada.
- Layout adaptado para celular: capa e informações se empilham sobre o banner com contraste preservado.

## Escopo preservado

A alteração se aplica à página pública de **obras/novels**. Não foi criado fluxo de mangás e não houve alteração em autenticação, APIs, migrations, banco de dados ou painel administrativo.
