# Tasks: Editor Web de Diagramas de Arquitetura

**Input**: Design documents from `/specs/017-architecture-diagram-editor/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Obrigatórios por `agent_docs/workflow.md`. Cada fase começa com testes observáveis; confirme o estado red antes de implementar.

**Organization**: As tarefas são agrupadas por user story para permitir incrementos testáveis. Todos os comandos de instalação, teste, lint, typecheck, build e desenvolvimento devem executar no serviço Docker `workspace`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode ser executada em paralelo após as dependências explícitas da fase, pois altera arquivos diferentes.
- **[Story]**: User story correspondente da spec.
- Cada tarefa inclui arquivos concretos e resultado verificável.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar módulos, fixtures e utilitários de teste sem alterar ainda o comportamento do produto.

- [X] T001 Criar barrels dos módulos planejados em `apps/web-editor/src/features/workspace/index.ts`, `apps/web-editor/src/features/canvas/index.ts`, `apps/web-editor/src/features/assistant/index.ts`, `apps/web-editor/src/features/persistence/index.ts`, `apps/web-editor/src/features/export/index.ts` e `apps/web-editor/src/features/theme/index.ts`
- [ ] T002 [P] Criar fixture canônica do fluxo assíncrono de pagamentos com sete elementos e seis relações em `apps/web-editor/src/features/workspace/payment-example.ts`
- [ ] T003 [P] Criar helpers de workspace isolado, limpeza de storage e downloads para Playwright em `tests/e2e/fixtures/workspace.ts`
- [X] T004 [P] Criar fixture de escala com 200 elementos e 400 conexões em `apps/web-editor/src/features/performance-fixtures.ts`
- [ ] T005 Registrar o mapeamento de requisitos, cenários e arquivos de teste da feature em `specs/017-architecture-diagram-editor/quickstart.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implementar o workspace transacional, histórico, estado visual e persistência versionada usados por todas as jornadas.

**⚠️ CRITICAL**: Nenhuma user story deve iniciar antes da fundação passar nos testes focados.

### Tests — write and observe failure first

- [X] T006 [P] Escrever testes de contrato para comandos, stale revisions, no-op e resultados discriminados em `packages/adl-workspace/test/command.test.ts`
- [X] T007 [P] Escrever testes para commit, coalescência, limite de 100 transações, undo, redo e descarte da future branch em `packages/adl-workspace/test/history.test.ts`
- [ ] T008 [P] Escrever testes para seleção discriminada, reconciliação de identidades e limites de viewport em `packages/adl-canvas-state/test/interaction-state.test.ts`
- [ ] T009 [P] Escrever testes de envelope `adl-workspace-v2`, escrita correlacionada, restore e recuperação seletiva em `packages/adl-persistence/test/workspace-repository.test.ts`
- [ ] T010 [P] Escrever teste de integração do controller cobrindo ADL, ADLS, placement e scene na mesma revisão em `apps/web-editor/src/features/workspace/workspace-controller.test.ts`

### Implementation

- [X] T011 [P] Definir `WorkspaceCommand`, envelopes, origens e resultados discriminados em `packages/adl-workspace/src/command.ts` e exportar em `packages/adl-workspace/src/index.ts`
- [X] T012 Implementar `WorkspaceTransaction`, snapshots correlacionados e validação de revisão em `packages/adl-workspace/src/transaction.ts`
- [X] T013 Implementar histórico imutável, coalescência e undo/redo global em `packages/adl-workspace/src/history.ts`
- [ ] T014 Integrar comandos/transações ao estado de revisão e preservar `lastValid` em `packages/adl-workspace/src/revision.ts` e `packages/adl-workspace/src/synchronize.ts`
- [X] T015 [P] Implementar `SelectionState`, `ViewportState` e reconciliação visual em `packages/adl-canvas-state/src/selection.ts`, `packages/adl-canvas-state/src/viewport.ts` e `packages/adl-canvas-state/src/index.ts`
- [X] T016 [P] Definir e validar envelopes persistidos, warnings e save status v2 em `packages/adl-persistence/src/model.ts`
- [X] T017 Implementar save/restore/clear atômicos e recuperação compatível em `packages/adl-persistence/src/repository.ts` e `packages/adl-persistence/src/index.ts`
- [ ] T018 [P] Implementar adaptador de armazenamento do navegador sem regras de domínio em `apps/web-editor/src/features/persistence/browser-storage-adapter.ts`
- [ ] T019 Implementar controller puro que executa comandos e deriva snapshots em `apps/web-editor/src/features/workspace/workspace-controller.ts`
- [ ] T020 Implementar store compartilhado como fachada do controller, sem duplicar AST/modelo/scene, em `apps/web-editor/src/features/workspace/workspace-store.ts`

