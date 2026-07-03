# Data Model: Editor Web de Diagramas de Arquitetura

## Overview

O workspace é uma composição versionada de três fontes independentes e correlacionadas:

1. **ADL source** — definição semântica canônica.
2. **ADLS source** — definição visual canônica.
3. **Canvas state** — geometria manual, viewport, seleção e preferências que não pertencem ao ADL.

Modelo semântico, estilos resolvidos, layout, rotas e scene graph são projeções derivadas. Não são persistidos como fontes independentes.

## Entities

### WorkspaceDocument

Representa o único diagrama ativo.

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `id` | string | yes | Identificador estável local; valor fixo `current` nesta fase |
| `name` | string | yes | 1–120 caracteres após trim para exibição; vazio temporário permitido durante edição |
| `revision` | non-negative integer | yes | Incrementa uma vez por transação confirmada |
| `adl` | SourceDocument | yes | Fonte semântica atual e último snapshot válido |
| `adls` | SourceDocument | yes | Fonte visual atual e último snapshot válido |
| `canvas` | CanvasState | yes | Estado visual separado das fontes |
| `conversation` | ConversationState | yes | Histórico contextual da assistência |
| `preferences` | WorkspacePreferences | yes | Preferências preservadas inclusive após Novo |
| `updatedAt` | ISO timestamp | yes | Atualizado somente ao confirmar transação persistível |

### SourceDocument

Mantém texto em edição sem perder a última revisão válida.

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `text` | string | yes | Texto atual, inclusive quando inválido |
| `validText` | string | yes | Último texto validado e aplicado |
| `validRevision` | non-negative integer | yes | Revisão do workspace em que `validText` foi confirmado |
| `status` | `valid \| invalid \| validating` | yes | Estado discriminado |
| `diagnostics` | Diagnostic[] | yes | Vazio quando válido; ranges referem-se a `text` |

**Validation rules**:

- `validText` deve produzir o modelo/stylesheet usado pelo canvas.
- Texto inválido nunca substitui `validText`.
- Diagnósticos precisam de código, mensagem, severidade e intervalo determinístico.

### CanvasState

Agrupa estado visual não semântico.

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `placements` | map<EntityId, Placement> | yes | Apenas entidades existentes; órfãos removidos na reconciliação |
| `routes` | map<RelationId, OrthogonalRoute> | yes | Derivado/recalculável; pode ser persistido como cache compatível |
| `selection` | SelectionState | yes | Efêmero; não entra em ADL/ADLS |
| `viewport` | ViewportState | yes | Zoom finito dentro dos limites da UI |
| `interaction` | InteractionState | yes | Efêmero; nunca persistido ou adicionado ao histórico antes de commit |

### Placement

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `entityId` | EntityId | yes | Deve referenciar elemento ou grupo atual |
| `x`, `y` | finite number | yes | Coordenadas do documento; podem ser negativas |
| `width`, `height` | positive finite number | yes | Respeitam mínimos do tipo visual |
| `pinned` | boolean | yes | Pinned preserva posição em novo layout automático |

### SelectionState

União discriminada:

- `{ kind: "none" }`
- `{ kind: "elements"; ids: EntityId[]; anchorId: EntityId }`
- `{ kind: "relation"; id: RelationId }`

**Rules**:

- Relação e elementos não ficam selecionados simultaneamente.
- `ids` não contém duplicatas e somente referencia entidades existentes.
- Seleção é reconciliada após mudança semântica; identidades removidas deixam a seleção.

### ViewportState

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `x`, `y` | finite number | yes | Translação do documento |
| `zoom` | finite number | yes | Intervalo inicial planejado: 0.25 a 2.0 |

### InteractionState

União efêmera:

- `idle`
- `panning`
- `moving` com caixas iniciais e preview atual
- `resizing` com entidade, handle, caixa inicial e preview
- `connecting` com origem, ponto atual e destino candidato
- `editing-label` com identidade e texto temporário
- `marquee-selecting` com retângulo atual

