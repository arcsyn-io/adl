# Implementation Plan: Stylesheet visual da ADL

**Branch**: `codex/new-specs` | **Date**: 2026-07-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/016-element-stylesheet/spec.md`

## Summary

Adicionar uma linguagem visual versionada em arquivos `.adls`, referenciável por um documento `.adl` e também disponível como bloco embutido ao final dele. Um novo pacote de domínio `@adl/stylesheet` analisará, validará, combinará e resolverá regras por tipo e ID. O parser ADL preservará referência e bloco embutido na AST; a camada semântica continuará representando somente arquitetura. O estilo resolvido fornecerá dimensões ao layout e propriedades de desenho ao renderer, enquanto o editor web coordenará leitura local, diagnósticos e atualização da visualização.

## Technical Context

**Language/Version**: TypeScript 6.0 em modo estrito; ADL 1.0; ADL Stylesheet 1.0

**Primary Dependencies**: pnpm 10, Turborepo, React 19, Vite, Vitest, ELK (`elkjs`) e SVG nativo; sem nova dependência de runtime planejada

**Storage**: Arquivos locais `.adl` e `.adls`; nenhuma persistência remota ou banco de dados

**Testing**: Vitest para unidade, contrato, integração e desempenho; Playwright para fluxos E2E visuais

**Target Platform**: Navegadores modernos no editor web e Node.js no workspace Docker para bibliotecas e validação

**Project Type**: Monorepo de bibliotecas de linguagem/compilação e aplicação web

**Performance Goals**: Resolver e aplicar estilos em até 100 ms para 100 elementos e 200 relações; preservar atualização interativa do preview

**Constraints**: Pipeline unidirecional; regras visuais fora de React; coordenadas fora do `.adl` semântico e permitidas somente por ID no stylesheet; viewport/zoom/seleção locais; funcionamento local; resultados determinísticos; nenhuma nova dependência sem necessidade demonstrada

**Scale/Scope**: Uma referência externa e um bloco embutido; seletores `*`, categoria, tipo e ID; 5 shapes; orientação/rotação; posição/tamanho por ID; pinturas sólidas/gradientes; tipografia completa

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

A constituição existente contém apenas placeholders e não impõe gates utilizáveis. Aplicam-se `AGENTS.md` e `agent_docs/`:

- **PASS — Separação arquitetural**: parsing de stylesheet e resolução de estilos ficam em pacote de domínio; React apenas coordena e apresenta.
- **PASS — Pipeline explícito**: AST ADL preserva a declaração visual, modelo semântico permanece independente da sintaxe concreta, estilo resolvido entra como contrato paralelo antes de layout/renderização.
- **PASS — Coordenadas**: `.adl` permanece sem coordenadas; `.adls` registra `x/y` por ID como estado visual portátil. Viewport, zoom e seleção continuam no estado local do canvas.
- **PASS — Persistência local**: referências externas são arquivos locais; não há backend, banco ou cloud.
- **PASS — Diagnósticos**: erros de sintaxe, valores e referências são estruturados, determinísticos e localizados.
- **PASS — TDD e validação**: tarefas exigem red–green–refactor e os gates `lint`, `typecheck`, `test`, `build` e E2E.

**Post-design re-check**: PASS. Os contratos de Phase 1 não introduzem ciclos, estado duplicado, regras em componentes ou dependências externas. A fronteira de carregamento recebe conteúdo por callback e não acopla pacotes de domínio a filesystem ou navegador.

## Project Structure

### Documentation (this feature)

```text
specs/016-element-stylesheet/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── stylesheet-language.md
│   └── pipeline.md
└── tasks.md
```

### Source Code (repository root)

```text
packages/
├── adl-language/src/syntax.ts             # referência e bloco embutido no contrato do documento
├── adl-parser/src/{lexer,parser}.ts        # parsing da integração dentro do .adl
├── adl-semantic/src/{model,resolve}.ts     # mantém semântica arquitetural; expõe identidades/tipos
├── adl-stylesheet/                         # novo pacote de linguagem visual
│   ├── src/{syntax,parser,validate,resolve,index}.ts
│   └── test/
├── adl-layout/src/{model,layout}.ts        # dimensões resolvidas como entrada de layout
├── adl-renderer/src/{scene,render}.ts      # estilo resolvido nas entidades da cena
├── adl-serializer/src/{serialize,policy}.ts # round-trip da declaração visual embutida/referenciada
└── adl-conformance/                        # fixtures e execução de casos normativos

apps/web-editor/
├── src/App.tsx                             # coordenação da fonte, stylesheet e pipeline
├── src/features/code-editor/               # diagnósticos e edição do bloco embutido
└── src/features/visual-editor/             # adaptação visual sem resolver regras

tests/e2e/                                  # referência externa, embedded e precedência no preview
docs/                                       # referência normativa e exemplos `.adl`/`.adls`
agent_docs/architecture.md                  # contrato arquitetural do fluxo de estilos
```

**Structure Decision**: Criar `@adl/stylesheet` como pacote independente porque stylesheet possui sintaxe, AST, validação, resolução e atualização próprias. `@adl/parser` reconhece somente os pontos de integração no documento ADL. O conteúdo externo é obtido pela aplicação e entregue como texto ao pacote, evitando acesso a arquivos no domínio. O modelo semântico não recebe apresentação; `ResolvedDiagramStyles` é um contrato paralelo consumido por layout e renderer. Alterações de posição/tamanho geram patches determinísticos na regra por ID da fonte visual gravável.

## Design Sequence

1. Definir contrato normativo `.adls`, AST visual, propriedades, unidades, pinturas sólidas/gradientes e códigos de diagnóstico.
2. Estender o envelope sintático do `.adl` para referência opcional antes do documento e bloco embutido opcional depois dele, preservando ranges.
3. Implementar parser e validador do stylesheet sem depender de browser, React ou renderer.
4. Combinar regras globais, por categoria, tipo e ID das fontes externa/embutida conforme a cascata.
5. Passar posição, dimensões e limites transformados ao layout e shape/orientação/rotação/aparência ao renderer.
6. Coordenar carregamento e atualização no editor web; apresentar diagnósticos sem invalidar a semântica arquitetural.
7. Persistir movimentos/redimensionamentos como patches de regra por ID sem gravar estado de sessão.
8. Fechar serialização, conformidade, documentação, desempenho e E2E.

## Complexity Tracking

Nenhuma violação arquitetural ou gate não atendido exige justificativa.
