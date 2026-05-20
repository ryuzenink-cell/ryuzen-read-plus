# 11 — Componentes e estados da interface

## Header

Estados:

- Visitante: logo, menu, busca, entrar.
- Logado: logo, menu, busca, biblioteca, avatar/menu.
- Admin: aviso de painel administrativo.

## Busca

Estados:

- Vazia: mostrar buscas populares.
- Digitando: sugestões por obra, autor e tag.
- Sem resultados: sugerir explorar gêneros.
- Erro: mensagem simples e opção de tentar novamente.

## Card de obra

Campos:

- Capa.
- Título.
- Autor.
- Gênero principal.
- Nota/ranking opcional.
- Badge: Novo, Grátis, Destaque, Promovido.

Estados:

- Normal.
- Hover/foco.
- Sem capa.
- Obra arquivada.
- Conteúdo restrito.

## Página da obra

Componentes:

- Hero da obra.
- Sinopse.
- Metadados.
- CTA de leitura.
- CTA de biblioteca.
- Lista de capítulos.
- Links comerciais.
- Obras relacionadas.

Estados:

- Sem capítulos publicados.
- Capítulo novo.
- Capítulo gratuito.
- Capítulo com link externo.

## Leitor

Componentes:

- Topbar com voltar, título, tema, fonte.
- Área textual.
- Navegação anterior/próximo.
- Sumário.
- CTA de login para salvar progresso.

Estados:

- Visitante.
- Logado.
- Capítulo não encontrado.
- Capítulo indisponível.
- Último capítulo publicado.

## Biblioteca

Estados:

- Vazia.
- Com obras acompanhadas.
- Obra com atualização nova.
- Filtro por status.

## Admin

Estados:

- Lista vazia.
- Rascunho.
- Em revisão.
- Publicado.
- Agendado.
- Erro de validação.

## Destaque pago

Sempre usar identificação discreta e transparente:

- “Promovido”
- “Destaque pago”
- “Parceria”

Evitar parecer recomendação editorial orgânica quando for publicidade.
