# Feature Specification: Provedor local Ollama

**Feature Branch**: `020-ollama-provider`

**Created**: 2026-07-23

**Status**: Complete

**Input**: Conectar o assistente de diagramas a um modelo de IA local via Ollama, mantendo a simulação como fallback.

## Objective

Permitir que o assistente gere propostas ADL por meio de um modelo executado localmente, sem enviar conteúdo para serviços cloud e sem perder as proteções de consentimento, validação e confirmação.

## Problem

O assistente atual demonstra a jornada com regras determinísticas, mas não interpreta descrições livres como um modelo de linguagem. O autor precisa instalar e executar um modelo local e entender claramente quando a geração real está disponível ou quando o fallback está sendo usado.

## Dependencies

- **Requires**: 015, 019
- **Parallelization**: Instalação do runtime e download do modelo são responsabilidades do ambiente do usuário.

## User Scenarios & Testing

### User Story 1 - Gerar com IA local (Priority: P1)

Como autor, quero enviar uma descrição ao modelo local e receber uma proposta ADL validada para representar arquiteturas que a simulação não reconhece.

**Independent Test**: Com o modelo local disponível, uma descrição livre produz uma proposta correlacionada, válida e revisável.

**Acceptance Scenarios**:

1. **Given** o runtime local disponível e um modelo instalado, **When** o autor autoriza a solicitação, **Then** a resposta do modelo é convertida em proposta ADL e passa pela validação normal.
2. **Given** uma resposta malformada, **When** ela é recebida, **Then** a proposta não é aplicada e um erro recuperável é exibido.
3. **Given** uma resposta ADL semanticamente inválida, **When** a validação ocorre, **Then** o documento atual permanece intacto.

### User Story 2 - Entender disponibilidade e fallback (Priority: P1)

Como autor, quero ver qual provedor e modelo serão usados para saber se a geração é realmente feita por IA.

**Independent Test**: O painel distingue claramente IA local disponível, indisponibilidade e simulação.

**Acceptance Scenarios**:

1. **Given** o runtime indisponível, **When** o painel é aberto, **Then** ele informa como habilitar a IA local e permite escolher o fallback.
2. **Given** o modelo ausente, **When** a geração é tentada, **Then** o erro identifica o modelo e o comando mínimo de preparação.
3. **Given** o fallback selecionado, **When** uma proposta é gerada, **Then** o painel identifica que o resultado é simulado.

### Edge Cases

- Runtime encerra durante uma geração.
- Modelo demora além do limite.
- Resposta JSON válida não segue o contrato.
- Endpoint configurado contém caminho ou protocolo inválido.
- O usuário muda de provedor com proposta em revisão.

## Requirements

### Functional Requirements

- **FR-001**: A app MUST oferecer um adaptador substituível para um runtime de modelo local.
- **FR-002**: O adaptador MUST enviar a descrição, a fonte atual e instruções da linguagem somente após consentimento.
- **FR-003**: A resposta MUST seguir um formato estruturado com fonte e resumo.
- **FR-004**: O endpoint, modelo, timeout e modo de provedor MUST possuir defaults explícitos e substituíveis.
- **FR-005**: A app MUST mostrar o provedor e modelo ativos antes da geração.
- **FR-006**: Indisponibilidade, modelo ausente, timeout e resposta inválida MUST produzir mensagens distintas e recuperáveis.
- **FR-007**: O fallback determinístico MUST permanecer disponível, mas nunca ser apresentado como IA.
- **FR-008**: Nenhuma resposta MUST ser aplicada sem validação ADL e confirmação.
- **FR-009**: A integração MUST funcionar sem backend, conta, chave ou serviço cloud.
- **FR-010**: Testes MUST simular a fronteira HTTP sem exigir modelo instalado.

### Key Entities

- **Configuração do provedor**: modo, endpoint, modelo e timeout.
- **Resposta Ollama**: envelope HTTP não confiável contendo mensagem estruturada.
- **Status do provedor**: disponível, indisponível ou modelo ausente.
- **Proposta ADL**: fonte e resumo correlacionados à solicitação.

## Scope

- Adaptador HTTP para Ollama local.
- Prompt de sistema com sintaxe ADL suportada.
- Resposta estruturada e validação em runtime.
- Seleção visível entre Ollama e demonstração.
- Diagnóstico de instalação/configuração.

## Out of Scope

- Instalação automática do Ollama.
- Download automático de modelos.
- Cloud Ollama ou outras APIs remotas.
- Streaming de tokens.
- Armazenamento permanente da configuração.

## Success Criteria

- **SC-001**: 100% das respostas inválidas nos testes são rejeitadas sem alterar o documento.
- **SC-002**: O usuário identifica provedor e modelo ativos antes de cada envio.
- **SC-003**: Indisponibilidade local é explicada em até um segundo.
- **SC-004**: O fallback continua utilizável em 100% dos cenários sem runtime local.

## Assumptions

- O endpoint padrão é local ao navegador do usuário.
- Um modelo geral multilíngue de aproximadamente 4 bilhões de parâmetros é adequado como default acessível.
- O usuário instala o runtime e baixa o modelo conscientemente.
