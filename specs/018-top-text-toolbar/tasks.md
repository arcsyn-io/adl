# Tasks: Barra superior de edicao de texto

**Input**: Design documents from `/specs/018-top-text-toolbar/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Obrigatorios por `agent_docs/workflow.md`. Escrever e observar falha antes de implementar.

**Organization**: Tarefas agrupadas por user story para permitir entrega incremental e teste independente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo por alterar arquivos diferentes.
- **[Story]**: User story correspondente.
- Todos os comandos de desenvolvimento e validacao rodam no servico Docker `workspace`.

## Phase 1: Setup

**Purpose**: Preparar contratos, fixtures e pontos de integracao sem alterar comportamento.

- [ ] T001 Registrar o contrato da feature em `specs/018-top-text-toolbar/contracts/text-toolbar.md`
- [ ] T002 [P] Criar fixture de selecao com estilos comuns e mistos em `apps/web-editor/src/features/workspace/text-toolbar-fixtures.ts`
- [ ] T003 [P] Registrar lista inicial de fontes livres e licencas em `apps/web-editor/src/features/workspace/free-font-options.ts`
- [ ] T004 Atualizar exports de workspace em `apps/web-editor/src/features/workspace/index.ts`

---

## Phase 2: Foundational

**Purpose**: Derivar estado da barra e definir comandos sem UI final.

### Tests - write and observe failure first

- [ ] T005 [P] Escrever testes de `TextToolbarState` para sem selecao, elemento unico, multisselecao mista e relacao em `apps/web-editor/src/features/workspace/text-toolbar-state.test.ts`
- [ ] T006 [P] Escrever testes da lista de fontes livres, fallback generico e ausencia de entrada livre em `apps/web-editor/src/features/workspace/free-font-options.test.ts`
- [ ] T007 [P] Escrever testes de comando `visual.apply-text-style`, revisao obsoleta, patch vazio e fonte visual somente leitura em `apps/web-editor/src/features/visual-editor/commands.test.ts`
- [ ] T008 [P] Escrever testes de patch ADLS por ID preservando propriedades nao relacionadas em `apps/web-editor/src/features/stylesheet/text-style-patch.test.ts`

### Implementation

- [ ] T009 Implementar derivacao pura de `TextToolbarState` em `apps/web-editor/src/features/workspace/text-toolbar-state.ts`
- [ ] T010 Implementar catalogo fechado de fontes livres em `apps/web-editor/src/features/workspace/free-font-options.ts`
- [ ] T011 Implementar comando/handler de patch textual em `apps/web-editor/src/features/visual-editor/commands.ts`
- [ ] T012 Implementar ou adaptar patch textual ADLS em `apps/web-editor/src/features/stylesheet/stylesheet-pipeline.ts` ou `packages/adl-stylesheet/src/update.ts`
- [ ] T013 Integrar resultado do comando ao historico/transacao existente em `packages/adl-workspace/src/command.ts` e `packages/adl-workspace/src/transaction.ts`

**Checkpoint**: Estado, fontes e comandos passam em Vitest sem componente visual.

---

## Phase 3: User Story 1 - Alterar estilo de texto de um elemento selecionado (Priority: P1)

**Goal**: Exibir barra contextual para um elemento e aplicar fonte, tamanho, cor, alinhamento e enfases.

**Independent Test**: Selecionar um elemento, alterar todos os controles, desfazer/refazer e verificar canvas/ADLS.

### Tests - write and observe failure first

- [ ] T014 [P] [US1] Escrever testes de UI para renderizar controles e estados ativos em `apps/web-editor/src/features/workspace/TextToolbar.test.tsx`
- [ ] T015 [P] [US1] Escrever E2E de elemento unico alterando fonte, tamanho, cor, alinhamento, bold, italic e underline em `tests/e2e/text-toolbar.spec.ts`

### Implementation

- [ ] T016 [US1] Implementar `TextToolbar` com select de fonte, controle de tamanho, color input, alinhamento e toggles em `apps/web-editor/src/features/workspace/TextToolbar.tsx`
- [ ] T017 [US1] Conectar `TextToolbar` ao snapshot e dispatch do workspace em `apps/web-editor/src/features/workspace/WorkspaceChrome.tsx`
- [ ] T018 [US1] Aplicar feedback visual de ativo, misto, disabled, erro e loading em `apps/web-editor/src/styles.css`
- [ ] T019 [US1] Garantir que undo/redo atualize estado da barra em `apps/web-editor/src/features/workspace/WorkspaceChrome.tsx`

**Checkpoint**: US1 funciona de ponta a ponta para elemento unico.

---

## Phase 4: User Story 2 - Aplicar estilo a selecoes compativeis (Priority: P2)

**Goal**: Suportar multisselecao e rotulos de relacao com estados mistos.

**Independent Test**: Selecionar varios elementos e uma relacao, aplicar estilo compativel e confirmar uma transacao.

### Tests - write and observe failure first

- [ ] T020 [P] [US2] Escrever testes de aplicacao em multiplos targets e uma unica entrada de historico em `apps/web-editor/src/features/visual-editor/commands.test.ts`
- [ ] T021 [P] [US2] Escrever E2E de multisselecao com estado misto e aplicacao conjunta em `tests/e2e/text-toolbar.spec.ts`
- [ ] T022 [P] [US2] Escrever E2E de rotulo de relacao selecionado em `tests/e2e/text-toolbar.spec.ts`

### Implementation

- [ ] T023 [US2] Estender `text-toolbar-state.ts` para alvos multiplos e valores mistos
- [ ] T024 [US2] Aplicar patch textual a todos os targets compativeis em `apps/web-editor/src/features/visual-editor/commands.ts`
- [ ] T025 [US2] Representar estado misto nos controles de `TextToolbar.tsx`
- [ ] T026 [US2] Tratar controles indisponiveis por tipo de selecao com tooltip/label acessivel em `TextToolbar.tsx`

**Checkpoint**: US2 aplica estilo em lote e evita sobrescrita silenciosa.

---

## Phase 5: User Story 3 - Copiar e remover a selecao pela barra superior (Priority: P2)

**Goal**: Expor copiar e remover usando os mesmos comandos do canvas/menu contextual.

**Independent Test**: Copiar, colar quando aplicavel, remover e desfazer para elementos e relacoes.

### Tests - write and observe failure first

- [ ] T027 [P] [US3] Escrever testes de disponibilidade de copiar/remover por selecao em `apps/web-editor/src/features/workspace/text-toolbar-state.test.ts`
- [ ] T028 [P] [US3] Escrever E2E de copiar/remover pela barra e undo/redo em `tests/e2e/text-toolbar.spec.ts`
- [ ] T029 [P] [US3] Escrever E2E garantindo que atalhos nativos nao sao interceptados dentro de editores em `tests/e2e/text-toolbar.spec.ts`

### Implementation

- [ ] T030 [US3] Conectar botoes copiar/remover da barra aos comandos existentes em `TextToolbar.tsx`
- [ ] T031 [US3] Exibir efeitos de remocao de relacoes dependentes antes de confirmar quando aplicavel em `WorkspaceChrome.tsx`
- [ ] T032 [US3] Garantir isolamento de foco/atalhos em `apps/web-editor/src/features/workspace/WorkspaceChrome.tsx`

**Checkpoint**: Acoes destrutivas e copia usam comportamento unico do workspace.

---

## Phase 6: User Story 4 - Usar a barra com teclado e telas estreitas (Priority: P3)

**Goal**: Garantir acessibilidade e agrupamento responsivo dos controles.

**Independent Test**: Navegar por teclado, verificar aria states e usar controles agrupados em viewport estreita.

### Tests - write and observe failure first

- [ ] T033 [P] [US4] Escrever testes de nomes acessiveis, mixed state, disabled reason e foco em `apps/web-editor/src/features/workspace/TextToolbar.test.tsx`
- [ ] T034 [P] [US4] Escrever E2E responsivo para menu agrupado e touch targets em `tests/e2e/text-toolbar.spec.ts`

### Implementation

- [ ] T035 [US4] Adicionar labels, aria-pressed, aria-disabled, aria-valuetext e descricoes em `TextToolbar.tsx`
- [ ] T036 [US4] Implementar agrupamento responsivo/overflow em `TextToolbar.tsx` e `apps/web-editor/src/styles.css`
- [ ] T037 [US4] Ajustar ordem de foco e retorno de foco para menus em `WorkspaceChrome.tsx`

**Checkpoint**: Barra e usavel por teclado/leitor de tela e nao quebra em telas estreitas.

---

## Phase 7: Polish & Cross-Cutting

- [ ] T038 Revisar textos, tooltips e mensagens de erro em portugues em `TextToolbar.tsx`
- [ ] T039 Atualizar documentacao de convencoes se a feature introduzir novo padrao de toolbar em `agent_docs/conventions.md`
- [ ] T040 Executar quickstart focado e registrar achados em `specs/018-top-text-toolbar/quickstart.md`
- [ ] T041 Executar `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` e `pnpm test:e2e` no Docker

## Dependencies & Execution Order

- Phase 1 antes de todas.
- Phase 2 bloqueia as user stories.
- US1 e MVP.
- US2 e US3 podem avancar em paralelo apos US1 se nao editarem os mesmos arquivos ao mesmo tempo.
- US4 depende da UI de US1 e estados de US2/US3.
- Polish depende das stories incluidas.

## Notes

- Nao adicionar fontes remotas ou dependencias de rede.
- Nao gravar propriedades visuais no `.adl`.
- Nao duplicar logica de copiar/remover em React.
- Confirmar falha dos testes antes de cada implementacao correspondente.
