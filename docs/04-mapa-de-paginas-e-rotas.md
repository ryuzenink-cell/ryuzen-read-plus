# 04 — Mapa de páginas e rotas

## Rotas públicas principais

| Página | Rota | Objetivo | MVP |
|---|---|---|---:|
| Home | `/` | Apresentar catálogo, destaques, novidades e CTA. | Sim |
| Explorar | `/explorar/` | Descobrir obras por filtros. | Sim |
| Gratuitos | `/gratuitos/` | Obras/capítulos gratuitos. | Sim |
| Novidades | `/novidades/` | Últimos capítulos e obras novas. | Sim |
| Rankings | `/rankings/` | Obras mais lidas/populares. | Sim |
| Tags | `/tags/` | Lista de tags e temas. | Pós-MVP |
| Gênero | `/generos/:genero/` | Obras por gênero. | Sim |
| Obra | `/obra/:slug/` | Página individual da obra. | Sim |
| Capítulo | `/obra/:slug/:chapterSlug/` | Leitor de texto. | Sim |
| Autor | `/autor/:slug/` | Perfil público de autor. | Pós-MVP |
| Evento | `/eventos/:slug/` | Votações/concursos. | Pós-MVP |
| Para autores | `/para-autores/` | Explicar envio, curadoria e proposta. | Sim |
| Enviar obra | `/enviar-obra/` | Formulário de proposta. | Sim |
| Sobre | `/sobre/` | Institucional. | Sim |
| FAQ | `/faq/` | Dúvidas comuns. | Pós-MVP |
| Contato | `/contato/` | Suporte e parcerias. | Sim |
| Termos | `/termos/` | Termos de uso. | Sim |
| Privacidade | `/privacidade/` | LGPD e cookies. | Sim |

## Rotas de conta

| Página | Rota | Objetivo | MVP |
|---|---|---|---:|
| Login | `/login/` | Autenticação. | Sim |
| Cadastro | `/cadastro/` | Criar conta. | Sim |
| Recuperar senha | `/recuperar-senha/` | Recuperação de senha. | Sim |
| Biblioteca | `/biblioteca/` | Obras acompanhadas. | Sim |
| Histórico | `/historico/` | Leituras recentes. | Pós-MVP |
| Preferências | `/preferencias/` | Tema, notificações e conta. | Sim |

## Rotas administrativas

| Página | Rota | Objetivo | MVP |
|---|---|---|---:|
| Admin Dashboard | `/admin/` | Visão geral da operação. | Sim |
| Obras | `/admin/obras/` | Listar/criar/editar obras. | Sim |
| Nova obra | `/admin/obras/nova/` | Cadastro editorial. | Sim |
| Capítulos | `/admin/capitulos/` | Criar/editar capítulos. | Sim |
| Destaques | `/admin/destaques/` | Gerenciar home e slots pagos. | Sim |
| Afiliados | `/admin/afiliados/` | Links Hotmart/Kirvano/KDP. | Pós-MVP |
| Autores | `/admin/autores/` | Gerenciar autores/parceiros. | Pós-MVP |
| Eventos | `/admin/eventos/` | Votações/concursos. | Pós-MVP |
| Métricas | `/admin/metricas/` | Leituras, cliques, conversões. | Pós-MVP |

## URLs recomendadas

- Obra: `/obra/fui-chamado-para-salvar-o-mundo/`
- Capítulo: `/obra/fui-chamado-para-salvar-o-mundo/capitulo/capitulo-01/`
- Gênero: `/generos/fantasia/`
- Tag: `/tags/isekai/`

## Regras de URL

- Sempre minúsculas.
- Separar palavras com hífen.
- Evitar acentos na URL.
- Preservar URLs antigas com redirects se o título mudar.
- Usar canonical nas páginas públicas.


### Curadoria da página inicial

| Página | Rota | Função | MVP |
|---|---|---|---|
| Banners da home | `/admin/banners/` | Configurar carrossel público com 1 a 6 banners por URL ou reaproveitamento de obra publicada. | Sim |
