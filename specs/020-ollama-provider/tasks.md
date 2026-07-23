# Tasks: Provedor local Ollama

## Phase 1: Setup

- [x] T001 Registrar defaults e exports em `apps/web-editor/src/features/assistant/index.ts`

## Phase 2: Foundational

- [x] T002 [P] Escrever testes de status, timeout e validação HTTP em `apps/web-editor/src/features/assistant/ollama-client.test.ts`
- [x] T003 [P] Escrever testes de prompt, schema e proposta correlacionada em `apps/web-editor/src/features/assistant/ollama-provider.test.ts`
- [x] T004 Implementar cliente HTTP tipado em `apps/web-editor/src/features/assistant/ollama-client.ts`
- [x] T005 Implementar `ProviderAdapter` Ollama em `apps/web-editor/src/features/assistant/ollama-provider.ts`

## Phase 3: User Story 1 - Gerar com IA local

- [x] T006 [US1] Conectar provider Ollama e configuração no `apps/web-editor/src/App.tsx`
- [x] T007 [US1] Exibir provider/modelo e usar Ollama na geração em `apps/web-editor/src/features/workspace/WorkspaceChrome.tsx`

## Phase 4: User Story 2 - Disponibilidade e fallback

- [x] T008 [P] [US2] Estender teste de UI para seleção e diagnóstico em `apps/web-editor/src/features/workspace/AssistantConversation.test.tsx`
- [x] T009 [US2] Implementar status, seleção Ollama/demo e instruções em `apps/web-editor/src/features/workspace/WorkspaceChrome.tsx`
- [x] T010 [US2] Preservar fallback determinístico sem apresentá-lo como IA em `apps/web-editor/src/App.tsx`

## Phase 5: Polish

- [x] T011 [P] Atualizar E2E do modo indisponível e fallback em `tests/e2e/ai-diagram-assistant.spec.ts`
- [x] T012 Registrar configuração e validação em `specs/020-ollama-provider/quickstart.md`
- [x] T013 Executar lint, typecheck, test, build e E2E no Docker

## Dependencies

- T002 e T003 devem falhar antes de T004 e T005.
- US1 depende do cliente/provider.
- US2 depende de US1.
- Validação global depende de todas as histórias.
