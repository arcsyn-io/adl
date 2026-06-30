# Research: Fundamentos da linguagem ADL

## Decision: Technical approach

**Chosen**: contratos de sintaxe e versão; sem geometria.

**Rationale**: Preserva determinismo, fronteiras e uma API pequena em packages/adl-language. Respeita a direção de dependências: Nenhuma.

**Alternatives considered**:

- Lógica em componentes React — rejeitada por misturar domínio e apresentação.
- Serviço remoto — rejeitado pelo requisito local-first.
- Estruturas mutáveis compartilhadas — rejeitadas por prejudicar histórico e testes.

## Decision: Testing

**Chosen**: unidade para regras puras, contrato para API pública e Playwright somente para interação/visual.

**Rationale**: Critérios são verificados na camada responsável, com regressões precisas.

## Decision: Errors and versions

**Chosen**: resultados discriminados e versionados, sem fallback ou descarte silencioso.

## Decision: Performance

**Chosen**: saídas equivalentes para entradas equivalentes e casos de referência cobrindo limites SC.

## Resolved Questions

Nenhum marcador NEEDS CLARIFICATION permanece. Bibliotecas podem ser refinadas sem alterar os contratos e gates.

