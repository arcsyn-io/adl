# Implementation Plan: Gramática, lexer, parser e AST

**Branch**: `codex/adl-plans-tasks` | **Date**: 2026-06-29 | **Spec**: [spec.md](./spec.md)

## Summary

Entregar a feature em `packages/adl-parser`, com API pública `@adl/parser`, respeitando as dependências do roadmap e mantendo regras de domínio fora de componentes React.

## Technical Context

**Language/Version**: TypeScript 6, módulos ES
**Primary Dependencies**: @adl/language; decisão: parser recursivo descendente guiado por EBNF
**Storage**: memória; persistência somente por feature dependente
**Testing**: Vitest para unidade/contrato; Playwright para interação visual
**Target Platform**: navegador moderno e Node nos testes
**Project Type**: monorepo pnpm, pacotes de domínio e app web
**Performance Goals**: limites SC definidos em spec.md
**Constraints**: local-first; sem backend/cloud; coordenadas fora do .adl; determinismo
**Scale/Scope**: feature 002, três histórias entregáveis

## Constitution Check

- [x] Linguagem, parser, AST, semântica, compilação, layout e renderer separados.
- [x] Regras de negócio fora de React.
- [x] Coordenadas manuais fora do texto .adl.
- [x] Nenhum serviço remoto.
- [x] Testes proporcionais ao risco.
- [x] Escopo limitado à spec.

## Project Structure

```text
specs/002-grammar-parser-ast/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/parser-contract.md
└── tasks.md

packages/adl-parser/
├── src/
│   ├── index.ts
│   ├── domain/
│   └── services/
└── test/
    ├── unit/
    └── contract/
```

**Structure Decision**: `@adl/parser` expõe contrato mínimo. Integrações de UI são adaptadores finos e dependências apontam somente para camadas anteriores.

## Phase 0: Research

Research.md registra parser recursivo descendente guiado por EBNF, alternativas, determinismo, erros, acessibilidade aplicável e performance. Não restam NEEDS CLARIFICATION.

## Phase 1: Design & Contracts

- Modelar Token, SyntaxNode, SourceRange, ParseError em data-model.md.
- Definir `contracts/parser-contract.md`.
- Validar cenários com quickstart.md.
- Limitar implementação futura a `packages/adl-parser` e testes associados.

## Dependency and Delivery Strategy

**Requires**: @adl/language
**Provides**: @adl/parser
**MVP**: User Story 1; histórias 2 e 3 incrementais.
**Parallel**: fixtures/modelos e testes de contrato após aprovação do contrato.

## Post-Design Constitution Check

- [x] Sem dependência circular.
- [x] Estado visual separado da linguagem.
- [x] Sem infraestrutura remota.
- [x] Caminhos detalhados em tasks.md.

