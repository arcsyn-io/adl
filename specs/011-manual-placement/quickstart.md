# Quickstart Validation: Posicionamento manual

## Prerequisites

Serviço Docker workspace ativo, dependências Linux instaladas e features requeridas disponíveis.

## Flow

1. Executar testes em packages/adl-canvas-state/test.
2. Exercitar User Story 1 com fixtures.
3. Confirmar saída e ausência de mutação fora da feature.
4. Exercitar entrada inválida e preservação do estado.
5. Repetir histórias 2 e 3 independentemente.
6. Executar no container: pnpm lint, pnpm typecheck, pnpm test e pnpm build.
7. Se houver interação visual, executar pnpm test:e2e.

## Expected

Todos os SC passam; contratos são determinísticos; nenhum estado visual entra no .adl; nenhuma operação exige serviço remoto.