**Checkpoint**: Comandos, histórico, estado visual e persistência passam em Vitest; as superfícies podem consumir uma revisão única.

---

## Phase 3: User Story 1 — Criar e editar o diagrama visualmente (Priority: P1) 🎯 MVP

**Goal**: Entregar o diagrama inicial e um canvas funcional com seleção, movimento, resize, edição de texto, conexões, duplicação, exclusão, copiar/colar e undo/redo.

**Independent Test**: Abrir sem estado salvo, manipular o fluxo de pagamentos, criar/editar/inverter uma conexão e desfazer/refazer cada operação sem usar os editores textuais.

### Tests — write and observe failure first

- [ ] T021 [P] [US1] Escrever testes de comandos semânticos para adicionar, atualizar, duplicar e remover elementos/relações em `apps/web-editor/src/features/visual-editor/commands.test.ts`
- [ ] T022 [P] [US1] Escrever testes de roteamento ortogonal, escolha de lados, redução de cruzamentos e fallback em `packages/adl-layout/test/routing.test.ts`
- [ ] T023 [P] [US1] Escrever testes de scene para multi-seleção, relação selecionada, rotas e labels em `packages/adl-renderer/test/interactive-scene.test.ts`
- [ ] T024 [P] [US1] Escrever E2E do diagrama inicial, pan/zoom, seleção, movimento, resize e edição de texto em `tests/e2e/canvas-interactions.spec.ts`
- [ ] T025 [P] [US1] Escrever E2E de criação por qualquer lado, texto, direção, duplicação e exclusão de conexão em `tests/e2e/connection-editing.spec.ts`

### Implementation

- [ ] T026 [US1] Completar transformações semânticas serializáveis e geração determinística de ids em `apps/web-editor/src/features/visual-editor/commands.ts` e `apps/web-editor/src/features/visual-editor/model-adapter.ts`
- [ ] T027 [US1] Implementar roteamento ortogonal incremental e cálculo de label anchor em `packages/adl-layout/src/routing.ts` e exportar em `packages/adl-layout/src/index.ts`
- [ ] T028 [US1] Incluir rotas, seleção múltipla e estado de relações no scene graph em `packages/adl-renderer/src/scene.ts` e `packages/adl-renderer/src/render.ts`
- [ ] T029 [US1] Implementar mapeamento bidirecional isolado entre scene/geometry e nós/edges do canvas em `apps/web-editor/src/features/canvas/react-flow-adapter.ts`
- [ ] T030 [US1] Implementar canvas com pan, zoom, seleção simples/múltipla, drag, resize e handles de conexão em `apps/web-editor/src/features/canvas/DiagramCanvas.tsx`
- [ ] T031 [P] [US1] Implementar menu contextual tipado para canvas, elementos e relações em `apps/web-editor/src/features/canvas/ContextMenu.tsx`
- [ ] T032 [P] [US1] Implementar edição inline de labels por duplo clique com commit/cancelamento em `apps/web-editor/src/features/canvas/InlineLabelEditor.tsx`
- [ ] T033 [US1] Implementar atalhos de mover, copiar, colar, duplicar, excluir e seleção no canvas em `apps/web-editor/src/features/canvas/use-canvas-shortcuts.ts`
- [ ] T034 [US1] Implementar ações contextuais de elemento/relação na barra superior em `apps/web-editor/src/features/workspace/SelectionToolbar.tsx`
- [ ] T035 [US1] Conectar fixture inicial, controller, canvas e toolbar no shell em `apps/web-editor/src/App.tsx` e `apps/web-editor/src/features/workspace/WorkspaceChrome.tsx`

