# 07 — Modelagem de dados e API conceitual

## Entidades principais

### users

| Campo | Tipo | Observação |
|---|---|---|
| id | uuid | Identificador. |
| name | string | Opcional no início. |
| email | string | Único. |
| password_hash | string | Nunca salvar senha pura. |
| role | enum | reader, author, editor, admin. |
| notification_opt_in | boolean | Consentimento. |
| theme_preference | enum | light, dark, system. |
| created_at | datetime | Auditoria. |

### author_profiles

| Campo | Tipo | Observação |
|---|---|---|
| id | uuid | Identificador. |
| user_id | uuid/null | Pode existir sem conta no início. |
| display_name | string | Nome público. |
| bio | text | Biografia. |
| links | json | Redes, loja, site. |

### works

| Campo | Tipo | Observação |
|---|---|---|
| id | uuid | Identificador. |
| slug | string | URL. |
| title | string | Título. |
| subtitle | string | Opcional. |
| synopsis | text | Sinopse. |
| cover_url | string | Capa. |
| author_id | uuid | Autor. |
| status | enum | ongoing, completed, hiatus. |
| content_type | enum | light_novel, manga. |
| maturity_rating | enum | livre, 10, 12, 14, 16, 18. |
| publication_status | enum | draft, review, published, archived. |
| is_featured | boolean | Destaque editorial. |
| created_at | datetime | Auditoria. |
| updated_at | datetime | Auditoria. |

### chapters

| Campo | Tipo | Observação |
|---|---|---|
| id | uuid | Identificador. |
| work_id | uuid | Obra. |
| slug | string | URL. |
| title | string | Título do capítulo. |
| number | decimal | Ordem. |
| body_html | text | Conteúdo sanitizado. |
| excerpt | text | Descrição curta. |
| access_type | enum | free, external_paid, premium_future. |
| publication_status | enum | draft, scheduled, published, archived. |
| published_at | datetime | Publicação. |

### library_items

| Campo | Tipo | Observação |
|---|---|---|
| id | uuid | Identificador. |
| user_id | uuid | Leitor. |
| work_id | uuid | Obra. |
| status | enum | following, favorite, completed, dropped. |
| created_at | datetime | Data. |

### reading_progress

| Campo | Tipo | Observação |
|---|---|---|
| id | uuid | Identificador. |
| user_id | uuid | Leitor. |
| work_id | uuid | Obra. |
| chapter_id | uuid | Capítulo. |
| progress_percent | number | 0–100. |
| last_position | string/json | Âncora ou parágrafo. |
| updated_at | datetime | Última leitura. |

### featured_slots

| Campo | Tipo | Observação |
|---|---|---|
| id | uuid | Identificador. |
| work_id | uuid | Obra. |
| slot_type | enum | editorial, paid, event_prize. |
| label | string | Ex: Destaque, Patrocinado. |
| starts_at | datetime | Início. |
| ends_at | datetime | Fim. |
| active | boolean | Estado. |

### affiliate_links

| Campo | Tipo | Observação |
|---|---|---|
| id | uuid | Identificador. |
| work_id | uuid/null | Pode ser por obra ou produto geral. |
| label | string | Comprar volume completo. |
| provider | enum | kirvano, hotmart, amazon_kdp, other. |
| url | string | Link com rastreio. |
| active | boolean | Estado. |

### events

| Campo | Tipo | Observação |
|---|---|---|
| id | uuid | Identificador. |
| slug | string | URL. |
| title | string | Nome. |
| event_type | enum | contest, poll. |
| description | text | Regras. |
| starts_at | datetime | Início. |
| ends_at | datetime | Fim. |
| status | enum | draft, active, closed, archived. |

## API conceitual

### Público

```txt
GET /api/works
GET /api/works/:slug
GET /api/works/:slug/chapters
GET /api/chapters/:id
GET /api/search?q=
GET /api/rankings?period=week
GET /api/genres
GET /api/tags
```

### Conta

```txt
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/recover-password
GET /api/me
PATCH /api/me/preferences
GET /api/me/library
POST /api/me/library
DELETE /api/me/library/:workId
POST /api/me/progress
```

### Admin

```txt
GET /api/admin/works
POST /api/admin/works
PATCH /api/admin/works/:id
POST /api/admin/chapters
PATCH /api/admin/chapters/:id
POST /api/admin/featured-slots
PATCH /api/admin/featured-slots/:id
GET /api/admin/metrics
```

## Stack sugerida

### MVP parrudo e enxuto

- Front-end: Astro ou Next.js.
- UI: CSS próprio ou Tailwind com design tokens discretos.
- API: Node.js em Cloudflare Workers/Pages Functions.
- Banco: Cloudflare D1, Turso, Supabase ou Neon.
- Autenticação: Lucia/Auth.js/Supabase Auth ou implementação própria bem revisada.
- Armazenamento de capas: Cloudflare R2 ou Supabase Storage.
- Analytics: Plausible, Cloudflare Web Analytics ou solução própria simples.

## Recomendação prática

Começar com Astro é uma boa opção porque as páginas públicas de obra e capítulo precisam ser rápidas, renderizáveis e boas para SEO. Onde houver interatividade, usar pequenas ilhas de JavaScript/React.
