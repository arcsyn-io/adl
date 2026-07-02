# Tasks: Stylesheet visual da ADL

**Input**: Design documents from `/specs/016-element-stylesheet/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)

**Tests**: Obrigatórios. Seguir red–green–refactor: escrever cada teste, confirmar a falha pela razão esperada e somente então implementar.

**Organization**: Tarefas agrupadas por user story para permitir incrementos demonstráveis. US1 é o MVP externo; US2 adiciona seletores/cascata completa; US3 adiciona o bloco embutido.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode ser executada em paralelo sem editar os mesmos arquivos ou depender de trabalho incompleto.
- **[US1]**, **[US2]**, **[US3]**: Correspondem às user stories da spec.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Criar a estrutura do pacote e registrar os contratos sem implementar comportamento.

- [ ] T001 Criar o pacote `@adl/stylesheet` com scripts, exports e configuração TypeScript em `packages/adl-stylesheet/package.json`, `packages/adl-stylesheet/tsconfig.json`, `packages/adl-stylesheet/tsconfig.build.json` e `packages/adl-stylesheet/eslint.config.js`
- [ ] T002 [P] Criar os pontos de entrada vazios do pacote em `packages/adl-stylesheet/src/index.ts`, `packages/adl-stylesheet/src/syntax.ts`, `packages/adl-stylesheet/src/parser.ts`, `packages/adl-stylesheet/src/validate.ts` e `packages/adl-stylesheet/src/resolve.ts`
- [ ] T003 [P] Documentar a responsabilidade inicial e a fronteira pública do pacote em `packages/adl-stylesheet/README.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Estabelecer sintaxe, tipos, parsing e diagnósticos compartilhados por todas as stories.

**⚠️ CRITICAL**: Nenhuma user story começa antes desta fase estar verde.

- [ ] T004 [P] Escrever testes falhos do contrato léxico e sintático `.adls` 1.0, incluindo ranges e recuperação de erro, em `packages/adl-stylesheet/test/parser.test.ts`
- [ ] T005 [P] Escrever testes falhos de valores válidos/inválidos, limites, pinturas, posição por ID e propriedades tipográficas por alvo em `packages/adl-stylesheet/test/validation.test.ts`
- [ ] T006 [P] Escrever testes falhos dos tipos públicos imutáveis e exports do pacote em `packages/adl-stylesheet/test/contract.test.ts`
- [ ] T007 Definir AST, seletores, declarações, estilos normalizados e diagnósticos discriminados em `packages/adl-stylesheet/src/syntax.ts`
- [ ] T008 Implementar lexer/parser puro para arquivo externo e corpo de regras embutidas em `packages/adl-stylesheet/src/parser.ts`
- [ ] T009 Implementar normalização e validação de formas, pixels, pinturas, pares `x/y`, alinhamentos e tipografia em `packages/adl-stylesheet/src/validate.ts`
- [ ] T010 Publicar somente os contratos necessários em `packages/adl-stylesheet/src/index.ts` e concluir o ciclo verde dos testes em `packages/adl-stylesheet/test/parser.test.ts`, `packages/adl-stylesheet/test/validation.test.ts` e `packages/adl-stylesheet/test/contract.test.ts`

**Checkpoint**: Um `.adls` isolado pode ser analisado e validado deterministicamente, sem filesystem, modelo semântico, layout ou renderer.

---

## Phase 3: User Story 1 — Aplicar um stylesheet externo (Priority: P1) 🎯 MVP

**Goal**: Referenciar um `.adls` externo, carregá-lo pela fronteira do consumidor e aplicar uma regra por tipo a elementos, incluindo dimensões no layout e aparência no renderer.

**Independent Test**: Dois elementos `service` em um `.adl` que referencia `theme.adls` tornam-se elipses com as dimensões/pinturas declaradas; o mesmo tema funciona em dois documentos e uma referência ausente gera diagnóstico sem alterar o modelo semântico.

### Tests for User Story 1

