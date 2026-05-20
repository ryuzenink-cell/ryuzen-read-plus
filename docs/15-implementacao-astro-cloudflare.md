# Implementação Astro + Cloudflare

Esta versão converte a arquitetura anterior em uma base técnica profissional usando Astro + TypeScript e preparação para Cloudflare.

## Decisões tomadas

- Astro em modo `static` para maximizar SEO, performance e simplicidade no MVP.
- Catálogo mockado em `src/data` para publicar rápido antes do D1.
- Rotas dinâmicas estáticas para obras e capítulos.
- Pages Functions preparadas como skeletons, sem autenticação insegura.
- D1 preparado via migration, mas ainda não integrado ao frontend.
- R2 preparado para assets futuros.
- Leitor textual priorizado para light novels.
- Mangá completo deixado para fase posterior.

## Núcleo validável

Home → Explorar → Página da Obra → Leitor → SEO → Deploy.
