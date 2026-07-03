# Feature Specification: Editor Web de Diagramas de Arquitetura

**Feature Branch**: `feat/home-page-layout`

**Created**: 2026-07-02

**Status**: Draft

**Input**: Aplicação web responsiva para criar e editar um diagrama de arquitetura por IA, canvas visual, ADL e ADLS, com persistência local, histórico compartilhado e exportação.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Criar e editar o diagrama visualmente (Priority: P1)

Como pessoa responsável por arquitetura, quero visualizar um exemplo útil e manipular elementos e conexões diretamente no canvas para representar a arquitetura sem depender da edição textual.

**Why this priority**: O canvas é a superfície principal do produto e precisa entregar valor mesmo sem IA ou edição de código.

**Independent Test**: Abrir a aplicação pela primeira vez, manipular o diagrama de pagamentos, criar e editar uma conexão, desfazer as operações e verificar o resultado visual.

**Acceptance Scenarios**:

1. **Given** uma primeira execução sem estado salvo, **When** a aplicação termina de carregar, **Then** o canvas apresenta o fluxo assíncrono de pagamentos completo, organizado e enquadrado.
2. **Given** um elemento no canvas, **When** o usuário o seleciona, move e redimensiona, **Then** o canvas mostra a nova geometria, handles apenas durante a seleção e uma única entrada de histórico por operação concluída.
3. **Given** um elemento selecionado, **When** o usuário edita seu texto com duplo clique, altera a formatação, duplica ou exclui, **Then** a alteração aparece imediatamente e pode ser desfeita.
4. **Given** dois elementos, **When** o usuário arrasta uma conexão de qualquer lado do primeiro até o segundo, **Then** uma conexão ortogonal é criada com pontos de ancoragem adequados e se reajusta quando os elementos se movem.
5. **Given** uma conexão, **When** o usuário a seleciona, edita o texto ou altera a direção da seta, **Then** o resultado visual e a representação do documento permanecem sincronizados.

---

### User Story 2 - Editar ADL e ADLS junto ao canvas (Priority: P1)

Como usuário avançado, quero editar diretamente o documento ADL e o stylesheet ADLS para ter controle textual preciso sem perder a visualização do diagrama.

**Why this priority**: ADL e ADLS são fontes canônicas do conteúdo semântico e da aparência; sua sincronização é indispensável para uma ferramenta funcional.

**Independent Test**: Alternar entre as abas ADL e ADLS, fazer alterações válidas e inválidas e verificar atualização do canvas, diagnósticos e preservação da última visualização válida.

**Acceptance Scenarios**:

1. **Given** o modo ADL aberto, **When** o usuário altera elementos, relações ou textos com conteúdo válido, **Then** o canvas é atualizado após uma curta estabilização da digitação.
2. **Given** uma alteração ADL inválida, **When** o documento não pode ser interpretado, **Then** o editor destaca os erros e o canvas preserva a última revisão válida.
3. **Given** o modo ADLS aberto, **When** o usuário altera uma propriedade visual válida, **Then** o canvas reflete a alteração imediatamente.
4. **Given** uma alteração ADLS inválida, **When** a validação falha, **Then** o editor mostra o diagnóstico sem substituir a última aparência válida.
5. **Given** uma alteração semântica feita no canvas, **When** a operação termina, **Then** o ADL correspondente é atualizado; alterações puramente visuais ou geométricas permanecem no ADLS ou no estado visual, sem inserir coordenadas manuais no `.adl`.

---

### User Story 3 - Alterar o diagrama por conversa com IA (Priority: P1)

Como usuário, quero descrever mudanças em linguagem natural para gerar ou modificar o diagrama sem precisar conhecer toda a sintaxe da linguagem.

**Why this priority**: A conversa é a principal simplificação proposta para a criação de arquiteturas e deve operar sobre o mesmo documento das demais superfícies.

