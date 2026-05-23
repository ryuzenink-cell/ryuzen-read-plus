# Ryuzen ReadPlus

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


A migration `0005_home_banner_carousel_and_reader_progress.sql` adiciona o carrossel editorial da Home, permitindo banners configuráveis por URL externa ou reaproveitados de obras publicadas.


## Fluxo editorial

1. Entre com uma conta `admin` ou `editor`.
2. Acesse `/admin/`.
3. Crie uma obra em `/admin/obras/nova/`.
4. Use URLs externas para capa e banner.
5. Salve como rascunho ou publique.
6. Crie capítulos em `/admin/capitulos/`.
7. Marque uma obra como destaque em `/admin/destaques/` ou no formulário da obra.
8. Configure de 1 a 6 banners da Home em `/admin/banners/`, reutilizando banners de obras publicadas ou URLs externas.
9. A obra publicada aparece automaticamente no catálogo, home, página da obra, novidades, gratuitos e seleção editorial quando aplicável.

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
- `GET/POST/DELETE /api/library`
- `POST /api/progress`

Administrativas:

- `GET/POST /api/admin/works`
- `GET/PATCH/DELETE /api/admin/works/:id`
- `GET/POST /api/admin/chapters`
- `GET/PATCH/DELETE /api/admin/chapters/:id`
- `GET/POST /api/admin/featured`
- `PATCH/DELETE /api/admin/featured/:id`
- `GET /api/admin/overview`
- `GET/POST /api/admin/banners`
- `PATCH/DELETE /api/admin/banners/:id`

## Segurança

- APIs administrativas exigem sessão de admin ou editor.
- Senhas usam PBKDF2-SHA256.
- Sessões usam cookie `HttpOnly`, `SameSite=Lax` e `Secure` em HTTPS.
- Conteúdo Markdown é renderizado com escape de HTML para reduzir risco de XSS.
- URLs externas são validadas no backend.

## Observações

Não edite `dist/` manualmente. Altere os arquivos em `src/`, `functions/`, `public/` e `migrations/`, depois rode o build.


## Experiência pública e retenção

- A Home apresenta um carrossel editorial de banners com controles acessíveis e comportamento responsivo.
- O leitor registra localmente o capítulo e a posição aproximada, habilitando a seção **Continue lendo** na Home sem exigir conta.
- Contas autenticadas podem adicionar/remover obras da biblioteca e sincronizar progresso de leitura.
- A página de capítulo inclui barra de progresso, tempo estimado, navegação e ações de retorno.
- O domínio canônico oficial utilizado no projeto é `https://readplus.ryuzen.ink`.

## Progressive Web App (PWA)

A aplicação agora pode ser instalada em navegadores compatíveis como **Ryuzen ReadPlus** (`ReadPlus` em espaços reduzidos), mantendo o mesmo domínio, login, biblioteca e painel editorial.

### Implementação

- manifesto único em `public/manifest.webmanifest`;
- ícones oficiais R+ para instalação, Apple Touch e variantes `maskable`;
- service worker conservador em `public/sw.js`;
- botão discreto de instalação exibido no rodapé apenas quando o navegador dispara `beforeinstallprompt`;
- orientação discreta no Safari do iPhone/iPad, com opção de fechar;
- aviso manual de atualização, evitando recarregar formulários administrativos sem ação do usuário;
- ajustes de safe area aplicados somente em modo `standalone`.

### Política de cache e segurança

Esta primeira versão prioriza **instalação segura**, não leitura offline completa. O service worker armazena apenas assets locais estáticos: manifesto, ícones/favicons, branding e recursos públicos de CSS/JavaScript/imagem sob `/_astro/` e `/assets/`.

Não são cacheados pelo service worker:

- qualquer navegação/documento HTML;
- `/admin` e `/admin/*`;
- `/api` e `/api/*`;
- `/functions` e `/functions/*`;
- `/login`, `/cadastro`, `/recuperar-senha` e `/nova-senha`;
- `/biblioteca` e `/conta`;
- requisições `POST`, `PUT`, `PATCH` ou `DELETE`;
- páginas dinâmicas de obras/capítulos e imagens externas de capa/banner.

Com isso, conteúdo publicado, sessões, formulários editoriais e dados privados permanecem dependentes da rede e das APIs atuais, sem risco de uma resposta autenticada ser reaproveitada pelo cache da PWA.

### Testar a PWA localmente

```bash
npm install
npx tsc --noEmit
npm run build
npm run preview
```

Abra a URL local do preview e, no DevTools do navegador:

1. Em **Application → Manifest**, confirme nome, ícones e modo `standalone`.
2. Em **Application → Service Workers**, confirme o registro de `/sw.js`.
3. Em **Cache Storage**, confirme que só há assets estáticos públicos.
4. Verifique que requisições para `/api/*`, `/admin/*`, login e biblioteca não são armazenadas.
5. Em navegador compatível, use o botão **Instalar aplicativo** quando ele aparecer.

Service workers exigem HTTPS fora de `localhost`. O domínio em produção no Cloudflare Pages atende esse requisito quando servido por HTTPS.

### Atualizações

Ao modificar assets precacheados em versões futuras, incremente `CACHE_VERSION` em `public/sw.js`. Quando um novo service worker estiver aguardando ativação, a interface pública apresenta **“Uma nova versão está disponível. Atualizar agora.”**. A atualização só recarrega a página após ação do leitor; o painel admin não exibe esse controle e não sofre reload automático durante edição.

### Fora do escopo desta fase

Não foram implementados leitura offline de capítulos, download offline, push notifications, Play Store/TWA, Capacitor, aplicativos nativos, alterações no banco ou alterações nos endpoints editoriais/autenticação.

Melhorias futuras possíveis incluem offline controlado apenas para capítulos gratuitos, TWA para distribuição Android e notificações opt-in após definição de políticas editoriais.

## Central privada do leitor e avatares oficiais

A rota `/conta/` foi transformada em uma central pessoal do leitor. A edição ocorre em `/conta/configuracoes/`, sempre dependente de sessão ativa e do endpoint autenticado `GET/PATCH /api/profile/`.

### Perfil e preferências

- `display_name`, `bio`, `avatar_key`, até cinco gêneros favoritos e preferência de novidades são persistidos na tabela `users`.
- Preferências de leitura são persistidas na conta e sincronizadas no navegador para aplicação imediata no leitor: tema, tamanho de fonte, espaçamento entre linhas e largura do conteúdo.
- O leitor aplica essas preferências sem alterar obras, capítulos ou o fluxo editorial existente.
- O card de biblioteca e a continuação de leitura usam somente `library_items` e `reading_progress` já existentes; sem histórico, a tela mostra estados vazios honestos.

### Avatares

O pacote recebido como `icons_profile.zip` foi tratado como o pacote de avatares solicitado. Os sete arquivos JPEG válidos foram convertidos para WebP 512 × 512, sem metadados incorporados, e adicionados em `public/assets/avatars/default/` com nomes estáveis de `avatar-01.webp` a `avatar-07.webp`. O backend aceita apenas chaves catalogadas em `functions/_lib/profile.ts`; caminhos arbitrários enviados pelo cliente são rejeitados por normalização para o fallback oficial.

> Antes de disponibilizar esses avatares publicamente, confirme que a Ryuzen possui direitos/licenças de uso comercial das imagens fornecidas.

### Migration desta rodada

A migration incremental `migrations/0007_reader_profiles_and_preferences.sql` adiciona apenas campos opcionais ou com valores padrão seguros na tabela `users` e índices de consulta. Execute-a no D1 antes de publicar o código que usa `/api/profile/`:

```bash
npm run db:migrate:remote
```