**Checkpoint**: US1 é um MVP visual completo e testável sem IA, persistência de sessão ou exportação.

---

## Phase 4: User Story 2 — Editar ADL e ADLS junto ao canvas (Priority: P1)

**Goal**: Oferecer editores completos com última revisão válida, diagnósticos e sincronização bidirecional sem gravar coordenadas no ADL.

**Independent Test**: Alternar ADL/ADLS, aplicar fontes válidas e inválidas, editar semanticamente no canvas e confirmar a separação entre ADL, ADLS e placement.

### Tests — write and observe failure first

- [ ] T036 [P] [US2] Escrever testes de transações para draft inválido, último ADL válido, coalescência e canvas-to-ADL em `packages/adl-workspace/test/source-transaction.test.ts`
- [ ] T037 [P] [US2] Escrever testes de ADLS válido/inválido, último estilo válido e geometry patch em `apps/web-editor/src/features/stylesheet/stylesheet-controller.test.ts`
- [ ] T038 [P] [US2] Escrever E2E de linhas, syntax highlight, linha ativa, diagnósticos e atalhos nos dois editores em `tests/e2e/source-editors.spec.ts`
- [ ] T039 [P] [US2] Escrever E2E de sincronização ADL↔canvas e ADLS↔canvas, incluindo ausência de coordenadas no ADL, em `tests/e2e/code-canvas-sync.spec.ts`

### Implementation

- [ ] T040 [P] [US2] Completar extensões de linguagem, linhas, indentação, linha ativa, atalhos e diagnósticos do CodeMirror em `apps/web-editor/src/features/code-editor/CodeEditor.tsx`
- [ ] T041 [US2] Implementar binding ADL transacional com debounce, revisão base e último válido em `apps/web-editor/src/features/code-editor/source-binding.ts`
- [ ] T042 [P] [US2] Implementar controller ADLS transacional e retenção do último stylesheet válido em `apps/web-editor/src/features/stylesheet/stylesheet-controller.ts`
- [ ] T043 [US2] Serializar comandos semânticos do canvas para ADL por `WorkspaceCodec` em `apps/web-editor/src/features/workspace/adl-workspace-codec.ts`
- [ ] T044 [US2] Atualizar geometry/style patches do canvas no ADLS sem inserir coordenadas no ADL em `packages/adl-stylesheet/src/update.ts` e `apps/web-editor/src/features/stylesheet/stylesheet-controller.ts`
- [ ] T045 [US2] Adaptar tabs IA/ADL/ADLS para fontes controladas e preservar draft/seleção ao alternar em `apps/web-editor/src/features/code-editor/EditorTabs.tsx`
- [ ] T046 [US2] Expor status válido/inválido, diagnostics e revisão nas regiões acessíveis em `apps/web-editor/src/features/code-editor/SourceDiagnostics.tsx`
- [ ] T047 [US2] Integrar editores e canvas à mesma revisão do workspace em `apps/web-editor/src/App.tsx`

**Checkpoint**: ADL e ADLS permanecem sincronizados com o canvas; fontes inválidas não substituem a última cena válida.

---

## Phase 5: User Story 3 — Alterar o diagrama por conversa com IA (Priority: P1)

**Goal**: Entregar chat contextual simulado que aplica propostas validadas ao documento e participa do histórico global.

**Independent Test**: Enviar o comando de cache, observar geração/aplicação, desfazer/refazer, provocar erro e stale revision sem alteração parcial.

### Tests — write and observe failure first

