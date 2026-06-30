# Data Model: Validação semântica e diagnósticos

## Ownership

Entidades da feature 004, expostas por @adl/diagnostics somente quando necessárias.

## Diagnostic

- **Identity**: estável no escopo da feature.
- **Fields**: dados dos requisitos, versão/revisão quando aplicável e proveniência.
- **Validation**: obrigatórios presentes; referências existentes; versão suportada.
- **Lifecycle**: draft → validated → accepted; falha permanece explícita.

## RelatedLocation

- **Identity**: estável no escopo da feature.
- **Fields**: dados dos requisitos, versão/revisão quando aplicável e proveniência.
- **Validation**: obrigatórios presentes; referências existentes; versão suportada.
- **Lifecycle**: draft → validated → accepted; falha permanece explícita.

## ValidationResult

- **Identity**: estável no escopo da feature.
- **Fields**: dados dos requisitos, versão/revisão quando aplicável e proveniência.
- **Validation**: obrigatórios presentes; referências existentes; versão suportada.
- **Lifecycle**: draft → validated → accepted; falha permanece explícita.

## Rule

- **Identity**: estável no escopo da feature.
- **Fields**: dados dos requisitos, versão/revisão quando aplicável e proveniência.
- **Validation**: obrigatórios presentes; referências existentes; versão suportada.
- **Lifecycle**: draft → validated → accepted; falha permanece explícita.

## Invariants

- Estruturas públicas imutáveis.
- Mesmo input e versão produzem modelo equivalente.
- Coordenadas apenas em layout/canvas, nunca no ADL/modelo semântico.
- Conteúdo externo é não confiável até validação.

