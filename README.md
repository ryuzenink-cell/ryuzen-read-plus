# Ryuzen Read Plus

Base profissional em **Astro + TypeScript + Cloudflare Pages/Functions + Cloudflare D1** para uma plataforma curada de **Light Novels/Webnovels**.

O MVP atual não usa mangás no fluxo principal. O catálogo público começa vazio e passa a ser preenchido por obras reais publicadas pelo painel administrativo.

## Rodar localmente

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

Testar Functions localmente depois do build:

```bash
npm run pages:dev
```

## Deploy no Cloudflare Pages

Configuração recomendada:

- Framework preset: Astro
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: raiz do projeto

Configure o binding do banco em **Settings → Functions → D1 database bindings**:

- Variable name: `DB`
- Database: `ryuzen-read-plus-db`

## Migrations

Aplicar localmente:

```bash
npm run db:migrate:local
```

Aplicar no remoto:

```bash
npm run db:migrate:remote
```

A migration `0004_editorial_publication_system.sql` adiciona o modelo editorial completo para:

- obras;
- volumes;
- capítulos;
- gêneros;
- tags;
- destaques;
- links externos;
- imagens externas;
- SEO;
- status de publicação.

## Fluxo editorial

1. Entre com uma conta `admin` ou `editor`.
2. Acesse `/admin/`.
3. Crie uma obra em `/admin/obras/nova/`.
4. Use URLs externas para capa e banner.
5. Salve como rascunho ou publique.
6. Crie capítulos em `/admin/capitulos/`.
7. Marque uma obra como destaque em `/admin/destaques/` ou no formulário da obra.
8. A obra publicada aparece automaticamente no catálogo, home, página da obra, novidades, gratuitos e ranking editorial quando aplicável.

## Imagens externas

Não há upload de imagens nesta fase.

Use URLs públicas para:

- capa;
- banner;
- imagens dentro dos capítulos em Markdown.

Exemplo de imagem dentro de um capítulo:

```markdown
![Descrição da imagem](https://exemplo.com/imagem.jpg)
```

## Estados vazios

Se o banco não tiver obras publicadas, o site mostra estados vazios elegantes em vez de obras fictícias. Nenhum dado de exemplo alimenta o catálogo público.

## APIs principais

Públicas:

- `GET /api/home`
- `GET /api/works`
- `GET /api/works/:slug`
- `GET /api/works/:slug/chapters`
- `GET /api/works/:slug/:chapterSlug`
- `GET /api/genres`
- `GET /api/search`

Administrativas:

- `GET/POST /api/admin/works`
- `GET/PATCH/DELETE /api/admin/works/:id`
- `GET/POST /api/admin/chapters`
- `GET/PATCH/DELETE /api/admin/chapters/:id`
- `GET/POST /api/admin/featured`
- `PATCH/DELETE /api/admin/featured/:id`
- `GET /api/admin/overview`

## Segurança

- APIs administrativas exigem sessão de admin ou editor.
- Senhas usam PBKDF2-SHA256.
- Sessões usam cookie `HttpOnly`, `SameSite=Lax` e `Secure` em HTTPS.
- Conteúdo Markdown é renderizado com escape de HTML para reduzir risco de XSS.
- URLs externas são validadas no backend.

## Observações

Não edite `dist/` manualmente. Altere os arquivos em `src/`, `functions/`, `public/` e `migrations/`, depois rode o build.