**Independent Test**: Enviar um comando simulado como “Adicione um cache entre o API Gateway e o Serviço de Pagamentos”, observar estado de geração, mensagem aplicada, alteração no diagrama e desfazer a mudança globalmente.

**Acceptance Scenarios**:

1. **Given** o modo IA aberto, **When** o usuário envia um comando pelo botão ou atalho, **Then** a mensagem entra no histórico, um estado de geração é exibido e o campo permanece disponível após a conclusão.
2. **Given** um comando reconhecido, **When** a geração simulada termina, **Then** a alteração é aplicada ao documento, indicada na conversa e registrada no histórico global de desfazer/refazer.
3. **Given** uma falha na geração, **When** a operação termina com erro, **Then** nenhuma alteração parcial é aplicada e a conversa exibe um estado de erro recuperável.
4. **Given** um histórico de conversa existente, **When** a página é recarregada, **Then** as mensagens e indicações de alterações aplicadas são restauradas.

---

### User Story 4 - Retomar trabalho e desfazer mudanças (Priority: P2)

Como usuário, quero que meu diagrama seja salvo automaticamente e que qualquer alteração relevante possa ser desfeita ou refeita para trabalhar com segurança.

**Why this priority**: Persistência e histórico reduzem perda de trabalho e tornam viáveis as diferentes formas de edição sobre um único documento.

**Independent Test**: Executar alterações por canvas, ADL, ADLS e IA, desfazer/refazer entre superfícies, recarregar a página e comparar todo o estado restaurado.

**Acceptance Scenarios**:

1. **Given** alterações no documento ou preferências, **When** a interação cessa por até um segundo, **Then** o estado é salvo automaticamente sem bloquear o uso.
2. **Given** operações concluídas por superfícies diferentes, **When** o usuário desfaz e refaz por botão ou atalho, **Then** a ordem global é respeitada e todas as superfícies são atualizadas.
3. **Given** um drag ou resize contínuo, **When** o usuário encerra o gesto, **Then** apenas o resultado final cria uma entrada no histórico.
4. **Given** estado salvo, **When** a aplicação é reaberta, **Then** documento, stylesheet, geometria, conversa e preferências retornam ao último estado consistente.

---

### User Story 5 - Criar um novo diagrama e exportar (Priority: P2)

Como usuário, quero iniciar um diagrama vazio e exportar o trabalho atual para compartilhar a imagem ou continuar usando os arquivos de origem.

**Why this priority**: Novo e exportação completam o ciclo de trabalho de um diagrama local, embora não sejam necessários para a edição básica.

**Independent Test**: Exportar PNG, ADL e ADLS; verificar conteúdo e nomes; depois usar “Novo”, confirmar a limpeza e validar quais preferências permanecem.

**Acceptance Scenarios**:

1. **Given** um diagrama editado, **When** o usuário exporta PNG, **Then** a imagem contém todo o conteúdo ocupado pelo diagrama com fidelidade, sem grade, seleção ou controles da interface.
2. **Given** um diagrama chamado “Payments Flow”, **When** o usuário exporta ADL e ADLS, **Then** os arquivos são baixados como `payments-flow.adl` e `payments-flow.adls` com o conteúdo atual.
3. **Given** alterações não descartadas, **When** o usuário aciona “Novo”, **Then** uma confirmação é exibida antes de limpar documento, stylesheet, conversa e histórico.
4. **Given** a criação confirmada, **When** o novo diagrama é aberto, **Then** o canvas fica vazio e preferências de tema, painel, grade, snap e guias são mantidas.

---

### User Story 6 - Personalizar o workspace (Priority: P2)

Como usuário, quero ajustar painel, tema, grade, snap e guias para adaptar a área de trabalho ao meu dispositivo e à tarefa atual.

**Why this priority**: Essas preferências tornam a interface densa utilizável em diferentes telas e condições visuais.

**Independent Test**: Redimensionar/recolher o painel, alternar temas e controles do canvas, recarregar a página e verificar restauração das preferências.

**Acceptance Scenarios**:

