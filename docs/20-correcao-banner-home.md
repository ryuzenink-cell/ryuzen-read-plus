# Correção do carrossel de banners da Home

## Problemas corrigidos

1. **Banner vinculado à obra podia ficar desatualizado.** O registro do carrossel armazenava uma cópia antiga da URL da imagem. Agora, quando a origem do banner é uma obra, a Home usa a URL atual cadastrada na própria obra.
2. **Uma falha em seção secundária podia impedir o carrossel de carregar.** O endpoint `/api/home` agora carrega o carrossel como conteúdo prioritário e isola falhas de gêneros, destaques, capítulos recentes ou listagens secundárias.
3. **Horários de exibição eram enviados como horário local sem fuso.** O painel converte agendamento para ISO/UTC ao salvar e converte de volta para o horário local ao editar.
4. **Imagem externa indisponível deixava o banner visualmente quebrado.** O carrossel agora tenta usar a capa da obra como fallback quando aplicável; sem fallback, mantém um fundo editorial elegante sem imagem quebrada.
5. **Preview/lista do admin para banners de obra podia mostrar imagem antiga.** A listagem administrativa agora usa a imagem atual da obra vinculada.

## Validação executada

- `node --check public/assets/editorial-public.js`
- `node --check public/assets/admin-banners.js`
- `npx tsc --noEmit --pretty false`
- `npm run build`
- Teste local do endpoint `/api/home` com banner vinculado a uma obra cuja URL de banner foi alterada: a API retornou a imagem atual.

## Observação para produção

O carrossel configurável depende da migration `0005_home_banner_carousel_and_reader_progress.sql`. Caso ela ainda não tenha sido aplicada ao banco remoto da Cloudflare, execute:

```bash
npm run db:migrate:remote
```
