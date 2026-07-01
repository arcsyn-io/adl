# `@adl/parser`

Lexer, parser recursivo descendente e AST sintática da ADL 1.0. O pacote é puro,
determinístico e não executa validação semântica ou resolução de referências.

## Gramática

```ebnf
document       = "adl", "version", string, "diagram", "{", declaration*, "}" ;
declaration    = element | relation | group ;
element        = "element", identifier, "{", elementField*, "}" ;
relation       = "relation", identifier, "{", relationField*, "}" ;
group          = "group", identifier, "{", groupField*, "}" ;
elementField   = ("name" | "type" | "description"), string | properties ;
relationField  = ("source" | "target"), identifier
               | ("name" | "type" | "description"), string | properties ;
groupField     = ("name" | "description"), string | "elements", identifierList
               | properties ;
properties     = "properties", "{", (identifier, string)*, "}" ;
identifierList = "[", [identifier, (",", identifier)*], "]" ;
identifier     = ASCII_LETTER, { ASCII_LETTER | DIGIT | "_" | "-" } ;
string         = JSON_STRING ;
```

Espaços são livres. Comentários começam com `#` ou `//` e terminam no fim da linha.
Strings usam aspas duplas e escapes JSON. Todo token, nó e erro contém range semiaberto
com offset UTF-16, linha e coluna (ambos iniciando em 1).

## Uso

```ts
import { lex, parse } from "@adl/parser";

const source = `adl version "1.0"
diagram { element api { name "API" type "service" } }`;

const tokens = lex(source); // inclui espaços, comentários e EOF
const result = parse(source);
if (!result.ok) console.error(result.errors);
else console.log(result.document.declarations);
```

Entradas inválidas nunca retornam sucesso parcial. A recuperação continua até limites de
campos e declarações para coletar erros posteriores, mas a AST parcial permanece interna.