- [ ] T048 [P] [US3] Escrever testes do provider simulado para cache, intents suportados, unsupported e falha em `apps/web-editor/src/features/assistant/simulated-provider.test.ts`
- [ ] T049 [P] [US3] Escrever testes de request/proposal para validação, stale revision e aplicação atômica em `packages/adl-ai-contracts/test/workspace-proposal.test.ts`
- [ ] T050 [P] [US3] Escrever E2E de envio por botão/atalho, geração, erro, retry, aplicação e undo/redo em `tests/e2e/assistant-flow.spec.ts`

### Implementation

- [ ] T051 [P] [US3] Implementar provider local determinístico sem rede em `apps/web-editor/src/features/assistant/simulated-provider.ts`
- [ ] T052 [US3] Estender contratos de proposta com erros estáveis e validação contra revisão em `packages/adl-ai-contracts/src/contracts.ts` e `packages/adl-ai-contracts/src/proposals.ts`
- [ ] T053 [US3] Implementar controller/hook de assistência com máquina idle/generating/applying/failed em `apps/web-editor/src/features/assistant/use-assistance.ts`
- [ ] T054 [US3] Aplicar proposta e resumo de conversa em uma única transação em `apps/web-editor/src/features/workspace/workspace-controller.ts`
- [ ] T055 [P] [US3] Implementar histórico de mensagens e indicadores acessíveis em `apps/web-editor/src/features/assistant/ConversationHistory.tsx`
- [ ] T056 [P] [US3] Implementar composer fixo, `Ctrl/Cmd+Enter`, bloqueio de duplicidade e retry em `apps/web-editor/src/features/assistant/AssistantComposer.tsx`
- [ ] T057 [US3] Montar estados completo/gerando/erro no painel IA em `apps/web-editor/src/features/assistant/AssistantPanel.tsx` e `apps/web-editor/src/features/code-editor/EditorTabs.tsx`

**Checkpoint**: A IA simulada altera o mesmo documento do canvas/ADL, com validação, histórico e erros recuperáveis.

---

## Phase 6: User Story 4 — Retomar trabalho e desfazer mudanças (Priority: P2)

**Goal**: Autosave/restauração correlacionados e undo/redo compartilhado entre canvas, ADL, ADLS e IA.

**Independent Test**: Misturar operações nas quatro superfícies, desfazer/refazer em ordem, recarregar e recuperar estado completo; testar dados corrompidos e storage indisponível.

### Tests — write and observe failure first

- [ ] T058 [P] [US4] Escrever testes de debounce, supersessão de save antigo, retry e status por revisão em `apps/web-editor/src/features/persistence/autosave-controller.test.ts`
- [ ] T059 [P] [US4] Escrever testes de restore v1→v2, visual incompatível, JSON corrompido e storage indisponível em `packages/adl-persistence/test/recovery.test.ts`
- [ ] T060 [P] [US4] Escrever E2E de autosave/restore de fontes, geometria, conversa e preferências em `tests/e2e/persistence-history.spec.ts`
- [ ] T061 [P] [US4] Escrever E2E de 50 operações, coalescência de gestos, undo/redo e branch futura em `tests/e2e/shared-history.spec.ts`

### Implementation

- [ ] T062 [US4] Implementar autosave de 500 ms, cancelamento/supersessão e retry em `apps/web-editor/src/features/persistence/use-autosave.ts`
- [ ] T063 [US4] Implementar migração e recuperação seletiva do envelope persistido em `packages/adl-persistence/src/repository.ts`
- [ ] T064 [US4] Restaurar fontes, placements, conversa e preferências antes de liberar ações destrutivas em `apps/web-editor/src/features/workspace/workspace-controller.ts`
- [ ] T065 [US4] Integrar undo/redo global e labels acessíveis ao controller/store em `apps/web-editor/src/features/workspace/workspace-store.ts`
- [ ] T066 [US4] Implementar atalhos globais sem capturar undo/redo nativo dos editores em `apps/web-editor/src/features/workspace/use-workspace-shortcuts.ts`
- [ ] T067 [P] [US4] Implementar estados loading, save pending/saved/failed e recovery warning em `apps/web-editor/src/features/persistence/PersistenceStatus.tsx`
- [ ] T068 [US4] Inicializar restore/autosave e feedback no shell em `apps/web-editor/src/App.tsx`

