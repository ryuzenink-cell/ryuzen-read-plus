# Implementação Astro + Cloudflare

Esta versão converte a arquitetura anterior em uma base técnica profissional usando Astro + TypeScript e preparação para Cloudflare.

## Decisões tomadas

- Astro em modo `static` para maximizar SEO, performance e simplicidade no MVP.
- Catálogo mockado em `src/data` para publicar rápido antes do D1.
- Rotas dinâmicas estáticas para obras e capítulos.
- Pages Functions implementadas para cadastro, login, logout, sessão atual, recuperação de senha, biblioteca, submissão de obras e API administrativa inicial.
- D1 integrado às APIs por binding `DB`, com tabelas de usuários, sessões, recuperação de senha, obras, biblioteca e submissões de autores.
- R2 preparado para assets futuros.
- Leitor textual priorizado para light novels.
- Mangá completo deixado para fase posterior.

## Núcleo validável

Home → Cadastro/Login → Sessão D1 → Biblioteca → Admin protegido → Explorar → Página da Obra → Leitor → SEO → Deploy.