Ao sair para `idle`, a interação confirma zero ou uma `WorkspaceTransaction`.

### OrthogonalRoute

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `relationId` | RelationId | yes | Uma rota por relação atual |
| `sourceSide` | `top \| right \| bottom \| left` | yes | Escolhido pelo roteador |
| `targetSide` | same | yes | Escolhido pelo roteador |
| `points` | Point[] | yes | Mínimo 2; segmentos alternam horizontal/vertical |
| `labelAnchor` | Point | yes | Próximo ao segmento principal e fora dos nós |

### CanvasPreferences

| Field | Type | Default | Rules |
|-------|------|---------|-------|
| `gridVisible` | boolean | true | Independente de snap |
| `snapEnabled` | boolean | true | Independente de grid |
| `guidesEnabled` | boolean | true | Independente de grid/snap |
| `gridSize` | positive number | 24 | Compartilhado por renderização e snap |

### PanelState

| Field | Type | Default | Rules |
|-------|------|---------|-------|
| `mode` | `assistant \| adl \| adls` | assistant | Exatamente um modo ativo |
| `collapsed` | boolean | false | Em mobile representa drawer fechado |
| `expandedWidth` | number | 30% da viewport | Clamp 280–520 px em desktop |
| `mobileOpen` | boolean | false | Efêmero; não substitui `collapsed` desktop |

### ThemePreference

| Field | Type | Default | Rules |
|-------|------|---------|-------|
| `preference` | `system \| light \| dark` | system | Persistido |
| `resolved` | `light \| dark` | derived | Não persistido; acompanha dispositivo em system |

### WorkspacePreferences

Composição persistível de `CanvasPreferences`, `PanelState` sem `mobileOpen` e `ThemePreference` sem `resolved`.

### ConversationState

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `messages` | ConversationMessage[] | yes | Ordem crescente de criação |
| `generation` | GenerationState | yes | No máximo uma geração ativa |

### ConversationMessage

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `id` | string | yes | Único no histórico |
| `role` | `user \| assistant \| system` | yes | System descreve aplicação/erro quando necessário |
| `content` | string | yes | Não vazio após trim |
| `createdAt` | ISO timestamp | yes | Ordem estável |
| `change` | AppliedChangeSummary | no | Presente em resposta que aplicou mudança |
| `error` | AssistanceError | no | Presente em resposta de falha |

### GenerationState

União discriminada:

- `{ status: "idle" }`
- `{ status: "generating"; requestId; baseRevision; startedAt }`
- `{ status: "failed"; requestId; code; message }`

Geração concluída com sucesso retorna a `idle` após inserir a resposta.

### WorkspaceCommand

União discriminada de intenções reversíveis:

- `semantic.add-element`
- `semantic.update-element`
- `semantic.remove-elements`
- `semantic.duplicate-elements`
- `semantic.add-relation`
- `semantic.update-relation`
- `semantic.reverse-relation`
- `semantic.remove-relation`
- `visual.move-elements`
- `visual.resize-entity`
- `visual.update-style`
- `source.replace-adl`
- `source.replace-adls`
- `assistant.apply-proposal`
- `workspace.rename`
- `workspace.reset`

Cada comando inclui `id`, `baseRevision`, `origin`, `timestamp`, payload validado e descrição acessível.

### WorkspaceTransaction

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `id` | string | yes | Único na sessão |
| `origin` | `canvas \| adl \| adls \| assistant \| workspace` | yes | Define feedback e agrupamento |
| `description` | string | yes | Texto curto para acessibilidade/depuração |
| `before` | WorkspaceSnapshot | yes | Estado confirmado anterior |
| `after` | WorkspaceSnapshot | yes | Estado confirmado posterior |
| `createdAt` | ISO timestamp | yes | Ordem estável |
| `groupKey` | string | no | Permite coalescer digitação contínua |

### WorkspaceSnapshot

