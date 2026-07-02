# Research: Stylesheet visual da ADL

## Linguagem e formato do arquivo

**Decision**: Usar arquivo textual `.adls`, com cabeçalho `stylesheet version "1.0"` e regras explícitas `element type`, `element id`, `relation type` e `relation id`. O bloco embutido usa `stylesheet { ... }` depois do fechamento de `diagram` e contém as mesmas regras, sem repetir versão.

**Rationale**: Uma DSL pequena mantém terminologia ADL, permite diagnósticos precisos e evita incorporar toda a complexidade e ambiguidades de CSS. Seletores explícitos removem colisão entre um tipo e um ID com o mesmo texto.

**Alternatives considered**: CSS foi rejeitado porque exigiria mapear DOM e aceitar semântica ampla não solicitada. JSON/YAML foram rejeitados por serem mais verbosos e oferecerem diagnóstico menos natural junto ao parser existente. Propriedades visuais dentro de cada elemento foram rejeitadas por violar a separação pedida.

## Sintaxe de valores

**Decision**: Usar strings para valores na versão 1.0. Dimensões e espessuras usam pixels inteiros positivos escritos como `"160px"`; arredondamento aceita pixels inteiros não negativos; fonte aceita pixels inteiros positivos. Formas aceitam `rectangle` e `ellipse`; `border-radius` é a única forma de arredondar um retângulo.

**Rationale**: Strings já são um primitivo estável da ADL, evitam ampliar o lexer com números, `#` e unidades contextuais, e mantêm validação de domínio explícita. Restringir formatos garante portabilidade e resultados determinísticos.

**Alternatives considered**: Uma forma separada `rounded-rectangle` foi rejeitada por duplicar `rectangle` com `border-radius`. Números sem unidade foram rejeitados por deixarem o significado implícito. Valores dimensionais percentuais foram rejeitados porque dependem de contexto de layout.

## Pinturas sólidas e gradientes

**Decision**: Modelar preenchimento, borda, linha e texto como `Paint`, uma união entre cor sólida (`#RRGGBB` ou `#RRGGBBAA`) e `linear-gradient(<ângulo>deg, <cor> <posição>%, ...)`. O gradiente exige ângulo finito, ao menos duas paradas, posições entre 0% e 100% em ordem não decrescente e usa os limites do objeto pintado como espaço de referência.

**Rationale**: “Cor” não representa corretamente gradientes. Um único tipo de pintura e a mesma sintaxe para todas as superfícies evitam capacidades inconsistentes entre preenchimento, borda, linha e texto. Limitar a primeira versão a gradientes lineares mantém validação e renderização determinísticas.

**Alternatives considered**: Gradientes radiais, cônicos e em malha foram adiados. Cores nomeadas e outros formatos funcionais foram adiados para impedir diferenças entre plataformas. Coordenadas absolutas de gradiente foram rejeitadas porque acoplariam o stylesheet ao layout.

## Limites iniciais

**Decision**: Largura e altura: 24–4096 px; espessura de borda e linha: 0–32 px; arredondamento: 0–2048 px, limitado na apresentação à metade da menor dimensão; fonte: 8–256 px.

**Rationale**: Os limites rejeitam valores inúteis ou capazes de degradar layout/renderização, mas cobrem diagramas comuns e exportações grandes.

**Alternatives considered**: Aceitar qualquer número finito foi rejeitado por transferir comportamento indefinido ao layout. Limites dependentes do viewport foram rejeitados por prejudicar determinismo.

## Precedência e ordem

**Decision**: Resolver cada propriedade nesta ordem crescente: padrão do renderer, externo por tipo, embutido por tipo, externo por ID, embutido por ID. Dentro da mesma origem e especificidade, a última declaração da propriedade vence e gera aviso de sobrescrita.

**Rationale**: Implementa exatamente a precedência assumida na spec e define duplicatas sem tornar o documento inteiro inválido.

**Alternatives considered**: Ordem puramente textual foi rejeitada porque permitiria regra de tipo superar ID. Rejeitar toda duplicata foi considerado rígido demais para ajustes progressivos.

## Fronteira de carregamento

**Decision**: Pacotes recebem o conteúdo externo por uma função assíncrona `loadStylesheet(reference, baseUri)` fornecida pelo consumidor. O editor web implementa essa fronteira com arquivos do workspace; testes usam carregador em memória.

**Rationale**: Mantém parser e domínio independentes de Node.js, browser e filesystem, além de permitir diagnóstico na declaração de referência.

**Alternatives considered**: Leitura direta no parser foi rejeitada por criar I/O implícito e acoplamento de plataforma. Incorporar conteúdo externo na AST foi rejeitado por duplicar fonte e dificultar sincronização.

## Integração ao pipeline

**Decision**: `DiagramModel` permanece sem estilos. O resolvedor produz `ResolvedDiagramStyles`, indexado por identidade. Layout recebe somente dimensões resolvidas; renderer recebe propriedades completas e não interpreta seletores nem strings cruas.

**Rationale**: Preserva a independência do modelo semântico e impede regras de negócio em layout, renderer ou React.

**Alternatives considered**: Adicionar `style` a cada entidade semântica foi rejeitado por misturar significado e apresentação. Resolver dentro do renderer foi rejeitado porque dimensões já afetam layout e porque renderizadores não devem interpretar linguagem.

## Posição persistente e estado de sessão

**Decision**: Permitir `x` e `y` somente em regras `element id`, sempre como par em pixels lógicos. Elementos posicionados são tratados como fixos; elementos sem posição passam pelo layout automático. Movimento e redimensionamento produzem patch na regra por ID da fonte gravável. Viewport, zoom, seleção e preferências do editor permanecem fora do stylesheet.

**Rationale**: Posição e tamanho determinam a composição portátil do diagrama. Estados de navegação são específicos de usuário/sessão, mudam com frequência e gerariam conflitos sem alterar a apresentação canônica.

**Alternatives considered**: Posição por tipo foi rejeitada porque sobreporia todas as entidades correspondentes. Armazenar viewport/seleção foi rejeitado por falta de portabilidade. Manter posição apenas no repositório local do editor foi rejeitado porque impediria reproduzir o diagrama em outro renderer.

## Tipografia

**Decision**: Usar um `TextStyle` comum para texto interno de elementos e rótulos de relações: `text-align` (`left|center|right`), `vertical-align` (`top|middle|bottom`), `font-family` (lista ordenada terminando em família genérica), `font-weight` (`normal|bold`), `font-style` (`normal|italic`) e `text-decoration` (`none|underline`).

**Rationale**: Um contrato compartilhado evita diferenças arbitrárias entre texto de elemento e relação. Lista de fallback permite solicitar `Arial Black` sem exigir incorporação de fontes e define comportamento quando ela não existe.

**Alternatives considered**: Pesos numéricos, múltiplas decorações e fontes incorporadas foram adiados. Usar nomes de fonte sem fallback foi rejeitado por produzir resultados dependentes do ambiente sem recuperação definida.

## Tratamento de falhas

**Decision**: Erros de parsing/validação invalidam somente a fonte de estilo afetada. O `.adl` semanticamente válido continua compilável; a cena é marcada como não integralmente estilizada e usa apenas fontes válidas/padrões. Referência externa ausente é erro de estilo; seletor sem correspondência é aviso.

**Rationale**: Mantém valor do diagrama e evita aparência parcialmente aplicada sem indicação.

**Alternatives considered**: Bloquear todo o diagrama foi rejeitado porque aparência não deve invalidar arquitetura. Ignorar erros foi rejeitado por produzir resultado enganoso.
