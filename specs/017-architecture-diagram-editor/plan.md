# Implementation Plan: Editor Web de Diagramas de Arquitetura

**Branch**: `feat/home-page-layout` | **Date**: 2026-07-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/017-architecture-diagram-editor/spec.md`

## Summary

Evoluir o editor web local-first para oferecer um workspace responsivo e funcional com três superfícies coordenadas: conversa de IA simulada, fontes ADL/ADLS e canvas visual. O plano preserva ADL como fonte semântica, ADLS como fonte de estilo e um estado visual separado para geometria manual, seleção, viewport e preferências. Todas as alterações entram em um histórico transacional compartilhado, são persistidas de forma versionada no navegador e alimentam exportações PNG/ADL/ADLS derivadas da mesma revisão.

O trabalho amplia os pacotes de domínio existentes em vez de criar pipelines paralelos. A aplicação React permanece como camada de composição; sincronização, comandos, histórico, layout, renderização, persistência, assistência e exportação continuam atrás de contratos testáveis e independentes da interface.

## Technical Context

**Language/Version**: TypeScript 6.0 com tipagem estrita; React 19.2 para composição da interface

**Primary Dependencies**: CodeMirror 6 para ADL/ADLS; ELK 0.11 através de `@adl/layout`; React Flow 12 atrás de adaptador do canvas; Zustand 5 apenas para estado compartilhado de interface; Zod 4 nas fronteiras persistidas; Tailwind CSS 4 e CSS variables para tokens/temas

**Storage**: Persistência local do navegador via adaptador de `@adl/persistence`; envelope JSON versionado, um documento ativo, escrita atômica e debounce

**Testing**: Vitest 4 para contratos, unidades e integração; Playwright 1.61 para jornadas E2E, acessibilidade, responsividade, downloads e interações de canvas

**Target Platform**: Navegadores evergreen desktop, tablet e mobile; execução local-first sem backend obrigatório

**Project Type**: Monorepo pnpm/Turbo com aplicação web e pacotes TypeScript de domínio

**Performance Goals**: Feedback visual inicial em até 100 ms para 95% das interações locais; ADLS refletido em até 300 ms; ADL refletido em até 1 s; restore em até 2 s; suporte de referência a 200 elementos e 400 conexões

**Constraints**: Viewport sem scroll da página; WCAG AA; um diagrama por vez; coordenadas manuais fora do ADL; histórico compartilhado sem entrada por pixel; PNG sem artefatos do editor; funcionamento básico offline; nenhuma regra de linguagem ou layout em componentes React

**Scale/Scope**: Uma tela principal; sete jornadas; três modos laterais; um documento correlacionado; até 100 transações de undo/redo em memória; 12 estados visuais explícitos; exportação em três formatos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

O arquivo `.specify/memory/constitution.md` ainda contém apenas o template e não define princípios ratificados. Os gates obrigatórios foram derivados de `AGENTS.md` e `agent_docs/`:

| Gate | Status pré-design | Evidência no plano |
|------|-------------------|--------------------|
| Preservar `ADL → parser → AST → semântica → compilação → layout → renderização` | PASS | A interface consome os pacotes existentes; não interpreta ADL no componente |
| Manter stylesheet em pipeline paralelo e fora do modelo semântico | PASS | ADLS é validado/resolvido por `@adl/stylesheet` e aplicado em layout/renderização |
| Manter coordenadas, seleção, viewport e preferências fora de `.adl` | PASS | `PlacementState`, `SelectionState`, `ViewportState` e preferências são modelos separados |
| Não colocar regras de domínio, layout ou persistência em React | PASS | Estado transacional e serviços ficam em pacotes puros; React apenas orquestra e apresenta |
| Não criar backend, banco ou serviço cloud sem decisão explícita | PASS | Persistência local e provedor de IA simulado; nenhum serviço novo |
| Manter integrações de bibliotecas atrás de adaptadores | PASS | React Flow, armazenamento do navegador e rasterização PNG ficam na aplicação/adaptadores |
| Seguir TDD e validar lint, typecheck, testes, build e E2E no Docker | PASS | Quickstart define ciclos red-green-refactor e gates globais no serviço `workspace` |

**Gate result**: PASS. Nenhuma violação requer justificativa.

### Post-design re-check

| Gate | Status pós-design | Design correspondente |
|------|-------------------|-----------------------|
| Pipeline de linguagem preservado | PASS | `WorkspaceTransaction` chama codecs e serializadores existentes; scene/layout são derivados |
| Estado visual fora do ADL | PASS | `WorkspaceSnapshot` correlaciona, mas não mistura, ADL, ADLS e `CanvasState` |
| Limites de domínio independentes da UI | PASS | Contratos em `contracts/workspace-state.md`; store UI mantém apenas referências/estado de apresentação |
| Sem infraestrutura externa | PASS | `LocalWorkspaceRepository` e `SimulatedAssistanceProvider` são fronteiras locais |
| Exportação consistente com renderer | PASS | `ExportScene` deriva do mesmo scene graph sem camada de controles |
| Testabilidade | PASS | Estados, transições e erros possuem resultados discriminados e cenários de quickstart |

## Project Structure

### Documentation (this feature)

```text
specs/017-architecture-diagram-editor/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── workspace-state.md
│   ├── persistence-export.md
│   └── assistance-ui.md
├── checklists/
│   └── requirements.md
└── tasks.md                 # criado somente por /speckit-tasks
```

### Source Code (repository root)

```text
apps/web-editor/src/
├── App.tsx
├── features/
│   ├── assistant/
│   │   ├── AssistantPanel.tsx
│   │   ├── simulated-provider.ts
│   │   └── use-assistance.ts
│   ├── canvas/
│   │   ├── DiagramCanvas.tsx
│   │   ├── CanvasToolbar.tsx
│   │   ├── ContextMenu.tsx
│   │   ├── AlignmentGuides.tsx
│   │   └── react-flow-adapter.ts
│   ├── code-editor/
│   │   ├── CodeEditor.tsx
│   │   ├── EditorTabs.tsx
│   │   └── source-binding.ts
│   ├── export/
│   │   ├── export-service.ts
│   │   ├── png-rasterizer.ts
│   │   └── ExportMenu.tsx
│   ├── persistence/
│   │   ├── browser-storage-adapter.ts
│   │   └── use-autosave.ts
│   ├── theme/
│   │   ├── ThemeProvider.tsx
│   │   └── theme-tokens.css
│   └── workspace/
│       ├── workspace-store.ts
│       ├── workspace-controller.ts
│       ├── WorkspaceChrome.tsx
│       ├── ResizablePanel.tsx
│       └── MobileDrawer.tsx
└── styles.css

