# Research: Editor Web de Diagramas de Arquitetura

## 1. Estado canônico e sincronização

**Decision**: Representar o workspace como uma revisão correlacionada que contém texto ADL, texto ADLS e estado visual separados. O ADL continua canônico para semântica; o ADLS para regras visuais; `PlacementState` para coordenadas manuais; modelo semântico, estilos resolvidos, layout e scene graph são sempre derivados.

**Rationale**: Essa decisão preserva o pipeline arquitetural existente, impede divergência silenciosa entre editores e canvas e permite que uma transação carregue todas as mudanças correlatas sem inserir coordenadas no ADL.

**Alternatives considered**:

- Tornar o modelo semântico a fonte canônica: rejeitado porque perderia texto inválido em edição, comentários e intenção textual.
- Armazenar tudo no ADL: rejeitado por violar a regra de coordenadas manuais fora do texto.
- Manter stores independentes por superfície: rejeitado porque exige sincronização bidirecional ad hoc e dificulta undo atômico.

## 2. Histórico global de undo/redo

**Decision**: Usar transações imutáveis de workspace com `before`, `after`, origem, descrição e agrupamento. Cada interação concluída gera no máximo uma transação; digitação é agrupada por sessão de edição/debounce; drag e resize só confirmam no pointer-up/cancelamento tratado.

**Rationale**: Snapshots correlacionados tornam undo/redo determinístico entre ADL, ADLS, geometria e IA. No limite de 200 elementos, 400 conexões e 100 entradas, o custo é aceitável e reduz a complexidade de comandos inversos para texto arbitrário.

**Alternatives considered**:

- Comandos inversos específicos: eficiente em memória, mas frágil para edições textuais e propostas de IA.
- Histórico separado por editor/canvas: rejeitado porque não preserva a ordem global.
- Entrada por evento de movimento: rejeitada por produzir histórico inútil e alto consumo.

## 3. Motor do canvas

**Decision**: Usar React Flow apenas como adaptador de interação/viewport. Nós e conexões são mapeados de/para contratos próprios; nenhum tipo da biblioteca entra em `@adl/*`. O scene graph de `@adl/renderer` continua sendo a representação visual independente usada para acessibilidade e exportação.

**Rationale**: A biblioteca já está instalada e cobre pan, pinch zoom, multi-seleção, conexão por handles e atalhos. O adaptador preserva a independência do domínio e reduz risco ao implementar interações avançadas.

**Alternatives considered**:

- Evoluir o SVG manual atual para todas as interações: mantém controle total, mas aumenta muito o escopo de gestos, seleção e viewport.
- Usar tipos do React Flow diretamente no domínio: rejeitado por acoplamento arquitetural.
- Canvas bitmap: rejeitado por acessibilidade, edição de texto e exportação vetorial intermediária.

## 4. Roteamento, snap e guias

**Decision**: Manter ELK para layout inicial e adicionar uma função pura de roteamento ortogonal incremental em `@adl/layout`. Portas candidatas são os quatro lados; o custo considera comprimento, dobras e cruzamentos. Snap e guias ficam em `@adl/canvas-state` como cálculos puros sobre caixas, tolerância e preferências.

**Rationale**: Layout completo a cada pixel de drag seria instável e caro. O roteamento incremental pode usar geometria fixada, atualizar durante o gesto de forma leve e confirmar a rota ao final.

**Alternatives considered**:

- Reexecutar ELK em cada frame: rejeitado por latência e deslocamento indesejado de nós.
- Linhas retas: não atende roteamento ortogonal nem legibilidade.
- Persistir pontos livres de linha: rejeitado porque o traçado é determinado por formatos fechados da linguagem.

## 5. Editores ADL e ADLS

**Decision**: Reutilizar CodeMirror e os serviços existentes. Cada fonte mantém texto em edição e último snapshot válido. O pipeline somente substitui modelo/estilo renderizado após validação bem-sucedida; diagnósticos permanecem associados à revisão textual atual.

**Rationale**: Já existem syntax highlighting, histórico local de edição, diagnósticos e bindings. Preservar a última revisão válida evita apagar o diagrama durante erros temporários de digitação.

**Alternatives considered**:

- Monaco: já está listado, mas aumentaria bundle e duplicaria integração sem benefício necessário.
- Textarea com highlighting próprio: não atende atalhos, linhas e diagnósticos com qualidade.
- Atualizar canvas mesmo com parse parcial: rejeitado por risco de estado semântico inconsistente.

## 6. Persistência local

**Decision**: Ampliar `@adl/persistence` para um envelope `adl-workspace-v2` validado na fronteira, com revisão confirmada, ADL, ADLS, estado visual e preferências. A aplicação fornece adaptador para o armazenamento do navegador e autosave de 500 ms. A escrita é um único valor serializado; a revisão só é marcada salva após sucesso.

**Rationale**: Uma gravação correlacionada impede combinações de ADL e geometria de revisões diferentes. Versionamento explícito permite migração ou descarte seletivo de estado visual incompatível.

**Alternatives considered**:

- Chaves independentes por campo: rejeitadas por falta de atomicidade.
- IndexedDB: útil para múltiplos documentos/arquivos grandes, mas excessivo para um único documento pequeno.
- Persistir histórico completo: rejeitado; a spec exige estado final, não undo entre sessões.

## 7. Assistência simulada e futura integração

