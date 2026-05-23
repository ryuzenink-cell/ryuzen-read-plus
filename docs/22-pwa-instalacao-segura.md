# PWA instalável — implementação segura

## Objetivo

Transformar a Ryuzen ReadPlus em aplicativo instalável mantendo o conteúdo editorial dinâmico, autenticação, biblioteca e administração dependentes da rede e das APIs existentes.

## Arquitetura escolhida

A implementação usa um manifesto web e um service worker manual mínimo, sem adicionar dependências. A escolha evita introduzir uma integração de build mais ampla em uma aplicação que já utiliza Astro estático junto a Cloudflare Pages Functions e D1.

## Manifesto

Fonte única: `public/manifest.webmanifest`.

- Nome: Ryuzen ReadPlus
- Nome curto: ReadPlus
- Idioma: pt-BR
- Exibição: standalone
- Cor de fundo: `#fffaf5`
- Cor de tema: `#8f4f36`
- Ícones `any` e `maskable` a partir da identidade R+ existente

## Instalação

O componente `InstallAppButton.astro`, exibido pelo rodapé da interface pública, só revela o botão quando o evento `beforeinstallprompt` é emitido pelo navegador. Em Safari iOS, uma mensagem dispensável orienta o uso de **Adicionar à Tela de Início**.

O componente não é carregado no painel administrativo nem no leitor, evitando interferir no fluxo editorial ou na leitura. O leitor registra o service worker silenciosamente para manter a experiência instalada funcionando quando acessado diretamente.

## Service worker

Arquivo: `public/sw.js`.

### Em cache

Somente arquivos locais públicos e estáticos:

- manifesto;
- ícones e favicons;
- identidade visual fixa;
- CSS, JavaScript, fontes e imagens locais sob `/_astro/` e `/assets/`, quando solicitados como assets.

### Fora do cache

O service worker não intercepta navegação HTML nem requisições não-GET. Também exclui explicitamente:

- `/admin/*`;
- `/api/*`;
- `/functions/*`;
- `/login`, `/cadastro`, `/recuperar-senha`, `/nova-senha`;
- `/biblioteca`, `/conta`.

Como documentos HTML não são armazenados, obras e capítulos dinâmicos também não ficam retidos em versões antigas pelo service worker.

## Atualização segura

A cada alteração futura nos assets precacheados, atualize `CACHE_VERSION` em `public/sw.js`. O service worker não executa `skipWaiting` automaticamente. Quando há versão nova, páginas públicas com o componente mostram aviso manual. Assim, uma atualização não recarrega subitamente a tela enquanto alguém edita conteúdo no painel.

## Backend e banco

Nenhum arquivo em `functions/` ou `migrations/` foi alterado. Não há mudança em D1, cookies, autenticação, APIs, publicação ou modelo editorial.

## Validação recomendada no Cloudflare Pages

Após deploy HTTPS:

1. abrir a Home e conferir `Application → Manifest`;
2. confirmar `/sw.js` em `Application → Service Workers`;
3. instalar em Chrome/Edge compatível;
4. navegar em modo standalone;
5. validar no painel Network/Cache Storage que `/api/*`, `/admin/*`, biblioteca e login nunca são atendidos pelo cache da PWA;
6. publicar uma alteração editorial e confirmar atualização imediata do conteúdo ao recarregar.