1. **Given** uma tela desktop, **When** o usuário arrasta o divisor do painel, **Then** a largura respeita limites e o canvas ocupa imediatamente o espaço restante.
2. **Given** o painel aberto, **When** o usuário o recolhe e posteriormente o reabre, **Then** a última largura expandida é restaurada.
3. **Given** o seletor de tema, **When** o usuário escolhe sistema, claro ou escuro, **Then** toda a interface muda de forma coerente e a escolha é preservada.
4. **Given** os controles da barra flutuante, **When** grade, snap ou guias são alternados, **Then** cada recurso muda independentemente e sua preferência é preservada.

---

### User Story 7 - Usar em telas menores e com tecnologias assistivas (Priority: P3)

Como usuário em tablet, celular ou utilizando teclado/leitor de tela, quero acessar as ações essenciais sem que o painel reduza permanentemente o canvas.

**Why this priority**: A experiência principal deve permanecer utilizável fora do desktop e atender requisitos básicos de inclusão.

**Independent Test**: Validar os fluxos essenciais em viewport móvel, por teclado e com a árvore de acessibilidade, incluindo drawer, foco, labels e gestos de navegação.

**Acceptance Scenarios**:

1. **Given** uma tela que não comporta painel e canvas lado a lado, **When** IA, ADL ou ADLS é aberto, **Then** o conteúdo aparece em drawer sobreposto e pode ocupar quase toda a tela sem redimensionar permanentemente o canvas.
2. **Given** um dispositivo sensível ao toque, **When** o usuário usa pan ou gesto de pinça, **Then** o viewport do diagrama responde sem acionar ações conflitantes.
3. **Given** navegação somente por teclado, **When** o usuário percorre ações principais e elementos selecionáveis, **Then** a ordem é lógica, o foco é visível e as operações essenciais são acionáveis.
4. **Given** uso com leitor de tela, **When** o usuário navega pelas regiões e controles, **Then** nomes, estados, erros e seleção são comunicados sem depender apenas de cor.

### Edge Cases

- O que acontece quando o estado local está ausente, corrompido ou pertence a uma versão incompatível do documento?
- Como o sistema se comporta quando o armazenamento local está indisponível ou sem espaço?
- Como edições ADL ou ADLS inválidas afetam a última revisão válida renderizada e o histórico?
- O que acontece quando uma alteração por IA entra em conflito com a revisão atual do documento?
- Como o canvas trata conexões sem destino, destinos removidos e referências inexistentes?
- Como copiar e colar se comporta quando os identificadores já existem?
- Como o roteamento se comporta quando não há caminho ortogonal sem cruzamentos?
- Como a exportação enquadra diagramas vazios, muito grandes ou com elementos em coordenadas negativas?
- O que acontece ao acionar “Novo” durante geração da IA, drag, resize ou edição textual não estabilizada?
- Como o nome vazio, composto apenas por espaços ou com caracteres não permitidos vira nome de arquivo?
- Como o tema sistema reage a uma mudança de `prefers-color-scheme` enquanto a aplicação está aberta?
- Como o drawer e menus se comportam com teclado virtual, rotação da tela ou viewport muito estreita?

## Requirements *(mandatory)*

### Functional Requirements

#### Estrutura e navegação

