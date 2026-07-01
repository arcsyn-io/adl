# `@adl/language`

Contrato fundamental e independente de interface para documentos ADL. O pacote define o
vocabulário da versão `1.0`, tipos imutáveis e validação de dados externos. Parser, AST,
semântica, layout e renderização pertencem a features posteriores.

## Uso

```ts
import { validateDocument } from "@adl/language";

const result = validateDocument({
  version: "1.0",
  elements: [
    { id: "web-app", name: "Web application", type: "application" },
    { id: "api", name: "API", type: "service" },
  ],
  relations: [{ id: "calls", source: "web-app", target: "api" }],
});

if (!result.ok) console.error(result.errors);
```

`relations` e `groups` são opcionais e recebem `[]` como default. Os campos `version` e
`elements` são obrigatórios. Elementos exigem `id`, `name` e `type`; relações exigem `id`,
`source` e `target`; grupos exigem `id`, `name` e `elementIds`.

## Regras da linguagem

- Identificadores são case-sensitive, começam com letra ASCII e depois aceitam letras,
  dígitos, `_` e `-`.
- `adl`, `diagram`, `element`, `relation`, `group`, `properties` e `version` são reservadas.
- Nomes, descrições, tipos e propriedades são strings Unicode. Literais textuais futuros
  usam aspas duplas e escapes JSON (`\"`, `\\`, `\n`, `\r`, `\t`, `\uXXXX`) para manter
  uma interpretação única.
- Comentários textuais futuros começam com `//` ou `#` e terminam no fim da linha.
- IDs são únicos no documento. Origens, destinos e membros de grupos devem referenciar
  elementos existentes.
- Propriedades são mapas de string para string.
- Versões desconhecidas retornam `UNSUPPORTED_VERSION`; nenhuma versão é interpretada por
  fallback silencioso.
- Coordenadas, dimensões e posição manual (`x`, `y`, `width`, `height`, `position` e
  `coordinates`) são rejeitadas. Estado visual nunca pertence ao documento ADL.

`validateDocument` não lança por entrada inválida, não altera a entrada e retorna todos os
diagnósticos encontrados em ordem determinística.
