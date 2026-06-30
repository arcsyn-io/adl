# Feature Specification: Modelo semântico da ADL

**Feature Branch**: `specs`

**Created**: 2026-06-29

**Status**: Draft

**Input**: Decomposição do projeto ADL em features independentes; Converter a AST em um modelo semântico normalizado, navegável e independente da forma textual.

## Objective

Converter a AST em um modelo semântico normalizado, navegável e independente da forma textual.

## Problem

A AST descreve como o texto foi escrito, mas renderização e validação precisam de identidades, referências e defaults resolvidos de forma consistente.

## Dependencies

- **Requires**: 001, 002
- **Parallelization**: Após 002, pode avançar em paralelo com a preparação de 006 e 014.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Obter modelo normalizado (Priority: P1)

Como ferramenta ADL, quero consumir entidades e relações normalizadas para não reinterpretar a sintaxe.

**Why this priority**: Entrega o resultado central e verificável da feature.

**Independent Test**: Um documento válido produz o mesmo modelo quando diferenças textuais não alteram significado.

**Acceptance Scenarios**:

1. **Given** as dependências da feature estão disponíveis, **When** obter modelo normalizado é exercitado, **Then** um documento válido produz o mesmo modelo quando diferenças textuais não alteram significado.
2. **Given** uma entrada fora das regras declaradas, **When** a mesma jornada é tentada, **Then** a operação não produz sucesso enganoso e informa o limite aplicável.

---

### User Story 2 - Navegar referências (Priority: P2)

Como consumidor, quero acessar origem, destino, grupo e propriedades resolvidos por identidade.

**Why this priority**: Amplia o valor sem alterar o objetivo único da feature.

**Independent Test**: Referências existentes são ligadas às entidades corretas e preservam rastreabilidade ao texto.

**Acceptance Scenarios**:

1. **Given** as dependências da feature estão disponíveis, **When** navegar referências é exercitado, **Then** referências existentes são ligadas às entidades corretas e preservam rastreabilidade ao texto.
2. **Given** uma entrada fora das regras declaradas, **When** a mesma jornada é tentada, **Then** a operação não produz sucesso enganoso e informa o limite aplicável.

---

### User Story 3 - Separar significado de apresentação (Priority: P3)

Como mantenedor, quero um modelo sem coordenadas ou estado do canvas para manter a linguagem portátil.

**Why this priority**: Amplia o valor sem alterar o objetivo único da feature.

**Independent Test**: A inspeção do modelo confirma ausência de posição, tamanho e seleção visual.

**Acceptance Scenarios**:

1. **Given** as dependências da feature estão disponíveis, **When** separar significado de apresentação é exercitado, **Then** a inspeção do modelo confirma ausência de posição, tamanho e seleção visual.
2. **Given** uma entrada fora das regras declaradas, **When** a mesma jornada é tentada, **Then** a operação não produz sucesso enganoso e informa o limite aplicável.

### Edge Cases

- O comportamento deve permanecer definido para referência ausente ou ambígua.
- O comportamento deve permanecer definido para grupos aninhados e ordem diferente de declarações.
- O comportamento deve permanecer definido para defaults omitidos.
- O comportamento deve permanecer definido para entidades sintáticas parcialmente inválidas.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST transformar uma AST analisável em um modelo semântico normalizado.
- **FR-002**: Identidades MUST ser estáveis dentro de um documento e referências MUST apontar para identidades, não nomes exibidos.
- **FR-003**: Defaults definidos em 001 MUST aparecer de forma explícita no modelo normalizado.
- **FR-004**: O modelo MUST preservar rastreabilidade entre entidades semânticas e intervalos de origem.
- **FR-005**: Ordem textual sem significado MUST NOT alterar a equivalência do modelo.
- **FR-006**: Coordenadas, dimensões, viewport, seleção e demais estados visuais MUST NOT integrar o modelo semântico.
- **FR-007**: Falhas de resolução MUST ser representáveis para consumo por 004 sem simular sucesso.

### Key Entities

- **Modelo do diagrama**: visão normalizada do documento.
- **Identidade semântica**: chave estável de uma entidade.
- **Referência resolvida**: vínculo entre identidades.
- **Proveniência**: associação ao nó e intervalo de origem.

## Scope

- Entrega exclusivamente o comportamento descrito no objetivo, requisitos e cenários acima.
- Define contratos observáveis necessários às specs dependentes sem escolher tecnologia de implementação.

## Out of Scope

- Diagnósticos apresentados ao usuário.
- Layout.
- Estado visual persistido e formatos de intercâmbio..

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Todos os exemplos válidos resultam em modelos navegáveis sem referências pendentes.
- **SC-002**: Documentos semanticamente equivalentes produzem modelos equivalentes em 100% dos casos de conformidade.
- **SC-003**: 100% das entidades mantêm proveniência ao texto.
- **SC-004**: Nenhum campo do modelo representa coordenadas ou estado de interação.

## Assumptions

- A identidade é local ao documento nesta fase.
- Validação decide se falhas impedem renderização.
- O modelo pode conter informação suficiente para reserialização, sem exigir preservação de formatação.

