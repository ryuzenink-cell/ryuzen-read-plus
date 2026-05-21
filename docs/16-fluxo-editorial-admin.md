# Fluxo editorial do painel admin

O MVP atual da Ryuzen Read Plus trabalha apenas com Light Novels/Webnovels.

## Publicar uma obra

1. Acesse `/admin/obras/nova/`.
2. Preencha título, slug, autor, tipo, status editorial e status de publicação.
3. Preencha sinopse curta, sinopse completa e SEO.
4. Cole a URL pública da capa e, se houver, do banner.
5. Informe alt text e crédito/fonte da imagem.
6. Defina gêneros e tags separados por vírgula.
7. Marque se a obra é gratuita.
8. Escolha se a obra será destaque.
9. Publique ou salve como rascunho.

## Publicar capítulo

1. Acesse `/admin/capitulos/`.
2. Selecione a obra.
3. Informe número, título, slug, resumo e conteúdo.
4. Use Markdown simples no conteúdo.
5. Para inserir imagem externa no capítulo, use:

```markdown
![Descrição da imagem](https://exemplo.com/imagem.jpg)
```

6. Publique ou salve como rascunho.

## Onde a obra publicada aparece

Quando uma obra tem `publication_status = published`, ela passa a aparecer automaticamente em:

- Home;
- Explorar;
- Página individual da obra;
- Novidades, se houver capítulo publicado;
- Gratuitos, se estiver marcada como gratuita;
- Rankings/destaques, se tiver prioridade editorial ou destaque ativo.

## Estado vazio

Se não houver obras publicadas, o site mostra mensagens de catálogo vazio em vez de obras fictícias.

## Imagens

Não há upload de imagens nesta fase. O painel salva apenas URLs externas.
