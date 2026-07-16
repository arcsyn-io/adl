# Data Model: Barra superior de edicao de texto

## TextToolbarState

- `selectionRevision`: revisao do snapshot que originou o estado.
- `targets`: lista de `EditableTextTarget`.
- `fontFamily`: `ToolbarValue<FontFamilyValue>`.
- `fontSize`: `ToolbarValue<number>`.
- `textPaint`: `ToolbarValue<SolidColor>`.
- `textAlign`: `ToolbarValue<"left" | "center" | "right">`.
- `fontWeight`: `ToolbarValue<"normal" | "bold">`.
- `fontStyle`: `ToolbarValue<"normal" | "italic">`.
- `textDecoration`: `ToolbarValue<"none" | "underline">`.
- `actions`: disponibilidade de `copy` e `remove`.
- `disabledReason`: motivo geral quando nao ha alvo editavel.

`TextToolbarState` e derivado do snapshot do workspace. Ele nao e persistido e nao duplica AST, modelo semantico ou stylesheet resolvido.

## ToolbarValue<T>

- `{ kind: "empty" }`: nenhuma selecao aplicavel.
- `{ kind: "single"; value: T }`: todos os alvos compartilham o mesmo valor.
- `{ kind: "mixed" }`: alvos possuem valores diferentes.
- `{ kind: "unavailable"; reason: string }`: propriedade nao pode ser aplicada.

## EditableTextTarget

- `kind`: `element-text` ou `relation-label`.
- `entityId`: identidade semantica do elemento ou relacao.
- `styleSelector`: seletor por ID a ser atualizado.
- `currentTextStyle`: `TextStyle` resolvido.
- `canPersistStyle`: booleano indicando se a fonte visual pode ser escrita.
- `readOnlyReason`: mensagem quando `canPersistStyle` for falso.

## TextStylePatch

- `fontFamily`: lista ordenada opcional de familias.
- `fontSize`: tamanho opcional em px.
- `textPaint`: cor solida opcional normalizada.
- `textAlign`: alinhamento horizontal opcional.
- `fontWeight`: `normal` ou `bold`, opcional.
- `fontStyle`: `normal` ou `italic`, opcional.
- `textDecoration`: `none` ou `underline`, opcional.

O patch deve conter ao menos uma propriedade. Propriedades ausentes preservam o estilo resolvido ou declarado existente.

## FreeFontOption

- `id`: identificador estavel usado pela UI.
- `label`: nome mostrado ao usuario.
- `fontFamily`: lista CSS serializavel para ADLS.
- `genericFallback`: `sans-serif`, `serif` ou `monospace`.
- `licenseName`: nome da licenca livre confirmada.
- `source`: origem local/documental da confirmacao de licenca.

## SelectionActionAvailability

- `enabled`: booleano.
- `reason`: motivo quando indisponivel.
- `affectedTargets`: numero de entidades afetadas.
- `dependentEffects`: resumo de relacoes que serao removidas junto com elementos.

## Command relationships

```text
Workspace snapshot + selection
  -> derive TextToolbarState
  -> user chooses value/action
  -> TextStylePatch or SelectionAction command
  -> workspace transaction
  -> ADLS/style source update + scene recompute
  -> new snapshot updates toolbar
```

## Validation lifecycle

1. **Derive**: coletar alvos textuais compativeis a partir da selecao.
2. **Normalize**: converter UI value para `TextStylePatch` validado.
3. **Dispatch**: enviar comando com `baseRevision`.
4. **Apply**: atualizar regra por ID na fonte visual gravavel.
5. **Resolve**: recalcular estilos e scene.
6. **Report**: retornar sucesso, estado misto atualizado ou erro recuperavel.
