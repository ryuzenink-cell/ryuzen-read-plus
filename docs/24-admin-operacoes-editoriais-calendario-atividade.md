# Rodada administrativa — operações editoriais (migration 0006)

## Escopo implementado

- Menu administrativo agrupado: visão geral, conteúdo, vitrine, planejamento e sistema.
- Dashboard com oito indicadores, pendências editoriais reais, próximos eventos e atividade recente.
- Central de obras com busca, filtros, ordenação, ações rápidas e arquivamento não destrutivo.
- Formulário de obra com texto promocional curto, contador/alerta, ilustrador, título alternativo, mídia mobile/social, avisos e modelo de acesso.
- Editor de capítulos com volume, tipo, ordem, upload `.md`, palavras, estimativa de leitura e preview protegido no cliente.
- Banners com copy própria, arte desktop/mobile, CTA secundário, duração opcional, validações visuais e dois previews.
- Calendário editorial administrativo, histórico de atividades e configurações iniciais.

## Migração D1

Aplicar antes de publicar esta versão:

```bash
npm install
npx tsc --noEmit
npm run build
npm run db:migrate:local
npm run db:migrate:remote
```

A migration `migrations/0006_admin_editorial_operations.sql` é incremental:

- adiciona somente colunas opcionais ou com valores padrão seguros;
- cria `editorial_calendar_events`, `admin_activity` e `admin_settings`;
- preserva obras, capítulos, banners, sessões e usuários existentes;
- não remove nem renomeia dados existentes.

## Decisões de segurança

- Exclusão destrutiva de obras e capítulos não é exposta na interface ou nas APIs atualizadas; use status **Arquivada**.
- Todas as novas APIs passam por `adminGuard`, mantendo exigência de usuário `admin` ou `editor`.
- Previews de obra, capítulo e banner são renderizados no painel após autenticação; não publicam dados.
- O registro de atividade não bloqueia uma edição caso a migration ainda não tenha sido aplicada, mas as novas páginas dependem da migration.

## Restrição preservada deliberadamente

O schema legado da tabela `works` possui uma restrição SQLite de tipo limitada a `light_novel`, `webnovel` e um identificador antigo. Ativar `one_shot` de forma correta exigiria reconstrução controlada da tabela. Para evitar uma alteração arriscada com conteúdo já publicado, a interface mantém **Light novel** e **Webnovel** nesta rodada e informa a preparação futura para one shots.
