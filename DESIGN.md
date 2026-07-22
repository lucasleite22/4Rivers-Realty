---
name: 4Rivers Realty
description: Sistema visual de um rancho moderno atemporal — navy profundo, serifada editorial e generosidade de espaço para uma butique imobiliária equestre.
colors:
  primary:
    dark-navy: "#181B3A"
    navy: "#252859"
  secondary:
    brand-blue: "#86ACDB"
    light-blue: "#B5CEEA"
  neutral:
    off-white: "#F8F9FC"
    gray-400: "#9CA3AF"
    gray-500: "#6B7280"
    gray-600: "#4B5563"
typography:
  display:
    fontFamily: "Cormorant Garamond"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Cormorant Garamond"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Cormorant Garamond"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Barlow"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Barlow"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.2em"
rounded:
  md: "0.375rem"
  xl: "0.75rem"
spacing:
  section: "4rem"
  container: "80rem"
  gridGap: "3rem"
components:
  primaryButton:
    backgroundColor: "{colors.primary.navy}"
    textColor: "#FFFFFF"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0.75rem 1.5rem"
  secondaryButton:
    backgroundColor: "transparent"
    textColor: "#FFFFFF"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
  outlineButton:
    backgroundColor: "transparent"
    textColor: "{colors.primary.navy}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
  sectionTitle:
    textColor: "{colors.primary.dark-navy}"
    typography: "{typography.headline}"
  countdownTile:
    backgroundColor: "{colors.primary.navy}"
    textColor: "#FFFFFF"
    typography: "{typography.display}"
    rounded: "{rounded.xl}"
    size: "5rem"
---

## Overview

4Rivers Realty é um rancho moderno atemporal: a herança rural do cavalo e da terra encontrando uma sofisticação silenciosa e contemporânea. O navy profundo funciona como madeira escura e céu de fim de tarde — uma âncora sóbria contra a qual a paisagem e o portfólio de propriedades ganham protagonismo. A tipografia serifada (Cormorant Garamond) carrega o peso editorial e atemporal da marca; a sans-serif (Barlow) mantém a leitura funcional e confiável no dia a dia. Nada aqui deve parecer uma corretora de bairro: cada tela é uma butique especializada em fazendas equestres, não um portal residencial genérico.

## Colors

- **Primary — Dark Navy `#181B3A`**: a cor de fundo âncora, usada em superfícies grandes (footer, seções de destaque) para transmitir profundidade e exclusividade sem peso corporativo.
- **Primary — Navy `#252859`**: o navy de trabalho — botões primários, tiles de destaque (contador), textos de marca sobre fundo claro. É o tom mais versátil da paleta.
- **Secondary — Brand Blue `#86ACDB`**: acento de interação — hover states, foco, rótulos de destaque. Traz leveza e ar sem competir com o navy.
- **Secondary — Light Blue `#B5CEEA`**: suporte discreto para estados secundários e realces sutis, sempre em doses pequenas.
- **Neutral — Off-White `#F8F9FC`**: fundo claro padrão das seções públicas, quase branco, nunca creme/areia — mantém o frio elegante da paleta.
- **Neutral — Grays (`#9CA3AF` / `#6B7280` / `#4B5563`)**: hierarquia de texto secundário sobre fundos escuros (footer) — do mais claro ao mais escuro conforme a importância da informação cai.

Contraste segue WCAG AA: texto de corpo ≥4.5:1, texto grande/display ≥3:1 — crítico onde há texto branco sobre imagem/vídeo de hero e texto sobre navy.

## Typography

- **Display** — Cormorant Garamond, 700, ~48px: números do countdown e momentos de maior impacto visual.
- **Headline** — Cormorant Garamond, 700, ~36px: títulos de seção (`.section-title`), a voz editorial da marca.
- **Title** — Cormorant Garamond, 600, ~18px: subtítulos de bloco (ex.: colunas do footer).
- **Body** — Barlow, 400, 16px, leading 1.6: parágrafos, descrições, `.section-subtitle`.
- **Label** — Barlow, 600, 12px, tracking 0.2em, uppercase: rótulos funcionais (labels do countdown, tags de categoria) — usado com moderação, nunca como eyebrow decorativo repetido acima de toda seção.

Cormorant Garamond carrega a voz; Barlow carrega a função. Nunca inverter os papéis.

## Elevation

Sombras suaves e rasas — refinamento silencioso, não camadas dramáticas. `shadow-lg` de baixo blur e opacidade contida é reservado a elementos que realmente flutuam sobre o fundo (tiles do countdown). A maior parte da hierarquia visual vem de cor, espaço e tipografia, não de sombra. Bordas decorativas (stripes, contornos coloridos) estão banidas; quando uma borda é necessária, usar 1px sutil (`border-white/10`) como divisor discreto, nunca como acento de cor.

## Components

- **Primary Button** (`.btn-primary`): fundo navy, texto branco, `rounded-md`, hover para brand-blue. Ação principal — agendar visita, enviar contato.
- **Secondary Button** (`.btn-secondary`): borda branca dupla sobre fundo escuro, hover preenche branco com texto navy. Usado sobre hero/imagens.
- **Outline Button** (`.btn-outline`): borda navy sobre fundo claro, hover inverte para navy sólido. Ação secundária em seções claras.
- **Section Title / Subtitle** (`.section-title` / `.section-subtitle`): par headline + body que abre cada seção da página — título em Cormorant, subtítulo em Barlow cinza.
- **Countdown Tile**: bloco navy `rounded-xl` com dígito em Cormorant branco e `shadow-lg` raso — o único componente com elevação decorativa, reservado a momentos de expectativa (lançamento de propriedade).
- **Skip Link**: oculto até foco, fundo navy, texto branco, desliza do topo — padrão de acessibilidade a preservar em qualquer novo componente interativo.

## Do's and Don'ts

- **Do** usar navy/dark-navy como âncora e deixar fotografia de propriedade/paisagem ser o elemento mais chamativo da tela.
- **Do** reservar brand-blue para interação (hover, foco, links) — nunca como cor de fundo dominante.
- **Do** manter contraste AA em qualquer combinação texto/fundo, especialmente branco sobre hero de vídeo.
- **Do** aplicar `prefers-reduced-motion` a qualquer nova animação, seguindo o padrão já usado no hero e no countdown.
- **Don't** criar grids de cards idênticos (ícone + título + texto repetido) — cada seção deve ter uma razão visual própria para sua forma.
- **Don't** adicionar eyebrows uppercase tracked acima de cada seção nem numeração 01/02/03 como scaffolding padrão.
- **Don't** usar bordas coloridas laterais (side-stripe) como acento decorativo.
- **Don't** introduzir gradientes em texto ou glassmorphism decorativo fora de um uso pontual e justificado.
