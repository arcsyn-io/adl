# Feature Specification: Stylesheet visual da ADL

**Feature Branch**: `specs`

**Created**: 2026-07-02

**Status**: Draft

**Input**: Permitir que autores definam a aparência de elementos e relações da ADL em um arquivo de stylesheet separado, referenciado pelo documento `.adl`, com suporte adicional a stylesheet embutido ao final do documento.

## Objective

Permitir a personalização declarativa da aparência de diagramas ADL sem misturar decisões visuais com a definição semântica dos elementos e relações.

## Problem

Sem um stylesheet próprio, todos os elementos de um mesmo tipo ficam limitados à apresentação padrão ou exigem que detalhes visuais sejam incorporados ao conteúdo semântico. Autores precisam variar forma, dimensões, bordas, preenchimento, linhas e texto por tipo ou por elemento específico, mantendo o `.adl` legível e portátil.

## Dependencies

- **Requires**: 001–006
- **Extends**: 014 com referência normativa, exemplos e casos de conformidade do stylesheet.
- **Parallelization**: A definição da linguagem de estilos pode avançar após os contratos de identidade, tipos, relações e renderização estarem estáveis.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Aplicar um stylesheet externo (Priority: P1)

Como autor de diagramas, quero manter as regras visuais em um arquivo separado e referenciá-lo no meu documento `.adl`, para reutilizar uma identidade visual sem poluir a descrição da arquitetura.

**Why this priority**: O arquivo externo é o fluxo principal e estabelece a separação entre conteúdo semântico e apresentação.

**Independent Test**: Um documento referencia um stylesheet válido, e o diagrama resultante aplica as regras declaradas aos elementos e relações correspondentes sem alterar seu significado.

**Acceptance Scenarios**:

1. **Given** um documento `.adl` válido e um stylesheet externo válido acessível pela referência, **When** o diagrama é apresentado, **Then** as propriedades visuais correspondentes são aplicadas.
2. **Given** dois documentos que referenciam o mesmo stylesheet, **When** ambos são apresentados, **Then** as mesmas regras produzem aparência consistente para os mesmos tipos de entidade.
3. **Given** uma referência ausente, inacessível ou inválida, **When** o documento é processado, **Then** o autor recebe um diagnóstico que identifica a referência problemática e o diagrama não é apresentado como integralmente estilizado.

---

### User Story 2 - Estilizar por tipo e por identidade (Priority: P2)

Como autor, quero definir uma aparência comum para um tipo de elemento e sobrescrevê-la para uma identidade específica, para combinar consistência visual com exceções intencionais.

**Why this priority**: Seletores por tipo e ID entregam o nível de controle solicitado sem exigir estilos repetidos em cada elemento.

**Independent Test**: Uma regra transforma todos os elementos `service` em elipses, enquanto uma regra por ID altera somente um desses serviços; os demais preservam a regra do tipo.

**Acceptance Scenarios**:

1. **Given** uma regra para o tipo `service`, **When** o diagrama contém vários serviços, **Then** todos recebem a forma, as cores, as bordas, o texto e as dimensões declaradas para o tipo.
2. **Given** regras aplicáveis por tipo e por ID, **When** ambas definem a mesma propriedade, **Then** o valor da regra por ID prevalece somente para a entidade identificada.
3. **Given** regras aplicáveis por tipo e por ID que definem propriedades diferentes, **When** a entidade é apresentada, **Then** as propriedades são combinadas sem descartar valores não conflitantes.
4. **Given** um seletor por ID sem entidade correspondente, **When** o stylesheet é validado, **Then** o autor recebe um aviso e as demais regras válidas continuam aplicáveis.

---

### User Story 3 - Incorporar ajustes no documento (Priority: P3)

Como autor, quero adicionar um stylesheet embutido ao final do `.adl`, para distribuir um exemplo autocontido ou realizar ajustes locais sobre um tema externo.

**Why this priority**: O modo embutido complementa o arquivo externo, mas não é necessário para o primeiro fluxo reutilizável.

**Independent Test**: Um documento com stylesheet embutido é apresentado com os estilos locais; quando também há arquivo externo, conflitos são resolvidos de maneira previsível.

