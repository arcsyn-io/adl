# Feature Specification: Validação semântica e diagnósticos

**Feature Branch**: `specs`

**Created**: 2026-06-29

**Status**: Draft

**Input**: Decomposição do projeto ADL em features independentes; Detectar violações sintáticas e semânticas e apresentá-las como diagnósticos claros, localizados e acionáveis.

## Objective

Detectar violações sintáticas e semânticas e apresentá-las como diagnósticos claros, localizados e acionáveis.

## Problem

Sem validação unificada, documentos inconsistentes podem ser renderizados de forma enganosa e autores não sabem como corrigir erros.

## Dependencies

- **Requires**: 002, 003
- **Parallelization**: Pode avançar em paralelo com 005 depois de 003.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Corrigir erro localizado (Priority: P1)

Como autor, quero ver mensagem, severidade e posição de cada problema para corrigi-lo rapidamente.

**Why this priority**: Entrega o resultado central e verificável da feature.

**Independent Test**: Um identificador duplicado aponta as declarações envolvidas e explica a restrição.

**Acceptance Scenarios**:

1. **Given** as dependências da feature estão disponíveis, **When** corrigir erro localizado é exercitado, **Then** um identificador duplicado aponta as declarações envolvidas e explica a restrição.
2. **Given** uma entrada fora das regras declaradas, **When** a mesma jornada é tentada, **Then** a operação não produz sucesso enganoso e informa o limite aplicável.

---

### User Story 2 - Receber vários diagnósticos (Priority: P2)

Como autor, quero corrigir vários problemas em uma rodada sem que um erro oculte todos os seguintes.

**Why this priority**: Amplia o valor sem alterar o objetivo único da feature.

**Independent Test**: Um documento com falhas independentes retorna diagnósticos determinísticos para cada uma.

**Acceptance Scenarios**:

1. **Given** as dependências da feature estão disponíveis, **When** receber vários diagnósticos é exercitado, **Then** um documento com falhas independentes retorna diagnósticos determinísticos para cada uma.
2. **Given** uma entrada fora das regras declaradas, **When** a mesma jornada é tentada, **Then** a operação não produz sucesso enganoso e informa o limite aplicável.

---

### User Story 3 - Distinguir bloqueios de avisos (Priority: P3)

Como consumidor, quero saber se um documento pode prosseguir para outras operações.

**Why this priority**: Amplia o valor sem alterar o objetivo único da feature.

**Independent Test**: Cada diagnóstico tem severidade e o resultado informa se existe erro bloqueante.

**Acceptance Scenarios**:

1. **Given** as dependências da feature estão disponíveis, **When** distinguir bloqueios de avisos é exercitado, **Then** cada diagnóstico tem severidade e o resultado informa se existe erro bloqueante.
2. **Given** uma entrada fora das regras declaradas, **When** a mesma jornada é tentada, **Then** a operação não produz sucesso enganoso e informa o limite aplicável.

### Edge Cases

- O comportamento deve permanecer definido para problemas em cascata causados por um único símbolo ausente.
- O comportamento deve permanecer definido para intervalos sobrepostos ou fim de arquivo.
- O comportamento deve permanecer definido para referência a elemento duplicado.
- O comportamento deve permanecer definido para mensagem contendo conteúdo fornecido pelo usuário.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST validar unicidade, referências, tipos de relação, agrupamentos e restrições de versão definidas nas specs anteriores.
- **FR-002**: Cada diagnóstico MUST ter código estável, severidade, mensagem, intervalo principal e, quando útil, intervalos relacionados.
- **FR-003**: Mensagens MUST explicar o problema e uma ação de correção sem expor detalhes internos.
- **FR-004**: A ordem dos diagnósticos MUST ser determinística para a mesma entrada.
- **FR-005**: Erros derivados em cascata SHOULD ser suprimidos quando não acrescentarem ação distinta.
- **FR-006**: O resultado MUST distinguir erros bloqueantes de avisos informativos.
- **FR-007**: Diagnósticos sintáticos e semânticos MUST seguir um contrato comum para consumidores.

### Key Entities

- **Diagnóstico**: problema identificado com código e severidade.
- **Localização relacionada**: contexto adicional ligado ao problema.
- **Resultado de validação**: conjunto ordenado e indicador de bloqueio.

## Scope

- Entrega exclusivamente o comportamento descrito no objetivo, requisitos e cenários acima.
- Define contratos observáveis necessários às specs dependentes sem escolher tecnologia de implementação.

## Out of Scope

- Auto-fix.
- Lint de estilo opinativo.
- Telemetria.
- UI de problemas e validação de formatos externos..

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Cada regra semântica possui ao menos um caso válido e um inválido verificável.
- **SC-002**: 100% dos erros bloqueantes conhecidos impedem que o documento seja tratado como válido.
- **SC-003**: Em teste de usabilidade, ao menos 90% das mensagens permitem identificar a correção sem documentação adicional.
- **SC-004**: Resultados repetidos mantêm códigos, severidades e ordem.

## Assumptions

- Mensagens iniciais são em português; localização adicional é evolução futura.
- Correções automáticas não fazem parte desta entrega.
- O editor consumirá diagnósticos, mas sua apresentação visual pertence a 008.

