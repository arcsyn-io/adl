# `@adl/semantic`

Modelo semântico normalizado da ADL. O pacote transforma a AST de `@adl/parser` em
entidades independentes da forma textual, resolve referências e preserva proveniência.
Não contém regras de layout, renderização ou estado de interface.

## Uso

```ts
import { parse } from "@adl/parser";
import { buildSemanticModel } from "@adl/semantic";

const parsed = parse(`adl version "1.0" diagram {
  element api { name "API" type "service" }
}`);

if (parsed.ok) {
  const semantic = buildSemanticModel(parsed.document);
  if (semantic.ok) console.log(semantic.model.elements);
  else console.error(semantic.errors);
}
```

## Contrato

- Entidades e propriedades são ordenadas deterministicamente por identidade/chave.
- Campos opcionais têm defaults explícitos (`null`, `{}` ou `[]`).
- Relações e membros de grupos apontam para `SemanticIdentity`, nunca para nomes exibidos.
- Cada entidade mantém os ranges da declaração e do identificador, copiados da AST.
- O resultado público é congelado profundamente; a AST de entrada não é alterada.
- IDs duplicados são ambíguos e não satisfazem referências.
- Versões, campos ou referências inválidas retornam todos os erros determinísticos e nenhum
  modelo parcial.

`areSemanticallyEquivalent` compara o significado normalizado e ignora apenas a
proveniência, permitindo comparar documentos cuja ordem ou formatação textual difere.