**Acceptance Scenarios**:

1. **Given** um documento sem referência externa e com stylesheet embutido válido, **When** ele é apresentado, **Then** suas regras locais são aplicadas.
2. **Given** um documento com stylesheet externo e embutido, **When** ambos definem a mesma propriedade para a mesma entidade, **Then** o valor embutido prevalece.
3. **Given** um stylesheet embutido malformado, **When** o documento é processado, **Then** o diagnóstico aponta a localização do erro no `.adl` e nenhuma regra ambígua é aplicada.

### Edge Cases

- Uma entidade não coberta por regra alguma conserva integralmente a apresentação padrão.
- Uma regra parcialmente válida não pode aplicar silenciosamente valores inválidos; cada propriedade inválida gera diagnóstico localizado sem apagar propriedades válidas independentes.
- IDs e nomes de tipos inexistentes ou incompatíveis não podem causar a estilização de outra entidade por aproximação.
- Dimensões menores que o necessário para o texto seguem um comportamento previsível de conteúdo excedente e não alteram o modelo semântico.
- Cores inválidas, tamanhos não positivos, formas desconhecidas e combinações de borda inválidas são rejeitados com diagnóstico acionável.
- Texto Unicode e rótulos longos mantêm o mesmo conteúdo, ainda que sua apresentação precise ser limitada pelas dimensões declaradas.
- Auto-relações, relações paralelas e relações sem rótulo mantêm identidade e conectividade ao receber estilos de linha.
- A indisponibilidade do stylesheet externo não impede a análise semântica do `.adl`; ela impede apenas que o resultado seja tratado como integralmente estilizado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A linguagem MUST aceitar um arquivo de stylesheet distinto do documento `.adl` como fonte principal de regras visuais.
- **FR-002**: Um documento `.adl` MUST poder declarar uma referência relativa a um stylesheet externo, resolvida a partir da localização do próprio documento.
- **FR-003**: Um documento `.adl` MUST poder conter um bloco de stylesheet embutido após sua definição semântica.
- **FR-004**: O uso de stylesheet MUST NOT alterar identidades, tipos, relações, agrupamentos ou qualquer outro significado do modelo semântico.
- **FR-005**: O stylesheet MUST permitir selecionar elementos por tipo semântico e por ID exato.
- **FR-006**: O stylesheet MUST permitir selecionar relações por tipo semântico e por ID exato quando a relação possuir ID.
- **FR-007**: Regras por ID MUST prevalecer sobre regras por tipo para a mesma propriedade e a mesma entidade.
- **FR-008**: Regras embutidas MUST prevalecer sobre regras externas de igual especificidade para a mesma propriedade e a mesma entidade.
- **FR-009**: Propriedades não declaradas por uma regra mais específica MUST preservar valores de regras menos específicas; na ausência destas, MUST preservar os padrões do renderer.
- **FR-010**: Regras para elementos MUST admitir, no mínimo, forma, largura, altura, cor de preenchimento, cor de borda, espessura de borda, arredondamento de borda, cor do texto e tamanho da fonte.
- **FR-011**: As formas iniciais suportadas MUST incluir, no mínimo, retângulo, retângulo arredondado e elipse.
- **FR-012**: Regras para relações MUST admitir, no mínimo, cor da linha, espessura da linha, cor do texto do rótulo e tamanho da fonte do rótulo.
- **FR-013**: Uma cor de texto definida para um elemento MUST ser aplicada a todo texto interno, salvo quando uma regra mais específica para uma categoria de texto definir outro valor.
- **FR-014**: Largura, altura, espessura de borda, arredondamento, espessura de linha e tamanhos de fonte MUST aceitar somente valores finitos dentro dos limites documentados e compatíveis com a propriedade.
- **FR-015**: Formas, propriedades, seletores e valores desconhecidos ou inválidos MUST produzir diagnósticos determinísticos que indiquem origem e correção esperada.
- **FR-016**: Uma referência externa ausente, inacessível ou inválida MUST produzir diagnóstico associado à declaração de referência.
- **FR-017**: Um seletor sintaticamente válido que não corresponda a nenhuma entidade MUST produzir aviso sem impedir a aplicação das demais regras válidas.
- **FR-018**: A aplicação do stylesheet MUST produzir o mesmo resultado visual para o mesmo documento, stylesheet, padrões de apresentação e dimensões disponíveis.
- **FR-019**: A referência normativa MUST documentar seletores, propriedades, valores permitidos, precedência, padrões, diagnósticos e exemplos externos e embutidos.
- **FR-020**: A suíte de conformidade MUST cobrir regras válidas, conflitos de precedência, referências ausentes, seletores sem correspondência e valores inválidos.

