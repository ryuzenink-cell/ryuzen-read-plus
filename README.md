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
functions/api/     Skeleton de APIs para Cloudflare Pages Functions
migrations/        Schema inicial do Cloudflare D1
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

O schema inicial está em:

```txt
migrations/0001_initial_schema.sql
```

Fluxo futuro sugerido:

```bash
wrangler d1 create ryuzen-read-plus-db
wrangler d1 migrations apply ryuzen-read-plus-db --local
wrangler d1 migrations apply ryuzen-read-plus-db --remote
```

Depois configure o binding `DB` no Cloudflare Pages/Workers.

## Cloudflare R2

O R2 será usado futuramente para:

- Capas
- Banners
- Avatares
- Imagens de mangá
- Materiais promocionais

Exemplo de binding em `wrangler.toml.example`:

```toml
[[r2_buckets]]
binding = "RRP_ASSETS"
bucket_name = "ryuzen-read-plus-assets"
```

## API inicial

Skeletons em `functions/api`:

- `/api/health`
- `/api/works`
- `/api/works/[slug]`
- `/api/auth/login`
- `/api/auth/register`
- `/api/library`
- `/api/admin/works`

Autenticação real ainda não foi implementada de propósito. Quando for feita, use hash seguro de senha, cookies `HttpOnly`, `Secure`, `SameSite`, proteção contra brute force e validações robustas.

## O que já está pronto

- Projeto Astro + TypeScript organizado
- Tema light padrão e dark mode
- Home editorial
- Explorar com filtros locais
- Páginas de obra dinâmicas estáticas
- Leitor textual com ajuste de fonte
- Páginas institucionais
- Página comercial para autores
- Biblioteca simulada
- Admin editorial protótipo
- SEO básico, Open Graph, Twitter Card e JSON-LD
- Sitemap dinâmico
- Robots.txt
- Schema inicial D1
- Preparação para R2
- Skeletons de APIs Cloudflare Pages Functions

## Próximos passos recomendados

1. Subir o projeto para GitHub.
2. Conectar ao Cloudflare Pages.
3. Trocar capas temporárias por artes reais próprias ou licenciadas.
4. Criar banco D1 remoto e aplicar migrations.
5. Migrar `src/data` para consultas D1.
6. Implementar autenticação.
7. Implementar biblioteca/progresso real.
8. Implementar painel editorial com CRUD de obras e capítulos.
9. Integrar R2 para upload de capas e imagens.
10. Adicionar métricas de leitura, cliques e links de afiliado.

## Observação

A pasta `legacy-prototype/` preserva o protótipo HTML anterior para consulta. A pasta `docs/` preserva a documentação estratégica original.
