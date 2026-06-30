# Feature Specification: Sincronização entre código e canvas

**Feature Branch**: `specs`

**Created**: 2026-06-29

**Status**: Draft

**Input**: Decomposição do projeto ADL em features independentes; Manter texto ADL e edição visual semanticamente consistentes, com origem de mudanças, conflitos e estados inválidos tratados explicitamente.

## Objective

Manter texto ADL e edição visual semanticamente consistentes, com origem de mudanças, conflitos e estados inválidos tratados explicitamente.

## Problem

Dois modos de edição podem divergir, sobrescrever mudanças ou produzir ciclos de atualização se não compartilharem um contrato transacional.

## Dependencies

- **Requires**: 005, 008, 009
- **Parallelization**: Marco de integração; não deve iniciar antes dos contratos dependentes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver texto refletido no canvas (Priority: P1)

Como autor, quero que mudanças válidas no código atualizem o diagrama sem ação manual.

**Why this priority**: Entrega o resultado central e verificável da feature.

**Independent Test**: Após editar uma propriedade válida, o canvas mostra o mesmo significado.

**Acceptance Scenarios**:

1. **Given** as dependências da feature estão disponíveis, **When** ver texto refletido no canvas é exercitado, **Then** após editar uma propriedade válida, o canvas mostra o mesmo significado.
2. **Given** uma entrada fora das regras declaradas, **When** a mesma jornada é tentada, **Then** a operação não produz sucesso enganoso e informa o limite aplicável.

---

### User Story 2 - Ver canvas refletido no texto (Priority: P2)

Como autor, quero que uma alteração visual semântica produza ADL canônico.

**Why this priority**: Amplia o valor sem alterar o objetivo único da feature.

**Independent Test**: Criar um elemento visualmente atualiza o texto e ambos convergem para o mesmo modelo.

**Acceptance Scenarios**:

1. **Given** as dependências da feature estão disponíveis, **When** ver canvas refletido no texto é exercitado, **Then** criar um elemento visualmente atualiza o texto e ambos convergem para o mesmo modelo.
2. **Given** uma entrada fora das regras declaradas, **When** a mesma jornada é tentada, **Then** a operação não produz sucesso enganoso e informa o limite aplicável.

---

### User Story 3 - Preservar edição inválida (Priority: P3)

Como autor, quero corrigir texto temporariamente inválido sem o canvas apagar meu trabalho.

**Why this priority**: Amplia o valor sem alterar o objetivo único da feature.

**Independent Test**: Enquanto há erro, o texto permanece intacto e o canvas mantém o último estado válido com indicação de desatualização.

**Acceptance Scenarios**:

1. **Given** as dependências da feature estão disponíveis, **When** preservar edição inválida é exercitado, **Then** enquanto há erro, o texto permanece intacto e o canvas mantém o último estado válido com indicação de desatualização.
2. **Given** uma entrada fora das regras declaradas, **When** a mesma jornada é tentada, **Then** a operação não produz sucesso enganoso e informa o limite aplicável.

### Edge Cases

- O comportamento deve permanecer definido para edições rápidas alternadas nos dois modos.
- O comportamento deve permanecer definido para mudança visual enquanto texto é inválido.
- O comportamento deve permanecer definido para seleção e cursor após reserialização.
- O comportamento deve permanecer definido para falha de serialização de comando visual.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST manter uma revisão identificável para texto, modelo e apresentação.
- **FR-002**: Mudança textual válida MUST atualizar modelo e canvas uma única vez, sem ciclo de realimentação.
- **FR-003**: Mudança visual semântica válida MUST atualizar modelo e texto canônico uma única vez.
- **FR-004**: Texto inválido MUST ser preservado e MUST NOT ser substituído automaticamente por estado visual anterior.
- **FR-005**: Durante texto inválido, o canvas MUST indicar se representa a última revisão válida.
- **FR-006**: Conflitos entre mudanças concorrentes da mesma sessão MUST ter regra determinística e não causar perda silenciosa.
- **FR-007**: Cursor, seleção textual e seleção visual SHOULD ser preservados quando suas identidades ainda existirem.

### Key Entities

- **Revisão sincronizada**: versões correlacionadas das representações.
- **Origem da mudança**: código, canvas ou restauração.
- **Último estado válido**: modelo exibível anterior a erro.
- **Conflito**: mudanças incompatíveis ainda não reconciliadas.

## Scope

- Entrega exclusivamente o comportamento descrito no objetivo, requisitos e cenários acima.
- Define contratos observáveis necessários às specs dependentes sem escolher tecnologia de implementação.

## Out of Scope

- Colaboração multiusuário.
- Merge entre arquivos externos.
- Geometria manual e autosave..

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos cenários de ida e volta convergem para modelos equivalentes sem loops.
- **SC-002**: Nenhum cenário de texto inválido perde caracteres digitados.
- **SC-003**: Atualizações válidas aparecem no outro modo em até 500 ms para diagramas de até 100 elementos.
- **SC-004**: Seleções de entidades sobrevivem a reserializações que preservam identidade.

## Assumptions

- A sessão é de um único usuário e uma única aba inicialmente.
- Formatação canônica de 005 é aceitável após mudanças visuais.
- Persistência é acionada apenas sobre revisões definidas por 012.