**Checkpoint**: O estado final sobrevive ao reload e todas as operações persistíveis compartilham uma ordem reversível consistente.

---

## Phase 7: User Story 5 — Criar um novo diagrama e exportar (Priority: P2)

**Goal**: Exportar PNG/ADL/ADLS fiéis e criar novo diagrama vazio com confirmação e preservação de preferências.

**Independent Test**: Exportar conteúdo fora da viewport sem artefatos do editor, validar nomes/arquivos e executar Novo com cancelar/confirmar.

### Tests — write and observe failure first

- [ ] T069 [P] [US5] Escrever testes de nomes, MIME, ADL, ADLS, PNG bytes e erros estáveis em `packages/adl-io/test/export-artifacts.test.ts`
- [ ] T070 [P] [US5] Escrever testes de export scene, bounds, labels, rotas e exclusão de editor layers em `packages/adl-renderer/test/export-scene.test.ts`
- [ ] T071 [P] [US5] Escrever testes do rasterizer para escala, área máxima e falha de canvas em `apps/web-editor/src/features/export/png-rasterizer.test.ts`
- [ ] T072 [P] [US5] Escrever E2E de downloads PNG/ADL/ADLS e conteúdo fora da viewport em `tests/e2e/export.spec.ts`
- [ ] T073 [P] [US5] Escrever E2E do dialog Novo para clean/dirty/cancel/confirm e preferências preservadas em `tests/e2e/new-diagram.spec.ts`

### Implementation

- [ ] T074 [US5] Estender contratos e geradores de artefatos PNG/ADL/ADLS em `packages/adl-io/src/transfer.ts` e `packages/adl-io/src/import-export.ts`
- [ ] T075 [US5] Implementar export scene e bounds independentes da viewport/seleção em `packages/adl-renderer/src/export-scene.ts` e `packages/adl-renderer/src/index.ts`
- [ ] T076 [US5] Implementar serialização SVG isolada da export scene em `apps/web-editor/src/features/export/export-svg.ts`
- [ ] T077 [US5] Implementar rasterização PNG 2x com limite de área e erros tipados em `apps/web-editor/src/features/export/png-rasterizer.ts`
- [ ] T078 [US5] Implementar serviço/download adapter por revisão e normalização de nomes em `apps/web-editor/src/features/export/export-service.ts`
- [ ] T079 [P] [US5] Implementar menu de exportação com estados disabled/loading/error em `apps/web-editor/src/features/export/ExportMenu.tsx`
- [ ] T080 [US5] Implementar confirmação e transação de reset preservando preferências em `apps/web-editor/src/features/workspace/NewDiagramDialog.tsx` e `apps/web-editor/src/features/workspace/workspace-controller.ts`

**Checkpoint**: As três exportações refletem a revisão atual; Novo limpa apenas estado de documento e histórico após confirmação.

---

## Phase 8: User Story 6 — Personalizar o workspace (Priority: P2)

**Goal**: Painel desktop redimensionável/recolhível, temas completos e controles independentes de grade, snap e guias.

**Independent Test**: Ajustar painel, tema e preferências do canvas, recarregar e confirmar comportamento/estado restaurado.

### Tests — write and observe failure first

- [ ] T081 [P] [US6] Escrever testes de snap com grid invisível, tolerância e múltiplos elementos em `packages/adl-canvas-state/test/snapping.test.ts`
- [ ] T082 [P] [US6] Escrever testes de guias por centros/extremidades e espaçamento uniforme em `packages/adl-canvas-state/test/alignment.test.ts`
- [ ] T083 [P] [US6] Escrever testes de preferências, clamp 280–520 e resolução de tema sistema em `apps/web-editor/src/features/workspace/workspace-preferences.test.ts`
- [ ] T084 [P] [US6] Escrever E2E de painel, temas, grade, snap, guias e restore das preferências em `tests/e2e/workspace-preferences.spec.ts`

### Implementation

