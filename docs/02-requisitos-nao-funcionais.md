# 02 — Requisitos não funcionais

## Performance

| ID | Requisito | Meta |
|---|---|---|
| RNF-001 | A página inicial deve carregar rápido mesmo em internet móvel. | LCP abaixo de 2,5s em páginas críticas. |
| RNF-002 | O leitor deve ser extremamente leve. | HTML textual, CSS otimizado e JS mínimo. |
| RNF-003 | Imagens de capa devem ser otimizadas. | WebP/AVIF quando possível, lazy loading e tamanhos responsivos. |
| RNF-004 | O site deve funcionar mesmo com baixo processamento. | Evitar animações pesadas e dependências excessivas. |

## Acessibilidade

| ID | Requisito | Meta |
|---|---|---|
| RNF-005 | Contraste adequado no tema claro e escuro. | Alvo WCAG AA. |
| RNF-006 | Navegação por teclado. | Menus, botões e leitor acessíveis. |
| RNF-007 | Leitor com fonte ajustável. | Pelo menos 3 tamanhos. |
| RNF-008 | Estrutura semântica. | Header, nav, main, article, section, footer. |

## Segurança

| ID | Requisito | Meta |
|---|---|---|
| RNF-009 | Senhas com hash seguro. | Argon2id ou bcrypt no backend. |
| RNF-010 | Proteção contra ataques comuns. | OWASP Top 10 como base. |
| RNF-011 | Rate limiting em login, cadastro e envio de formulário. | Evitar brute force e spam. |
| RNF-012 | Sanitização de conteúdo publicado. | Evitar XSS nos capítulos e sinopses. |
| RNF-013 | Sessões seguras. | Cookies HttpOnly, Secure e SameSite. |

## Privacidade e LGPD

| ID | Requisito | Meta |
|---|---|---|
| RNF-014 | Coletar apenas dados necessários. | Email, senha, biblioteca, progresso e preferências. |
| RNF-015 | Consentimento claro para notificações. | Opt-in explícito. |
| RNF-016 | Permitir exclusão de conta/dados. | Fluxo previsto. |
| RNF-017 | Política de privacidade clara. | Linguagem simples. |

## Escalabilidade

| ID | Requisito | Meta |
|---|---|---|
| RNF-018 | Arquitetura compatível com Cloudflare Pages/Workers. | Deploy barato e escalável. |
| RNF-019 | Separar front-end, API e armazenamento. | Evolução gradual. |
| RNF-020 | Cache em páginas públicas. | Home, obra, capítulo público. |
| RNF-021 | Banco preparado para crescimento de catálogo. | Índices em obra, capítulo, usuário e leitura. |

## SEO

| ID | Requisito | Meta |
|---|---|---|
| RNF-022 | Páginas públicas renderizáveis sem depender totalmente de JS. | SEO e acessibilidade. |
| RNF-023 | URLs permanentes e canônicas. | Evitar duplicidade. |
| RNF-024 | Sitemap atualizado. | Obras e capítulos públicos. |
| RNF-025 | Dados estruturados. | CreativeWork/Book/Article. |

## Manutenibilidade

| ID | Requisito | Meta |
|---|---|---|
| RNF-026 | Componentes reutilizáveis. | Header, card de obra, lista de capítulos, leitor. |
| RNF-027 | Padrão de rotas claro. | Facilitar expansão. |
| RNF-028 | Documentação viva. | Atualizar docs junto do código. |
| RNF-029 | Versionamento no GitHub. | Branches, commits descritivos e releases. |

## Operação editorial

| ID | Requisito | Meta |
|---|---|---|
| RNF-030 | Publicação não pode depender de editar código manualmente para sempre. | Painel editorial ou CMS headless. |
| RNF-031 | Capítulos devem ter rascunho, revisão e publicação. | Fluxo editorial mínimo. |
| RNF-032 | Destaques pagos devem ter data de início e fim. | Evitar esquecimento manual. |
