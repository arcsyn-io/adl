# Feature Specification: Editor visual de diagramas

**Feature Branch**: `specs`

**Created**: 2026-06-29

**Status**: Draft

**Input**: Decomposição do projeto ADL em features independentes; Permitir criar, selecionar, editar e remover entidades do diagrama por interações visuais baseadas no modelo semântico.

## Objective

Permitir criar, selecionar, editar e remover entidades do diagrama por interações visuais baseadas no modelo semântico.

## Problem

Usuários visuais precisam manipular o conteúdo arquitetural sem editar diretamente cada construção textual.

## Dependencies

- **Requires**: 006, 003, 004
- **Parallelization**: Pode avançar em paralelo com 008; integração textual ocorre em 010.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Criar elemento visualmente (Priority: P1)

Como autor, quero adicionar um elemento pelo canvas e definir seus dados essenciais.

**Why this priority**: Entrega o resultado central e verificável da feature.

**Independent Test**: A ação cria uma entidade válida no estado de edição e a apresenta no diagrama.

**Acceptance Scenarios**:

1. **Given** as dependências da feature estão disponíveis, **When** criar elemento visualmente é exercitado, **Then** a ação cria uma entidade válida no estado de edição e a apresenta no diagrama.
2. **Given** uma entrada fora das regras declaradas, **When** a mesma jornada é tentada, **Then** a operação não produz sucesso enganoso e informa o limite aplicável.

---

### User Story 2 - Editar relações e metadados (Priority: P2)

Como autor, quero ligar elementos e alterar propriedades sem perder consistência.

**Why this priority**: Amplia o valor sem alterar o objetivo único da feature.

**Independent Test**: Uma relação válida pode ser criada e uma inválida é impedida ou diagnosticada.

**Acceptance Scenarios**:

1. **Given** as dependências da feature estão disponíveis, **When** editar relações e metadados é exercitado, **Then** uma relação válida pode ser criada e uma inválida é impedida ou diagnosticada.
2. **Given** uma entrada fora das regras declaradas, **When** a mesma jornada é tentada, **Then** a operação não produz sucesso enganoso e informa o limite aplicável.

---

### User Story 3 - Remover com segurança (Priority: P3)

Como autor, quero entender impactos antes de excluir uma entidade referenciada.

**Why this priority**: Amplia o valor sem alterar o objetivo único da feature.

**Independent Test**: A exclusão trata relações dependentes de modo explícito e reversível.

**Acceptance Scenarios**:

1. **Given** as dependências da feature estão disponíveis, **When** remover com segurança é exercitado, **Then** a exclusão trata relações dependentes de modo explícito e reversível.
2. **Given** uma entrada fora das regras declaradas, **When** a mesma jornada é tentada, **Then** a operação não produz sucesso enganoso e informa o limite aplicável.

### Edge Cases

- O comportamento deve permanecer definido para criação com identificador conflitante.
- O comportamento deve permanecer definido para exclusão de elemento com relações.
- O comportamento deve permanecer definido para seleção múltipla e perda de foco.
- O comportamento deve permanecer definido para operação inválida durante estado com erros.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O editor visual MUST permitir criar, selecionar, editar e remover elementos, relações e grupos suportados.
- **FR-002**: Cada operação MUST resultar em mudança semanticamente representável em ADL ou em rejeição explicada.
- **FR-003**: Operações destrutivas MUST explicitar seus efeitos sobre referências dependentes.
- **FR-004**: Alterações MUST participar de histórico de desfazer/refazer.
- **FR-005**: Controles MUST ser acessíveis por teclado e não depender exclusivamente de arrastar.
- **FR-006**: O editor MUST diferenciar seleção visual de conteúdo do modelo.
- **FR-007**: Movimentação de geometria MUST NOT ser tratada como alteração semântica e pertence a 011.

### Key Entities

- **Comando visual**: intenção reversível de alteração semântica.
- **Seleção**: identidades atualmente apontadas, sem persistência no ADL.
- **Rascunho de entidade**: dados ainda não confirmados.

## Scope

- Entrega exclusivamente o comportamento descrito no objetivo, requisitos e cenários acima.
- Define contratos observáveis necessários às specs dependentes sem escolher tecnologia de implementação.

## Out of Scope

- Editor textual.
- Sincronização bidirecional.
- Persistência.
- Layout e colaboração..

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Usuários criam um exemplo com dois elementos e uma relação sem editar texto em até 3 minutos.
- **SC-002**: 100% das operações confirmadas resultam em modelo válido ou diagnóstico explícito.
- **SC-003**: Desfazer restaura o estado anterior em todos os comandos cobertos.
- **SC-004**: Fluxos principais são concluídos usando somente teclado.

## Assumptions

- A serialização de mudanças para texto será coordenada por 010.
- Posicionamento manual será acrescentado por 011.
- Não há colaboração simultânea nesta fase.