packages/
├── adl-workspace/src/
│   ├── revision.ts
│   ├── synchronize.ts
│   ├── command.ts
│   ├── history.ts
│   └── transaction.ts
├── adl-canvas-state/src/
│   ├── placement.ts
│   ├── move.ts
│   ├── selection.ts
│   ├── viewport.ts
│   ├── snapping.ts
│   └── alignment.ts
├── adl-layout/src/
│   ├── layout.ts
│   └── routing.ts
├── adl-renderer/src/
│   ├── scene.ts
│   ├── render.ts
│   └── export-scene.ts
├── adl-persistence/src/
│   ├── model.ts
│   └── repository.ts
├── adl-io/src/
│   ├── transfer.ts
│   └── import-export.ts
└── adl-ai-contracts/src/
    ├── contracts.ts
    └── proposals.ts

tests/e2e/
├── workspace-layout.spec.ts
├── assistant-flow.spec.ts
├── code-canvas-sync.spec.ts
├── canvas-interactions.spec.ts
├── persistence-history.spec.ts
├── export.spec.ts
├── theme-responsive.spec.ts
└── accessibility.spec.ts
```

**Structure Decision**: Manter o monorepo atual e ampliar responsabilidades já identificadas. Regras reversíveis e sincronização ficam em `@adl/workspace`; geometria/interação matemática em `@adl/canvas-state`; roteamento em `@adl/layout`; scene graph e export scene em `@adl/renderer`; envelopes e restore em `@adl/persistence`; artefatos em `@adl/io`; validação de propostas em `@adl/ai-contracts`. A aplicação contém somente adaptadores de navegador e componentes de apresentação. Nenhum pacote novo é necessário nesta fase.

## Agent Context Update

A instalação atual do Spec Kit não contém o helper padrão `.specify/scripts/bash/update-agent-context.sh`, portanto nenhuma atualização automática de contexto foi executada. `AGENTS.md` e `agent_docs/architecture.md`, `agent_docs/conventions.md` e `agent_docs/workflow.md` permanecem como contexto autoritativo. A menor correção futura é restaurar o helper por uma atualização do próprio Spec Kit, sem criar um script específico para esta feature.

## Complexity Tracking

Nenhuma violação de gate foi identificada; esta seção permanece vazia.