### Key Entities

- **Stylesheet ADL**: conjunto versionável de regras visuais, armazenado externamente ou embutido no documento.
- **Referência de stylesheet**: vínculo declarado pelo `.adl` para localizar uma fonte externa de estilos.
- **Regra de estilo**: seletor acompanhado das propriedades visuais aplicáveis.
- **Seletor de tipo**: corresponde a todas as entidades de um tipo semântico exato.
- **Seletor de ID**: corresponde a uma única entidade pela identidade exata.
- **Propriedade visual**: atributo de apresentação com nome, valor válido e padrão definido.
- **Estilo resolvido**: combinação determinística dos padrões e regras aplicáveis a uma entidade.

## Scope

- Definição e aplicação de stylesheets externos e embutidos.
- Seletores por tipo e ID para elementos e relações.
- Formas básicas, dimensões, preenchimento, bordas, linhas e tipografia descritos nos requisitos.
- Precedência, validação, diagnósticos, documentação e casos de conformidade necessários ao comportamento inicial.

## Out of Scope

- Coordenadas, posicionamento manual ou regras de layout.
- Animações, imagens, ícones, sombras, gradientes e estilos condicionais por estado de interação.
- Seletores por classe, atributo, hierarquia, grupo, origem ou destino de relação.
- Variáveis, funções, herança arbitrária, temas múltiplos e importação encadeada de stylesheets.
- Editor visual dedicado para criar ou alterar stylesheets.
- Fontes externas ou incorporação de arquivos de fonte.
- Alterações no significado do `.adl` motivadas por aparência.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos exemplos de conformidade aplicam corretamente estilos por tipo, por ID e a combinação de ambos.
- **SC-002**: 100% dos conflitos cobertos pela suíte produzem o resultado de precedência documentado entre padrões, arquivo externo, bloco embutido, tipo e ID.
- **SC-003**: Um autor familiarizado com ADL consegue criar, referenciar e visualizar um stylesheet externo com uma regra por tipo em até 10 minutos usando apenas a documentação.
- **SC-004**: Um mesmo stylesheet pode ser aplicado a pelo menos 10 documentos de exemplo sem duplicação de regras dentro desses documentos.
- **SC-005**: 100% dos casos inválidos da suíte produzem diagnóstico com origem e orientação, sem alterar o modelo semântico válido.
- **SC-006**: Em um diagrama de 100 elementos e 200 relações, a aplicação dos estilos acrescenta no máximo 100 ms ao tempo entre uma alteração e a apresentação atualizada no ambiente de referência.
- **SC-007**: Todos os diagramas estilizados permanecem compreensíveis quando avaliados sem depender exclusivamente da cor para distinguir o significado das entidades.

## Assumptions

- A primeira versão aceita uma referência externa por documento e, opcionalmente, um bloco embutido; composição de múltiplos arquivos fica fora do escopo.
- A ordem de precedência, do menor para o maior peso, é: padrão do renderer, regra externa por tipo, regra embutida por tipo, regra externa por ID e regra embutida por ID.
- Seletores correspondem somente a nomes de tipos e IDs exatos; não há correspondência parcial ou sensível ao contexto.
- Dimensões personalizadas influenciam o espaço usado pelo layout, mas não permitem declarar coordenadas no stylesheet nem no `.adl`.
- O formato concreto, a extensão do arquivo e a lista normativa de unidades e formatos de cor serão definidos no planejamento sem ampliar o comportamento desta spec.
- A apresentação padrão existente continua válida quando nenhum stylesheet é fornecido.
