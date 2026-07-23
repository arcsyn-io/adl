# Research: Assistente de geração de diagramas

## Decision 1: Entregar o fluxo sem provedor remoto

**Decision**: Usar um adaptador local determinístico que produz propostas ADL a partir de conceitos reconhecidos na descrição.

**Rationale**: Permite validar toda a experiência, os contratos e as proteções sem criar backend, expor chave no navegador ou escolher fornecedor.

**Alternatives considered**:

- Chamar uma API diretamente do navegador: rejeitado por expor credenciais e conteúdo.
- Criar proxy/backend: rejeitado porque exige decisão arquitetural explícita.
- Não fornecer adaptador: rejeitado porque impediria validar a jornada de ponta a ponta.

## Decision 2: Reutilizar a fronteira de IA existente

**Decision**: Construir solicitações e propostas com `@adl/ai-contracts`.

**Rationale**: O pacote já cobre consentimento por conteúdo, resposta não confiável, preview, confirmação e revisão obsoleta.

**Alternatives considered**:

- Criar tipos duplicados no app: rejeitado por gerar duas fontes de verdade.
- Aplicar a resposta diretamente: rejeitado por violar os requisitos de segurança da feature 015.

## Decision 3: Validar pela cadeia normal

**Decision**: Adaptar `validateSource` de `@adl/diagnostics` ao `ProposalValidator`.

**Rationale**: Garante as mesmas regras sintáticas e semânticas do editor.

**Alternatives considered**:

- Conferir apenas prefixo ou formato textual: insuficiente para referências, IDs e campos obrigatórios.
- Implementar validador específico para IA: rejeitado por divergir do compilador.

## Decision 4: Fonte completa como proposta

**Decision**: A proposta contém o documento ADL completo e não inclui stylesheet.

**Rationale**: É compatível com o contrato existente e torna diff, validação e aplicação atômicos.

**Alternatives considered**:

- Operações incrementais: aumentariam o contrato e a superfície de conflitos.
- Pacote ADL + ADLS: exige versionar o contrato e não é necessário para o MVP.

## Decision 5: Estado explícito da jornada

**Decision**: Modelar a jornada como união discriminada e manter transições em módulo puro.

**Rationale**: Evita combinações impossíveis de loading, erro e proposta e mantém regras fora do componente React.

**Alternatives considered**:

- Vários booleans no componente: rejeitado por permitir estados contraditórios.
- Store global: desnecessário para uma única instância do painel.