- [ ] T011 [P] [US1] Escrever testes falhos da referência externa, resolução relativa e round-trip no envelope ADL em `packages/adl-parser/test/stylesheet-reference.test.ts` e `packages/adl-serializer/test/stylesheet-reference.test.ts`
- [ ] T012 [P] [US1] Escrever testes falhos de resolução externa por tipo, defaults e falha de carregamento em `packages/adl-stylesheet/test/external-resolution.test.ts`
- [ ] T013 [P] [US1] Escrever testes falhos de dimensões e posições fixas por ID combinadas com layout automático em `packages/adl-layout/test/stylesheet-layout.test.ts`
- [ ] T014 [P] [US1] Escrever testes falhos de forma, arredondamento exclusivo de retângulo e pinturas sólidas/gradientes em preenchimento, borda e texto nas entidades da cena em `packages/adl-renderer/test/stylesheet-renderer.test.ts`

### Implementation for User Story 1

- [ ] T015 [US1] Estender tokens e AST do envelope ADL com referência externa e ranges em `packages/adl-parser/src/lexer.ts` e `packages/adl-parser/src/index.ts`
- [ ] T016 [US1] Analisar uma referência externa opcional antes do documento e rejeitar duplicatas em `packages/adl-parser/src/parser.ts`
- [ ] T017 [US1] Preservar a referência externa na serialização determinística em `packages/adl-serializer/src/serialize.ts` e `packages/adl-serializer/src/policy.ts`
- [ ] T018 [US1] Implementar a fronteira de carregamento, diagnósticos de URI e criação de fontes externas em `packages/adl-stylesheet/src/source.ts` e exportá-la em `packages/adl-stylesheet/src/index.ts`
- [ ] T019 [US1] Implementar matching por tipo de elemento, preenchimento por defaults e `ResolvedDiagramStyles` em `packages/adl-stylesheet/src/resolve.ts`
- [ ] T020 [US1] Aceitar overrides numéricos de largura/altura e preservar pares `x/y` fixos sem interpretar a DSL em `packages/adl-layout/src/model.ts` e `packages/adl-layout/src/layout.ts`
- [ ] T021 [US1] Adicionar `ResolvedElementStyle` às entradas/entidades da cena e manter defaults compatíveis em `packages/adl-renderer/src/scene.ts` e `packages/adl-renderer/src/render.ts`
- [ ] T022 [US1] Coordenar referência, carregamento, resolução, layout e cena fora dos componentes visuais em `apps/web-editor/src/features/stylesheet/stylesheet-pipeline.ts` e integrar o resultado em `apps/web-editor/src/App.tsx`
- [ ] T023 [US1] Renderizar retângulo ou elipse, aplicar `border-radius` somente ao retângulo e materializar pinturas sólidas/gradientes validadas no SVG em `apps/web-editor/src/App.tsx` e `apps/web-editor/src/styles.css`
- [ ] T024 [US1] Adicionar teste de integração do pipeline externo, posições restauradas e modelo semântico inalterado em `apps/web-editor/src/features/stylesheet/stylesheet-pipeline.test.ts`

**Checkpoint**: O fluxo externo por tipo funciona fim a fim e pode ser demonstrado como MVP.

---

## Phase 4: User Story 2 — Estilizar por tipo e por identidade (Priority: P2)

**Goal**: Completar seletores por ID/tipo para elementos e relações, combinação propriedade a propriedade, precedência, avisos e estilo de linhas/rótulos.

**Independent Test**: Uma regra de tipo estiliza todos os serviços e uma regra por ID modifica somente `payments`; relações do mesmo tipo recebem linha/rótulo configurados e seletores órfãos geram aviso.

### Tests for User Story 2

- [ ] T025 [P] [US2] Escrever testes falhos da matriz de precedência, combinação, posição exclusiva por ID e última declaração vencedora em `packages/adl-stylesheet/test/cascade.test.ts`
- [ ] T026 [P] [US2] Escrever testes falhos de seletores por ID/tipo de relação e avisos sem correspondência em `packages/adl-stylesheet/test/relation-resolution.test.ts`
- [ ] T027 [P] [US2] Escrever testes falhos de pinturas, alinhamentos, família/fallback, peso, itálico e sublinhado em elementos e relações em `packages/adl-renderer/test/relation-styles.test.ts`

