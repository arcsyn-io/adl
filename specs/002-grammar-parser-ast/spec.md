# Feature Specification: Gramática, lexer, parser e AST

**Feature Branch**: `specs`

**Created**: 2026-06-29

**Status**: Draft

**Input**: Decomposição do projeto ADL em features independentes; Transformar texto ADL em uma árvore sintática fiel por meio de uma gramática formal e comportamento de análise definido.

## Objective

Transformar texto ADL em uma árvore sintática fiel por meio de uma gramática formal e comportamento de análise definido.

## Problem

Ferramentas não podem consumir ADL de modo consistente sem regras formais de tokens, precedência, recuperação e representação sintática.

## Dependencies

- **Requires**: 001
- **Parallelization**: Pode avançar em paralelo com 014 após 001 estabilizar.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Analisar documento válido (Priority: P1)

Como consumidor da linguagem, quero converter ADL válido em uma AST determinística para alimentar ferramentas posteriores.

**Why this priority**: Entrega o resultado central e verificável da feature.

**Independent Test**: Cada exemplo válido de 001 gera uma AST com todas as declarações e localizações de origem.

**Acceptance Scenarios**:

1. **Given** as dependências da feature estão disponíveis, **When** analisar documento válido é exercitado, **Then** cada exemplo válido de 001 gera uma AST com todas as declarações e localizações de origem.
2. **Given** uma entrada fora das regras declaradas, **When** a mesma jornada é tentada, **Then** a operação não produz sucesso enganoso e informa o limite aplicável.

---

### User Story 2 - Localizar falhas sintáticas (Priority: P2)

Como autor, quero saber onde a estrutura textual é inválida para corrigir o documento.

**Why this priority**: Amplia o valor sem alterar o objetivo único da feature.

**Independent Test**: Entradas inválidas retornam falhas com intervalo de origem e não são aceitas como documentos completos.

**Acceptance Scenarios**:

1. **Given** as dependências da feature estão disponíveis, **When** localizar falhas sintáticas é exercitado, **Then** entradas inválidas retornam falhas com intervalo de origem e não são aceitas como documentos completos.
2. **Given** uma entrada fora das regras declaradas, **When** a mesma jornada é tentada, **Then** a operação não produz sucesso enganoso e informa o limite aplicável.

---

### User Story 3 - Preservar informação relevante (Priority: P3)

Como ferramenta, quero associar nós ao texto de origem para navegação e diagnósticos.

**Why this priority**: Amplia o valor sem alterar o objetivo único da feature.

**Independent Test**: Nós e tokens relevantes podem ser correlacionados a linhas e colunas do documento.

**Acceptance Scenarios**:

1. **Given** as dependências da feature estão disponíveis, **When** preservar informação relevante é exercitado, **Then** nós e tokens relevantes podem ser correlacionados a linhas e colunas do documento.
2. **Given** uma entrada fora das regras declaradas, **When** a mesma jornada é tentada, **Then** a operação não produz sucesso enganoso e informa o limite aplicável.

### Edge Cases

- O comportamento deve permanecer definido para arquivo vazio, fim inesperado e token desconhecido.
- O comportamento deve permanecer definido para comentários e espaços em posições limítrofes.
- O comportamento deve permanecer definido para literais escapados e Unicode.
- O comportamento deve permanecer definido para múltiplos erros sintáticos no mesmo documento.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A gramática MUST cobrir integralmente a sintaxe definida em 001 e MUST ser não ambígua.
- **FR-002**: O processo léxico MUST classificar tokens, comentários, espaços e tokens inválidos.
- **FR-003**: O parser MUST produzir uma AST sintática determinística para entrada válida.
- **FR-004**: Cada nó e erro MUST manter intervalo preciso no texto de origem.
- **FR-005**: Entrada inválida MUST NOT resultar em sucesso completo, mesmo quando houver recuperação parcial.
- **FR-006**: A recuperação MUST permitir relatar erros posteriores sem inventar declarações semanticamente válidas.
- **FR-007**: A AST sintática MUST representar a forma escrita sem incorporar regras do modelo semântico.

### Key Entities

- **Token**: unidade lexical com classe e intervalo.
- **AST sintática**: hierarquia fiel às construções escritas.
- **Intervalo de origem**: posição inicial e final no documento.
- **Erro sintático**: falha de formação encontrada durante análise.

## Scope

- Entrega exclusivamente o comportamento descrito no objetivo, requisitos e cenários acima.
- Define contratos observáveis necessários às specs dependentes sem escolher tecnologia de implementação.

## Out of Scope

- Resolução de referências.
- Regras semânticas.
- Formatação canônica.
- Interface de editor e escolha de tecnologia do parser..

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos exemplos válidos de 001 são analisados de forma determinística.
- **SC-002**: 100% dos exemplos inválidos de sintaxe são rejeitados com ao menos um intervalo correto.
- **SC-003**: A mesma entrada gera uma AST estruturalmente equivalente em execuções repetidas.
- **SC-004**: Um documento com até 10 mil declarações é analisado em até 2 segundos no ambiente de referência.

## Assumptions

- A definição formal pode evoluir junto dos exemplos, mas não redefinir 001.
- Diagnósticos editoriais completos pertencem a 004.
- A AST não é o modelo consumido diretamente pelo renderer.

