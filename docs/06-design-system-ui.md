# 06 — Design system e UI

## Direção visual

A identidade deve passar sensação de:

- Leitura confortável.
- Catálogo editorial.
- Organização.
- Confiança.
- Cultura geek/anime sem exagero visual.

Evitar:

- Neon excessivo.
- Gradientes fortes.
- Cards muito brilhantes.
- Fundo preto absoluto como padrão.
- Interface parecida com cassino, game launcher ou landing page agressiva.

## Paleta recomendada

### Tema claro

| Token | Cor | Uso |
|---|---|---|
| `--bg` | `#f8f3ea` | Fundo geral, papel quente. |
| `--surface` | `#fffdf8` | Cards e áreas principais. |
| `--surface-2` | `#f1e8dc` | Chips, filtros e blocos secundários. |
| `--text` | `#251f1a` | Texto principal. |
| `--muted` | `#746a5f` | Texto secundário. |
| `--border` | `#e4d8c9` | Bordas suaves. |
| `--accent` | `#9b3d2e` | Botões principais e links. |
| `--accent-soft` | `#f2d8d0` | Fundo leve de destaque. |

### Tema escuro

| Token | Cor | Uso |
|---|---|---|
| `--bg` | `#171412` | Fundo escuro quente. |
| `--surface` | `#211d1a` | Cards. |
| `--surface-2` | `#2b2520` | Chips e blocos. |
| `--text` | `#f7efe5` | Texto principal. |
| `--muted` | `#c9b9a7` | Texto secundário. |
| `--border` | `#40362f` | Bordas. |
| `--accent` | `#d78973` | Ação principal. |
| `--accent-soft` | `#3a211d` | Fundo leve de destaque. |

## Tipografia

Usar fontes de sistema:

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

Para leitura longa:

```css
font-family: Georgia, "Times New Roman", serif;
```

## Componentes principais

1. Header fixo leve.
2. Busca expandida.
3. Chip de gênero/tag.
4. Card de obra.
5. Card horizontal de capítulo recente.
6. Lista de capítulos.
7. Botão primário.
8. Botão secundário.
9. Badge “Novo”, “Grátis”, “Destaque”, “Pago”.
10. Painel de filtros.
11. Leitor com toolbar.
12. Alertas e estados vazios.

## Layout da home

- Largura máxima: 1180px.
- Grid responsivo.
- Cards de obra entre 150px e 190px de largura no desktop.
- Hero com texto e 1 card grande, sem carrossel pesado no MVP.
- Seções com título, descrição curta e botão “Ver mais”.

## Leitor

O leitor deve priorizar conforto:

- Coluna de texto entre 680px e 760px.
- Altura de linha entre 1.75 e 1.9.
- Parágrafos bem espaçados.
- Botões de ajuste de fonte.
- Sumário acessível.
- Barra superior discreta.

## Dark mode

O tema claro é padrão. O dark mode deve ser opcional e salvo no navegador. No produto real, quando logado, a preferência pode ser salva no perfil.
