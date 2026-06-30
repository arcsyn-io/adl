# Feature Specification: Conformidade, documentação e exemplos

**Feature Branch**: `specs`

**Created**: 2026-06-29

**Status**: Draft

**Input**: Decomposição do projeto ADL em features independentes; Fornecer documentação autocontida, exemplos versionados e uma suíte de conformidade que torne a ADL compreensível e verificável.

## Objective

Fornecer documentação autocontida, exemplos versionados e uma suíte de conformidade que torne a ADL compreensível e verificável.

## Problem

Sem referência normativa e casos executáveis, implementações divergem e usuários dependem de conhecimento informal.

## Dependencies

- **Requires**: 001; amplia com 002–005 e 013
- **Parallelization**: Começa após 001 e evolui em paralelo às specs da linguagem.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Aprender por exemplos (Priority: P1)

Como novo autor, quero exemplos progressivos para criar meu primeiro diagrama sem suporte externo.

**Why this priority**: Entrega o resultado central e verificável da feature.

**Independent Test**: Um usuário segue o início rápido e produz um documento válido.

**Acceptance Scenarios**:

1. **Given** as dependências da feature estão disponíveis, **When** aprender por exemplos é exercitado, **Then** um usuário segue o início rápido e produz um documento válido.
2. **Given** uma entrada fora das regras declaradas, **When** a mesma jornada é tentada, **Then** a operação não produz sucesso enganoso e informa o limite aplicável.

---

### User Story 2 - Consultar referência (Priority: P2)

Como autor experiente, quero localizar regras e erros por versão.

**Why this priority**: Amplia o valor sem alterar o objetivo único da feature.

**Independent Test**: Cada construção e diagnóstico público possui documentação encontrável.

**Acceptance Scenarios**:

1. **Given** as dependências da feature estão disponíveis, **When** consultar referência é exercitado, **Then** cada construção e diagnóstico público possui documentação encontrável.
2. **Given** uma entrada fora das regras declaradas, **When** a mesma jornada é tentada, **Then** a operação não produz sucesso enganoso e informa o limite aplicável.

---

### User Story 3 - Verificar conformidade (Priority: P3)

Como implementador, quero casos válidos e inválidos com resultados esperados.

**Why this priority**: Amplia o valor sem alterar o objetivo único da feature.

**Independent Test**: Uma implementação pode executar o conjunto e identificar divergências objetivamente.

**Acceptance Scenarios**:

1. **Given** as dependências da feature estão disponíveis, **When** verificar conformidade é exercitado, **Then** uma implementação pode executar o conjunto e identificar divergências objetivamente.
2. **Given** uma entrada fora das regras declaradas, **When** a mesma jornada é tentada, **Then** a operação não produz sucesso enganoso e informa o limite aplicável.

### Edge Cases

- O comportamento deve permanecer definido para exemplo desatualizado após mudança de versão.
- O comportamento deve permanecer definido para regra normativa em conflito com exemplo.
- O comportamento deve permanecer definido para caso inválido aceito parcialmente.
- O comportamento deve permanecer definido para migração entre versões incompatíveis.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A documentação MUST separar material normativo, guia de uso e exemplos.
- **FR-002**: Cada construção de 001 MUST ter descrição, ao menos um exemplo válido e limites relevantes.
- **FR-003**: A suíte MUST conter entradas válidas e inválidas com resultado esperado para análise, modelo, validação e serialização aplicáveis.
- **FR-004**: Exemplos publicados MUST ser validados pela mesma definição de conformidade.
- **FR-005**: A política de versionamento MUST definir compatibilidade, depreciação e tratamento de versões desconhecidas.
- **FR-006**: Mudanças incompatíveis MUST incluir orientação de migração antes de serem consideradas documentadas.
- **FR-007**: A documentação MUST afirmar que coordenadas manuais não pertencem ao `.adl`.

### Key Entities

- **Caso de conformidade**: entrada e resultados esperados.
- **Referência da linguagem**: regras normativas por versão.
- **Exemplo**: documento explicativo validado.
- **Registro de versão**: mudanças e compatibilidade.

## Scope

- Entrega exclusivamente o comportamento descrito no objetivo, requisitos e cenários acima.
- Define contratos observáveis necessários às specs dependentes sem escolher tecnologia de implementação.

## Out of Scope

- Implementação da linguagem.
- Site público.
- Tradução.
- Tutoriais em vídeo e suporte comunitário..

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das construções públicas possuem cobertura documental e de conformidade.
- **SC-002**: Todos os exemplos publicados passam na versão declarada.
- **SC-003**: Um novo usuário conclui o exemplo inicial em até 15 minutos.
- **SC-004**: Duas implementações conformes concordam em 100% dos resultados normativos do conjunto.

## Assumptions

- A primeira documentação é em português.
- A suíte cresce conforme 002–005 entregam contratos.
- Hospedagem pública da documentação não é necessária nesta spec.

