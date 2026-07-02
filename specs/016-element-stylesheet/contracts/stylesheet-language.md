# Contract: ADL Stylesheet 1.0

## External file

```adl
stylesheet version "1.0" {
  * {
    font-size "14px"
    font-family "Arial, sans-serif"
    text-paint "#102A43FF"
  }

  element * {
    border-paint "#2457A6FF"
    border-width "2px"
  }

  element type "service" {
    shape "ellipse"
    width "180px"
    height "96px"
    fill "linear-gradient(90deg, #E8F0FFFF 0%, #B8CCFFFF 100%)"
    border-paint "#2457A6FF"
    border-width "2px"
    border-radius "0px"
    text-paint "linear-gradient(0deg, #102A43FF 0%, #2457A6FF 100%)"
    font-size "16px"
    font-family "Arial Black, Arial, sans-serif"
    font-weight "bold"
    font-style "italic"
    text-decoration "underline"
    text-align "center"
    vertical-align "middle"
  }

  element id payments {
    shape "parallelogram"
    orientation "horizontal"
    rotation "15deg"
    border-radius "16px"
    fill "#FFF3CDFF"
    x "320px"
    y "180px"
  }

  relation type "async" {
    line-paint "linear-gradient(90deg, #6B46C1FF 0%, #D53F8CFF 100%)"
    line-width "3px"
    text-paint "#44337AFF"
    font-size "14px"
    font-family "Arial, sans-serif"
    font-weight "normal"
    font-style "normal"
    text-decoration "none"
    text-align "center"
    vertical-align "top"
  }
}
```

## ADL integration

Uma referência opcional precede o documento e um bloco embutido opcional o sucede:

```adl
stylesheet "./architecture.adls"

adl version "1.0" diagram {
  element payments { name "Payments" type "service" }
}

stylesheet {
  element id payments {
    fill "#FFF3CDFF"
  }
}
```

Somente uma referência e um bloco são permitidos. A referência é relativa à URI do `.adl`. O bloco embutido reutiliza as mesmas regras do arquivo externo e não declara versão.

## Grammar sketch

```text
stylesheet-file     := "stylesheet" "version" STRING "{" rule* "}"
adl-envelope        := stylesheet-reference? adl-document embedded-stylesheet? EOF
stylesheet-reference:= "stylesheet" STRING
embedded-stylesheet := "stylesheet" "{" rule* "}"
rule                := global-rule | category-rule
global-rule         := "*" "{" common-declaration* "}"
category-rule       := target category-selector "{" declaration* "}"
target              := "element" | "relation"
category-selector   := "*" | selector-kind selector-value
selector-kind       := "type" | "id"
selector-value      := STRING | IDENTIFIER
declaration         := PROPERTY STRING
```

`*` global aceita apenas propriedades comuns a elementos e relações. `element *` e `relation *` aceitam todas as propriedades válidas da categoria. Seletores `type` usam string; seletores `id` usam identificador.

## Paint values

As propriedades `fill`, `border-paint`, `line-paint` e `text-paint` aceitam a mesma união:

```text
paint           := HEX_COLOR | linear-gradient
linear-gradient := "linear-gradient(" ANGLE "," stop "," stop ("," stop)* ")"
stop            := HEX_COLOR PERCENTAGE
```

- `HEX_COLOR`: `#RRGGBB` ou `#RRGGBBAA`.
- `ANGLE`: número finito seguido de `deg`, normalizado para o intervalo de 0 a menos de 360 graus.
- `PERCENTAGE`: valor entre `0%` e `100%`; as posições devem estar em ordem não decrescente.
- O espaço do gradiente é a caixa delimitadora do objeto: elemento para preenchimento/borda, caminho completo para relação e limites do texto para texto.
- Gradientes radiais, cônicos e em malha não pertencem à versão 1.0.
- `border-radius` é válido somente com `shape "rectangle"`; não existe forma `rounded-rectangle`.

## Position and typography

- `x` e `y` aceitam pixels lógicos finitos, devem aparecer juntos e são válidos somente em `element id`.
- Uma entidade com `x/y` é fixa; a ausência das duas propriedades delega posição ao layout automático.
- `text-align`: `left`, `center` ou `right`.
- `vertical-align`: `top`, `middle` ou `bottom`.
- `font-family`: lista separada por vírgula, encerrada por `serif`, `sans-serif` ou `monospace`.
- `font-weight`: `normal` ou `bold`.
- `font-style`: `normal` ou `italic`.
- `text-decoration`: `none` ou `underline`.
- As propriedades tipográficas são válidas para elemento e relação; em relação, aplicam-se ao rótulo.
- Viewport, zoom, seleção e estado de painéis não fazem parte da gramática.

## Shapes and transforms

- `shape`: `rectangle`, `ellipse`, `cylinder`, `user` ou `parallelogram`.
- `orientation`: `horizontal` ou `vertical`; define o eixo estrutural antes da rotação.
- `rotation`: número finito seguido de `deg`, normalizado para `[0, 360)` e aplicado ao redor do centro.
- `x/y` permanecem no canto superior esquerdo da caixa canônica não rotacionada.
- Layout, hit testing e conectores usam o contorno e a caixa delimitadora depois de orientação e rotação.
- Em shapes sem diferença estrutural visível entre orientações, o valor permanece no modelo resolvido e orienta conteúdo interno, sem alterar a caixa canônica.

## Cascade

Precedência por propriedade, da menor para a maior:

1. padrão do renderer;
2. externo `*`;
3. embutido `*`;
4. externo universal por categoria;
5. embutido universal por categoria;
6. externo por tipo;
7. embutido por tipo;
8. externo por ID;
9. embutido por ID.

Na mesma origem e especificidade, a última declaração vence e gera aviso. Propriedades diferentes são combinadas.

## Diagnostics contract

- Erros incluem URI/range e impedem apenas a fonte visual afetada de ser considerada completa.
- Referência externa ausente ou ilegível aponta para a string da referência no `.adl`.
- Propriedade não permitida para o alvo e valor fora do domínio são erros.
- Seletor válido sem correspondência é aviso.
- Nenhum diagnóstico visual altera o `DiagramModel`.
