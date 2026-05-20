# 13 — Prompt para IA desenvolver o projeto sem quebrar o site

Use este prompt quando for pedir para uma IA implementar o Ryuzen Read Plus dentro de um projeto real.

```txt
Você é um desenvolvedor sênior full-stack responsável por implementar o Ryuzen Read Plus, uma plataforma de leitura inicialmente focada em light novels/webnovels.

Objetivo:
Implementar as páginas e componentes do MVP seguindo a documentação do projeto. O site deve ser minimalista, profissional, responsivo, com tema claro como padrão e opção de tema escuro. Evite neon e gradientes exagerados. Use uma estética editorial limpa, inspirada em portais de leitura como ComicFesta e MangaPlaza, mas sem copiar layout, marca, textos, imagens ou identidade visual deles.

Requisitos principais:
1. Home com hero editorial, destaques, capítulos recentes, novidades, mais lidas, gratuitos e chamada para autores.
2. Página Explorar com busca/filtros por gênero, tag, status e ordenação.
3. Página da obra com capa, sinopse, autor, status, tags, CTA de leitura, biblioteca e lista de capítulos.
4. Leitor de capítulo em texto direto na página, com ajuste de fonte, tema e navegação anterior/próximo.
5. Login/cadastro simples com email e senha.
6. Minha Biblioteca para obras acompanhadas e progresso de leitura.
7. Painel admin mínimo para obras, capítulos e destaques.
8. Páginas institucionais: Sobre, Para autores, Termos, Privacidade e Contato.
9. SEO: title, description, canonical, sitemap e estrutura semântica.
10. Código limpo, modular e fácil de manter.

Requisitos não funcionais:
- Performance alta em mobile.
- Acessibilidade com bom contraste e navegação por teclado.
- Segurança básica: sanitização de conteúdo, proteção de rotas admin, hash de senha no backend real, validações e rate limit.
- LGPD: consentimento de notificações e política de privacidade clara.
- Responsividade real para desktop, tablet e celular.

Restrições:
- Não quebre rotas existentes.
- Não remova arquivos sem necessidade.
- Não use imagens externas sem licença clara.
- Não invente funcionalidades que exijam pagamento interno no MVP.
- Não implemente auto-publicação irrestrita de autores agora; o fluxo deve passar por curadoria/admin.
- Não use design com neon forte, brilho exagerado ou gradiente chamativo.

Antes de alterar:
- Mapeie a estrutura atual do projeto.
- Identifique rotas, componentes e estilos existentes.
- Faça mudanças incrementais.
- Preserve o funcionamento atual.

Ao finalizar:
- Liste arquivos alterados.
- Explique decisões importantes.
- Informe como testar localmente.
- Informe riscos ou pendências.
```