- **FR-001**: A aplicação MUST ocupar toda a viewport sem scroll da página e manter uma barra superior fixa, um painel de ferramentas e um canvas dominante.
- **FR-002**: Em desktop, o painel MUST iniciar com aproximadamente 30% da largura, respeitando mínimo de 280 px e máximo de 520 px.
- **FR-003**: O painel MUST ser redimensionável por divisor arrastável, recolhível e restaurável à última largura expandida.
- **FR-004**: O painel MUST oferecer abas compactas para IA, ADL e ADLS, com apenas um modo ativo por vez.
- **FR-005**: A barra superior MUST mostrar identificação do produto, nome editável do diagrama, Novo, desfazer, refazer, exportar, tema, ações adicionais e controle do painel.
- **FR-006**: Quando um elemento estiver selecionado, a barra superior MUST mostrar tamanho e alinhamento do texto, cor, negrito, itálico, sublinhado, duplicar e excluir.
- **FR-007**: Quando uma conexão estiver selecionada, a barra superior MUST mostrar direção da seta, duplicar quando permitido e excluir.
- **FR-008**: Quando não houver seleção, ações contextuais de elemento ou conexão MUST permanecer ocultas.
- **FR-009**: O nome do diagrama MUST ser editável diretamente e MUST participar da persistência e da nomeação dos arquivos exportados.
- **FR-010**: A aparência MUST usar hierarquia técnica e minimalista, paleta neutra, uma cor de destaque, bordas discretas, pouco arredondamento e densidade funcional legível, sem copiar marcas da referência.

#### Modo IA

- **FR-011**: O modo IA MUST apresentar histórico cronológico que diferencie mensagens do usuário, respostas do assistente e resumos de mudanças aplicadas.
- **FR-012**: O campo de comando MUST permanecer fixado na parte inferior do painel e permitir envio por botão e por `Ctrl/Cmd + Enter`.
- **FR-013**: Durante uma solicitação, a interface MUST mostrar estado de geração e impedir envios duplicados involuntários.
- **FR-014**: A integração desta feature MUST usar respostas simuladas determinísticas, incluindo pelo menos o comando de adição de cache, e MUST manter um contrato substituível por um provedor real posterior.
- **FR-015**: Uma resposta bem-sucedida MUST aplicar a alteração ao mesmo documento usado pelo canvas e pelos editores.
- **FR-016**: Toda alteração aplicada pela IA MUST criar uma operação atômica no histórico global.
- **FR-017**: Uma falha da IA MUST ser exibida na conversa, preservar o documento anterior e permitir nova tentativa.
- **FR-018**: O histórico da conversa MUST ser salvo e restaurado junto ao diagrama atual.

#### Editores ADL e ADLS

- **FR-019**: O editor ADL MUST oferecer numeração de linhas, destaque de sintaxe, indentação, linha ativa, diagnósticos e atalhos tradicionais de edição.
- **FR-020**: Edições ADL válidas MUST atualizar elementos, relações, grupos e textos do canvas após no máximo um segundo sem nova digitação.
- **FR-021**: Edições ADL inválidas MUST exibir erros com localização e mensagem compreensível sem substituir a última revisão válida renderizada.
- **FR-022**: Alterações semânticas feitas no canvas MUST atualizar o documento ADL correspondente.
- **FR-023**: Coordenadas manuais, viewport e seleção MUST permanecer fora do texto `.adl`; geometria e preferências visuais MUST ser mantidas no estado visual ou no ADLS conforme seus contratos.
- **FR-024**: O editor ADLS MUST oferecer a mesma qualidade de edição e diagnóstico do editor ADL para propriedades visuais suportadas.
- **FR-025**: O ADLS MUST permitir definir cores, tipografia, tamanhos, bordas, espaçamentos, estilos de elementos e estilos fechados de conexões.
- **FR-026**: Edições ADLS válidas MUST atualizar o canvas perceptivelmente em até 300 ms após estabilização da digitação.
- **FR-027**: Edições ADLS inválidas MUST preservar a última aparência válida e indicar o erro sem perda do texto digitado.

#### Canvas e elementos