- [ ] T085 [P] [US6] Implementar cálculo puro de snap e grid em `packages/adl-canvas-state/src/snapping.ts` e exportar em `packages/adl-canvas-state/src/index.ts`
- [ ] T086 [P] [US6] Implementar cálculo puro de guias, distância e espaçamento em `packages/adl-canvas-state/src/alignment.ts` e exportar em `packages/adl-canvas-state/src/index.ts`
- [ ] T087 [US6] Renderizar grade e alignment guides como overlays independentes do export scene em `apps/web-editor/src/features/canvas/AlignmentGuides.tsx` e `apps/web-editor/src/features/canvas/DiagramCanvas.tsx`
- [ ] T088 [P] [US6] Implementar tokens semânticos e variantes claro/escuro em `apps/web-editor/src/features/theme/theme-tokens.css`
- [ ] T089 [US6] Implementar preferência system/light/dark e listener da preferência do dispositivo em `apps/web-editor/src/features/theme/ThemeProvider.tsx`
- [ ] T090 [US6] Implementar divisor pointer/teclado, clamp, collapse e restore da largura em `apps/web-editor/src/features/workspace/ResizablePanel.tsx`
- [ ] T091 [US6] Implementar barra flutuante com seleção, zoom, fit, center, grid, snap e guias em `apps/web-editor/src/features/canvas/CanvasToolbar.tsx`
- [ ] T092 [US6] Integrar tema, painel e preferências persistidas no shell/top bar em `apps/web-editor/src/features/workspace/WorkspaceChrome.tsx` e `apps/web-editor/src/App.tsx`

**Checkpoint**: Preferências atuam independentemente, respeitam limites e são restauradas sem alterar o documento.

---

## Phase 9: User Story 7 — Usar em telas menores e com tecnologias assistivas (Priority: P3)

**Goal**: Drawer móvel, top bar adaptada, gestos touch e operação completa por teclado/leitor de tela com contraste AA.

**Independent Test**: Executar jornadas essenciais em viewport móvel/touch e percorrer a interface por teclado/árvore acessível nos dois temas.

### Tests — write and observe failure first

- [ ] T093 [P] [US7] Escrever E2E de drawer IA/ADL/ADLS, preservação do viewport, Escape e rotação em `tests/e2e/responsive-drawer.spec.ts`
- [ ] T094 [P] [US7] Escrever E2E touch para pan, pinch-to-zoom e alvos de 44 px em `tests/e2e/touch-canvas.spec.ts`
- [ ] T095 [P] [US7] Escrever E2E de foco, tabs, menus, dialog, live regions e estados não dependentes de cor em `tests/e2e/accessibility.spec.ts`
- [ ] T096 [P] [US7] Criar auditoria automatizada de contraste dos tokens claro/escuro em `apps/web-editor/src/features/theme/theme-contrast.test.ts`

### Implementation

- [ ] T097 [US7] Implementar drawer sobreposto com focus trap, backdrop e retorno de foco em `apps/web-editor/src/features/workspace/MobileDrawer.tsx`
- [ ] T098 [US7] Adaptar top bar para ações essenciais e menu overflow em `apps/web-editor/src/features/workspace/ResponsiveTopBar.tsx`
- [ ] T099 [US7] Configurar pan/pinch e conflitos de gesto no adaptador do canvas em `apps/web-editor/src/features/canvas/react-flow-adapter.ts`
- [ ] T100 [US7] Implementar roving tabindex e navegação por teclado entre entidades em `apps/web-editor/src/features/canvas/use-canvas-a11y.ts`
- [ ] T101 [US7] Preservar aria labels/estados do scene graph em nós, relações, menus e handles em `apps/web-editor/src/features/canvas/DiagramCanvas.tsx`
- [ ] T102 [P] [US7] Implementar live regions para assistência, save, undo/redo e exportação em `apps/web-editor/src/features/workspace/WorkspaceAnnouncements.tsx`
- [ ] T103 [US7] Aplicar breakpoints, touch targets, foco e contraste responsivo em `apps/web-editor/src/styles.css`, `apps/web-editor/src/source-tabs.css` e `apps/web-editor/src/features/theme/theme-tokens.css`

