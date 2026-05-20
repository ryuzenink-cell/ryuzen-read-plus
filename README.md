# Ryuzen Read Plus

MVP profissional da plataforma de leitura digital da Ryuzen, voltada para light novels, mangás, webnovels e obras autorais.

Este pacote transforma o protótipo inicial em um projeto **Astro + TypeScript** preparado para **Cloudflare Pages**, com estrutura inicial para **Cloudflare Pages Functions**, **D1** e **R2**.

## Stack

- Astro + TypeScript
- Cloudflare Pages
- Cloudflare Pages Functions / Workers
- Cloudflare D1
- Cloudflare R2
- GitHub
- HTML semântico, CSS responsivo e acessível

## Como rodar localmente

```bash
npm install
npm run dev
```

Acesse o endereço indicado pelo Astro, normalmente `http://localhost:4321`.

## Build

```bash
npm run build
npm run preview
```


## Estrutura principal

```txt
src/
  components/      Componentes reutilizáveis
  layouts/         Layouts público, leitor e admin
  pages/           Rotas Astro
  data/            Catálogo mockado inicial
  styles/          Design system global
  lib/             Configurações e helpers
functions/api/     APIs de autenticação, biblioteca, autores e admin no Cloudflare Pages Functions
migrations/        Schema do Cloudflare D1 com usuários, sessões, obras e submissões
public/            Imagens, favicons e assets públicos
```

## Rotas principais

- `/` — Home editorial
- `/explorar/` — Catálogo com filtros locais
- `/obra/[slug]/` — Página de obra
- `/obra/[slug]/[chapter]/` — Leitor textual
- `/gratuitos/` — Obras gratuitas
- `/novidades/` — Capítulos recentes
- `/rankings/` — Ranking editorial
- `/para-autores/` — Página comercial para autores
- `/contato/` — Email `hello@ryuzen.ink`
- `/admin/` — Protótipo do painel editorial

## Cloudflare Pages

Configuração sugerida no painel da Cloudflare Pages:

- Framework preset: Astro
- Build command: `npm run build`
- Build output directory: `dist`
- Node version: 22 ou superior
- O `npm install` normal deve instalar também as dependências opcionais do Rollup usadas pelo Astro no ambiente de build.

Depois conecte o repositório GitHub ao Cloudflare Pages para deploy automático.

## Cloudflare D1

O projeto já vem com `wrangler.toml` apontando para o banco criado no Cloudflare:

```txt
ryuzen-read-plus-db
```

Binding esperado pela aplicação:

```txt
DB
```

Migrations principais:

```txt
migrations/0001_initial_schema.sql
migrations/0002_auth_sessions_and_recovery.sql
migrations/0003_author_submissions.sql
```

Aplicar no banco remoto:

```bash
npm run db:migrate:remote
```

Conferir tabelas no remoto:

```bash
npm run db:tables:remote
```

No painel do Cloudflare Pages, confirme também o binding `DB` em **Settings → Functions → D1 database bindings**.

## Cloudflare R2

O R2 será usado futuramente para:

- Capas
- Banners
- Avatares
- Imagens de mangá
- Materiais promocionais

O binding R2 ainda está comentado no `wrangler.toml` para não quebrar deploy enquanto o bucket não existir.

## APIs ativas

Endpoints em `functions/api`:

- `GET /api/health`
- `GET /api/works`
- `GET /api/works/[slug]`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/library`
- `POST /api/author-submissions`
- `GET /api/admin/works`
- `POST /api/admin/works`

A autenticação usa hash PBKDF2-SHA256, sessões salvas no D1 e cookie `HttpOnly`, `SameSite=Lax` e `Secure` quando estiver em HTTPS.

### Variáveis recomendadas no Cloudflare Pages

```txt
APP_ENV=production
COOKIE_NAME=rrp_session
ADMIN_EMAIL=hello@ryuzen.ink
RETURN_RESET_LINK=false
```

`ADMIN_EMAIL` faz com que a conta criada com esse email receba perfil `admin`. Como alternativa para ambiente fechado de teste, `ALLOW_FIRST_USER_ADMIN=true` transforma apenas o primeiro usuário criado em admin.

## O que já está pronto

- Projeto Astro + TypeScript organizado
- Tema light padrão e dark mode
- Home editorial
- Explorar com filtros locais
- Páginas de obra dinâmicas estáticas
- Leitor textual com ajuste de fonte
- Páginas institucionais
- Página comercial para autores
- Biblioteca conectada à sessão real via API
- Admin editorial com guard de sessão e API administrativa inicial
- SEO básico, Open Graph, Twitter Card e JSON-LD
- Sitemap dinâmico
- Robots.txt
- Schema inicial D1
- Preparação para R2
- APIs Cloudflare Pages Functions para login, sessão, biblioteca, submissões e admin

## Próximos passos recomendados

1. Aplicar migrations no D1 remoto.
2. Configurar variáveis de ambiente no Cloudflare Pages.
3. Criar a primeira conta admin usando o email definido em `ADMIN_EMAIL`.
4. Testar cadastro, login, logout, biblioteca e painel admin.
5. Cadastrar algumas obras de teste no D1.
6. Popular capítulos e capas reais.
7. Integrar R2 para upload de capas e imagens de mangá.
8. Migrar páginas públicas para consumir D1 quando o catálogo real estiver pronto.
9. Adicionar métricas de leitura, cliques e links de afiliado.
10. Implementar email transacional para recuperação de senha em produção aberta.

## Observação

A pasta `legacy-prototype/` preserva o protótipo HTML anterior para consulta. A pasta `docs/` preserva a documentação estratégica original.