**Decision**: Criar um `SimulatedAssistanceProvider` determinístico na aplicação que implementa os contratos de `@adl/ai-contracts`. Toda proposta contém `baseRevision`, fonte candidata e resumo; passa por validação e rejeição de stale revision antes de aplicação. A solicitação local pode aplicar diretamente após o comando explícito do usuário; qualquer provedor de rede futuro exigirá consentimento conforme o contrato existente.

**Rationale**: O mock prova a jornada sem backend e mantém a mesma fronteira de confiança prevista para uma integração real. Revisionamento impede que uma resposta atrasada sobrescreva edições novas.

**Alternatives considered**:

- Alterar diretamente o store a partir do componente de chat: rejeitado por bypass de validação e histórico.
- Simular apenas mensagens sem mudança real: não atende critérios de aceite.
- Integrar provedor real agora: fora do escopo e exigiria decisão explícita de serviço externo.

## 8. Exportação PNG, ADL e ADLS

**Decision**: Derivar uma `ExportScene` do mesmo modelo, estilos, geometria e rotas da revisão atual, sem estado de seleção ou controles. Serializar para SVG isolado, calcular bounds com padding e rasterizar no adaptador do navegador. `@adl/io` empacota bytes/texto, MIME type e nomes seguros para PNG, ADL e ADLS.

**Rationale**: Uma cena dedicada garante que grid e UI não sejam capturados. Bounds do documento, e não da viewport, incluem conteúdo fora da tela. A etapa SVG mantém fidelidade e facilita teste antes da rasterização.

**Alternatives considered**:

- Screenshot do DOM: incluiria controles, falharia fora da viewport e seria sensível ao tema da UI.
- Rasterização direta do scene graph: duplicaria lógica de desenho.
- Exportar apenas SVG: não atende o formato solicitado.

## 9. Temas e design tokens

**Decision**: Definir tokens semânticos em CSS variables para superfícies, texto, bordas, destaque, grid, conexões, seleção e estados. Tailwind referencia esses tokens; `ThemePreference` resolve `system | light | dark`, e somente o modo sistema reage a mudanças do dispositivo.

**Rationale**: Tokens semânticos evitam valores duplicados e permitem auditar contraste. CSS variables aplicam a troca de tema sem rerenderizar o domínio ou reconstruir o canvas.

**Alternatives considered**:

- Classes completas duplicadas por tema: maior risco de divergência.
- Cores inline em componentes: difícil de testar e incompatível com exportação consistente.
- Tema armazenado no documento: rejeitado porque é preferência de workspace, não conteúdo do diagrama.

## 10. Desktop, drawer e gestos móveis

**Decision**: Um único modelo de painel controla modo ativo, largura expandida e recolhimento. Em desktop ele ocupa coluna redimensionável; quando o espaço do canvas ficaria abaixo de 640 px, o mesmo conteúdo é apresentado em drawer modal sobreposto. O viewport do canvas continua montado ao alternar de layout.

**Rationale**: Reutilizar o conteúdo evita duas implementações de IA/editores. Manter o canvas montado preserva pan, zoom e seleção ao abrir/fechar o drawer.

**Alternatives considered**:

- Painel fixo reduzido em mobile: não deixa área útil suficiente ao canvas.
- Rotas/páginas separadas para editor e canvas: quebra sincronização visual imediata.
- Duplicar componentes desktop/mobile: aumenta inconsistência e testes.

## 11. Acessibilidade do canvas

**Decision**: Manter uma representação DOM/SVG navegável por entidade, com rótulos do scene graph, estado selecionado/focado/erro em texto e cor, roving tabindex para entidades e atalhos documentados. Menus e drawers usam foco contido e retorno ao acionador.

**Rationale**: React Flow sozinho não garante a semântica específica do domínio. O scene graph já gera alternativas textuais; o adaptador deve preservá-las.

**Alternatives considered**:

- Canvas somente visual com descrição global: insuficiente para selecionar e operar entidades.
- Tornar todos os elementos tabuláveis simultaneamente: ordem extensa e difícil em diagramas maiores.
- Indicar estado apenas pela cor: viola WCAG e a spec.

## 12. Orquestração de estado na aplicação

**Decision**: Um controller puro executa transações e deriva o snapshot; Zustand expõe apenas o estado compartilhado necessário aos componentes e delega regras ao controller. Estado efêmero de gesto permanece local no adaptador do canvas e só é confirmado no término.

**Rationale**: Essa separação mantém React declarativo, evita efeitos calculando estado derivado e permite testar transações sem renderizar componentes.

**Alternatives considered**:

- Um componente `App` com todo o estado: já se mostrou difícil de evoluir e mistura responsabilidades.
- Store com regras de parser/layout embutidas: acopla domínio à biblioteca de estado.
- Contextos React múltiplos para cada fatia: possível, mas não resolve transações atômicas entre fatias.

## 13. Estratégia de testes

**Decision**: TDD por camada: contratos puros e casos limítrofes em Vitest; adapters com testes de integração próximos; jornadas visuais, downloads, atalhos, persistência e responsividade em Playwright. Testes E2E usam o provedor simulado e armazenamento isolado por contexto.

**Rationale**: A maior parte da complexidade é determinística e deve ser testada sem browser. E2E fica reservado para integração real entre superfícies e APIs do navegador.

**Alternatives considered**:

- Cobrir tudo por E2E: lento e difícil de diagnosticar.
- Mockar parser/layout nos testes principais: esconderia falhas de integração.
- Snapshots visuais como única validação: não comprovam semântica, histórico ou exportação.
