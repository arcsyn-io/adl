# Feature Specification: Movimentação e posicionamento manual

**Feature Branch**: `specs`

**Created**: 2026-06-29

**Status**: Draft

**Input**: Decomposição do projeto ADL em features independentes; Permitir ajustar posições no canvas e preservar esses ajustes como estado visual separado do texto e do modelo semântico.

## Objective

Permitir ajustar posições no canvas e preservar esses ajustes como estado visual separado do texto e do modelo semântico.

## Problem

Layout automático nem sempre expressa a intenção do autor, mas gravar coordenadas em `.adl` viola a separação entre significado e apresentação.

## Dependencies

- **Requires**: 007, 009, 010
- **Parallelization**: Pode avançar em paralelo com 012 após 010.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mover elemento (Priority: P1)

Como autor, quero arrastar ou reposicionar um elemento e manter o ajuste na sessão.

**Why this priority**: Entrega o resultado central e verificável da feature.

**Independent Test**: A nova posição aparece sem modificar o texto ADL.

**Acceptance Scenarios**:

1. **Given** as dependências da feature estão disponíveis, **When** mover elemento é exercitado, **Then** a nova posição aparece sem modificar o texto ADL.
2. **Given** uma entrada fora das regras declaradas, **When** a mesma jornada é tentada, **Then** a operação não produz sucesso enganoso e informa o limite aplicável.

---

### User Story 2 - Combinar manual e automático (Priority: P2)

Como autor, quero reorganizar o restante sem perder posições fixadas deliberadamente.

**Why this priority**: Amplia o valor sem alterar o objetivo único da feature.

**Independent Test**: O novo layout respeita a política explícita para itens fixados.

**Acceptance Scenarios**:

1. **Given** as dependências da feature estão disponíveis, **When** combinar manual e automático é exercitado, **Then** o novo layout respeita a política explícita para itens fixados.
2. **Given** uma entrada fora das regras declaradas, **When** a mesma jornada é tentada, **Then** a operação não produz sucesso enganoso e informa o limite aplicável.

---

### User Story 3 - Restaurar posição (Priority: P3)

Como autor, quero desfazer movimentos ou retornar ao layout automático.

**Why this priority**: Amplia o valor sem alterar o objetivo único da feature.

**Independent Test**: Desfazer restaura a geometria anterior sem mudança semântica.

**Acceptance Scenarios**:

1. **Given** as dependências da feature estão disponíveis, **When** restaurar posição é exercitado, **Then** desfazer restaura a geometria anterior sem mudança semântica.
2. **Given** uma entrada fora das regras declaradas, **When** a mesma jornada é tentada, **Then** a operação não produz sucesso enganoso e informa o limite aplicável.

### Edge Cases

- O comportamento deve permanecer definido para movimento fora da área visível.
- O comportamento deve permanecer definido para grupo com filhos e itens fixados.
- O comportamento deve permanecer definido para mudança textual que remove ou recria identidade.
- O comportamento deve permanecer definido para estado visual incompatível com nova versão do documento.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O usuário MUST poder reposicionar elementos por ponteiro e por alternativa de teclado.
- **FR-002**: Movimentos MUST atualizar somente estado visual, nunca texto `.adl` ou modelo semântico.
- **FR-003**: O estado MUST associar geometria a identidades semânticas estáveis.
- **FR-004**: O usuário MUST poder fixar, liberar, desfazer e refazer posições.
- **FR-005**: Reaplicar layout MUST seguir política explícita para posições fixadas.
- **FR-006**: Geometria órfã após mudança semântica MUST ser ignorada ou removida sem afetar o documento.
- **FR-007**: Limites, alinhamento e feedback durante movimento MUST ser previsíveis e acessíveis.

### Key Entities

- **Estado de posicionamento**: geometria manual por identidade.
- **Fixação**: preferência para preservar uma geometria.
- **Operação de movimento**: alteração visual reversível.

## Scope

- Entrega exclusivamente o comportamento descrito no objetivo, requisitos e cenários acima.
- Define contratos observáveis necessários às specs dependentes sem escolher tecnologia de implementação.

## Out of Scope

- Mudança semântica de entidades.
- Formato ADL.
- Colaboração e algoritmo de layout..

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos movimentos cobertos não alteram um único byte do ADL.
- **SC-002**: Posições persistem durante a sessão e após fluxo de 012.
- **SC-003**: Desfazer/refazer restaura posições exatas nos casos de teste.
- **SC-004**: Reaplicar layout respeita todos os elementos fixados nos cenários definidos.

## Assumptions

- A persistência local do estado visual será feita por 012.
- Zoom e viewport podem ser persistidos junto, mas nunca no ADL.
- Edição de tamanho manual não é obrigatória na primeira entrega.

