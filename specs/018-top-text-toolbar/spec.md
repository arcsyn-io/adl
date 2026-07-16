# Feature Specification: Barra superior de edicao de texto

**Feature Branch**: `018-top-text-toolbar`

**Created**: 2026-07-16

**Status**: Draft

**Input**: Componente da barra superior para alterar texto selecionado no canvas: fonte livre para uso, tamanho, cor, alinhamento, negrito, italico, sublinhado, copiar e remover.

## Objective

Permitir que autores alterem rapidamente a apresentacao textual de elementos e rotulos selecionados no canvas pela barra superior, sem editar ADLS manualmente e sem misturar estilo visual com o conteudo semantico do `.adl`.

## Problem

A barra superior ja concentra acoes contextuais do workspace, mas a edicao textual do canvas precisa de um contrato proprio para evitar comportamento ambiguo entre selecao de elemento, selecao de relacao, edicao inline e stylesheet. Autores precisam alterar familia de fonte, tamanho, cor, alinhamento e enfases de texto de modo previsivel, reversivel e persistivel em ADLS ou na fonte visual gravavel.

## Dependencies

- **Requires**: 016, 017
- **Extends**: 009 e 010 ao definir comandos visuais que atualizam texto/estilo e preservam sincronizacao com ADL/ADLS.
- **Parallelization**: Pode avancar em paralelo com partes da UI do workspace, desde que use os contratos de command/history da 017 e o modelo de `TextStyle` da 016.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Alterar estilo de texto de um elemento selecionado (Priority: P1)

Como autor, quero selecionar um elemento no canvas e alterar fonte, tamanho, cor, alinhamento, negrito, italico e sublinhado pela barra superior para ajustar a leitura do diagrama sem abrir o editor ADLS.

**Why this priority**: Texto em elementos e a interacao principal do componente; sem isso a barra nao entrega valor independente.

**Independent Test**: Selecionar um unico elemento, alterar cada controle textual, desfazer/refazer e confirmar que o canvas e o ADLS resolvido refletem exatamente o estilo aplicado.

**Acceptance Scenarios**:

1. **Given** um elemento selecionado, **When** o usuario escolhe uma familia de fonte permitida, **Then** o texto do elemento usa essa familia com fallback livre suportado.
2. **Given** um elemento selecionado, **When** o usuario altera tamanho, cor ou alinhamento, **Then** a mudanca aparece no canvas e cria uma transacao reversivel.
3. **Given** um elemento selecionado, **When** o usuario alterna negrito, italico ou sublinhado, **Then** somente a propriedade correspondente muda e os demais estilos existentes sao preservados.
4. **Given** um elemento selecionado com estilo vindo de regra por tipo, **When** o usuario altera uma propriedade pela barra, **Then** uma regra por ID ou patch equivalente sobrescreve apenas esse elemento.

---

### User Story 2 - Aplicar estilo a selecoes compativeis (Priority: P2)

Como autor, quero aplicar a mesma formatacao a varios elementos ou a um rotulo de relacao quando a selecao permitir, para manter consistencia visual sem repetir operacoes.

**Why this priority**: Multisselecao e rotulos de relacao aumentam a utilidade da barra, mas dependem do fluxo principal de um elemento.

**Independent Test**: Selecionar dois elementos, aplicar tamanho/cor/alinhamento, depois selecionar uma relacao com rotulo e aplicar estilo compativel.

**Acceptance Scenarios**:

1. **Given** varios elementos selecionados, **When** o usuario altera uma propriedade textual, **Then** todos os elementos selecionados recebem a mesma alteracao em uma unica transacao.
2. **Given** uma relacao com rotulo selecionada, **When** o usuario altera tamanho, cor, fonte ou enfase, **Then** o estilo do rotulo da relacao e atualizado sem alterar endpoints, tipo ou direcao.
3. **Given** uma selecao mista com elementos e relacoes, **When** uma propriedade for aplicavel a todos os itens textuais, **Then** a operacao e permitida; quando nao for aplicavel, o controle fica indisponivel e explica o motivo.
4. **Given** valores diferentes na selecao, **When** a barra e exibida, **Then** controles mostram estado misto sem sobrescrever valores ate o usuario escolher um novo valor.

---

### User Story 3 - Copiar e remover a selecao pela barra superior (Priority: P2)

Como autor, quero copiar e remover a selecao pela mesma barra contextual para concluir edicoes comuns sem abrir menu de contexto.

**Why this priority**: Copiar e remover sao acoes contextuais esperadas na barra superior e precisam compartilhar o mesmo historico/selecionamento dos estilos.

**Independent Test**: Selecionar elemento(s) ou relacao, acionar copiar e remover, colar quando aplicavel e desfazer a remocao.

