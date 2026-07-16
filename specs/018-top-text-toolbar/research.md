# Research: Barra superior de edicao de texto

## Decision 1: Estilos por barra geram patches ADLS, nao alteracoes ADL

**Decision**: A barra despacha um comando de patch textual que atualiza a fonte visual gravavel, preservando o `.adl` semantico.

**Rationale**: A arquitetura define que aparencia pertence ao stylesheet. Fonte, tamanho, cor, alinhamento e enfases sao propriedades ja previstas em 016.

**Alternatives considered**:

- Gravar propriedades no `.adl`: rejeitado porque viola separacao semantica/visual.
- Manter somente em estado de UI: rejeitado porque nao sobreviveria a reload/exportacao ADLS.

## Decision 2: Lista fechada de fontes livres

**Decision**: A UI oferece uma lista fechada de fontes com licenca livre documentada, cada uma com fallback generico.

**Rationale**: Evita entrada arbitraria, fontes proprietarias e dependencia de rede. Tambem facilita teste visual e validacao do stylesheet.

**Initial candidates**:

- Inter -> `Inter, sans-serif`
- Source Sans 3 -> `"Source Sans 3", sans-serif`
- Noto Sans -> `"Noto Sans", sans-serif`
- Roboto Slab -> `"Roboto Slab", serif`
- JetBrains Mono -> `"JetBrains Mono", monospace`

**Constraint**: Antes de implementar, confirmar licencas a partir dos artefatos usados no projeto. Se a fonte nao for empacotada, a opcao ainda deve terminar em fallback generico e nao buscar rede.

## Decision 3: Estado misto para multisselecao

**Decision**: Quando alvos selecionados possuem valores diferentes, a barra mostra estado misto ate o usuario escolher um valor.

**Rationale**: Escolher um valor automaticamente poderia sobrescrever estilo sem intencao. Estado misto e padrao esperado para toolbars contextuais.

**Alternatives considered**:

- Mostrar o valor do primeiro alvo: rejeitado por ser enganoso.
- Desabilitar controles em multisselecao: rejeitado por reduzir valor da feature.

## Decision 4: Copiar e remover usam comandos existentes

**Decision**: A barra chama os mesmos comandos de copiar/remover usados por canvas, atalhos e menu contextual.

**Rationale**: Garante historico, diagnosticos, tratamento de relacoes dependentes e IDs consistentes.

**Alternatives considered**:

- Implementar logica local no componente: rejeitado por duplicar regras de dominio em React.

## Decision 5: Controles responsivos com prioridade

**Decision**: Em desktop, controles textuais aparecem diretamente; em viewport estreita, controles de menor frequencia entram em menu.

**Rationale**: A barra superior tambem contem nome do diagrama e acoes globais. Agrupar evita sobreposicao e preserva alvos de toque.

**Priority order**:

1. Remover, copiar e controles de enfase.
2. Cor e tamanho.
3. Alinhamento.
4. Familia de fonte.

Essa ordem pode ser refinada por teste visual, mas nao altera o contrato funcional.
