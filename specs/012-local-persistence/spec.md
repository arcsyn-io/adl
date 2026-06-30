# Feature Specification: Persistência local do diagrama

**Feature Branch**: `specs`

**Created**: 2026-06-29

**Status**: Draft

**Input**: Decomposição do projeto ADL em features independentes; Salvar e restaurar localmente conteúdo ADL e estado visual separado, com recuperação segura e sem backend.

## Objective

Salvar e restaurar localmente conteúdo ADL e estado visual separado, com recuperação segura e sem backend.

## Problem

Sem persistência, autores perdem documentos e ajustes de canvas entre sessões; misturar ambos compromete portabilidade da linguagem.

## Dependencies

- **Requires**: 005, 010, 011
- **Parallelization**: Pode avançar em paralelo com 013 após contratos de dados.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Retomar trabalho (Priority: P1)

Como autor, quero reabrir o editor e recuperar texto e posições da última sessão.

**Why this priority**: Entrega o resultado central e verificável da feature.

**Independent Test**: Após recarregar, o conteúdo e o estado visual compatível são restaurados.

**Acceptance Scenarios**:

1. **Given** as dependências da feature estão disponíveis, **When** retomar trabalho é exercitado, **Then** após recarregar, o conteúdo e o estado visual compatível são restaurados.
2. **Given** uma entrada fora das regras declaradas, **When** a mesma jornada é tentada, **Then** a operação não produz sucesso enganoso e informa o limite aplicável.

---

### User Story 2 - Reconhecer salvamento (Priority: P2)

Como autor, quero saber se há mudanças pendentes ou falha de gravação.

**Why this priority**: Amplia o valor sem alterar o objetivo único da feature.

**Independent Test**: O estado salvo, pendente ou com erro é visível e não afirma sucesso incorretamente.

**Acceptance Scenarios**:

1. **Given** as dependências da feature estão disponíveis, **When** reconhecer salvamento é exercitado, **Then** o estado salvo, pendente ou com erro é visível e não afirma sucesso incorretamente.
2. **Given** uma entrada fora das regras declaradas, **When** a mesma jornada é tentada, **Then** a operação não produz sucesso enganoso e informa o limite aplicável.

---

### User Story 3 - Recuperar com segurança (Priority: P3)

Como autor, quero preservar conteúdo mesmo se o estado visual estiver corrompido.

**Why this priority**: Amplia o valor sem alterar o objetivo único da feature.

**Independent Test**: ADL válido abre e o estado visual incompatível é descartado com aviso.

**Acceptance Scenarios**:

1. **Given** as dependências da feature estão disponíveis, **When** recuperar com segurança é exercitado, **Then** aDL válido abre e o estado visual incompatível é descartado com aviso.
2. **Given** uma entrada fora das regras declaradas, **When** a mesma jornada é tentada, **Then** a operação não produz sucesso enganoso e informa o limite aplicável.

### Edge Cases

- O comportamento deve permanecer definido para armazenamento indisponível ou quota excedida.
- O comportamento deve permanecer definido para gravação interrompida.
- O comportamento deve permanecer definido para ADL válido com estado visual antigo ou corrompido.
- O comportamento deve permanecer definido para múltiplas abas alterando o mesmo documento local.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST persistir o texto ADL e o estado visual como dados separados e correlacionados.
- **FR-002**: Ele MUST restaurar a última revisão confirmada após reinício do editor.
- **FR-003**: Falhas de armazenamento MUST ser informadas e MUST NOT marcar a revisão como salva.
- **FR-004**: Estado visual inválido MUST NOT impedir acesso ao texto ADL recuperável.
- **FR-005**: A gravação MUST evitar expor revisão parcialmente atualizada como completa.
- **FR-006**: O usuário MUST poder iniciar novo documento sem apagar silenciosamente o anterior.
- **FR-007**: Nenhum backend, conta ou serviço cloud MUST ser necessário.

### Key Entities

- **Documento local**: conteúdo ADL e metadados locais.
- **Estado visual local**: geometria, viewport e preferências compatíveis.
- **Revisão persistida**: unidade confirmada de recuperação.
- **Status de salvamento**: salvo, pendente ou falhou.

## Scope

- Entrega exclusivamente o comportamento descrito no objetivo, requisitos e cenários acima.
- Define contratos observáveis necessários às specs dependentes sem escolher tecnologia de implementação.

## Out of Scope

- Backend.
- Contas.
- Colaboração.
- Histórico remoto e formatos de exportação..

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Reabrir restaura exatamente o ADL da última revisão confirmada em 100% dos testes normais.
- **SC-002**: Falhas simuladas nunca substituem uma revisão válida por dados parciais.
- **SC-003**: Estado visual corrompido não causa perda do ADL.
- **SC-004**: O status exibido corresponde ao resultado real de persistência em todos os cenários.

## Assumptions

- Primeira versão mantém um conjunto pequeno de documentos locais.
- Sincronização cloud e autenticação estão fora de escopo.
- Importação e exportação explícitas pertencem a 013.

