# Data Model: Stylesheet visual da ADL

## ADL document style declaration

- `externalReference`: string opcional, única, preservada com range de origem.
- `embeddedStylesheet`: bloco opcional com regras e range de origem, localizado após `diagram`.
- Não participa de `DiagramModel`; acompanha o resultado sintático/compilação como entrada visual.

## StylesheetDocument

- `version`: `"1.0"` para arquivo externo; herdada do contrato quando embutido.
- `origin`: `external` ou `embedded`.
- `rules`: lista ordenada de `StyleRule`.
- `provenance`: URI lógica e range de origem.

## StyleRule

- `targetKind`: `element` ou `relation`.
- `selector`: `TypeSelector` ou `IdSelector`.
- `declarations`: lista ordenada de `StyleDeclaration`.
- `provenance`: range completo da regra.

Regras são imutáveis depois do parsing. Um seletor de tipo compara `type` por igualdade exata; um seletor de ID compara a identidade por igualdade exata.

## StyleDeclaration

- `property`: união discriminada de propriedades permitidas para o alvo.
- `rawValue`: texto original para diagnóstico/serialização.
- `value`: valor validado e normalizado.
- `provenance`: range da propriedade e do valor.

### ElementStyle

- `shape`: `rectangle | rounded-rectangle | ellipse`
- `width`, `height`: pixels, inteiro entre 24 e 4096
- `fillColor`, `borderColor`, `textColor`: cor normalizada `#RRGGBB` ou `#RRGGBBAA`
- `borderWidth`: pixels, inteiro entre 0 e 32
- `borderRadius`: pixels, inteiro entre 0 e 2048
- `fontSize`: pixels, inteiro entre 8 e 256

### RelationStyle

- `lineColor`, `textColor`: cor normalizada
- `lineWidth`: pixels, inteiro entre 0 e 32
- `fontSize`: pixels, inteiro entre 8 e 256

## ResolvedDiagramStyles

- `elements`: mapa imutável de ID para `ResolvedElementStyle` completo.
- `relations`: mapa imutável de ID para `ResolvedRelationStyle` completo.
- `diagnostics`: erros e avisos ordenados por origem/range.
- `completeness`: `complete` ou `fallback`, indicando se alguma fonte solicitada falhou.

Cada estilo resolvido contém todas as propriedades após aplicar padrões e cascata. Não contém seletores, strings cruas ou dependências de renderizador.

## StyleDiagnostic

- `severity`: `error` ou `warning`.
- `code`: código estável, incluindo sintaxe inválida, versão não suportada, propriedade/valor inválido, referência indisponível, seletor sem correspondência e sobrescrita.
- `message`: problema e correção esperada.
- `source`: URI lógica do `.adl` ou `.adls`.
- `range`: origem exata quando disponível.

## Relationships and flow

```text
ADL syntax declaration ─┐
external .adls text ─────┼─> StylesheetDocument(s)
embedded block ──────────┘          │
DiagramModel identities/types ──────┼─> resolver ─> ResolvedDiagramStyles
                                    ├─> dimensions ─> layout
                                    └─> appearance ─> renderer
```

## Validation lifecycle

1. **Parsed**: estrutura e ranges disponíveis, podendo conter erros sintáticos.
2. **Validated**: seletores, propriedades e valores normalizados; declarações inválidas excluídas com diagnóstico.
3. **Matched**: seletores comparados ao modelo; ausência gera aviso.
4. **Resolved**: propriedades combinadas pela precedência e preenchidas com padrões.
5. **Consumed**: layout usa dimensões; renderer usa estilo completo. Não há mutação após resolução.