**Checkpoint**: Canvas permanece dominante em mobile; drawer e ações essenciais são acessíveis por toque, teclado e leitor de tela.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Validar escala, coesão arquitetural, documentação e qualidade global após as stories desejadas.

- [ ] T104 [P] Escrever teste de performance do controller/histórico com 200 elementos, 400 conexões e 50 operações em `apps/web-editor/src/features/performance.test.ts`
- [ ] T105 [P] Escrever E2E de performance para restore, interação e exportação da fixture de escala em `tests/e2e/performance.spec.ts`
- [ ] T106 Revisar carregamento e aplicar code splitting aos editores/canvas sem alterar contratos em `apps/web-editor/src/App.tsx` e `apps/web-editor/vite.config.ts`
- [ ] T107 Revisar mensagens, tooltips e fallbacks em português em `apps/web-editor/src/features/workspace/WorkspaceChrome.tsx`, `apps/web-editor/src/features/assistant/AssistantPanel.tsx` e `apps/web-editor/src/features/export/ExportMenu.tsx`
- [ ] T108 Atualizar documentação de arquitetura para histórico transacional, adapters e export scene em `agent_docs/architecture.md`
- [ ] T109 Atualizar documentação de convenções/testes para controller, store e E2E touch/download em `agent_docs/conventions.md` e `agent_docs/workflow.md`
- [ ] T110 Executar os 12 cenários manuais e registrar resultados/riscos em `specs/017-architecture-diagram-editor/quickstart.md`
- [ ] T111 Executar `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` e `pnpm test:e2e` no Docker e registrar o resultado final em `specs/017-architecture-diagram-editor/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 — Setup**: Sem dependências; T002–T004 podem avançar em paralelo após T001 quando precisarem dos barrels.
- **Phase 2 — Foundation**: Depende de Setup e bloqueia todas as user stories. Testes T006–T010 devem falhar antes de T011–T020.
- **Phase 3 — US1**: Depende da Foundation. Entrega o MVP visual.
- **Phase 4 — US2**: Depende da Foundation; pode iniciar em paralelo à US1, mas T047 usa a integração de canvas concluída em T035.
- **Phase 5 — US3**: Depende da Foundation e do codec ADL T043 para aplicar propostas ao documento; UI final T057 integra com tabs T045.
- **Phase 6 — US4**: Depende da Foundation; E2E completo pressupõe as superfícies US1–US3, mas autosave/recovery podem avançar antes.
- **Phase 7 — US5**: Exportação visual depende do scene/rotas da US1; Novo depende somente da Foundation.
- **Phase 8 — US6**: Cálculos puros podem iniciar após Foundation; integração da toolbar/painel depende do canvas US1.
- **Phase 9 — US7**: Depende das UIs de US1, US2, US3 e US6 para validar responsive/a11y de ponta a ponta.
- **Phase 10 — Polish**: Depende de todas as stories incluídas na entrega.

### User Story Dependency Graph

```text
Setup → Foundation → US1 ─────────────┬→ US5 ─┐
                    ├→ US2 → US3 ─────┤      │
                    ├→ US4            ├→ US7 ├→ Polish
                    └→ US6 ───────────┘      │
                         US1 + US6 ───────────┘
