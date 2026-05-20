# 03 — Arquitetura de informação

## Estrutura principal

```txt
Ryuzen Read Plus
├─ Home
├─ Explorar
│  ├─ Todos
│  ├─ Gêneros
│  ├─ Tags
│  ├─ Gratuitos
│  ├─ Novidades
│  └─ Finalizadas
├─ Rankings
│  ├─ Hoje
│  ├─ Semana
│  ├─ Mês
│  └─ Todos os tempos
├─ Obra
│  ├─ Visão geral
│  ├─ Capítulos
│  ├─ Sobre o autor
│  └─ Relacionadas
├─ Leitor
│  ├─ Capítulo
│  ├─ Sumário
│  ├─ Ajustes de leitura
│  └─ Progresso
├─ Conta
│  ├─ Login
│  ├─ Cadastro
│  ├─ Biblioteca
│  ├─ Histórico
│  ├─ Notificações
│  └─ Preferências
├─ Para autores
│  ├─ Como publicar
│  ├─ Enviar obra
│  ├─ Política editorial
│  └─ Produtos/serviços
├─ Eventos
│  ├─ Concursos
│  ├─ Votações
│  └─ Resultados
├─ Institucional
│  ├─ Sobre
│  ├─ Contato
│  ├─ FAQ
│  ├─ Termos
│  └─ Privacidade
└─ Admin
   ├─ Dashboard
   ├─ Obras
   ├─ Capítulos
   ├─ Autores
   ├─ Destaques
   ├─ Afiliados
   ├─ Eventos
   └─ Métricas
```

## Menu público recomendado

Menu superior enxuto:

1. Início
2. Explorar
3. Rankings
4. Gratuitos
5. Novidades
6. Para autores

Ações à direita:

- Buscar
- Entrar
- Minha Biblioteca, quando logado
- Alternar tema

## Rodapé recomendado

- Sobre a Ryuzen
- Para autores
- Política editorial
- Termos de uso
- Privacidade
- Contato
- Redes sociais
- Aviso de direitos autorais

## Padrão de seções na home

1. Hero editorial discreto.
2. Continuar lendo, se logado.
3. Destaques da semana.
4. Capítulos recentes.
5. Novidades.
6. Mais lidas.
7. Gratuitas para começar.
8. Gêneros populares.
9. Evento ou votação ativa.
10. Chamada para autores.

## Observação estratégica sobre mangás

A plataforma pode reservar uma categoria “Mangás” no banco e no painel, mas não precisa exibir isso no MVP inicial. Light novels devem ter leitura em texto direto. Mangás, quando entrarem, devem usar leitor de imagem com ordem direita → esquerda e controle de páginas.
