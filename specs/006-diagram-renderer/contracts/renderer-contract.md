# Contract: Renderer de diagramas

## Purpose

Superfície observável de @adl/renderer para consumidores internos; entradas e resultados são normativos para testes.

## Inputs

- Dados versionados compatíveis com: @adl/semantic, @adl/diagnostics.
- Revisão quando o resultado puder ficar obsoleto.
- Opções explícitas com defaults documentados.

## Success

- Resultado ok contendo DiagramScene, EntityView, RenderState, GeometryInput conforme aplicável.
- Saída determinística e correlacionável ao documento.

## Failure

- Resultado error com código estável, mensagem e contexto seguro.
- Nenhuma saída parcial apresentada como sucesso.
- Falha não destrói estado anterior utilizável.

## Invariants

1. Sem rede ou backend.
2. Domínio independente de React.
3. Coordenadas fora do ADL/modelo semântico.
4. Dados externos validados.
5. Mudança incompatível exige nova versão.

## Contract tests

Caso nominal por história, classes de erro, repetição determinística, limite SC e compatibilidade das dependências.