**Acceptance Scenarios**:

1. **Given** um ou mais elementos selecionados, **When** o usuario aciona copiar, **Then** uma copia interna preserva texto, estilo textual e geometria visual compativel para colagem posterior.
2. **Given** uma selecao removivel, **When** o usuario aciona remover, **Then** os itens selecionados sao removidos com tratamento explicito de relacoes dependentes e podem ser restaurados por undo.
3. **Given** uma relacao selecionada, **When** o usuario aciona remover, **Then** somente a relacao e removida e os elementos conectados permanecem.
4. **Given** foco dentro de um editor de texto ou campo de entrada, **When** o usuario usa atalhos de copiar/remover, **Then** a barra nao intercepta a edicao nativa do campo.

---

### User Story 4 - Usar a barra com teclado e telas estreitas (Priority: P3)

Como usuario de teclado, leitor de tela ou viewport estreita, quero acessar as acoes textuais essenciais sem perder contexto da selecao.

**Why this priority**: Acessibilidade e responsividade completam a experiencia, mas podem ser validadas depois do comportamento central.

**Independent Test**: Navegar pelos controles por teclado, aplicar uma alteracao textual, abrir controles agrupados em viewport estreita e verificar nomes/estados acessiveis.

**Acceptance Scenarios**:

1. **Given** um elemento selecionado, **When** o usuario navega por Tab/Shift+Tab, **Then** cada controle tem foco visivel, nome acessivel e estado atual.
2. **Given** viewport estreita, **When** nao houver espaco para todos os controles, **Then** a barra preserva acoes principais e agrupa controles secundarios em menu acessivel.
3. **Given** uma operacao invalida para a selecao atual, **When** o controle estiver desabilitado, **Then** o motivo pode ser descoberto por tooltip ou texto acessivel.

### Edge Cases

- Nenhuma selecao: controles textuais, copiar e remover ficam ocultos ou desabilitados sem alterar estado.
- Selecao com estilos mistos: controles mostram estado misto e so alteram valores apos escolha explicita.
- Fonte indisponivel no ambiente: usa fallback declarado e livre, sem buscar fonte externa.
- Tamanho de fonte fora do intervalo suportado: valor e rejeitado com feedback recuperavel.
- Cor invalida ou contraste insuficiente: valor invalido e rejeitado; contraste baixo gera aviso quando nao impedir a escolha.
- Texto pequeno demais para o elemento: o conteudo semantico nao muda; renderer trata overflow conforme contrato existente.
- Estilo aplicado durante edicao inline nao confirmada: a operacao usa a revisao atual e nao descarta texto em edicao.
- Fonte visual gravavel somente leitura: a barra informa que nao pode persistir e nao apresenta sucesso enganoso.
- Remover elemento com relacoes: o efeito sobre relacoes dependentes e explicito e reversivel.
- Copiar itens com IDs existentes ao colar: novos IDs sao gerados de modo deterministico e sem colisao.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A barra superior MUST exibir controles textuais somente quando a selecao atual contiver pelo menos um alvo textual editavel.
- **FR-002**: A barra MUST permitir escolher familia de fonte a partir de uma lista fechada de fontes livres para uso, sem carregar fontes externas em runtime.
- **FR-003**: A lista inicial de fontes MUST incluir alternativas livres e instalaveis/embutidas por CSS, com fallback generico final `sans-serif`, `serif` ou `monospace`.
- **FR-004**: A barra MUST permitir alterar tamanho de fonte dentro do intervalo suportado por `@adl/stylesheet`.
- **FR-005**: A barra MUST permitir alterar cor do texto usando uma cor solida suportada pelo stylesheet.
- **FR-006**: A barra MUST permitir alinhamento horizontal `left`, `center` e `right` para elementos e rotulos quando aplicavel.
- **FR-007**: A barra MUST permitir alternar `bold`, `italic` e `underline` de modo independente.
- **FR-008**: Mudancas de estilo textual MUST ser enviadas como comandos transacionais, participar de undo/redo e coalescer alteracoes continuas quando apropriado.
- **FR-009**: Mudancas feitas pela barra MUST atualizar a fonte visual gravavel por regra por ID ou patch equivalente, sem inserir propriedades visuais no `.adl` semantico.
- **FR-010**: A operacao MUST preservar propriedades textuais nao alteradas e regras ADLS nao relacionadas.
- **FR-011**: Para multisselecao, a barra MUST aplicar a propriedade escolhida a todos os alvos compativeis em uma unica transacao.
- **FR-012**: Para valores divergentes na selecao, a barra MUST representar estado misto sem escolher silenciosamente um dos valores.
- **FR-013**: Controles nao aplicaveis ao alvo atual MUST ficar indisponiveis e comunicar o motivo.
- **FR-014**: A barra MUST permitir copiar a selecao de elementos e relacoes conforme os contratos do editor visual.
- **FR-015**: A copia de elementos MUST preservar texto, estilo textual resolvido aplicavel e geometria visual suficiente para colagem consistente.
- **FR-016**: A barra MUST permitir remover a selecao removivel e explicitar efeitos sobre relacoes dependentes quando elementos forem removidos.
- **FR-017**: Copiar e remover pela barra MUST compartilhar os mesmos comandos, atalhos, historico e diagnosticos do canvas/menu contextual.
- **FR-018**: A barra MUST nao interceptar atalhos nativos de copiar, apagar, negrito, italico ou sublinhado quando o foco estiver em editor de texto, input ou textarea.
- **FR-019**: Todos os controles MUST ter nome acessivel, foco visivel, estado selecionado/desabilitado correto e area de clique/toque adequada.
- **FR-020**: Em viewport estreita, a barra MUST agrupar controles sem sobrepor nome do diagrama, acoes globais ou canvas.
- **FR-021**: Erros esperados, como valor invalido, selecao obsoleta ou fonte visual somente leitura, MUST retornar resultado estruturado e feedback recuperavel.
- **FR-022**: A implementacao MUST manter regras de dominio e serializacao fora dos componentes React; componentes apenas coletam entrada, exibem estado e disparam comandos.
- **FR-023**: O componente MUST refletir imediatamente o snapshot atual do workspace apos undo, redo, alteracao ADLS manual ou mudanca de selecao.
- **FR-024**: A feature MUST incluir testes unitarios/contratuais para comandos de estilo textual e E2E para a jornada da barra superior.

