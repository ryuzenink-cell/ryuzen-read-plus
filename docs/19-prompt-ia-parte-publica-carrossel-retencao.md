# Prompt completo — Home pública, carrossel editorial e retenção da Ryuzen Read Plus

Você é um desenvolvedor sênior especializado em Astro, TypeScript, JavaScript, Cloudflare Pages, Cloudflare Pages Functions, Cloudflare D1, SEO técnico, acessibilidade, segurança front-end e UI/UX de plataformas de leitura digital.

Você receberá um ZIP do projeto **Ryuzen Read Plus**. Trabalhe diretamente no código-fonte do projeto e entregue o ZIP alterado, sem editar `dist/` como fonte da verdade e sem quebrar autenticação, publicação, Cloudflare Functions, D1, biblioteca ou rotas existentes.

## Contexto de produto

A Ryuzen Read Plus é uma plataforma pública de leitura exclusivamente para **Light Novels** e **Webnovels** neste momento. O visual deve ser editorial, minimalista, elegante e confortável, inspirado apenas conceitualmente em plataformas de leitura como ComicFesta e MangaPlaza. Não incluir mangás, neon, gradientes exagerados ou aparência gamer.

A parte pública deve conversar com **leitores**, não com administradores ou desenvolvedores. Nunca exibir ao público mensagens sobre MVP, SEO, banco D1, API, painel admin ou implementação interna.

## Objetivo principal

Substitua a primeira dobra da Home por uma vitrine editorial com **carrossel horizontal de banners** e implemente mecanismos reais de retenção do leitor, corrigindo problemas públicos de UX, consistência, navegação, SEO e biblioteca.

O menu principal e a logo existentes devem ser preservados visualmente.

## 1. Carrossel de banners da Home

### Área pública

Crie na primeira dobra da Home um carrossel elegante e responsivo que exiba de **1 a 6 banners ativos** definidos pelo admin.

Cada slide deve suportar:
- imagem horizontal via URL externa;
- imagem alternativa para celular, opcional;
- texto alternativo;
- selo editorial, por exemplo “Novo capítulo disponível”;
- título de destaque;
- texto curto;
- CTA principal com rótulo e URL;
- vínculo opcional a uma obra publicada;
- prioridade/ordem;
- janela opcional de exibição por data;
- estado ativo/inativo.

Requisitos visuais e de UX:
- overlay escuro discreto para manter legibilidade sobre a imagem;
- CTA claro de leitura;
- botões anterior/próximo;
- indicadores de slide;
- autoplay moderado, interrompido em hover/foco;
- respeitar `prefers-reduced-motion`;
- layout mobile funcional;
- estado elegante caso não haja banner configurado.

### Painel admin

Adicione uma rota/menu administrativo **Banners da home**.

O admin deve poder:
- cadastrar banner usando URL externa;
- reutilizar automaticamente o `banner_url` de uma obra publicada;
- informar imagem mobile opcional;
- visualizar preview da imagem;
- definir selo, título, descrição, botão, link, prioridade, datas e status ativo;
- editar, ativar/desativar e excluir banners;
- visualizar a quantidade de banners ativos;
- manter no máximo 6 banners ativos;
- manter no mínimo 1 banner ativo quando o carrossel já tiver sido configurado.

Não implementar upload de imagem. Todas as imagens continuam sendo referenciadas por URL.

### Persistência

Crie migration retrocompatível para tabela dedicada, por exemplo `home_banners`, com relação opcional à tabela `works`. Proteja endpoints administrativos com permissão `admin`/`editor` e valide URLs e campos obrigatórios no backend.

Crie APIs:
- `GET/POST /api/admin/banners`
- `PATCH/DELETE /api/admin/banners/:id`

A API pública da Home deve retornar os banners ativos; caso a migration ainda não tenha sido aplicada ou a curadoria esteja vazia, poderá usar com segurança banners existentes de obras públicas como fallback transitório.

## 2. Continue lendo e retenção

Logo abaixo do carrossel, implemente a seção **Continue lendo**.

Sem login:
- guardar em `localStorage` a obra, capítulo, link, capa, data e porcentagem aproximada do capítulo mais recentemente lido;
- exibir na Home os últimos itens lidos neste dispositivo;
- não prometer sincronização entre dispositivos sem conta.

