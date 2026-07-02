# `@adl/renderer`

Cria um scene graph imutável e independente de tecnologia gráfica a partir de `DiagramModel`.
`createDiagramScene` exige geometria externa para elementos e grupos, preserva identidades,
gera texto acessível, trunca rótulos previsivelmente e distingue seleção, foco e erro também
por texto. Validação bloqueante gera cena `unavailable`; ausência gera `empty`. O pacote não
calcula layout nem altera modelo, geometria ou estado recebidos.

## Conectores MDL 2.0

O campo `type` de uma relação aceita os valores canônicos da
[especificação MDL 2.0](https://mdlmodel.com/pt-BR):

- `link`: linha contínua com seta aberta em V no destino;
- `always-link`: círculo preenchido na origem e seta aberta em V no destino;
- `specialization`: triângulo vazado no destino;
- `virtual-link`: linha tracejada, sem marcador terminal;
- `composition`: losango preenchido no destino.

Tipos não reconhecidos mantêm compatibilidade visual usando `link`.