Subset imutável necessário para restaurar a transação:

- `name`
- texto e último válido de ADL/ADLS
- placements
- entidades selecionadas quando ainda válidas
- conversation quando a transação vem da assistência

Viewport e preferências não entram no undo semântico; são persistidos separadamente.

### CommandHistory

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `past` | WorkspaceTransaction[] | yes | Máximo 100; mais antiga descartada ao exceder |
| `future` | WorkspaceTransaction[] | yes | Limpo ao confirmar novo comando após undo |
| `activeGesture` | GestureDraft | no | Efêmero; não conta como histórico |

### PersistedWorkspaceEnvelope

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `format` | `adl-workspace-v2` | yes | Discriminador de versão |
| `revision` | non-negative integer | yes | Igual ao documento confirmado |
| `document` | PersistedDocument | yes | Nome, ADL e ADLS atuais/últimos válidos |
| `visual` | VersionedVisualEnvelope | yes | Placements e viewport compatíveis com revisão |
| `conversation` | VersionedConversationEnvelope | yes | Mensagens e geração normalizada para idle |
| `preferences` | VersionedPreferencesEnvelope | yes | Tema/painel/canvas |
| `savedAt` | ISO timestamp | yes | Momento da confirmação da escrita |

**Restore policy**:

1. Envelope válido e revisões correlatas: restaura tudo.
2. Documento válido e visual incompatível: preserva fontes, recalcula visual e avisa.
3. Preferências válidas com documento inválido: preserva preferências e carrega exemplo inicial.
4. JSON corrompido: carrega exemplo inicial e fornece aviso recuperável.

### ExportRequest

União:

- `{ format: "png"; name; revision; scene; scale }`
- `{ format: "adl"; name; revision; source }`
- `{ format: "adls"; name; revision; source }`

### ExportArtifact

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `filename` | string | yes | Slug seguro + extensão; fallback `diagram` |
| `mediaType` | enum | yes | `image/png`, `text/x-adl`, `text/x-adls` |
| `content` | bytes or text | yes | Corresponde à revisão solicitada |
| `revision` | non-negative integer | yes | Impede download de resultado stale |

## Relationships

```text
WorkspaceDocument
├── ADL SourceDocument ──parse/compile──> DiagramModel
├── ADLS SourceDocument ──resolve────────> ResolvedDiagramStyles
├── CanvasState
│   ├── Placement map
│   ├── OrthogonalRoute map
│   ├── Selection
│   └── Viewport
├── ConversationState
└── WorkspacePreferences

DiagramModel + ResolvedDiagramStyles + Placement/Layout
└── DiagramScene
    ├── Interactive canvas adapter
    └── ExportScene ──> PNG

WorkspaceCommand ──execute──> WorkspaceTransaction
WorkspaceTransaction ────────> CommandHistory
WorkspaceDocument + Preferences ──> PersistedWorkspaceEnvelope
```

## State Transitions

### Application lifecycle

```text
booting → restoring → ready
                  ↘ recovery-warning → ready
                         ↘ fatal-unavailable (only unrecoverable runtime failure)
```

### Source edit

```text
valid → editing/validating → valid (commit transaction)
                         ↘ invalid (retain last valid canvas)
invalid → editing/validating → valid (commit from last confirmed source)
```

### Canvas gesture

```text
idle → preview gesture → cancel → idle (no transaction)
                       ↘ commit → validate → transaction → autosave pending
```

### Assistance

```text
idle → generating(baseRevision)
     → proposal received → validate revision/source → apply transaction → idle
     → stale/invalid/provider error → failed → retry or dismiss → idle
```

### History

```text
commit: transaction appended to past; future cleared
undo: past.last.before becomes current; transaction prepended to future
redo: future.first.after becomes current; transaction appended to past
```

### New diagram

```text
ready + clean → reset transaction
ready + dirty → confirmation → cancel | reset transaction
reset → empty document + preserved preferences → autosave
```