### Key Entities

- **Text Toolbar State**: estado derivado da selecao atual, contendo alvos textuais, valores comuns, valores mistos e disponibilidade de acoes.
- **Text Style Patch**: alteracao parcial de familia, tamanho, cor, alinhamento, peso, estilo ou decoracao enviada ao workspace.
- **Editable Text Target**: elemento ou rotulo de relacao selecionado que aceita estilo textual.
- **Free Font Option**: opcao de fonte permitida, com nome visivel, familia CSS, licenca livre registrada e fallback generico.
- **Selection Action**: acao contextual de copiar ou remover derivada da selecao atual e executada por comando transacional.

## Scope

- Componente de barra superior contextual para estilo textual, copiar e remover.
- Elementos e rotulos de relacoes ja representados pelo canvas e pelo stylesheet.
- Atualizacao de ADLS/fonte visual gravavel por comandos existentes ou novos do workspace.
- Estados mistos, indisponiveis, responsivos e acessiveis dos controles.

## Out of Scope

- Editor visual completo de stylesheet.
- Carregamento remoto, compra, upload ou incorporacao dinamica de arquivos de fonte.
- Novas propriedades de texto alem das ja previstas pela spec 016.
- Edicao de conteudo textual em si; o texto continua sendo editado por inline editor ou ADL.
- Paletas de tema, estilos de borda, fill, linha, shape, rotacao ou layout automatico.
- Backend, contas, colaboracao, biblioteca de estilos ou cloud.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um usuario altera fonte, tamanho, cor, alinhamento e enfases de um elemento selecionado em ate 45 segundos sem abrir ADLS.
- **SC-002**: 100% das propriedades alteradas pela barra aparecem no canvas e no estilo resolvido correspondente apos a transacao.
- **SC-003**: 100% das alteracoes textuais, copias e remocoes feitas pela barra podem ser desfeitas e refeitas sem divergencia entre canvas e fontes.
- **SC-004**: 100% dos controles da barra sao acessiveis por teclado e possuem nome/estado verificavel por teste E2E.
- **SC-005**: Em uma selecao de 10 elementos, aplicar uma propriedade textual cria uma unica entrada de historico e atualiza todos os alvos compativeis.
- **SC-006**: A lista de fontes inicial contem somente fontes com licenca livre para uso e fallback generico documentado.

## Assumptions

- A barra altera estilo visual, nao o texto semantico.
- A fonte visual gravavel segue a regra da spec 016: bloco embutido quando existir; caso contrario, arquivo ADLS externo quando gravavel.
- Fontes iniciais preferidas: Inter, Source Sans 3, Noto Sans, Roboto Slab e JetBrains Mono, todas tratadas como familias livres documentadas; a implementacao pode reduzir a lista se alguma licenca nao puder ser comprovada no ambiente.
- Quando a fonte escolhida nao estiver disponivel localmente, o fallback generico declarado deve manter o diagrama legivel.
- Relacoes sem rotulo podem receber estilo para rotulo futuro somente se o contrato de renderer aceitar alvo textual vazio; caso contrario, controles textuais ficam indisponiveis.
