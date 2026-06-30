# Data Model: Editor de código ADL

## Ownership

Entidades da feature 008, expostas por web code editor somente quando necessárias.

## EditingDocument

- **Identity**: estável no escopo da feature.
- **Fields**: dados dos requisitos, versão/revisão quando aplicável e proveniência.
- **Validation**: obrigatórios presentes; referências existentes; versão suportada.
- **Lifecycle**: draft → validated → accepted; falha permanece explícita.

## Decoration

- **Identity**: estável no escopo da feature.
- **Fields**: dados dos requisitos, versão/revisão quando aplicável e proveniência.
- **Validation**: obrigatórios presentes; referências existentes; versão suportada.
- **Lifecycle**: draft → validated → accepted; falha permanece explícita.

## EditorRevision

- **Identity**: estável no escopo da feature.
- **Fields**: dados dos requisitos, versão/revisão quando aplicável e proveniência.
- **Validation**: obrigatórios presentes; referências existentes; versão suportada.
- **Lifecycle**: draft → validated → accepted; falha permanece explícita.

## EditHistory

- **Identity**: estável no escopo da feature.
- **Fields**: dados dos requisitos, versão/revisão quando aplicável e proveniência.
- **Validation**: obrigatórios presentes; referências existentes; versão suportada.
- **Lifecycle**: draft → validated → accepted; falha permanece explícita.

## Invariants

- Estruturas públicas imutáveis.
- Mesmo input e versão produzem modelo equivalente.
- Coordenadas apenas em layout/canvas, nunca no ADL/modelo semântico.
- Conteúdo externo é não confiável até validação.

