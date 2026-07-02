# Quickstart validation: Stylesheet visual da ADL

## Prerequisites

- Serviço Docker `workspace` em execução.
- Dependências do monorepo já instaladas nos volumes Linux.

## Scenario 1 — external stylesheet

1. Criar uma fixture `.adl` com `stylesheet "./theme.adls"` e dois elementos `service`.
2. Criar `theme.adls` conforme [stylesheet-language.md](./contracts/stylesheet-language.md), aplicando elipse e dimensões ao tipo.
3. Abrir a fixture no editor ou executar o teste de integração correspondente.
4. Verificar que ambos os serviços usam o estilo, que o layout respeita as dimensões e que o modelo semântico é idêntico ao obtido sem stylesheet.

## Scenario 2 — ID and embedded precedence

1. Adicionar regra externa por ID para um serviço.
2. Adicionar bloco embutido com outra cor para o mesmo ID.
3. Verificar que somente esse elemento recebe a exceção e que a propriedade embutida vence; propriedades externas não conflitantes permanecem.

## Scenario 3 — relation styling and diagnostics

1. Aplicar cor/espessura de linha e cor/tamanho do rótulo por tipo de relação.
2. Incluir um seletor sem correspondência e um valor de cor inválido em fixtures separadas.
3. Verificar o estilo da relação, o aviso para seletor órfão e o erro localizado para a cor, sem invalidar o `DiagramModel`.

## Scenario 4 — missing external file

1. Referenciar um `.adls` inexistente.
2. Verificar diagnóstico na referência, `completeness: fallback` e apresentação com padrão explícito, sem estilo obsoleto.

## Required validation commands

Executar no serviço Docker:

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Os resultados esperados são todos os comandos aprovados e os quatro cenários acima cobertos. O orçamento de desempenho é no máximo 100 ms adicionais para resolver/aplicar estilos em 100 elementos e 200 relações.