- **FR-028**: O canvas MUST ocupar todo o espaço restante e permitir pan, zoom, ajuste à tela e centralização.
- **FR-029**: O canvas MUST permitir seleção simples e múltipla com indicação que combine cor de destaque e sinal visual adicional.
- **FR-030**: Elementos MUST permitir mover, redimensionar, duplicar, excluir, copiar, colar e editar texto por duplo clique.
- **FR-031**: Handles de redimensionamento MUST aparecer somente nos elementos selecionados.
- **FR-032**: Operações de elemento MUST ser acessíveis por mouse, toque quando aplicável e atalhos de teclado.
- **FR-033**: O canvas MUST oferecer menu contextual com ações adequadas ao alvo e à seleção atual.
- **FR-034**: A grade quadriculada MUST ser discreta, ativável independentemente e usada como referência visual.
- **FR-035**: O snap à grade MUST ser ativável independentemente da visibilidade da grade.
- **FR-036**: Guias de alinhamento MUST ser ativáveis independentemente de grade e snap.
- **FR-037**: Durante movimentação e redimensionamento, as guias MUST indicar alinhamento por centros e extremidades, distâncias equivalentes e espaçamento uniforme.
- **FR-038**: A cor de seleção, grade, guias e relações MUST manter contraste adequado nos temas claro e escuro.
- **FR-039**: A barra flutuante inferior MUST incluir seleção, zoom menor, percentual, zoom maior, ajustar à tela, centralizar, grade, snap e guias.
- **FR-040**: A barra flutuante MUST permanecer centralizada, discreta e posicionada de modo a não impedir a manipulação do conteúdo principal.
- **FR-041**: O canvas MUST suportar desfazer e refazer, atalhos de exclusão, copiar, colar e duplicar sem conflito com os editores de texto.

#### Conexões

- **FR-042**: O usuário MUST poder iniciar uma conexão a partir de qualquer lado de um elemento e concluí-la em qualquer lado de outro elemento permitido.
- **FR-043**: Conexões MUST usar roteamento ortogonal e ajustar automaticamente origem, destino e caminho quando elementos se moverem ou redimensionarem.
- **FR-044**: O roteamento MUST escolher pontos adequados e reduzir cruzamentos desnecessários, aceitando o menor caminho válido quando não houver solução sem cruzamento.
- **FR-045**: Conexões MUST permitir seleção, exclusão, direção de seta e duplicação apenas quando a linguagem permitir uma relação equivalente.
- **FR-046**: O texto da conexão MUST aparecer centralizado ou próximo ao segmento principal e permitir edição por duplo clique.
- **FR-047**: Alterar a direção da seta MUST atualizar a representação semântica correspondente e ser reversível pelo histórico.
- **FR-048**: A interface MUST limitar estilos de linha aos formatos fechados aceitos pela linguagem ADL, sem edição livre do traçado.

#### Diagrama inicial

- **FR-049**: Na primeira execução, a aplicação MUST carregar Cliente, API Gateway, Serviço de Pagamentos, Fila, Worker, Banco de Dados e Sistema Externo.
- **FR-050**: O exemplo inicial MUST representar Cliente solicitando, API Gateway encaminhando, Serviço de Pagamentos registrando e publicando, Worker consumindo, persistindo e notificando.
- **FR-051**: As conexões iniciais MUST usar os textos curtos `solicita`, `encaminha`, `publica`, `consome`, `persiste` e `notifica`.
- **FR-052**: O exemplo MUST iniciar organizado, com grade visível e conteúdo enquadrado, demonstrando elementos, seleção e textos de conexão.

#### Persistência e histórico

- **FR-053**: A aplicação MUST manter localmente um único diagrama por vez, sem exigir conta, backend ou conexão de rede após o carregamento.
- **FR-054**: Documento ADL, ADLS, geometria, conexões, nome, conversa, tema, painel, grade, snap e guias MUST ser salvos automaticamente em até um segundo após a última alteração.
- **FR-055**: Ao recarregar, a aplicação MUST restaurar o último estado consistente e mostrar um estado de loading até finalizar a leitura local.
- **FR-056**: Estado local ausente, corrompido ou incompatível MUST produzir recuperação segura para o exemplo inicial, com aviso não destrutivo quando houver dados ignorados.
- **FR-057**: O histórico global MUST incluir movimentação, resize, texto, criação/remoção, conexões, IA, ADL e ADLS em ordem única.
- **FR-058**: Drag, resize e digitação contínua MUST ser consolidados em operações significativas, evitando entrada por pixel ou tecla quando fizerem parte do mesmo gesto.
- **FR-059**: Ações de desfazer e refazer MUST estar disponíveis por botões e `Ctrl/Cmd + Z`, `Ctrl/Cmd + Shift + Z` e `Ctrl/Cmd + Y` onde suportado.
- **FR-060**: Cada aplicação de undo ou redo MUST atualizar de forma consistente canvas, ADL, ADLS, seleção aplicável e persistência.

