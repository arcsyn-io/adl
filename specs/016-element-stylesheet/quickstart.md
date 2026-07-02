# Quickstart validation: Stylesheet visual da ADL

## Prerequisites

- Serviço Docker `workspace` em execução.
- Dependências do monorepo já instaladas nos volumes Linux.

## Scenario 1 — external stylesheet

1. Criar uma fixture `.adl` com `stylesheet "./theme.adls"` e dois elementos `service`.
2. Criar `theme.adls` conforme [stylesheet-language.md](./contracts/stylesheet-language.md), aplicando elipse, dimensões e gradiente de preenchimento ao tipo.
3. Abrir a fixture no editor ou executar o teste de integração correspondente.
4. Verificar que ambos os serviços usam o estilo, que o layout respeita as dimensões e que o modelo semântico é idêntico ao obtido sem stylesheet.
5. Mover um serviço, reabrir o documento e verificar que `x/y` foram atualizados no stylesheet e restaurados.
6. Aplicar `*` para tipografia, `element *` para borda e confirmar que regras por tipo/ID prevalecem.

## Scenario 2 — ID and embedded precedence

1. Adicionar regra externa por ID para um serviço.
2. Adicionar bloco embutido com outra cor para o mesmo ID.
3. Verificar que somente esse elemento recebe a exceção e que a propriedade embutida vence; propriedades externas não conflitantes permanecem.

## Scenario 3 — relation styling and diagnostics

1. Aplicar gradiente/espessura de linha e pintura sólida/tamanho do rótulo por tipo de relação.
2. Incluir um seletor sem correspondência e um valor de cor inválido em fixtures separadas.
3. Verificar o estilo da relação, o aviso para seletor órfão e o erro localizado para a cor, sem invalidar o `DiagramModel`.
4. Verificar alinhamento, fallback de família, negrito, itálico e sublinhado no texto do elemento e no rótulo da relação.
5. Verificar `cylinder`, `user` e `parallelogram` nas duas orientações e com rotação, incluindo conexões e seleção.

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

## Resultado da implementação

Validado em 2026-07-02 no serviço `workspace`: os cenários externo, cascata por
tipo/ID, relações/diagnósticos e fallback por referência ausente estão cobertos
por testes de pacote e pipeline; o fluxo embedded está coberto por E2E. O teste
de 100 elementos e 200 relações permaneceu abaixo do orçamento de 100 ms.
`lint`, `typecheck`, `test`, `build` e `test:e2e` foram aprovados.
