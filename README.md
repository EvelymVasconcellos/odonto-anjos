# Odonto Anjos — site institucional e cartão digital (demonstrativo EV)

Projeto derivado do modelo **Lumina Odonto** (que não foi alterado) e redesenhado em outubro de 2026:
paleta clara, fotografias reais da clínica e mascote voando conforme a rolagem. Site estático, sem
framework e sem bibliotecas de animação, gerado por um build em Node a partir de um único arquivo de dados.

## Estrutura
```
src/
  site.config.js     ← ÚNICA fonte de dados: marca, paleta, fotos, carrosséis, mascote, unidades,
                       telefones, horários, tratamentos, textos, SEO e modo demonstração
  css/styles.css     ← design system (tokens) + estilos do site e do cartão
  css/card.css       ← ajustes do cartão digital
  js/core.js         ← dados e ações compartilhados (WhatsApp, rotas, abas acessíveis)
  js/units.js        ← seletor de unidades, mapa sob demanda, agendamento
  js/carousel.js     ← carrossel de fotos (Sobre, Estrutura)
  js/main.js         ← menu, cabeçalho, entradas no scroll
  js/illustrations.js← ilustrações SVG dos tratamentos (chave = id do tratamento)
  js/card.js         ← cartão digital: anjo animado, compartilhar, QR Code
  assets/brand/      ← logomarca oficial (várias alturas), favicons, og-image
  assets/images/odonto-anjos/ ← fotografias reais em WebP
  assets/mascot/     ← anjo-loop-{640,420}.webp (animado, alfa) e anjo-still-* (1º quadro)
assets-src/          ← originais: fotos (+ MAPA-DAS-IMAGENS.md) e logo-src.png
scripts/build.mjs    ← gera dist/ (index, /cartao-digital/, /politica-de-privacidade/, 404,
                       robots.txt, sitemap.xml, _headers, _redirects, dados estruturados)
```

## Ordem das seções
Início · Sobre · Tratamentos · Nossa estrutura · Profissional · Instagram · Dúvidas ·
Agende sua avaliação · Nossas unidades (última, antes do rodapé).

## Anjo voando
- **Loop sem corte:** trecho de 1,33 s (quadros 156–195 do vídeo original). A diferença entre o
  último e o primeiro quadro (4,7) é menor que a variação normal entre quadros vizinhos (4,9),
  então a emenda não aparece e não há mistura de quadros (sem "fantasma").
- **Posição fixa no layout:** o anjo fica dentro do contêiner de cada seção (`.fly-spot`), sem
  deslocamento, mola, parallax, escala ou rotação ligados à rolagem. Rola junto com a página como
  qualquer outro elemento. Só a animação interna do WebP (asas, corpo) roda em loop.
- **Celular:** aparece na Home (abaixo de "CLÍNICA ODONTOLÓGICA", acima do título) e em
  "Agende sua avaliação"; os demais pontos ficam só em telas maiores.
- `prefers-reduced-motion`: `<picture>` troca o loop pelo 1º quadro, parado (sem JavaScript).

## Comandos
| Comando | O que faz |
|---|---|
| `npm run build` | Gera `dist/` |
| `npm run dev` | Build + servidor local em http://localhost:5173 |
| `npm run preview` | Build + `wrangler pages dev` (simula o Cloudflare) |
| `npm run deploy` | Build + publica no Cloudflare Pages (projeto `odonto-anjos`) |

## Deploy no Cloudflare Pages
- Pelo painel: conecte o repositório, comando de build `npm run build`, pasta de saída `dist`.
- Pela linha de comando: `npx wrangler login` (uma vez) e `npm run deploy`.

## Ir para produção
Veja `PENDENCIAS.md`. Depois de validar os dados: `demo.enabled: false`,
`seo.robots: "index, follow"`, `seo.siteUrl` definitivo e `seo.siteUrlConfirmed: true` (ativa o QR Code).