#### Novo e exportação

- **FR-061**: A ação Novo MUST solicitar confirmação quando houver alterações desde a criação ou restauração do diagrama atual.
- **FR-062**: Confirmar Novo MUST limpar conteúdo ADL, ADLS, canvas, conversa e histórico, mantendo preferências de tema, painel, grade, snap e guias.
- **FR-063**: O menu de exportação MUST oferecer PNG, ADL e ADLS como ações distintas e identificáveis.
- **FR-064**: O PNG MUST incluir toda a área ocupada pelo diagrama, inclusive conteúdo fora da viewport, preservando posições, dimensões, textos, cores, conexões e setas.
- **FR-065**: O PNG MUST excluir grade, handles, seleção, menus, barras, painel e controles do canvas.
- **FR-066**: As exportações ADL e ADLS MUST refletir a revisão atual e usar um slug do nome do diagrama, com fallback `diagram` quando o nome estiver vazio.
- **FR-067**: A exportação MUST informar erro recuperável quando o arquivo não puder ser gerado ou baixado.

#### Temas, responsividade e acessibilidade

- **FR-068**: A aplicação MUST oferecer temas sistema, claro e escuro, com a escolha visível na barra superior e preservada entre sessões.
- **FR-069**: O tema sistema MUST acompanhar mudanças da preferência do dispositivo enquanto estiver selecionado.
- **FR-070**: Em telas que não comportem painel e canvas lado a lado, IA, ADL e ADLS MUST abrir em drawer sobreposto, sem reduzir permanentemente o canvas.
- **FR-071**: Em tablet e mobile, a barra superior MUST priorizar ações essenciais e agrupar ações secundárias em menus acessíveis.
- **FR-072**: Em dispositivos de toque, o canvas MUST permitir pan e pinch-to-zoom, e o drawer MUST poder ocupar quase toda a tela.
- **FR-073**: A aplicação MUST oferecer navegação por teclado, foco visível, labels, tooltips e anúncios acessíveis para ações, seleção, geração e erros.
- **FR-074**: Texto, controles, bordas informativas, seleção, código, conexões e tooltips MUST atender contraste WCAG AA e não depender apenas de cor.
- **FR-075**: Alvos interativos MUST possuir área adequada para toque e não sobrepor controles essenciais em viewports suportadas.
- **FR-076**: A interface MUST representar os estados de diagrama carregado, elemento selecionado, conexão selecionada, geração e erro da IA, erro ADL, erro ADLS, canvas vazio, painel recolhido, drawer aberto, exportação, confirmação de Novo e loading inicial.

### Key Entities

