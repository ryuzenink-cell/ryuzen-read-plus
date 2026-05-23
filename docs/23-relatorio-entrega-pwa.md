# Relatório de entrega — PWA Ryuzen ReadPlus

## Resumo executivo

A Ryuzen ReadPlus foi preparada como Progressive Web App instalável, com manifesto oficial, ícones R+ adequados, experiência standalone, orientação discreta de instalação e service worker de política conservadora. A solução mantém o site como plataforma online de light novels e webnovels, sem implementar leitura offline de capítulos e sem alterar o backend editorial.

## Auditoria inicial

- Framework: Astro `^6.3.6` + TypeScript `^5.9.3`.
- Output: `static`.
- Hospedagem: Cloudflare Pages, com `pages_build_output_dir = "dist"`.
- Backend: Cloudflare Pages Functions separadas em `functions/`.
- Banco: Cloudflare D1 configurado em `wrangler.toml`.
- Situação PWA inicial: não havia manifesto ativo no layout global, service worker ou fluxo de instalação.
- Validação anterior às alterações: `npm ci`, `npx tsc --noEmit` e `npm run build` concluíram sem erros.

## Arquivos criados

- `public/manifest.webmanifest`
- `public/sw.js`
- `public/assets/pwa-client.js`
- `public/icons/pwa-192x192.png`
- `public/icons/pwa-512x512.png`
- `public/icons/pwa-maskable-192x192.png`
- `public/icons/pwa-maskable-512x512.png`
- `src/components/InstallAppButton.astro`
- `docs/22-pwa-instalacao-segura.md`
- `docs/23-relatorio-entrega-pwa.md`

## Arquivos modificados

- `README.md`
- `src/components/Footer.astro`
- `src/layouts/BaseLayout.astro`
- `src/layouts/ReaderLayout.astro`
- `src/lib/site.ts`
- `src/styles/global.css`

## Arquivos removidos

- `public/icons/site.webmanifest`
- `public/favicon/site.webmanifest`

Os dois manifests antigos não estavam conectados aos layouts atuais e foram removidos para deixar `public/manifest.webmanifest` como fonte única do aplicativo instalável.

## Dependências

Nenhuma dependência foi adicionada ou atualizada. A estratégia manual mínima foi adotada para não ampliar a superfície de risco ou mudar a configuração Astro/Cloudflare existente.

## Manifesto e identidade

- Nome: `Ryuzen ReadPlus`
- Nome curto: `ReadPlus`
- Descrição: `Leia light novels e webnovels autorais na Ryuzen ReadPlus.`
- Idioma: `pt-BR`
- Display: `standalone`
- Tema: terracota editorial `#8f4f36`
- Fundo: `#fffaf5`

Os ícones foram derivados do arquivo R+ oficial já incluído no projeto. As variantes `maskable` incluem margem segura e fundo coerente com o tema claro, preservando a marca.

## Service worker e política de cache

O arquivo `public/sw.js` adota cache somente para assets locais e estáticos:

- manifesto;
- ícones/favicons;
- branding local;
- CSS, JavaScript, fontes ou imagens locais em `/_astro/` e `/assets/` quando requisitados como assets.

Não são cacheados:

- documentos HTML/navegações;
- `/admin` e `/admin/*`;
- `/api` e `/api/*`;
- `/functions` e `/functions/*`;
- `/login`, `/cadastro`, `/recuperar-senha`, `/nova-senha`;
- `/biblioteca`, `/conta`;
- qualquer `POST`, `PUT`, `PATCH` ou `DELETE`;
- páginas dinâmicas de obras e capítulos;
- imagens externas de capas e banners.

A atualização do worker requer ação manual no aviso público **Atualizar agora**, evitando reload imprevisto durante uso editorial.

## Interface e instalação

- O rodapé público recebe o componente de instalação discreto.
- O botão só surge quando `beforeinstallprompt` está disponível.
- Safari em iPhone/iPad recebe uma instrução dispensável para adicionar à tela inicial.
- O painel admin não recebe botão ou banner de atualização.
- O leitor recebe metatags de PWA e registro silencioso do service worker, sem pop-up de instalação.
- Tema visual e `theme-color` acompanham a preferência light/dark do usuário.
- Safe areas são respeitadas apenas no modo standalone.

## Backend e banco

- Alterações em `functions/`: nenhuma.
- Alterações em `migrations/`: nenhuma.
- Alterações em D1/schema/bindings: nenhuma.
- Alterações em autenticação/cookies/APIs/editor/publicação: nenhuma.

## Comandos executados

Antes da implementação:

```bash
npm ci
npx tsc --noEmit
npm run build
```

Após a implementação:

```bash
node --check public/sw.js
node --check public/assets/pwa-client.js
python3 -m json.tool public/manifest.webmanifest
npx tsc --noEmit
npm run build
npm run preview -- --host 127.0.0.1
```

## Resultados de validação

- Instalação de dependências: concluída.
- Typecheck anterior: aprovado.
- Build anterior: aprovado; 23 páginas geradas.
- Sintaxe JavaScript do service worker: aprovada.
- Sintaxe JavaScript do cliente PWA: aprovada.
- JSON do manifesto: válido.
- Typecheck final: aprovado.
- Build final limpo: aprovado; 23 páginas geradas.
- Preview local: Home, manifesto e service worker retornaram HTTP 200.
- Verificação de interface: Home construída contém manifesto/cliente/botão condicionado; HTML admin construído não contém UI de instalação/atualização.
- Comparação estrutural: `functions/` e `migrations/` permanecem sem diferenças.

## Verificações que dependem do ambiente real

Login autenticado, publicação editorial com D1 remoto e instalação nativa em dispositivo/navegador devem ser confirmados após deploy HTTPS, pois dependem de sessão, bindings e suporte do navegador.

## Teste em produção no Cloudflare Pages

1. Fazer deploy normalmente via `npm run build`, publicando `dist`.
2. Abrir `https://readplus.ryuzen.ink`.
3. Conferir no DevTools: **Application → Manifest** e **Service Workers**.
4. Instalar a aplicação em Chrome/Edge ou adicionar à tela inicial no Safari iOS.
5. Abrir em standalone e navegar pela Home, catálogo, obra e capítulo.
6. Acessar login/biblioteca/admin e verificar que requisições não vêm de Cache Storage.
7. Editar/publicar conteúdo e confirmar que as páginas dinâmicas refletem os dados atuais.

## Fase futura

- offline seletivo para capítulos gratuitos, somente com regras editoriais e invalidação explícitas;
- Trusted Web Activity/Play Store;
- notificações push opt-in;
- auditoria Lighthouse em produção.
