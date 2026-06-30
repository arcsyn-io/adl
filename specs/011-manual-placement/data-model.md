# Data Model: Posicionamento manual

## Ownership

Entidades da feature 011, expostas por @adl/canvas-state somente quando necessárias.

## PlacementState

- **Identity**: estável no escopo da feature.
- **Fields**: dados dos requisitos, versão/revisão quando aplicável e proveniência.
- **Validation**: obrigatórios presentes; referências existentes; versão suportada.
- **Lifecycle**: draft → validated → accepted; falha permanece explícita.

## PinnedPlacement

- **Identity**: estável no escopo da feature.
- **Fields**: dados dos requisitos, versão/revisão quando aplicável e proveniência.
- **Validation**: obrigatórios presentes; referências existentes; versão suportada.
- **Lifecycle**: draft → validated → accepted; falha permanece explícita.

## MoveOperation

- **Identity**: estável no escopo da feature.
- **Fields**: dados dos requisitos, versão/revisão quando aplicável e proveniência.
- **Validation**: obrigatórios presentes; referências existentes; versão suportada.
- **Lifecycle**: draft → validated → accepted; falha permanece explícita.

## ViewportState

- **Identity**: estável no escopo da feature.
- **Fields**: dados dos requisitos, versão/revisão quando aplicável e proveniência.
- **Validation**: obrigatórios presentes; referências existentes; versão suportada.
- **Lifecycle**: draft → validated → accepted; falha permanece explícita.

## Invariants

- Estruturas públicas imutáveis.
- Mesmo input e versão produzem modelo equivalente.
- Coordenadas apenas em layout/canvas, nunca no ADL/modelo semântico.
- Conteúdo externo é não confiável até validação.

