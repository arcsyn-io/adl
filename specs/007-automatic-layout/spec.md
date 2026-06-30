# Feature Specification: Layout automático

**Feature Branch**: `specs`

**Created**: 2026-06-29

**Status**: Draft

**Input**: Decomposição do projeto ADL em features independentes; Calcular posições legíveis e determinísticas para entidades de um diagrama sem inserir coordenadas no texto ADL.

## Objective

Calcular posições legíveis e determinísticas para entidades de um diagrama sem inserir coordenadas no texto ADL.

## Problem

Diagramas textuais precisam de uma disposição inicial útil; exigir posicionamento manual impediria visualização imediata e misturaria apresentação com linguagem.

## Dependencies

- **Requires**: 003, 006
- **Parallelization**: Pode avançar em paralelo com 008 depois do renderer básico.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Obter layout inicial (Priority: P1)

Como autor, quero que um diagrama sem posições seja organizado automaticamente.

**Why this priority**: Entrega o resultado central e verificável da feature.

**Independent Test**: Um modelo válido recebe posições para todas as entidades renderizáveis sem sobreposição indevida.

**Acceptance Scenarios**:

1. **Given** as dependências da feature estão disponíveis, **When** obter layout inicial é exercitado, **Then** um modelo válido recebe posições para todas as entidades renderizáveis sem sobreposição indevida.
2. **Given** uma entrada fora das regras declaradas, **When** a mesma jornada é tentada, **Then** a operação não produz sucesso enganoso e informa o limite aplicável.

---

### User Story 2 - Repetir resultado estável (Priority: P2)

Como autor, quero que o mesmo conteúdo mantenha uma disposição previsível.

**Why this priority**: Amplia o valor sem alterar o objetivo único da feature.

**Independent Test**: Execuções com o mesmo modelo e opções produzem posições equivalentes.

**Acceptance Scenarios**:

1. **Given** as dependências da feature estão disponíveis, **When** repetir resultado estável é exercitado, **Then** execuções com o mesmo modelo e opções produzem posições equivalentes.
2. **Given** uma entrada fora das regras declaradas, **When** a mesma jornada é tentada, **Then** a operação não produz sucesso enganoso e informa o limite aplicável.

---

### User Story 3 - Reorganizar após mudança (Priority: P3)

Como autor, quero recalcular a disposição quando a estrutura mudar.

**Why this priority**: Amplia o valor sem alterar o objetivo único da feature.

**Independent Test**: Adicionar uma entidade gera layout completo e mantém o diagrama utilizável.

**Acceptance Scenarios**:

1. **Given** as dependências da feature estão disponíveis, **When** reorganizar após mudança é exercitado, **Then** adicionar uma entidade gera layout completo e mantém o diagrama utilizável.
2. **Given** uma entrada fora das regras declaradas, **When** a mesma jornada é tentada, **Then** a operação não produz sucesso enganoso e informa o limite aplicável.

### Edge Cases

- O comportamento deve permanecer definido para grafo desconectado, ciclos e auto-relações.
- O comportamento deve permanecer definido para grupos aninhados.
- O comportamento deve permanecer definido para rótulos muito longos e tamanhos mínimos.
- O comportamento deve permanecer definido para um ou milhares de elementos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O layout MUST atribuir posição e dimensão a toda entidade renderizável.
- **FR-002**: O resultado MUST ser determinístico para modelo e opções equivalentes.
- **FR-003**: O cálculo MUST considerar grupos, dimensões de rótulo e rotas de relações.
- **FR-004**: O resultado SHOULD minimizar sobreposições de entidades, rótulos e relações segundo critérios verificáveis.
- **FR-005**: Posições calculadas MUST permanecer fora do documento `.adl` e do modelo semântico.
- **FR-006**: O usuário MUST poder solicitar novo layout sem alterar o significado do documento.
- **FR-007**: Falha ou limite excedido MUST preservar um estado anterior utilizável e informar o motivo.

### Key Entities

- **Resultado de layout**: posições, dimensões e rotas por identidade.
- **Opções de layout**: direção e espaçamentos observáveis.
- **Métrica de qualidade**: colisões e legibilidade do resultado.

## Scope

- Entrega exclusivamente o comportamento descrito no objetivo, requisitos e cenários acima.
- Define contratos observáveis necessários às specs dependentes sem escolher tecnologia de implementação.

## Out of Scope

- Renderer.
- Armazenamento de posições manuais.
- Animações e alteração do texto..

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das entidades recebem geometria finita em casos suportados.
- **SC-002**: O mesmo caso produz resultado equivalente em 100% das repetições.
- **SC-003**: Casos de referência de até 100 elementos não apresentam sobreposição de caixas.
- **SC-004**: Um diagrama de 500 elementos obtém resultado em até 3 segundos no ambiente de referência.

## Assumptions

- Estabilidade visual entre pequenas mudanças é desejável, mas secundária à legibilidade inicial.
- Movimentação manual e precedência entre posições pertencem a 011.
- O algoritmo específico será decidido no planejamento.

