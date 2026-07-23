# Tasks: Assistente de geração de diagramas

**Input**: Design documents from `/specs/019-ai-diagram-assistant/`

**Tests**: Obrigatórios por `agent_docs/workflow.md`; observar falha antes da implementação.

## Phase 1: Setup

- [x] T001 Adicionar dependências internas do assistente em `apps/web-editor/package.json`
- [x] T002 Criar exports da feature em `apps/web-editor/src/features/assistant/index.ts`

## Phase 2: Foundational

- [x] T003 [P] Escrever testes do estado, preparação, validação e revisão obsoleta em `apps/web-editor/src/features/assistant/assistant-flow.test.ts`
- [x] T004 [P] Escrever testes de geração ADL válida e determinística em `apps/web-editor/src/features/assistant/local-provider.test.ts`
- [x] T005 Implementar estado e orquestração puros em `apps/web-editor/src/features/assistant/assistant-flow.ts`
- [x] T006 Implementar adaptador local sem rede em `apps/web-editor/src/features/assistant/local-provider.ts`

## Phase 3: User Story 1 - Gerar uma proposta de diagrama (P1)

**Goal**: Enviar descrição consentida e receber proposta válida sem alterar o documento.

**Independent Test**: A fonte atual permanece idêntica até a proposta ser confirmada.

- [x] T007 [P] [US1] Escrever testes de UI para prompt vazio, consentimento, loading e proposta em `apps/web-editor/src/features/workspace/AssistantConversation.test.tsx`
- [x] T008 [US1] Tornar `AssistantConversation` controlado e acessível em `apps/web-editor/src/features/workspace/WorkspaceChrome.tsx`
- [x] T009 [US1] Conectar geração local e revisão do documento em `apps/web-editor/src/App.tsx`

## Phase 4: User Story 2 - Revisar e aplicar a proposta (P1)

**Goal**: Comparar, aplicar ou descartar uma proposta com proteção contra revisão obsoleta.

**Independent Test**: Aplicar atualiza fonte/canvas; descartar e proposta obsoleta preservam o documento.

- [x] T010 [P] [US2] Estender testes de UI para comparação, aplicar, descartar e erro obsoleto em `apps/web-editor/src/features/workspace/AssistantConversation.test.tsx`
- [x] T011 [US2] Implementar comparação e ações de proposta em `apps/web-editor/src/features/workspace/WorkspaceChrome.tsx`
- [x] T012 [US2] Aplicar proposta pelo binding textual e incrementar revisão em `apps/web-editor/src/App.tsx`

## Phase 5: User Story 3 - Controlar conteúdo compartilhado (P2)

**Goal**: Exibir conteúdo divulgado e exigir consentimento específico.

**Independent Test**: Sem consentimento não há chamada ao adaptador; alterar prompt invalida consentimento anterior.

- [x] T013 [P] [US3] Cobrir conteúdo divulgado e consentimento específico em `apps/web-editor/src/features/assistant/assistant-flow.test.ts`
- [x] T014 [US3] Exibir contexto divulgado e invalidar consentimento ao editar em `apps/web-editor/src/features/workspace/WorkspaceChrome.tsx`

## Phase 6: Polish & Cross-Cutting

- [x] T015 [P] Escrever E2E da jornada principal e descarte em `tests/e2e/ai-diagram-assistant.spec.ts`
- [x] T016 Revisar responsividade, foco, anúncios e textos do painel em `apps/web-editor/src/features/workspace/WorkspaceChrome.tsx`
- [x] T017 Executar o quickstart e atualizar achados em `specs/019-ai-diagram-assistant/quickstart.md`
- [x] T018 Executar `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` e `pnpm test:e2e` no Docker

## Dependencies & Execution Order

- Phase 1 precede todas as demais.
- T003 e T004 devem falhar antes de T005 e T006.
- US1 depende da fundação.
- US2 depende de US1.
- US3 reutiliza a solicitação de US1 e pode ser validada depois do fluxo principal.
- E2E e validações globais dependem das três histórias.

## Parallel Opportunities

- T003 e T004 alteram arquivos de teste distintos.
- T007 e os testes puros concluídos podem evoluir independentemente.
- T013 e T015 cobrem camadas diferentes depois da implementação principal.

## Implementation Strategy

O MVP inclui US1 e US2 com adaptador local. US3 fecha o requisito de consentimento necessário para tornar o adaptador substituível no futuro.