```

### Story Independence

- **US1**: Testável apenas com fixture e controller; não exige IA, persistência ou exportação.
- **US2**: Testável com editores + scene derivada; não exige IA ou persistência.
- **US3**: Testável com provider em memória + controller; não exige storage ou exportação.
- **US4**: Testável com storage isolado + comandos sintéticos; E2E final cobre superfícies reais.
- **US5**: Export services testáveis com export scene/artefatos; dialog Novo testável com controller.
- **US6**: Preferências e cálculos são testáveis sem mobile; integração usa canvas existente.
- **US7**: Testável com viewport/touch/árvore acessível após as superfícies que adapta estarem prontas.

### Within Each User Story

1. Escrever testes e confirmar falha pela razão correta.
2. Implementar contratos/modelos puros.
3. Implementar serviços/controllers/adapters.
4. Implementar componentes e integrar.
5. Rodar testes focados da fase e o conjunto de regressão afetado.
6. Parar no checkpoint antes de iniciar a próxima fase sequencial.

## Parallel Opportunities

### Foundation

```text
T006 command tests | T007 history tests | T008 interaction tests | T009 persistence tests | T010 controller test
T011 command types | T015 selection/viewport | T016 persistence model | T018 browser adapter
```

### User Story 1

```text
T021 semantic tests | T022 routing tests | T023 renderer tests | T024 canvas E2E | T025 connection E2E
Após T030: T031 context menu | T032 inline label editor
```

### User Story 2

```text
T036 source transaction tests | T037 ADLS tests | T038 editor E2E | T039 synchronization E2E
T040 CodeMirror UI | T042 ADLS controller
```

### User Story 3

```text
T048 provider tests | T049 proposal tests | T050 assistant E2E
Após contratos: T051 simulated provider | T055 conversation history | T056 composer
```

### User Story 4

```text
T058 autosave tests | T059 recovery tests | T060 persistence E2E | T061 history E2E
Após repository: T062 autosave | T067 persistence status UI
```

### User Story 5

```text
T069 IO tests | T070 export scene tests | T071 rasterizer tests | T072 export E2E | T073 new E2E
Após contratos: T075 export scene | T079 export menu
```

### User Story 6

```text
T081 snap tests | T082 alignment tests | T083 preferences tests | T084 preferences E2E
T085 snapping | T086 alignment | T088 theme tokens
```

### User Story 7

```text
T093 responsive E2E | T094 touch E2E | T095 accessibility E2E | T096 contrast test
Após contratos: T098 responsive top bar | T102 announcements
```

## Implementation Strategy

### MVP First — User Story 1

1. Concluir Setup (T001–T005).
2. Concluir Foundation (T006–T020).
3. Concluir US1 (T021–T035).
4. Rodar os testes focados e regressões de canvas/layout/renderer.
5. **STOP AND VALIDATE**: demonstrar diagrama inicial, edição visual e conexões antes de ampliar escopo.

### Incremental Delivery

1. **MVP visual**: Setup + Foundation + US1.
2. **Fontes canônicas**: adicionar US2 e validar sincronização completa.
3. **Assistência local**: adicionar US3 sem infraestrutura externa.
4. **Segurança do trabalho**: adicionar US4 para restore/histórico compartilhado.
5. **Saída e reset**: adicionar US5.
6. **Workspace configurável**: adicionar US6.
7. **Cobertura de dispositivos e acessibilidade**: adicionar US7.
8. **Hardening**: concluir Polish e validação global.

### Parallel Team Strategy

Após Foundation:

- **Trilha A — Canvas**: US1, depois export scene de US5.
- **Trilha B — Sources/AI**: US2, depois US3.
- **Trilha C — State**: US4 e preferências puras de US6.
- **Trilha D — UI quality**: componentes de US6 e, quando superfícies estabilizarem, US7.

Integrações em `App.tsx`, `WorkspaceChrome.tsx`, `DiagramCanvas.tsx` e `workspace-controller.ts` devem ser serializadas para evitar conflitos entre trilhas.

## Notes

- `[P]` significa arquivos diferentes e ausência de dependência pendente dentro da fase; não autoriza ignorar checkpoints.
- `[USn]` mantém rastreabilidade direta para a spec.
- Testes devem ser observados em vermelho antes da implementação correspondente.
- Coordenadas, seleção, viewport e preferências nunca devem ser serializadas em `.adl`.
- React Flow, storage do navegador e rasterização permanecem atrás de adapters da aplicação.
- Não adicionar backend, banco, cloud ou provedor real de IA nesta feature.
- Fazer commits pequenos por tarefa ou grupo lógico e preservar mudanças não relacionadas do usuário.
