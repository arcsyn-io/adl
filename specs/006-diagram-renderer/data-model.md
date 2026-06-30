# Data Model: Renderer de diagramas

## Ownership

Entidades da feature 006, expostas por @adl/renderer somente quando necessárias.

## DiagramScene

- **Identity**: estável no escopo da feature.
- **Fields**: dados dos requisitos, versão/revisão quando aplicável e proveniência.
- **Validation**: obrigatórios presentes; referências existentes; versão suportada.
- **Lifecycle**: draft → validated → accepted; falha permanece explícita.

## EntityView

- **Identity**: estável no escopo da feature.
- **Fields**: dados dos requisitos, versão/revisão quando aplicável e proveniência.
- **Validation**: obrigatórios presentes; referências existentes; versão suportada.
- **Lifecycle**: draft → validated → accepted; falha permanece explícita.

## RenderState

- **Identity**: estável no escopo da feature.
- **Fields**: dados dos requisitos, versão/revisão quando aplicável e proveniência.
- **Validation**: obrigatórios presentes; referências existentes; versão suportada.
- **Lifecycle**: draft → validated → accepted; falha permanece explícita.

## GeometryInput

- **Identity**: estável no escopo da feature.
- **Fields**: dados dos requisitos, versão/revisão quando aplicável e proveniência.
- **Validation**: obrigatórios presentes; referências existentes; versão suportada.
- **Lifecycle**: draft → validated → accepted; falha permanece explícita.

## Invariants

- Estruturas públicas imutáveis.
- Mesmo input e versão produzem modelo equivalente.
- Coordenadas apenas em layout/canvas, nunca no ADL/modelo semântico.
- Conteúdo externo é não confiável até validação.

