# Correção pública v2 — carrossel e página da obra

## Diagnóstico

Os sintomas exibidos no site indicavam duas falhas de apresentação:

1. A Home permanecia com o conteúdo inicial de carregamento, mesmo após a implementação do carrossel.
2. A página dinâmica da obra aparecia com a imagem do banner e da capa fora do layout desenhado, comportamento compatível com HTML novo servido junto a CSS/JavaScript público antigo em cache.

## Correções aplicadas

- O JavaScript público da Home ganhou um nome versionado (`editorial-public.v2.js`) e as páginas passaram a carregá-lo diretamente.
- A folha utilizada pelas páginas dinâmicas ganhou um nome versionado (`rrp-public.v2.css`).
- As páginas dinâmicas agora enviam cabeçalhos `no-store`, evitando reaproveitamento de HTML antigo após alterações do layout.
- Scripts das páginas dinâmicas recebem versão na URL para não reutilizar arquivo antigo em cache.
- A Home deixou de exibir o texto “Carregando” como primeira impressão: antes mesmo dos dados chegarem, há um hero editorial utilizável e elegante.
- Caso o carrossel não possua um banner ativo elegível, a API passa a reaproveitar automaticamente banners — ou, na ausência deles, capas — das obras publicadas.
- A página da obra recebeu refinamento visual: banner escurecido e desfocado como fundo, capa à esquerda, informações e ações em primeiro plano e capítulos em cards mais claros.

## Estruturas preservadas

Nenhuma migration adicional foi criada e nenhuma tabela foi removida. A correção usa a tabela de banners já existente e mantém a compatibilidade com obras previamente publicadas.
