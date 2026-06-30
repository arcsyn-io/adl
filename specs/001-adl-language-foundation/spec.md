# Feature Specification: Fundamentos da linguagem ADL

**Feature Branch**: `specs`

**Created**: 2026-06-29

**Status**: Draft

**Input**: Decomposição do projeto ADL em features independentes; Definir o vocabulário, os conceitos e a sintaxe textual inicial da ADL para diagramas de arquitetura.

## Objective

Definir o vocabulário, os conceitos e a sintaxe textual inicial da ADL para diagramas de arquitetura.

## Problem

Sem um contrato de linguagem estável, parser, documentação e ferramentas podem interpretar o mesmo diagrama de formas incompatíveis.

## Dependencies

- **Requires**: Nenhuma
- **Parallelization**: Início do programa; bloqueia 002 e 014.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Descrever um diagrama mínimo (Priority: P1)

Como autor, quero declarar um diagrama, elementos e relações em texto legível para representar uma arquitetura sem coordenadas visuais.

**Why this priority**: Entrega o resultado central e verificável da feature.

**Independent Test**: Um exemplo mínimo contendo dois elementos e uma relação é aceito pela definição e possui interpretação única.

**Acceptance Scenarios**:

1. **Given** as dependências da feature estão disponíveis, **When** descrever um diagrama mínimo é exercitado, **Then** um exemplo mínimo contendo dois elementos e uma relação é aceito pela definição e possui interpretação única.
2. **Given** uma entrada fora das regras declaradas, **When** a mesma jornada é tentada, **Then** a operação não produz sucesso enganoso e informa o limite aplicável.

---

### User Story 2 - Usar metadados e agrupamentos (Priority: P2)

Como autor, quero nomear, classificar, documentar e agrupar elementos para expressar contexto arquitetural.

**Why this priority**: Amplia o valor sem alterar o objetivo único da feature.

**Independent Test**: Exemplos com nomes, tipos, descrições, propriedades e grupos podem ser explicados somente pela especificação.

**Acceptance Scenarios**:

1. **Given** as dependências da feature estão disponíveis, **When** usar metadados e agrupamentos é exercitado, **Then** exemplos com nomes, tipos, descrições, propriedades e grupos podem ser explicados somente pela especificação.
2. **Given** uma entrada fora das regras declaradas, **When** a mesma jornada é tentada, **Then** a operação não produz sucesso enganoso e informa o limite aplicável.

---

### User Story 3 - Evoluir com compatibilidade explícita (Priority: P3)

Como mantenedor, quero identificar a versão da linguagem para distinguir documentos compatíveis e incompatíveis.

**Why this priority**: Amplia o valor sem alterar o objetivo único da feature.

**Independent Test**: Documentos declaram uma versão e o comportamento para versões desconhecidas está definido.

**Acceptance Scenarios**:

1. **Given** as dependências da feature estão disponíveis, **When** evoluir com compatibilidade explícita é exercitado, **Then** documentos declaram uma versão e o comportamento para versões desconhecidas está definido.
2. **Given** uma entrada fora das regras declaradas, **When** a mesma jornada é tentada, **Then** a operação não produz sucesso enganoso e informa o limite aplicável.

### Edge Cases

- O comportamento deve permanecer definido para documento vazio ou contendo apenas comentários.
- O comportamento deve permanecer definido para identificadores duplicados ou referências ainda não resolvidas.
- O comportamento deve permanecer definido para texto Unicode, espaços e comentários.
- O comportamento deve permanecer definido para proibição de coordenadas, tamanhos e posições no texto ADL.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A especificação MUST definir a estrutura de um documento ADL e sua declaração de versão.
- **FR-002**: Ela MUST definir identificadores, nomes exibidos, tipos de elemento, relações direcionais, grupos, propriedades e comentários.
- **FR-003**: Ela MUST distinguir elementos obrigatórios de opcionais e fornecer defaults observáveis.
- **FR-004**: Ela MUST definir regras de nomes, literais, palavras reservadas, escape e sensibilidade a maiúsculas.
- **FR-005**: O texto `.adl` MUST permanecer declarativo e MUST NOT armazenar coordenadas, dimensões ou posição manual.
- **FR-006**: Versões não suportadas MUST produzir uma condição identificável, sem interpretação silenciosa.

### Key Entities

- **Documento ADL**: unidade versionada contendo declarações.
- **Elemento**: entidade arquitetural identificável e tipada.
- **Relação**: vínculo identificável entre origem e destino.
- **Grupo**: organização lógica, sem semântica de coordenadas.

## Scope

- Entrega exclusivamente o comportamento descrito no objetivo, requisitos e cenários acima.
- Define contratos observáveis necessários às specs dependentes sem escolher tecnologia de implementação.

## Out of Scope

- Parser.
- AST.
- Validação semântica.
- Renderização.
- Layout.
- Editor.
- Persistência e IA..

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Todos os conceitos necessários aos exemplos iniciais têm uma representação textual única.
- **SC-002**: Um revisor consegue classificar 100% de um conjunto de exemplos como válidos ou inválidos usando apenas a spec.
- **SC-003**: Nenhum exemplo ADL contém coordenadas ou estado visual.
- **SC-004**: A definição permite que gramática e documentação avancem sem decisões sintáticas pendentes.

## Assumptions

- A primeira versão cobre diagramas arquiteturais genéricos, não uma notação de domínio completa.
- O arquivo é texto Unicode e pode ser editado manualmente.
- Estilos visuais e posicionamento pertencem a specs posteriores.

