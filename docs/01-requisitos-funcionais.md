# 01 — Requisitos funcionais

## Catálogo e descoberta

| ID | Requisito | Prioridade | Observações |
|---|---|---:|---|
| RF-001 | Exibir página inicial com destaques editoriais, lançamentos, populares e capítulos recentes. | Alta | Inspirado em portais com seções horizontais e blocos editoriais. |
| RF-002 | Permitir busca por título, autor, descrição, tag e gênero. | Alta | Busca simples no MVP, avançada depois. |
| RF-003 | Listar obras por categorias/gêneros. | Alta | Fantasia, romance, ação, mistério, comédia, drama, isekai etc. |
| RF-004 | Exibir página de rankings. | Média | Ranking diário/semanal/mensal no futuro. |
| RF-005 | Exibir página de tags populares. | Média | Ajuda descoberta e SEO. |
| RF-006 | Exibir página de novidades/lançamentos. | Alta | Conteúdo novo é uma das principais razões para retorno do usuário. |
| RF-007 | Exibir página de capítulos gratuitos. | Alta | Importante para aquisição de leitores. |

## Página da obra

| ID | Requisito | Prioridade | Observações |
|---|---|---:|---|
| RF-008 | Exibir capa, título, subtítulo, sinopse, autor, status, classificação, gêneros e tags. | Alta | Página central para conversão. |
| RF-009 | Exibir lista de capítulos, indicando gratuito, bloqueado, novo ou em destaque. | Alta | Mesmo que pagamento seja externo no início. |
| RF-010 | Exibir botão “Começar leitura” e “Continuar de onde parei”. | Alta | Essencial para retenção. |
| RF-011 | Exibir obras relacionadas. | Média | Pode começar manualmente. |
| RF-012 | Exibir links externos de compra/apoio quando existirem. | Média | Hotmart, Kirvano, KDP, Catarse etc. |

## Leitor de light novel

| ID | Requisito | Prioridade | Observações |
|---|---|---:|---|
| RF-013 | Renderizar capítulos como texto direto na página. | Alta | Melhor para SEO, responsividade e acessibilidade. |
| RF-014 | Permitir alternar tema claro/escuro/sépia. | Média | Protótipo inclui claro/escuro. |
| RF-015 | Permitir ajustar tamanho da fonte. | Média | Ajuda leitura longa. |
| RF-016 | Salvar progresso de leitura. | Alta | Após login. LocalStorage no protótipo. Banco no produto real. |
| RF-017 | Permitir navegar para capítulo anterior/próximo. | Alta | Essencial. |
| RF-018 | Exibir sumário/índice lateral ou modal. | Média | Útil para obras longas. |

## Login, conta e biblioteca

| ID | Requisito | Prioridade | Observações |
|---|---|---:|---|
| RF-019 | Cadastro com email e senha. | Alta | Simples, seguro e direto. |
| RF-020 | Login com email e senha. | Alta | Preparar autenticação segura. |
| RF-021 | Recuperação de senha. | Alta | Obrigatório para produto real. |
| RF-022 | Biblioteca do usuário com obras acompanhadas. | Alta | Principal vantagem do login. |
| RF-023 | Marcar obra como favorita/acompanhando. | Alta | Ajuda retenção. |
| RF-024 | Exibir histórico de leitura. | Média | Pode vir após MVP. |
| RF-025 | Permitir opt-in de notificações por email/web push. | Média | Respeitar consentimento. |

## Notificações

| ID | Requisito | Prioridade | Observações |
|---|---|---:|---|
| RF-026 | Notificar usuário sobre novos capítulos de obras acompanhadas. | Média | Email primeiro; push depois. |
| RF-027 | Notificar sobre eventos, concursos e votações, se o usuário aceitar. | Baixa | Evitar spam. |
| RF-028 | Área de preferências de notificação. | Média | Necessário para LGPD e experiência. |

## Painel editorial/admin

| ID | Requisito | Prioridade | Observações |
|---|---|---:|---|
| RF-029 | Login administrativo separado por permissão. | Alta | Editor, admin, suporte. |
| RF-030 | Criar/editar obras. | Alta | Operação central. |
| RF-031 | Criar/editar capítulos. | Alta | Publicação manual no MVP. |
| RF-032 | Agendar publicação de capítulos. | Média | Ótimo para consistência editorial. |
| RF-033 | Moderar obras enviadas por autores. | Média | Mesmo que não seja auto-publicação. |
| RF-034 | Gerenciar destaques da home. | Alta | Inclui destaque editorial e pago. |
| RF-035 | Gerenciar banners discretos. | Média | Sem poluir visual. |
| RF-036 | Gerenciar tags, gêneros e status. | Média | Evita bagunça no catálogo. |
| RF-037 | Visualizar métricas básicas por obra/capítulo. | Média | Leituras, cliques, favoritos, conversão. |

## Monetização

| ID | Requisito | Prioridade | Observações |
|---|---|---:|---|
| RF-038 | Cadastrar links de afiliado por obra/produto. | Média | Hotmart, Kirvano etc. |
| RF-039 | Gerenciar slots de destaque pago na home. | Média | Definir início/fim do destaque. |
| RF-040 | Identificar destaque pago com transparência. | Alta | Credibilidade e compliance. |
| RF-041 | Cadastrar eventos/concursos/votações. | Baixa | Prêmios simbólicos: destaque gratuito por período. |
| RF-042 | Relatórios de cliques em links externos. | Média | Métrica de conversão. |

## Páginas institucionais e legais

| ID | Requisito | Prioridade | Observações |
|---|---|---:|---|
| RF-043 | Página “Sobre”. | Alta | Explicar missão e curadoria. |
| RF-044 | Página “Para autores”. | Alta | Captação de autores. |
| RF-045 | Página “Termos de uso”. | Alta | Produto público precisa disso. |
| RF-046 | Página “Privacidade/LGPD”. | Alta | Obrigatório. |
| RF-047 | Página “Contato/Suporte”. | Média | Simples no início. |
| RF-048 | Página “Política editorial”. | Média | Regras de publicação, moderação e direitos. |

## SEO e conteúdo público

| ID | Requisito | Prioridade | Observações |
|---|---|---:|---|
| RF-049 | Gerar metadados por obra/capítulo. | Alta | Title, description, canonical, OG. |
| RF-050 | Gerar sitemap.xml. | Alta | Incluir obras, capítulos públicos e páginas estáticas. |
| RF-051 | Gerar schema.org básico para CreativeWork/Book/Article. | Média | Ajuda mecanismos de busca. |
| RF-052 | URLs amigáveis. | Alta | `/obra/minha-novel/capitulo-01/`. |
