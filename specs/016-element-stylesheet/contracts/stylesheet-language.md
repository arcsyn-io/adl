# Contract: ADL Stylesheet 1.0

## External file

```adl
stylesheet version "1.0" {
  element type "service" {
    shape "ellipse"
    width "180px"
    height "96px"
    fill-color "#E8F0FFFF"
    border-color "#2457A6FF"
    border-width "2px"
    border-radius "0px"
    text-color "#102A43FF"
    font-size "16px"
  }

  element id payments {
    shape "rounded-rectangle"
    fill-color "#FFF3CDFF"
  }

  relation type "async" {
    line-color "#6B46C1FF"
    line-width "3px"
    text-color "#44337AFF"
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
    fill-color "#FFF3CDFF"
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
