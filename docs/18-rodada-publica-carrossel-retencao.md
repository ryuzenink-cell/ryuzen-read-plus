# Rodada pública: carrossel editorial, continuidade de leitura e consistência pública

## Objetivo implementado

Esta rodada transforma a primeira dobra da Home em uma vitrine editorial orientada à leitura. A home agora comporta um carrossel de banners configurável no painel, seguido por uma seção de continuidade de leitura salva no dispositivo.

## Prompt de implementação utilizado

> Evolua a área pública da Ryuzen Read Plus sem alterar menus ou logotipo. Substitua o hero institucional da página inicial por um carrossel editorial horizontal, minimalista e responsivo, com imagens externas e CTAs de leitura. Crie no painel admin uma seção **Banners da home** onde o editor possa ativar entre 1 e 6 banners, reusar o banner já cadastrado em obras publicadas ou informar URLs externas, definindo imagem mobile opcional, selo, título, descrição, botão, link, prioridade e período de exibição. Não faça upload de imagens.
>
> Abaixo do carrossel, implemente **Continue lendo neste dispositivo**, registrando o último capítulo aberto e o progresso aproximado em `localStorage`; para leitores autenticados, sincronize o progresso no banco quando possível. Melhore o leitor com barra de progresso, tempo estimado de leitura, CTA ao final do capítulo, compartilhamento e ação real de biblioteca.
>
> Corrija problemas públicos identificados: retire mensagens técnicas/MVP/admin da interface do leitor; faça a busca e filtros da página Explorar respeitarem parâmetros na URL; unifique o layout visual de páginas dinâmicas de obra com o cabeçalho/rodapé público; melhore a conversão na página da obra; implemente adicionar/remover da biblioteca e progresso; substitua a aparência artificial de ranking por seleção editorial na página, preservando a rota e o menu existentes; padronize o domínio oficial como `https://readplus.ryuzen.ink`; complemente SEO das páginas dinâmicas com canonical, Open Graph e dados estruturados; atualize textos institucionais e documentação de rotas.
>
> Preserve autenticação, publicação de obras/capítulos e estrutura existente. Adicione somente migrations retrocompatíveis e APIs necessárias, valide URL de imagens, proteja rotas admin e teste `npm run build` e `npx tsc --noEmit` antes da entrega.

## Funcionalidades adicionadas

- Carrossel público na Home com autoplay moderado, controles, dots, suporte a movimento reduzido e layout mobile.
- Menu administrativo `/admin/banners/` com:
  - reuso de banners de obras publicadas;
  - banner externo por URL;
  - URL alternativa para celular;
  - preview da imagem;
  - título, texto, CTA, prioridade e janela de exibição;
  - limite de seis banners ativos e proteção do último banner ativo.
- Migration `0005_home_banner_carousel_and_reader_progress.sql` para os banners da home.
- Seção `Continue lendo` baseada no histórico local do dispositivo.
- Barra de progresso e armazenamento local do andamento no leitor.
- Sincronização de progresso para conta autenticada via `/api/progress`.
- Ações reais de adicionar/remover obra da biblioteca via `/api/library`.
- Biblioteca atualizada com link para continuar capítulo e indicador de progresso.
- Página pública da obra com layout completo, CTAs, badges, tempo de leitura inicial, compartilhamento e SEO aprimorado.
- Página de capítulo com progresso, duração estimada, CTA de fim de capítulo e SEO estruturado.
- Busca e filtros preservados na URL em `/explorar/`.
- Textos públicos reescritos para conversar com leitores em vez de expor detalhes internos.
- Domínio oficial padronizado para `readplus.ryuzen.ink`.

## Aplicação da migration

No ambiente local:

```bash
npm run db:migrate:local
```

No banco remoto configurado no Cloudflare D1:

```bash
npm run db:migrate:remote
```

Aplique a migration antes de configurar o carrossel no painel admin.

## Validação da rodada

Comandos de verificação:

```bash
npm ci
npx tsc --noEmit --pretty false
npm run build
```

Depois do deploy, validar manualmente:

1. Home com e sem banners configurados.
2. Admin > Banners da home: criação por obra e por URL externa, ativação/desativação e limite de seis.
3. Explorar usando `?q=` e `?genre=`.
4. Página pública de obra com e sem banner.
5. Página de capítulo, barra de progresso e seção Continue lendo após retornar à Home.
6. Adicionar/remover da biblioteca com conta autenticada.
7. Sitemap, canonical e compartilhamento de obra/capítulo.
