# Feature Specification: Importação e exportação

**Feature Branch**: `specs`

**Created**: 2026-06-29

**Status**: Draft

**Input**: Decomposição do projeto ADL em features independentes; Permitir entrada e saída explícita de documentos ADL e representações portáveis do diagrama, com validação e falhas seguras.

## Objective

Permitir entrada e saída explícita de documentos ADL e representações portáveis do diagrama, com validação e falhas seguras.

## Problem

Persistência interna não permite compartilhar, versionar externamente ou apresentar diagramas fora do editor.

## Dependencies

- **Requires**: 004, 005, 006, 012
- **Parallelization**: Pode avançar em paralelo com 014 após dependências.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Importar ADL (Priority: P1)

Como autor, quero abrir um arquivo `.adl` e validar seu conteúdo antes de substituir meu trabalho.

**Why this priority**: Entrega o resultado central e verificável da feature.

**Independent Test**: Arquivo válido abre; inválido mostra diagnósticos sem perder o documento atual.

**Acceptance Scenarios**:

1. **Given** as dependências da feature estão disponíveis, **When** importar adl é exercitado, **Then** arquivo válido abre; inválido mostra diagnósticos sem perder o documento atual.
2. **Given** uma entrada fora das regras declaradas, **When** a mesma jornada é tentada, **Then** a operação não produz sucesso enganoso e informa o limite aplicável.

---

### User Story 2 - Exportar fonte (Priority: P2)

Como autor, quero baixar ADL canônico para versionar ou compartilhar.

**Why this priority**: Amplia o valor sem alterar o objetivo único da feature.

**Independent Test**: O arquivo exportado pode ser reimportado com significado equivalente.

**Acceptance Scenarios**:

1. **Given** as dependências da feature estão disponíveis, **When** exportar fonte é exercitado, **Then** o arquivo exportado pode ser reimportado com significado equivalente.
2. **Given** uma entrada fora das regras declaradas, **When** a mesma jornada é tentada, **Then** a operação não produz sucesso enganoso e informa o limite aplicável.

---

### User Story 3 - Exportar visualização (Priority: P3)

Como leitor, quero obter uma imagem ou documento visual do diagrama.

**Why this priority**: Amplia o valor sem alterar o objetivo único da feature.

**Independent Test**: A saída contém o diagrama completo, legível e sem controles do editor.

**Acceptance Scenarios**:

1. **Given** as dependências da feature estão disponíveis, **When** exportar visualização é exercitado, **Then** a saída contém o diagrama completo, legível e sem controles do editor.
2. **Given** uma entrada fora das regras declaradas, **When** a mesma jornada é tentada, **Then** a operação não produz sucesso enganoso e informa o limite aplicável.

### Edge Cases

- O comportamento deve permanecer definido para arquivo vazio, grande, extensão incorreta ou codificação inválida.
- O comportamento deve permanecer definido para versão de linguagem não suportada.
- O comportamento deve permanecer definido para falha ao gerar representação visual.
- O comportamento deve permanecer definido para nome de arquivo inseguro ou inválido.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A importação MUST validar tipo, leitura, versão, sintaxe e semântica antes de substituir o documento ativo.
- **FR-002**: Falha de importação MUST preservar integralmente o trabalho atual.
- **FR-003**: A exportação ADL MUST usar a forma canônica de 005 e preservar equivalência semântica.
- **FR-004**: O usuário MUST poder exportar ao menos uma representação visual portável e o arquivo `.adl`.
- **FR-005**: A saída visual MUST incluir todo o diagrama solicitado e MUST NOT incluir controles do editor.
- **FR-006**: Operações MUST indicar sucesso ou causa de falha de forma acionável.
- **FR-007**: Dados importados MUST ser tratados como conteúdo não confiável.

### Key Entities

- **Arquivo importado**: conteúdo externo e metadados de leitura.
- **Artefato exportado**: ADL ou representação visual.
- **Resultado de transferência**: sucesso, avisos ou falhas antes da aplicação.

## Scope

- Entrega exclusivamente o comportamento descrito no objetivo, requisitos e cenários acima.
- Define contratos observáveis necessários às specs dependentes sem escolher tecnologia de implementação.

## Out of Scope

- Cloud sync.
- Formatos proprietários de terceiros.
- Colaboração e publicação online..

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos arquivos ADL conformes são importados com modelo equivalente.
- **SC-002**: 100% dos inválidos do conjunto de teste preservam o documento ativo.
- **SC-003**: Arquivos ADL exportados passam novamente por análise e validação.
- **SC-004**: Representações visuais dos exemplos incluem todas as entidades e rótulos essenciais.

## Assumptions

- Formatos visuais exatos serão escolhidos no planejamento, mantendo ao menos um formato portável.
- Importação de formatos de terceiros não é requisito inicial.
- O estado visual pode acompanhar um pacote futuro, mas não o arquivo `.adl` simples.

