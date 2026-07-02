# Contract: ADL Stylesheet 1.0

## External file

```adl
stylesheet version "1.0" {
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
  }

  element id payments {
    shape "rectangle"
    border-radius "16px"
    fill "#FFF3CDFF"
  }

  relation type "async" {
    line-paint "linear-gradient(90deg, #6B46C1FF 0%, #D53F8CFF 100%)"
    line-width "3px"
    text-paint "#44337AFF"
    font-size "14px"
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
rule                := target selector-kind selector-value "{" declaration* "}"
target              := "element" | "relation"
selector-kind       := "type" | "id"
selector-value      := STRING | IDENTIFIER
declaration         := PROPERTY STRING
```

Seletores `type` usam string; seletores `id` usam identificador. Palavras de propriedade são reservadas somente dentro de regras de stylesheet.

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

## Cascade

Precedência por propriedade, da menor para a maior:

1. padrão do renderer;
2. externo por tipo;
3. embutido por tipo;
4. externo por ID;
5. embutido por ID.

Na mesma origem e especificidade, a última declaração vence e gera aviso. Propriedades diferentes são combinadas.

## Diagnostics contract

- Erros incluem URI/range e impedem apenas a fonte visual afetada de ser considerada completa.
- Referência externa ausente ou ilegível aponta para a string da referência no `.adl`.
- Propriedade não permitida para o alvo e valor fora do domínio são erros.
- Seletor válido sem correspondência é aviso.
- Nenhum diagnóstico visual altera o `DiagramModel`.