### Implementation for User Story 2

- [ ] T028 [US2] Implementar matching exato por ID e tipo para elementos/relações e aviso de seletor órfão em `packages/adl-stylesheet/src/resolve.ts`
- [ ] T029 [US2] Implementar cascata propriedade a propriedade, `TextStyle`, posição opcional e aviso de sobrescrita em `packages/adl-stylesheet/src/resolve.ts`
- [ ] T030 [US2] Transportar `ResolvedRelationStyle` para entidades da cena sem interpretar regras em `packages/adl-renderer/src/scene.ts` e `packages/adl-renderer/src/render.ts`
- [ ] T031 [US2] Aplicar pinturas, alinhamentos, família/fallback, negrito, itálico e sublinhado em elementos/rótulos preservando marcadores e acessibilidade em `apps/web-editor/src/App.tsx` e `apps/web-editor/src/styles.css`
- [ ] T032 [US2] Implementar patch de `x/y/width/height` na regra por ID, expor falha somente leitura e diagnósticos no editor em `packages/adl-stylesheet/src/update.ts`, `apps/web-editor/src/features/stylesheet/stylesheet-pipeline.ts` e `apps/web-editor/src/features/code-editor/CodeEditor.tsx`

**Checkpoint**: Tipo, ID, elementos, relações e conflitos externos estão completos e testáveis sem stylesheet embutido.

---

## Phase 5: User Story 3 — Incorporar ajustes no documento (Priority: P3)

**Goal**: Permitir um bloco `stylesheet { ... }` após o diagrama, com ranges, serialização e precedência sobre regras externas equivalentes.

**Independent Test**: Um `.adl` sem arquivo externo aplica seu bloco embutido; com ambas as fontes, embedded vence nos conflitos e erro local aponta para o range correto sem invalidar o modelo semântico.

### Tests for User Story 3

- [ ] T033 [P] [US3] Escrever testes falhos de parsing, duplicata, range e erro do bloco embutido em `packages/adl-parser/test/embedded-stylesheet.test.ts`
- [ ] T034 [P] [US3] Escrever testes falhos de round-trip do bloco embutido em `packages/adl-serializer/test/embedded-stylesheet.test.ts`
- [ ] T035 [P] [US3] Escrever testes falhos da precedência externo/embedded por tipo/ID em `packages/adl-stylesheet/test/embedded-cascade.test.ts`
- [ ] T036 [P] [US3] Escrever teste E2E do fluxo autocontido, persistência de movimento/tamanho e tipografia no preview em `tests/e2e/element-stylesheet.spec.ts`

### Implementation for User Story 3

- [ ] T037 [US3] Estender o envelope AST com bloco embutido e ranges sem adicioná-lo ao `DiagramModel` em `packages/adl-parser/src/lexer.ts` e `packages/adl-parser/src/index.ts`
- [ ] T038 [US3] Analisar exatamente um bloco após `diagram` e integrar diagnósticos do corpo em `packages/adl-parser/src/parser.ts`
- [ ] T039 [US3] Serializar deterministicamente o bloco embutido após o diagrama em `packages/adl-serializer/src/serialize.ts` e `packages/adl-serializer/src/policy.ts`
- [ ] T040 [US3] Combinar fontes externas/embutidas conforme a matriz de precedência e propagar `completeness` em `packages/adl-stylesheet/src/resolve.ts`
- [ ] T041 [US3] Atualizar o pipeline do editor para invalidar estilos obsoletos e reaplicar embedded a cada revisão em `apps/web-editor/src/features/stylesheet/stylesheet-pipeline.ts` e `apps/web-editor/src/App.tsx`

**Checkpoint**: Os três fluxos da spec funcionam e permanecem independentemente verificáveis.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Conformidade, documentação, desempenho e gates globais.

