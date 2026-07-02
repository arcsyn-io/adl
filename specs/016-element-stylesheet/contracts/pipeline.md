# Contract: Stylesheet pipeline

## Inputs

```ts
interface StylesheetSourceInput {
  readonly adlUri: string
  readonly external?: { readonly reference: string; readonly text: string; readonly uri: string }
  readonly embedded?: { readonly text: string; readonly range: SourceRange }
}

interface ResolveStylesInput {
  readonly model: DiagramModel
  readonly sources: readonly StylesheetDocument[]
  readonly sourceDiagnostics: readonly StyleDiagnostic[]
  readonly defaults?: DiagramStyleDefaults
}
```

O carregamento externo ocorre antes deste contrato. Uma fronteira consumidora resolve a URI relativa, lê o texto e preserva falhas como diagnóstico associado à referência.

## Output

```ts
interface ResolvedDiagramStyles {
  readonly elements: Readonly<Record<string, ResolvedElementStyle>>
  readonly relations: Readonly<Record<string, ResolvedRelationStyle>>
  readonly diagnostics: readonly StyleDiagnostic[]
  readonly completeness: 'complete' | 'fallback'
}
```

Cada propriedade visual de pintura é entregue como `Paint` discriminada e normalizada (`solid` ou `linear-gradient`). Layout e renderer não analisam strings de cor/gradiente nem decidem precedência.

`ResolvedElementStyle` pode conter um par posicional fixo; o layout preserva esse par e calcula somente posições ausentes. `ResolvedElementStyle` e `ResolvedRelationStyle` entregam `TextStyle` completo ao renderer.

Movimento/redimensionamento retorna `VisualStylePatch` para atualizar a regra `element id` na fonte gravável. O contrato não inclui viewport, zoom, seleção ou outro estado de sessão.

## Layer responsibilities

- `@adl/parser`: reconhece referência e bloco embutido no envelope `.adl`, com ranges; não lê arquivos nem resolve estilo.
- `@adl/semantic`: fornece modelo, identidades e tipos; não importa `@adl/stylesheet`.
- `@adl/stylesheet`: analisa `.adls`/bloco, valida e resolve estilos contra `DiagramModel`.
- `@adl/layout`: recebe overrides de largura/altura já numéricos; não interpreta propriedades.
- `@adl/renderer`: recebe `ResolvedDiagramStyles`; não implementa cascata nem parsing.
- `apps/web-editor`: coordena fonte, carregamento local, diagnósticos, layout e cena; componentes não contêm regras de resolução.

## Compatibility

- Documento sem referência/bloco produz estilos padrão e comportamento visual atual.
- APIs existentes mantêm parâmetros visuais opcionais durante a migração.
- Serialização preserva referência e bloco embutido; serializar `DiagramModel` isolado continua sem estilos.
- Uma fonte inválida nunca altera o modelo semântico e nunca reutiliza silenciosamente estilo obsoleto de revisão anterior.
