# `@adl/renderer`

Cria um scene graph imutável e independente de tecnologia gráfica a partir de `DiagramModel`.
`createDiagramScene` exige geometria externa para elementos e grupos, preserva identidades,
gera texto acessível, trunca rótulos previsivelmente e distingue seleção, foco e erro também
por texto. Validação bloqueante gera cena `unavailable`; ausência gera `empty`. O pacote não
calcula layout nem altera modelo, geometria ou estado recebidos.
