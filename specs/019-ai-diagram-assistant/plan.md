# Implementation Plan: Assistente de geração de diagramas

**Branch**: `019-ai-diagram-assistant` | **Date**: 2026-07-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/019-ai-diagram-assistant/spec.md`

## Summary

Transformar o painel estático do assistente em um fluxo controlado de solicitação, consentimento, geração local, validação, comparação e aplicação. A orquestração fica em módulos puros no app, reutiliza `@adl/ai-contracts` e `@adl/diagnostics`, e entrega a fonte confirmada ao mesmo binding usado pelo editor para preservar o pipeline.

## Technical Context

**Language/Version**: TypeScript 6.0, React 19.2

**Primary Dependencies**: `@adl/ai-contracts`, `@adl/diagnostics`, `@adl/parser`, `@adl/semantic`, componentes existentes do web editor

**Storage**: Estado efêmero no cliente; nenhuma nova persistência

**Testing**: Vitest para estado/orquestração e Playwright para o fluxo visual

**Target Platform**: Navegadores evergreen no editor web local-first

**Project Type**: Monorepo TypeScript com aplicação web e pacotes de domínio

**Performance Goals**: Validação e preview local percebidos em até 1 segundo; aplicação refletida no canvas dentro do orçamento atual do editor

**Constraints**: Sem backend, rede, credencial ou regra de negócio em React; propostas nunca aplicadas automaticamente; coordenadas fora do ADL

**Scale/Scope**: Uma solicitação ativa e uma proposta de fonte ADL completa por workspace

## Constitution Check

O arquivo `.specify/memory/constitution.md` permanece no template. Os gates aplicáveis vêm de `AGENTS.md` e `agent_docs/`.

| Gate | Status pre-design | Evidência |
|------|-------------------|----------|
| Preservar pipeline ADL | PASS | Proposta confirmada entra pelo binding textual existente |
| Regras fora de React | PASS | Estado, geração e validação ficam em módulos puros |
| Respostas externas não confiáveis | PASS | `@adl/ai-contracts` exige consentimento, validação e confirmação |
| Sem backend/cloud implícito | PASS | Adaptador local e determinístico |
| Coordenadas fora do ADL | PASS | Gerador local emite somente elementos, relações e grupos |
| TDD e validação Docker | PASS | Testes de unidade precedem implementação e E2E cobre interação |

### Post-design re-check

| Gate | Status pós-design | Design correspondente |
|------|-------------------|----------------------|
| Pipeline preservado | PASS | `assistant-contract.md` aplica somente fonte validada |
| Domínio independente de UI | PASS | Estado discriminado e funções puras em `features/assistant` |
| Editor funciona sem IA | PASS | Falha/ausência do adaptador não modifica fonte nem canvas |
| Segurança explícita | PASS | Conteúdo divulgado é exibido e consentido por solicitação |
| Sem infraestrutura externa | PASS | Nenhum endpoint, chave ou serviço novo |

## Project Structure

### Documentation (this feature)

```text
specs/019-ai-diagram-assistant/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- assistant-contract.md
|-- checklists/
|   `-- requirements.md
`-- tasks.md
```

### Source Code

```text
apps/web-editor/src/features/assistant/
|-- assistant-flow.ts
|-- assistant-flow.test.ts
|-- local-provider.ts
|-- local-provider.test.ts
`-- index.ts

apps/web-editor/src/features/workspace/
|-- WorkspaceChrome.tsx
`-- AssistantConversation.test.tsx

apps/web-editor/src/
`-- App.tsx

tests/e2e/
`-- ai-diagram-assistant.spec.ts
```

**Structure Decision**: Reutilizar `@adl/ai-contracts` como fronteira de confiança. O app contém apenas a orquestração específica da experiência e o adaptador local. A UI recebe estado e callbacks, sem interpretar ou validar ADL.

## Complexity Tracking

Nenhuma violação de gate foi identificada.