- **Diagram Document**: Representa o único diagrama atual, incluindo nome, revisão semântica, stylesheet associado e metadados de alteração.
- **ADL Source**: Texto canônico para elementos, relações, grupos e demais conceitos semânticos do diagrama.
- **ADLS Source**: Texto canônico para regras visuais suportadas, incluindo estilo e dimensões quando previsto pela linguagem.
- **Diagram Element**: Entidade visual identificável com tipo, texto, estado semântico e geometria visual separada do ADL.
- **Diagram Connection**: Relação tipada entre elementos, com origem, destino, direção, texto e estilo permitido pela linguagem.
- **Selection**: Conjunto atual de elementos ou conexão selecionada, separado do documento persistido.
- **Viewport**: Estado de pan e zoom do canvas, independente do conteúdo ADL.
- **Placement State**: Posições e dimensões manuais dos elementos, mantidas fora do texto ADL.
- **Command**: Alteração reversível e atômica originada no canvas, IA, ADL ou ADLS.
- **History**: Sequência ordenada de comandos concluídos com posição atual para undo e redo.
- **Conversation**: Mensagens do usuário e assistente, estados de geração, falhas e referências às mudanças aplicadas.
- **Workspace Preferences**: Tema, largura/recolhimento do painel e estados de grade, snap e guias.
- **Export Artifact**: Resultado PNG, ADL ou ADLS derivado da mesma revisão atual do diagrama.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em testes de primeira execução, 100% dos sete elementos e seis textos de conexão esperados aparecem organizados e utilizáveis sem configuração manual.
- **SC-002**: Usuários conseguem concluir mover, redimensionar, editar texto e criar uma conexão em até 3 minutos usando apenas a interface visual.
- **SC-003**: 100% das alterações válidas realizadas por canvas, IA, ADL ou ADLS aparecem nas demais representações aplicáveis sem recarregar a página.
- **SC-004**: Edições ADL válidas tornam-se visíveis no canvas em até 1 segundo e edições ADLS válidas em até 300 ms após estabilização da entrada.
- **SC-005**: Após recarregar, 100% dos campos persistidos são restaurados em até 2 segundos para diagramas de até 200 elementos e 400 conexões.
- **SC-006**: Sequências de pelo menos 50 operações mistas podem ser totalmente desfeitas e refeitas sem divergência entre canvas, ADL e ADLS.
- **SC-007**: Exportações PNG de diagramas com conteúdo fora da viewport incluem 100% dos elementos e excluem 100% dos artefatos de edição definidos.
- **SC-008**: Exportações ADL e ADLS reproduzem exatamente a revisão atual e usam nomes de arquivo derivados corretamente em todos os casos de nome válidos e fallback.
- **SC-009**: Os 17 critérios de aceite podem ser concluídos em desktop e os fluxos essenciais de visualizar, navegar, editar fonte e exportar podem ser concluídos em tablet e mobile.
- **SC-010**: Todas as ações principais são alcançáveis por teclado, possuem nome acessível e foco visível, e todos os pares de contraste relevantes atendem WCAG AA.
- **SC-011**: Em avaliação visual, a aplicação mantém canvas dominante, hierarquia semelhante à referência e consistência completa nos temas claro e escuro sem copiar identidade proprietária.
- **SC-012**: Em 95% das interações locais de seleção, movimento, painel e controles do canvas, o feedback visual começa em até 100 ms.

## Assumptions

- A feature atende um único usuário local e anônimo, sem autenticação, colaboração simultânea, backend ou armazenamento em nuvem.
- A integração de IA será simulada e determinística nesta etapa; conexão com um provedor real permanece fora do escopo.
- Um único diagrama pode estar ativo e persistido por vez; biblioteca de diagramas, pastas e múltiplas abas ficam fora do escopo.
- Navegadores modernos com suporte vigente são o ambiente alvo; importação de formatos externos além de ADL/ADLS não faz parte desta feature.
- Na primeira execução, grade, snap e guias iniciam ativos; o painel inicia aberto em aproximadamente 30% da largura.
- Coordenadas manuais não são gravadas no `.adl`; mudanças semânticas atualizam ADL, enquanto geometria e aparência permanecem no estado visual/ADLS.
- Quando o roteamento não puder evitar todos os cruzamentos, o menor caminho ortogonal válido tem prioridade.
- Nomes exportados são normalizados para minúsculas e hífens, removendo espaços excedentes e caracteres incompatíveis; `diagram` é o fallback.
- “Alterações existentes” para confirmação de Novo significa qualquer diferença persistível em relação ao estado criado ou restaurado no início da sessão atual.
- O histórico de undo/redo pertence à sessão atual e não precisa sobreviver ao fechamento completo da aplicação; o estado final do documento deve sobreviver.
