# Implementation Plan: Barra superior de edicao de texto

**Branch**: `018-top-text-toolbar` | **Date**: 2026-07-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/018-top-text-toolbar/spec.md`

## Summary

Adicionar uma barra superior contextual para aplicar patches de estilo textual a elementos e rotulos selecionados no canvas, alem de copiar e remover a selecao. A abordagem preserva o pipeline do projeto: React exibe controles e despacha comandos; `@adl/workspace` valida transacoes e historico; `@adl/stylesheet` representa e persiste estilo textual; canvas/renderers apenas consomem estilo resolvido.

## Technical Context

**Language/Version**: TypeScript 6.0 com tipagem estrita; React 19.2 para composicao da UI.

**Primary Dependencies**: `@adl/workspace` para comandos/historico, `@adl/stylesheet` para `TextStyle` e patches ADLS, `@adl/renderer` para scene resolvida, componentes React existentes em `apps/web-editor`.

**Storage**: Sem novo storage. Persistencia segue a fonte visual gravavel e autosave definidos nas specs 016/017.

**Testing**: Vitest para comandos/derivacao de toolbar e Playwright para interacao de barra, teclado, responsividade e undo/redo.

**Target Platform**: Navegadores evergreen no editor web local-first.

**Project Type**: Monorepo pnpm/Turbo com app web e pacotes TypeScript.

**Performance Goals**: Feedback visual em ate 100 ms para alteracoes por click/toggle; slider/stepper de tamanho coalescido sem criar historico por passo intermediario.

**Constraints**: Coordenadas e estilos fora do `.adl`; sem backend; sem carregamento remoto de fontes; controles acessiveis; nenhuma regra de negocio em React.

**Scale/Scope**: Barra contextual para selecao simples, multisselecao e rotulo de relacao; ate 10 alvos editados por uma unica transacao no criterio de sucesso.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

O arquivo `.specify/memory/constitution.md` ainda esta no template. Gates aplicaveis foram derivados de `AGENTS.md` e `agent_docs/`:

| Gate | Status pre-design | Evidencia no plano |
|------|-------------------|--------------------|
| Preservar separacao ADL/parser/AST/modelo/compilador/layout/renderers | PASS | A barra nao interpreta ADL; ela despacha comandos e consome snapshot |
| Manter estilo visual fora do modelo semantico | PASS | Patches atualizam ADLS/fonte visual, nao `DiagramModel` |
| Nao colocar regras de negocio em React | PASS | Componentes calculam apresentacao a partir de `TextToolbarState`; comandos ficam em workspace/stylesheet |
| Coordenadas e estado de UI fora do `.adl` | PASS | Nenhuma mudanca no texto ADL semantico |
| Sem backend, banco ou cloud | PASS | Fontes e estilos sao locais |
| Validacao por Docker workspace | PASS | Quickstart e tasks usam `docker compose exec workspace` |

**Gate result**: PASS. Nenhuma violacao exige justificativa.

### Post-design re-check

| Gate | Status pos-design | Design correspondente |
|------|-------------------|-----------------------|
| Pipeline preservado | PASS | `text-toolbar.md` limita comando a patch de estilo e acoes de selecao |
| Estilo fora do semantico | PASS | `TextStylePatch` serializa ADLS e preserva ADL |
| React sem dominio | PASS | `TextToolbarState` e resultado de comando sao contratos puros |
| Sem infraestrutura externa | PASS | Fontes livres sao opcoes locais/fallback CSS |
| Testabilidade | PASS | Quickstart define red-green para comandos e E2E |

## Project Structure

### Documentation (this feature)

```text
specs/018-top-text-toolbar/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- text-toolbar.md
|-- checklists/
|   `-- requirements.md
`-- tasks.md
```

### Source Code (repository root)

```text
apps/web-editor/src/features/workspace/
|-- WorkspaceChrome.tsx
|-- TextToolbar.tsx
|-- text-toolbar-state.ts
`-- text-toolbar-state.test.ts

apps/web-editor/src/features/visual-editor/
|-- commands.ts
`-- commands.test.ts

apps/web-editor/src/features/stylesheet/
|-- stylesheet-pipeline.ts
`-- text-style-patch.test.ts

packages/adl-workspace/src/
|-- command.ts
|-- transaction.ts
`-- history.ts

packages/adl-stylesheet/src/
|-- syntax.ts
|-- validate.ts
|-- resolve.ts
`-- update.ts

tests/e2e/
`-- text-toolbar.spec.ts
```

**Structure Decision**: Usar o app e pacotes existentes. O componente visual fica no workspace chrome porque a barra superior pertence ao shell. Estado derivado da selecao fica em helper testavel no app. Comandos e serializacao continuam nos pacotes/servicos existentes, evitando um segundo pipeline de estilo.

## Complexity Tracking

Nenhuma violacao de gate foi identificada.
