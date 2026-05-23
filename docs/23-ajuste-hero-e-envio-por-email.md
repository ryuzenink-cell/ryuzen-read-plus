# Ajuste do hero da Home e envio de obras por e-mail

## Correções desta rodada

- O bloco de busca da Home deixou de se sobrepor à área inferior do banner principal. Ele permanece visualmente associado ao destaque, mas abaixo do hero, preservando sempre os botões de chamada para leitura e página da obra.
- A rota `/enviar-obra/` não envia mais propostas por formulário interno. A página passou a orientar autores a enviarem materiais diretamente para `hello@ryuzen.ink`.
- A nova página explica o que a Ryuzen procura, quais informações incluir e como preparar o material para análise editorial.
- O CTA da página `/para-autores/` passou a comunicar melhor a nova jornada: "Como enviar sua obra".

## Backend

Nenhum endpoint, migration ou tabela foi removido ou alterado nesta rodada. A API antiga de submissões foi preservada para evitar quebra estrutural, embora a página pública não a utilize mais.

## Validação executada

```bash
npm ci
npx tsc --noEmit --pretty false
npm run build
```

O build foi concluído com sucesso, gerando 23 páginas estáticas.
