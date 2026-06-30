# Data Model: Layout automático

## Ownership

Entidades da feature 007, expostas por @adl/layout somente quando necessárias.

## LayoutResult

- **Identity**: estável no escopo da feature.
- **Fields**: dados dos requisitos, versão/revisão quando aplicável e proveniência.
- **Validation**: obrigatórios presentes; referências existentes; versão suportada.
- **Lifecycle**: draft → validated → accepted; falha permanece explícita.

## LayoutOptions

- **Identity**: estável no escopo da feature.
- **Fields**: dados dos requisitos, versão/revisão quando aplicável e proveniência.
- **Validation**: obrigatórios presentes; referências existentes; versão suportada.
- **Lifecycle**: draft → validated → accepted; falha permanece explícita.

## NodeGeometry

- **Identity**: estável no escopo da feature.
- **Fields**: dados dos requisitos, versão/revisão quando aplicável e proveniência.
- **Validation**: obrigatórios presentes; referências existentes; versão suportada.
- **Lifecycle**: draft → validated → accepted; falha permanece explícita.

## EdgeRoute

- **Identity**: estável no escopo da feature.
- **Fields**: dados dos requisitos, versão/revisão quando aplicável e proveniência.
- **Validation**: obrigatórios presentes; referências existentes; versão suportada.
- **Lifecycle**: draft → validated → accepted; falha permanece explícita.

## Invariants

- Estruturas públicas imutáveis.
- Mesmo input e versão produzem modelo equivalente.
- Coordenadas apenas em layout/canvas, nunca no ADL/modelo semântico.
- Conteúdo externo é não confiável até validação.

