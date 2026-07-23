# Implementation Plan: Provedor local Ollama

**Branch**: `020-ollama-provider` | **Date**: 2026-07-23 | **Spec**: [spec.md](./spec.md)

## Summary

Adicionar um `ProviderAdapter` HTTP para Ollama local, com resposta estruturada validada por Zod, detecção de modelos instalados e seleção explícita entre IA local e demonstração. O fluxo de proposta existente permanece responsável por consentimento, validação ADL, preview e confirmação.

## Technical Context

**Language/Version**: TypeScript 6.0 e React 19.2

**Primary Dependencies**: `@adl/ai-contracts`, Zod 4, Fetch API e API local Ollama

**Storage**: Estado efêmero no cliente

**Testing**: Vitest com `fetch` injetado e Playwright com Ollama indisponível

**Target Platform**: Navegadores evergreen em ambiente local

**Project Type**: Aplicação web local-first em monorepo

**Performance Goals**: Diagnóstico de disponibilidade em até 1 segundo; timeout de geração configurável com default de 120 segundos

**Constraints**: Sem backend, chave, cloud, instalação automática ou aplicação direta de resposta

**Scale/Scope**: Um endpoint, um modelo ativo e uma solicitação por vez

## Constitution Check

| Gate | Status | Evidência |
|------|--------|----------|
| Pipeline ADL preservado | PASS | Ollama retorna proposta, nunca modelo/layout |
| Respostas externas validadas | PASS | Envelope e conteúdo usam Zod, depois diagnósticos ADL |
| Regras fora de React | PASS | Cliente e adaptador ficam em módulos puros |
| Local-first | PASS | Endpoint loopback e nenhum cloud |
| Sem instalação implícita | PASS | UI apenas orienta comandos |
| TDD/Docker | PASS | Fetch injetado e validação no workspace |

## Project Structure

```text
apps/web-editor/src/features/assistant/
|-- ollama-client.ts
|-- ollama-client.test.ts
|-- ollama-provider.ts
|-- ollama-provider.test.ts
`-- index.ts

apps/web-editor/src/features/workspace/
|-- WorkspaceChrome.tsx
`-- AssistantConversation.test.tsx

apps/web-editor/src/App.tsx
tests/e2e/ai-diagram-assistant.spec.ts
```

**Structure Decision**: Manter protocolo e prompt no feature module; UI recebe configuração e providers prontos.

## Complexity Tracking

Nenhuma violação identificada.
