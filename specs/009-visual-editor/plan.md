# Implementation Plan: Editor visual de diagramas

**Branch**: `codex/adl-plans-tasks` | **Date**: 2026-06-29 | **Spec**: [spec.md](./spec.md)

## Summary

Entregar a feature em `apps/web-editor/src/features/visual-editor`, com API pública `web visual editor`, respeitando as dependências do roadmap e mantendo regras de domínio fora de componentes React.

## Technical Context

**Language/Version**: TypeScript 6, módulos ES
**Primary Dependencies**: @adl/semantic, @adl/diagnostics, @adl/renderer; decisão: command bus reversível independente da UI
**Storage**: memória; persistência somente por feature dependente
**Testing**: Vitest para unidade/contrato; Playwright para interação visual
**Target Platform**: navegador moderno e Node nos testes
**Project Type**: monorepo pnpm, pacotes de domínio e app web
**Performance Goals**: limites SC definidos em spec.md
**Constraints**: local-first; sem backend/cloud; coordenadas fora do .adl; determinismo
**Scale/Scope**: feature 009, três histórias entregáveis

## Constitution Check

- [x] Linguagem, parser, AST, semântica, compilação, layout e renderer separados.
- [x] Regras de negócio fora de React.
- [x] Coordenadas manuais fora do texto .adl.
- [x] Nenhum serviço remoto.
- [x] Testes proporcionais ao risco.
- [x] Escopo limitado à spec.

## Project Structure

```text
specs/009-visual-editor/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/visual-editor-contract.md
└── tasks.md

apps/web-editor/src/features/visual-editor/
├── src/
│   ├── index.ts
│   ├── domain/
│   └── services/
└── test/
    ├── unit/
    └── contract/
```

**Structure Decision**: `web visual editor` expõe contrato mínimo. Integrações de UI são adaptadores finos e dependências apontam somente para camadas anteriores.

## Phase 0: Research

Research.md registra command bus reversível independente da UI, alternativas, determinismo, erros, acessibilidade aplicável e performance. Não restam NEEDS CLARIFICATION.

## Phase 1: Design & Contracts

- Modelar VisualCommand, Selection, EntityDraft, CommandResult em data-model.md.
- Definir `contracts/visual-editor-contract.md`.
- Validar cenários com quickstart.md.
- Limitar implementação futura a `apps/web-editor/src/features/visual-editor` e testes associados.

## Dependency and Delivery Strategy

**Requires**: @adl/semantic, @adl/diagnostics, @adl/renderer
**Provides**: web visual editor
**MVP**: User Story 1; histórias 2 e 3 incrementais.
**Parallel**: fixtures/modelos e testes de contrato após aprovação do contrato.

## Post-Design Constitution Check

- [x] Sem dependência circular.
- [x] Estado visual separado da linguagem.
- [x] Sem infraestrutura remota.
- [x] Caminhos detalhados em tasks.md.

