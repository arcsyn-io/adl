# Arquitetura do ADL

Este documento define os limites arquiteturais que devem ser preservados durante qualquer implementação.

## Pipeline principal

O fluxo de dados deve permanecer explícito e unidirecional:

`texto .adl → parser → AST → modelo semântico → compilador → layout → renderizadores`

O fluxo visual segue em paralelo: `referência/bloco → @adl/stylesheet → estilo
resolvido → layout/renderizadores`. O `DiagramModel` não contém estilos. O
carregamento de arquivos é fornecido pelo consumidor; o pacote de stylesheet
permanece puro e independente de filesystem, browser e React.

Cada etapa deve expor contratos próprios e não depender de detalhes internos das etapas posteriores.

## Responsabilidades

- **Linguagem e gramática:** definem apenas a sintaxe e a estrutura válida do ADL.
- **Parser e AST:** transformam texto em uma representação sintática, preservando informações necessárias para diagnósticos.
- **Modelo semântico:** representa conceitos do domínio independentemente da interface e da sintaxe concreta.
- **Compilador:** converte a AST no modelo semântico e produz diagnósticos determinísticos.
- **Layout:** calcula posições automáticas a partir do modelo semântico, sem modificar o texto ADL.
- **Renderizadores:** transformam modelo e layout em uma representação visual; não interpretam regras da linguagem.
- **Editor web:** coordena entrada, comandos e apresentação; componentes React não contêm regras de negócio.

## Direção das dependências

- Camadas de domínio não importam React, Monaco, React Flow ou APIs do navegador.
- Parser e AST não dependem de layout ou renderização.
- O modelo semântico não depende da sintaxe concreta do arquivo `.adl`.
- Layout depende de contratos do modelo, não de componentes visuais.
- React Flow e ELK devem permanecer atrás de adaptadores quando seus tipos vazarem para o domínio.
- Integrações com Monaco ficam na camada do editor.

## Estado e persistência

- O workspace transacional coordena ADL, ADLS, geometria, conversa e revisão; React consome snapshots e despacha comandos, sem duplicar AST ou modelo semântico.
- Integrações de canvas ficam atrás de adapters próprios. O scene graph interativo e a `ExportScene` são projeções distintas da mesma revisão; a exportação nunca captura controles do editor.
- Persistência usa um envelope versionado e correlacionado em uma única escrita local. Histórico e gestos ativos permanecem efêmeros.

- Defina uma única fonte canônica para cada informação; derive representações secundárias sempre que possível.
- O texto `.adl` é a fonte da definição textual do diagrama.
- Coordenadas manuais, seleção, viewport e preferências de interface permanecem fora do texto `.adl`.
- Não duplique AST, modelo semântico ou estado visual sem uma estratégia explícita de sincronização.
- Persistência deve ser local por padrão; backend, banco de dados e serviços cloud exigem decisão explícita.

## Evolução

- Alterações na gramática devem considerar compatibilidade, diagnósticos e serialização.
- Novas abstrações devem corresponder a uma responsabilidade identificável, não apenas reduzir linhas de código.
- Dependências entre pacotes devem respeitar o pipeline e evitar ciclos.
- Decisões arquiteturais relevantes devem ser registradas na especificação da feature ou em documentação própria.
