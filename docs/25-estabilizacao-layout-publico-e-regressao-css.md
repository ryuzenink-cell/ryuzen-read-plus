# Estabilização visual pública e correção da regressão CSS

## Diagnóstico

A rodada de correção visual anterior substituiu por engano `src/styles/global.css` pela folha destinada às páginas dinâmicas públicas, `public/assets/rrp-public.v2.css`. Como consequência, foram removidas regras do painel administrativo, central do leitor, submissão por e-mail e PWA. Essa foi a causa da perda de dimensões dos cards/imagens e da quebra geral de layout.

## Estratégia adotada

A implementação desta rodada parte da versão estável com a Central do Leitor funcionando e aplica somente alterações isoladas:

- restauração integral de `src/styles/global.css`, preservando todos os módulos administrativos e de conta;
- bloco final `Public layout stability v3`, limitado aos namespaces `.home-showcase` e `.work-detail-page`;
- aplicação equivalente desse bloco na folha usada por páginas públicas dinâmicas;
- carrossel reimplementado com um único timer controlado, cleanup de listeners e reinicialização segura;
- arquivo versionado `editorial-public.v3.js` para impedir que cache mantenha a lógica anterior;
- suporte público ao campo `duration_ms` já existente no gerenciador de banners, com fallback de 7 segundos.

## Garantias de escopo

- Nenhuma migration foi adicionada.
- Nenhuma estrutura de autenticação, biblioteca ou perfil foi alterada.
- Nenhuma obra, capítulo ou dado real foi modificado.
- Nenhuma funcionalidade pública não relacionada foi removida.

## Validações realizadas

- `npm install`
- `npx tsc --noEmit`
- `npm run build`
- `node --check public/assets/editorial-public.v2.js`
- `node --check public/assets/editorial-public.v3.js`
- Migrations `0001` a `0007` aplicadas somente em D1 local limpo para validação.
- Verificação visual automatizada com conteúdo longo nos breakpoints 320, 375, 430, 768 e 1366 px.
- Verificação do carrossel por uma volta completa e início da volta seguinte com timer reduzido controladamente para acelerar o teste; o padrão real do código é `7000ms`.

## Arquivos alterados

- `src/styles/global.css`
- `public/assets/rrp-public.v2.css`
- `public/assets/editorial-public.v2.js`
- `public/assets/editorial-public.v3.js`
- `src/pages/index.astro`
- `src/pages/explorar.astro`
- `src/pages/gratuitos.astro`
- `src/pages/novidades.astro`
- `src/pages/rankings.astro`
- `functions/api/home.ts`
- `functions/_lib/public-page.ts`
