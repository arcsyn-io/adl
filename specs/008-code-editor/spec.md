# Feature Specification: Editor de código ADL

**Feature Branch**: `specs`

**Created**: 2026-06-29

**Status**: Draft

**Input**: Decomposição do projeto ADL em features independentes; Permitir editar ADL no navegador com feedback de análise, navegação e operações de texto adequadas à linguagem.

## Objective

Permitir editar ADL no navegador com feedback de análise, navegação e operações de texto adequadas à linguagem.

## Problem

Uma área de texto genérica não oferece diagnósticos localizados nem experiência segura para criar e corrigir documentos ADL.

## Dependencies

- **Requires**: 002, 004, 005
- **Parallelization**: Pode avançar em paralelo com 007 e 009 após seus contratos.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Editar com feedback (Priority: P1)

Como autor, quero escrever ADL e receber diagnósticos associados ao trecho correto.

**Why this priority**: Entrega o resultado central e verificável da feature.

**Independent Test**: Ao introduzir erro, o editor sinaliza o intervalo e atualiza o resultado após correção.

**Acceptance Scenarios**:

1. **Given** as dependências da feature estão disponíveis, **When** editar com feedback é exercitado, **Then** ao introduzir erro, o editor sinaliza o intervalo e atualiza o resultado após correção.
2. **Given** uma entrada fora das regras declaradas, **When** a mesma jornada é tentada, **Then** a operação não produz sucesso enganoso e informa o limite aplicável.

---

### User Story 2 - Usar recursos da linguagem (Priority: P2)

Como autor, quero destaque e sugestões contextuais básicas para reduzir erros.

**Why this priority**: Amplia o valor sem alterar o objetivo único da feature.

**Independent Test**: Palavras e construções conhecidas são distinguíveis e sugestões não inserem sintaxe inválida.

**Acceptance Scenarios**:

1. **Given** as dependências da feature estão disponíveis, **When** usar recursos da linguagem é exercitado, **Then** palavras e construções conhecidas são distinguíveis e sugestões não inserem sintaxe inválida.
2. **Given** uma entrada fora das regras declaradas, **When** a mesma jornada é tentada, **Then** a operação não produz sucesso enganoso e informa o limite aplicável.

---

### User Story 3 - Manter controle do texto (Priority: P3)

Como autor, quero desfazer, refazer e navegar até problemas sem perder minha edição.

**Why this priority**: Amplia o valor sem alterar o objetivo único da feature.

**Independent Test**: Uma sequência de alterações pode ser desfeita e refeita preservando texto e seleção.

**Acceptance Scenarios**:

1. **Given** as dependências da feature estão disponíveis, **When** manter controle do texto é exercitado, **Then** uma sequência de alterações pode ser desfeita e refeita preservando texto e seleção.
2. **Given** uma entrada fora das regras declaradas, **When** a mesma jornada é tentada, **Then** a operação não produz sucesso enganoso e informa o limite aplicável.

### Edge Cases

- O comportamento deve permanecer definido para digitação durante documento temporariamente inválido.
- O comportamento deve permanecer definido para arquivo grande, colagem extensa e Unicode.
- O comportamento deve permanecer definido para diagnóstico obsoleto após nova edição.
- O comportamento deve permanecer definido para atalhos e composição de entrada.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O editor MUST permitir abrir, alterar e obter o texto ADL atual.
- **FR-002**: Ele MUST apresentar destaque coerente com tokens de 002.
- **FR-003**: Ele MUST mostrar diagnósticos de 004 nos intervalos correspondentes e remover resultados obsoletos.
- **FR-004**: Ele MUST oferecer navegação entre diagnósticos e suporte a desfazer/refazer.
- **FR-005**: Análise durante digitação MUST tolerar estados intermediários inválidos sem bloquear edição.
- **FR-006**: Sugestões, quando oferecidas, MUST respeitar a versão e o contexto sintático.
- **FR-007**: O editor MUST ser operável por teclado e expor nomes acessíveis para seus controles.

### Key Entities

- **Documento de edição**: texto, versão de revisão e seleção.
- **Decoração**: destaque ou diagnóstico associado a intervalo.
- **Histórico de edição**: operações reversíveis da sessão.

## Scope

- Entrega exclusivamente o comportamento descrito no objetivo, requisitos e cenários acima.
- Define contratos observáveis necessários às specs dependentes sem escolher tecnologia de implementação.

## Out of Scope

- Canvas.
- Layout.
- Persistência.
- Colaboração em tempo real e implementação de parser..

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Feedback de análise aparece em até 500 ms após pausa de digitação para documentos de até 10 mil linhas.
- **SC-002**: 100% dos diagnósticos exibidos correspondem à revisão atual do texto.
- **SC-003**: Usuários concluem criação e correção do exemplo básico somente pelo teclado.
- **SC-004**: Desfazer e refazer restauram exatamente texto e seleção nos cenários de teste.

## Assumptions

- O editor trabalha localmente e não exige colaboração multiusuário.
- Persistência pertence a 012.
- Sincronização com canvas pertence a 010.