Com login:
- sincronizar progresso via API, usando a tabela de progresso já existente se possível;
- mostrar na biblioteca o último capítulo lido, porcentagem e botão de continuar.

Na página de capítulo, adicionar:
- barra de progresso de leitura no topo;
- tempo estimado de leitura;
- navegação anterior/sumário/próximo;
- CTA ao final do capítulo;
- ação para acompanhar/adicionar a obra à biblioteca;
- botão de compartilhamento.

## 3. Biblioteca funcional

Corrija a promessa pública da biblioteca implementando ações reais:
- adicionar obra à biblioteca;
- remover obra;
- listar obras salvas;
- continuar no último capítulo lido quando houver progresso.

APIs esperadas:
- `GET/POST/DELETE /api/library`
- `POST /api/progress`

Usuários não autenticados devem ser direcionados ao login no momento em que tentarem salvar uma obra, sem bloquear a leitura aberta.

## 4. Home e linguagem pública

Remova textos institucionais/técnicos excessivos da primeira dobra. A Home deve vender leitura e histórias, não infraestrutura.

Estrutura sugerida:
1. Carrossel editorial de banners.
2. Busca curta por obra, autor, gênero ou tag.
3. Continue lendo, quando houver histórico.
4. Capítulos recentes com miniatura, título, obra, data e CTA.
5. Obras em destaque.
6. Novidades.
7. Gratuitos para começar.
8. Seleção da Ryuzen.
9. Explorar por gênero.
10. CTA para autores abaixo das seções de leitura.

## 5. Corrigir problemas públicos existentes

Corrija todos estes pontos:

1. Remova textos públicos que mencionem painel admin, dados simulados, banco, API, MVP, SEO interno ou checkout ainda não implementado.
2. Faça a busca da Home funcionar em `/explorar/?q=...`.
3. Faça filtros por URL funcionarem em `/explorar/?genre=...`, `?type=...`, `?status=...` e `?free=...`.
4. Exiba contagem de resultados e botão para limpar filtros.
5. Faça páginas dinâmicas de obra manterem cabeçalho, rodapé, tema e identidade visual do restante da plataforma.
6. Melhore a página pública da obra com capa, banner opcional, CTA acima da dobra, badges, capítulos, duração inicial, biblioteca e compartilhamento.
7. Mantenha a rota/menu `Rankings`, mas apresente o conteúdo publicamente como seleção/curadoria enquanto não houver métricas reais de popularidade.
8. Padronize domínio canônico, sitemap, Open Graph e metadados para `https://readplus.ryuzen.ink`.
9. Adicione SEO estruturado para obra e capítulo (`Book`, `Article`, breadcrumbs e canonical quando aplicável).
10. Corrija documentação de rotas divergentes, usando `/login/`, `/biblioteca/` e `/obra/:slug/:chapterSlug/`.

## 6. Segurança e integridade

- Não reintroduzir obras de exemplo.
- Não introduzir mangás na interface pública.
- Não quebrar login, cadastro, recuperação, admin, obra, capítulo, biblioteca, favicon ou páginas institucionais.
- Validar URLs externas no backend.
- Escapar dados renderizados e manter a conversão Markdown segura.
- Não revelar mensagens técnicas ao leitor.
- Não permitir mais de 6 banners ativos.
- Não remover o último banner ativo sem orientar o admin a criar outro primeiro.

## 7. Validação obrigatória

Antes de entregar:
- executar `npm ci` ou o gerenciador indicado pelo lockfile;
- executar `npx tsc --noEmit --pretty false`;
- executar `npm run build`;
- aplicar migrations em D1 local limpo;
- realizar smoke test local de `/api/home`, página de obra, página de capítulo e proteção de `/api/admin/banners` sem autenticação;
- verificar que não há referências públicas incorretas ao domínio antigo;
- verificar que não há textos públicos de implementação/MVP/admin.

## Entrega

Entregue:
- ZIP final do projeto alterado;
- lista de arquivos relevantes modificados;
- migrations necessárias;
- comandos de validação executados e resultados;
- instrução clara de aplicar a migration no D1 antes de usar Banners da Home;
- observações sobre recursos preparados para rodada futura.
