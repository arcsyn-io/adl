# Feature Specification: Assistente de geração de diagramas

**Feature Branch**: `019-ai-diagram-assistant`

**Created**: 2026-07-23

**Status**: Draft

**Input**: Implementar no editor o fluxo seguro de geração e alteração de arquivos ADL por um assistente, com proposta validada, preview e confirmação antes de aplicar.

## Objective

Permitir que autores descrevam um diagrama em linguagem natural e revisem uma proposta ADL válida antes de incorporá-la ao documento atual.

## Problem

O painel de assistente atual é apenas demonstrativo. Autores não conseguem transformar uma descrição em uma proposta revisável, nem avaliar com segurança o impacto de uma sugestão antes de alterar o diagrama.

## Dependencies

- **Requires**: 004, 005, 010, 015, 017
- **Parallelization**: A integração com provedores externos permanece independente deste fluxo local.

## User Scenarios & Testing

### User Story 1 - Gerar uma proposta de diagrama (Priority: P1)

Como autor, quero descrever uma arquitetura e receber uma proposta ADL válida para iniciar um diagrama sem escrever toda a sintaxe manualmente.

**Why this priority**: É o valor central e permite validar o fluxo completo sem aplicar mudanças automaticamente.

**Independent Test**: Enviar uma descrição no painel e receber uma proposta válida, com resumo e preview, mantendo o documento atual intacto.

**Acceptance Scenarios**:

1. **Given** um documento aberto, **When** o autor envia uma descrição suportada, **Then** a aplicação apresenta uma proposta ADL válida sem alterar o documento.
2. **Given** uma descrição vazia, **When** o envio é tentado, **Then** nenhuma geração ocorre e uma orientação acessível é exibida.
3. **Given** uma resposta inválida, **When** a validação é executada, **Then** a proposta não pode ser aplicada e o documento permanece intacto.

---

### User Story 2 - Revisar e aplicar a proposta (Priority: P1)

Como autor, quero comparar a proposta com meu documento e confirmar sua aplicação para manter controle sobre as mudanças.

**Why this priority**: Evita mutações silenciosas e completa a jornada principal.

**Independent Test**: Gerar uma proposta, revisar origem e resultado, aplicar explicitamente e observar o diagrama atualizado.

**Acceptance Scenarios**:

1. **Given** uma proposta válida, **When** o autor escolhe aplicar, **Then** o texto e o diagrama são atualizados como uma nova revisão.
2. **Given** uma proposta válida, **When** o autor descarta, **Then** o documento não é alterado.
3. **Given** que o documento mudou depois da geração, **When** o autor tenta aplicar, **Then** a proposta obsoleta é bloqueada e pode ser gerada novamente.

---

### User Story 3 - Entender e controlar o conteúdo compartilhado (Priority: P2)

Como autor, quero saber qual conteúdo será enviado a um assistente para evitar compartilhamento inesperado.

**Why this priority**: Torna o fluxo compatível com dados sensíveis e com integrações futuras.

**Independent Test**: Antes da geração, inspecionar o conteúdo incluído e consentir para aquela solicitação específica.

**Acceptance Scenarios**:

1. **Given** uma solicitação pronta, **When** o conteúdo é exibido, **Then** o autor consegue distinguir sua descrição do documento atual incluído.
2. **Given** ausência de consentimento, **When** uma integração que exige compartilhamento é acionada, **Then** nenhuma solicitação é executada.

### Edge Cases

- O autor edita o documento enquanto uma geração está em andamento.
- A geração é cancelada, falha ou retorna conteúdo não ADL.
- A resposta usa elementos duplicados ou relações para destinos inexistentes.
- O documento atual contém texto inválido.
- Envios repetidos não devem aplicar duas vezes a mesma proposta.

## Requirements

### Functional Requirements

- **FR-001**: O painel MUST aceitar uma descrição textual e impedir envio vazio.
- **FR-002**: Cada solicitação MUST registrar a revisão base e o conteúdo que seria compartilhado.
- **FR-003**: A geração MUST produzir uma proposta separada do documento atual.
- **FR-004**: Toda proposta MUST passar pela validação normal da linguagem e do modelo antes de ser apresentada como aplicável.
- **FR-005**: O autor MUST conseguir ver o texto anterior, o texto proposto e um resumo da mudança.
- **FR-006**: A aplicação MUST exigir confirmação explícita.
- **FR-007**: Propostas baseadas em revisão obsoleta MUST ser rejeitadas.
- **FR-008**: Descartar ou falhar MUST preservar integralmente o último documento utilizável.
- **FR-009**: O fluxo essencial do editor MUST continuar funcionando quando o assistente estiver indisponível.
- **FR-010**: A primeira entrega MUST funcionar sem backend, conta, chave ou chamada de rede.
- **FR-011**: O resultado aplicado MUST percorrer o pipeline normal de texto, análise, modelo, layout e renderização.
- **FR-012**: Estados de geração, erro, proposta, descarte e aplicação MUST ser perceptíveis e acessíveis.

### Key Entities

- **Solicitação de assistência**: descrição, revisão base e conteúdo divulgado.
- **Proposta**: fonte ADL candidata e resumo, ainda não aplicada.
- **Preview**: comparação entre documento atual e proposta validada.
- **Consentimento**: autorização específica para o conteúdo exibido.
- **Estado do assistente**: etapa atual e eventual diagnóstico recuperável.

## Scope

- Painel funcional de geração no editor.
- Adaptador local de demonstração, determinístico e sem rede.
- Validação, comparação, aplicação, descarte e proteção contra revisão obsoleta.
- Contratos substituíveis para um provedor futuro.

## Out of Scope

- Escolha ou chamada de provedor externo.
- Backend, proxy, conta, cobrança ou armazenamento remoto.
- Inclusão de chaves de API no navegador.
- Geração de stylesheet ou múltiplos arquivos numa única proposta.
- Fine-tuning ou treinamento de modelo.

## Success Criteria

- **SC-001**: Em 100% dos cenários de teste, nenhuma proposta altera o documento antes de confirmação explícita.
- **SC-002**: Em 100% das respostas inválidas ou obsoletas, a aplicação é bloqueada sem perda do documento atual.
- **SC-003**: Um autor consegue descrever, revisar e aplicar um diagrama de demonstração em menos de dois minutos.
- **SC-004**: A proposta e seus controles aparecem em até um segundo após a conclusão da geração local.
- **SC-005**: Desativar ou indisponibilizar o assistente preserva todas as funções essenciais do editor.

## Assumptions

- A primeira entrega valida o produto e as fronteiras usando um adaptador local determinístico.
- Integrações externas serão decididas em uma feature separada.
- A proposta inicial substitui o texto ADL completo; alterações incrementais usam o mesmo mecanismo de comparação e confirmação.
- O stylesheet atual não é compartilhado nem modificado.