- [ ] T042 [P] Adicionar fixtures válidas/inválidas e resultados normativos de stylesheet em `packages/adl-conformance/test/fixtures.ts` e `packages/adl-conformance/test/conformance.test.ts`
- [ ] T043 [P] Adicionar referência da linguagem, tabela de propriedades, precedência e exemplos em `docs/stylesheet.md` e `docs/examples/stylesheet/theme.adls`
- [ ] T044 [P] Registrar o fluxo paralelo de estilo resolvido e as novas responsabilidades de pacote em `agent_docs/architecture.md`
- [ ] T045 Medir e otimizar resolução/aplicação para 100 elementos e 200 relações em `packages/adl-stylesheet/test/performance.test.ts`
- [ ] T046 Executar os quatro cenários de `specs/016-element-stylesheet/quickstart.md` e registrar eventuais desvios no próprio arquivo `specs/016-element-stylesheet/quickstart.md`
- [ ] T047 Executar `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` e `pnpm test:e2e` no serviço Docker `workspace` e corrigir somente falhas relacionadas à feature nos arquivos afetados
- [ ] T048 Revisar compatibilidade, exports públicos e diff final, removendo código morto e atualizando contratos divergentes em `packages/adl-stylesheet/README.md` e `specs/016-element-stylesheet/contracts/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: início imediato.
- **Foundational (Phase 2)**: depende de Setup e bloqueia todas as stories.
- **US1 (Phase 3)**: depende de Foundational e entrega o MVP.
- **US2 (Phase 4)**: depende do resolvedor e transporte visual entregues por US1, mas mantém fixtures próprias.
- **US3 (Phase 5)**: depende do resolvedor de US1/US2 para aplicar a precedência completa.
- **Polish (Phase 6)**: depende das stories incluídas na entrega.

### User Story Dependencies

```text
Setup → Foundational → US1 (MVP) → US2 → US3 → Polish
```

- **US1**: fluxo externo por tipo, demonstrável isoladamente.
- **US2**: amplia US1 com ID, relação e cascata; não exige embedded.
- **US3**: amplia a mesma linguagem com origem embedded.

### Within Each User Story

- Escrever os testes indicados e observar falha relevante antes de implementar.
- Consolidar contratos/AST antes de serviços de resolução.
- Resolver estilos antes de adaptar layout/renderer.
- Adaptar pacotes de domínio antes da coordenação React.
- Executar testes focados no checkpoint de cada story.

### Parallel Opportunities

- T002 e T003 podem avançar em paralelo após T001.
- T004–T006 podem ser escritos em paralelo.
- Em US1, T011–T014 cobrem pacotes diferentes e podem ser escritos em paralelo.
- Em US2, T025–T027 podem ser escritos em paralelo.
- Em US3, T033–T036 podem ser escritos em paralelo.
- T042–T044 podem avançar em paralelo após as stories.

## Parallel Examples

### User Story 1

```text
T011: contratos do envelope/serializer
T012: resolução externa
T013: layout
T014: renderer
```

### User Story 2

```text
T025: cascata
T026: relações e seletores órfãos
T027: cena de relações
```

### User Story 3

```text
T033: parser embedded
T034: serializer embedded
T035: cascata entre origens
T036: E2E
```

## Implementation Strategy

### MVP First

1. Completar Setup e Foundational.
2. Completar US1 até T024.
3. Validar stylesheet externo em dois documentos, referência ausente e orçamento básico.
4. Parar no checkpoint; nenhuma implementação de embedded é necessária para demonstrar valor.

### Incremental Delivery

1. **US1**: tema externo reutilizável por tipo.
2. **US2**: exceções por ID e styling completo de relações.
3. **US3**: documento autocontido e override embedded.
4. **Polish**: conformidade, docs, performance e gates globais.

## Notes

- Não criar backend, banco ou serviço cloud.
- Não adicionar coordenadas ao `.adl`; no `.adls`, permitir somente pares `x/y` em regras de elemento por ID.
- Não persistir viewport, zoom, seleção ou preferências de sessão no stylesheet.
- Não adicionar estilos ao `DiagramModel`; usar `ResolvedDiagramStyles` como contrato paralelo.
- `@adl/stylesheet` não acessa filesystem/browser e React não resolve seletores.
- Todos os comandos de desenvolvimento e validação rodam via `docker compose exec workspace bash -lc "<comando>"`.
