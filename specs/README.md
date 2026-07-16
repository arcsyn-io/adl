# Roadmap de especificações ADL

## Estado analisado

O repositório contém apenas o scaffold local-first do editor web, configuração Docker/pnpm/Turborepo e testes smoke. Não há implementação de linguagem, lexer, parser, AST, modelo semântico, validação, serialização, renderer, layout ou edição funcional.

## Roadmap

| ID | Feature | Objetivo / resultado esperado | Dependências | Prioridade | Complexidade | Separação e paralelismo |
|---|---|---|---|---|---|---|
| 001 | Fundamentos da linguagem ADL | Definir o vocabulário, os conceitos e a sintaxe textual inicial da ADL para diagramas de arquitetura. | Nenhuma | P0 | Média | Início do programa; bloqueia 002 e 014. |
| 002 | Gramática, lexer, parser e AST | Transformar texto ADL em uma árvore sintática fiel por meio de uma gramática formal e comportamento de análise definido. | 001 | P0 | Alta | Pode avançar em paralelo com 014 após 001 estabilizar. |
| 003 | Modelo semântico da ADL | Converter a AST em um modelo semântico normalizado, navegável e independente da forma textual. | 001, 002 | P0 | Alta | Após 002, pode avançar em paralelo com a preparação de 006 e 014. |
| 004 | Validação semântica e diagnósticos | Detectar violações sintáticas e semânticas e apresentá-las como diagnósticos claros, localizados e acionáveis. | 002, 003 | P0 | Alta | Pode avançar em paralelo com 005 depois de 003. |
| 005 | Serialização canônica da ADL | Converter modelos semânticos válidos em texto ADL canônico, estável e semanticamente equivalente. | 001, 003, 004 | P1 | Média | Pode avançar em paralelo com 006 e 007. |
| 006 | Renderer de diagramas | Apresentar um modelo semântico válido como diagrama visual legível, com elementos, relações, grupos e estados básicos. | 003, 004 | P1 | Alta | Pode avançar em paralelo com 005; integra com 007 depois. |
| 007 | Layout automático | Calcular posições legíveis e determinísticas para entidades de um diagrama sem inserir coordenadas no texto ADL. | 003, 006 | P1 | Alta | Pode avançar em paralelo com 008 depois do renderer básico. |
| 008 | Editor de código ADL | Permitir editar ADL no navegador com feedback de análise, navegação e operações de texto adequadas à linguagem. | 002, 004, 005 | P1 | Alta | Pode avançar em paralelo com 007 e 009 após seus contratos. |
| 009 | Editor visual de diagramas | Permitir criar, selecionar, editar e remover entidades do diagrama por interações visuais baseadas no modelo semântico. | 006, 003, 004 | P1 | Alta | Pode avançar em paralelo com 008; integração textual ocorre em 010. |
| 010 | Sincronização entre código e canvas | Manter texto ADL e edição visual semanticamente consistentes, com origem de mudanças, conflitos e estados inválidos tratados explicitamente. | 005, 008, 009 | P0 | Muito alta | Marco de integração; não deve iniciar antes dos contratos dependentes. |
| 011 | Movimentação e posicionamento manual | Permitir ajustar posições no canvas e preservar esses ajustes como estado visual separado do texto e do modelo semântico. | 007, 009, 010 | P1 | Alta | Pode avançar em paralelo com 012 após 010. |
| 012 | Persistência local do diagrama | Salvar e restaurar localmente conteúdo ADL e estado visual separado, com recuperação segura e sem backend. | 005, 010, 011 | P1 | Alta | Pode avançar em paralelo com 013 após contratos de dados. |
| 013 | Importação e exportação | Permitir entrada e saída explícita de documentos ADL e representações portáveis do diagrama, com validação e falhas seguras. | 004, 005, 006, 012 | P2 | Alta | Pode avançar em paralelo com 014 após dependências. |
| 014 | Conformidade, documentação e exemplos | Fornecer documentação autocontida, exemplos versionados e uma suíte de conformidade que torne a ADL compreensível e verificável. | 001; amplia com 002–005 e 013 | P1 | Alta | Começa após 001 e evolui em paralelo às specs da linguagem. |
| 015 | Fronteira para integração futura com IA | Definir um contrato seguro e opcional para futuras assistências de IA sem acoplar o núcleo ADL a um provedor ou serviço. | 003, 004, 005, 014 | P3 | Média | Pode ser especificada em paralelo ao editor; implementação fica deliberadamente futura. |
| 018 | Barra superior de edicao de texto | Permitir alterar fonte livre, tamanho, cor, alinhamento, negrito, italico, sublinhado, copiar e remover pela barra superior contextual. | 016, 017 | P1 | Media | Pode avancar apos contratos de stylesheet e workspace; nao altera o `.adl` semantico. |

Cada feature foi separada porque produz um contrato ou comportamento verificável, pode ser revisada com critérios próprios e evita misturar linguagem, semântica, apresentação e estado de editor. Itens sem valor isolado foram agrupados: gramática/lexer/parser/AST formam a análise sintática; validação e mensagens formam uma experiência diagnóstica única; testes, documentação, exemplos e versionamento formam a conformidade da linguagem.

## Ordem recomendada

1. **Fundação**: 001.
2. **Análise e significado**: 002 → 003 → 004.
3. **Saídas do núcleo**: 005; em paralelo, preparar 006 após 003/004 e iniciar 014 após 001.
4. **Visualização e autoria independentes**: 006 → 007; 008 após 002/004/005; 009 após 003/004/006.
5. **Integração de autoria**: 010 após 005/008/009.
6. **Estado visual e dados locais**: 011 após 007/009/010; 012 após 005/010/011.
7. **Intercâmbio e conformidade completa**: 013 após 004/005/006/012; concluir 014 com contratos de 002–005 e 013.
8. **Fronteira futura**: 015 após 003/004/005/014.

## Grafo de dependências

```text
001 ─┬─> 002 ─> 003 ─┬─> 004 ─┬─> 005 ─┬─> 008 ─┐
     │               │        │        │        ├─> 010 ─> 011 ─> 012 ─> 013
     │               └─> 006 ─┴─> 007  └─> 009 ─┘      │               │
     └────────────────────────────────────> 014 <────────┴───────────────┘
                                      003 + 004 + 005 + 014 ─> 015
```

Não há dependências circulares. A spec 014 começa cedo com 001 e acumula contratos públicos sem redefinir as specs que documenta.

## Execução paralela

- Após 001: 002 e a base de 014.
- Após 003/004: 005 e 006.
- Após 006 e contratos do núcleo: 007, 008 e 009 em frentes separadas.
- Após 010: preparação de 011 e 012, respeitando a dependência final de 012 em 011.
- Após 012: 013, conclusão de 014 e preparação não funcional de 015.

## Restrições transversais

- Coordenadas, dimensões, viewport, seleção e posições manuais nunca pertencem ao texto `.adl` nem ao modelo semântico.
- Estado visual é separado, associado por identidade e tratado por 011/012.
- Nenhuma spec autoriza backend, banco de dados, serviço cloud ou integração funcional com IA.
- Cada diretório está pronto para uma execução individual de `$speckit-clarify`.

