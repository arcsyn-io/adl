# Quickstart Validation Guide: Editor Web de Diagramas de Arquitetura

## Purpose

Validar a feature completa de forma reproduzível após a implementação. Este guia não substitui os testes unitários/contratuais; ele organiza as jornadas end-to-end contra [spec.md](./spec.md), [data-model.md](./data-model.md) e os [contratos](./contracts/).

## Prerequisites

- Docker Desktop ativo.
- Serviço `workspace` disponível pelo `docker compose` do repositório.
- Portas do editor local liberadas conforme `compose.yml`.
- Nenhum estado local prévio no contexto do navegador usado para o cenário de primeira execução.

## Setup

Todos os comandos devem executar no serviço Docker `workspace`:

```sh
docker compose up -d workspace
docker compose exec workspace bash -lc "pnpm install"
docker compose exec workspace bash -lc "pnpm --filter @adl/web-editor dev --host 0.0.0.0"
```

Abrir `http://localhost:5173` em navegador suportado.

## TDD and validation order

Para cada incremento:

1. Escrever teste de contrato/unidade ou E2E que expresse o comportamento.
2. Executar o teste e observar falha pela razão correta.
3. Implementar a menor mudança coerente.
4. Executar o teste focado até passar.
5. Refatorar mantendo o teste verde.

Antes de concluir a feature:

```sh
docker compose exec workspace bash -lc "pnpm lint"
docker compose exec workspace bash -lc "pnpm typecheck"
docker compose exec workspace bash -lc "pnpm test"
docker compose exec workspace bash -lc "pnpm build"
docker compose exec workspace bash -lc "pnpm test:e2e"
```

## Scenario 1 — First run and initial diagram

1. Limpar o registro local do workspace no contexto de teste.
2. Recarregar a aplicação.
3. Verificar o estado de loading inicial e sua conclusão.
4. Confirmar Cliente, API Gateway, Serviço de Pagamentos, Fila, Worker, Banco de Dados e Sistema Externo.
5. Confirmar `solicita`, `encaminha`, `publica`, `consome`, `persiste` e `notifica`.
6. Confirmar grade visível, conteúdo enquadrado e painel IA aberto.

**Expected**: sete elementos, seis relações rotuladas e layout assíncrono organizado; nenhuma falha no console.

## Scenario 2 — Visual editing and connections

1. Selecionar Serviço de Pagamentos.
2. Verificar handles e ações contextuais de elemento.
3. Mover e redimensionar o elemento.
4. Editar seu texto por duplo clique.
5. Duplicar e excluir a cópia.
6. Criar uma conexão arrastando de qualquer lado entre dois elementos.
7. Editar texto e inverter direção da conexão.
8. Fazer multi-seleção, copiar e colar.

**Expected**: cada gesto concluído produz uma mudança atômica; rotas permanecem ortogonais; ADL/ADLS e geometria refletem somente as mudanças aplicáveis.

## Scenario 3 — Snap, grid and guides

1. Alternar grade, snap e guias separadamente.
2. Mover elementos com snap ativo e grade invisível.
3. Alinhar um elemento pelo centro e borda de outro.
4. Criar três elementos igualmente espaçados.
5. Recarregar a aplicação.

**Expected**: toggles independentes, guias corretas durante o gesto e preferências restauradas.

## Scenario 4 — ADL synchronization and errors

1. Abrir a aba ADL.
2. Adicionar um elemento e uma relação válidos.
3. Verificar atualização do canvas em até um segundo.
4. Introduzir erro sintático.
5. Verificar diagnóstico com localização e preservação do último canvas válido.
6. Corrigir o erro.
7. Renomear/excluir pelo canvas e conferir atualização do ADL.
8. Mover um elemento e confirmar que coordenadas não são inseridas no `.adl`.

**Expected**: sincronização semântica bidirecional, draft inválido preservado e geometria fora do ADL.

## Scenario 5 — ADLS synchronization and errors

1. Abrir a aba ADLS.
2. Alterar cor, tipografia, tamanho, borda e estilo de conexão suportado.
3. Verificar atualização visual em até 300 ms após estabilização.
4. Introduzir propriedade/valor inválido.
5. Confirmar diagnóstico e preservação do último estilo válido.
6. Redimensionar um elemento no canvas e verificar regra visual atualizada.

**Expected**: estilo e geometria visual sincronizados sem alterar modelo semântico.

## Scenario 6 — Simulated assistance

1. Abrir IA e enviar com `Ctrl/Cmd + Enter`: “Adicione um cache entre o API Gateway e o Serviço de Pagamentos”.
2. Verificar mensagem do usuário, estado de geração e bloqueio de envio duplicado.
3. Verificar resposta, resumo aplicado e novo cache no diagrama/ADL.
4. Desfazer e refazer a mudança globalmente.
5. Executar fixture de erro e tentar novamente.
6. Editar o documento durante uma proposta atrasada para provocar stale revision.

**Expected**: proposta válida aplicada em uma transação; erros e stale não alteram documento; conversa persiste.

## Scenario 7 — Shared undo/redo

1. Executar, nesta ordem: mover, editar ADL, editar ADLS, aplicar IA e renomear diagrama.
2. Desfazer cinco vezes por toolbar/atalho.
3. Refazer por ambos os atalhos suportados.
4. Durante drag longo, verificar que apenas uma entrada é criada.
5. Após undo, executar uma nova ação.

**Expected**: ordem única entre superfícies, estado correlacionado e branch de redo descartada após nova ação.

## Scenario 8 — Persistence and recovery

1. Alterar documento, stylesheet, geometria, conversa, tema, painel e preferências de canvas.
2. Aguardar autosave e recarregar.
3. Comparar todos os campos persistidos.
4. Simular visual envelope incompatível mantendo fontes válidas.
5. Simular JSON corrompido e armazenamento indisponível.

**Expected**: restore completo em até dois segundos; recuperação seletiva preserva fontes/preferências válidas; falha de save não interrompe edição.

## Scenario 9 — New diagram

1. Com alterações, acionar Novo.
2. Cancelar e confirmar que nada mudou.
3. Acionar novamente e confirmar.
4. Verificar canvas, ADL, ADLS, conversa e histórico vazios.
5. Verificar tema, painel, grade, snap e guias preservados.

**Expected**: confirmação segura e reset dentro de uma transação persistida.

## Scenario 10 — Export

1. Posicionar elementos parcialmente fora da viewport e aplicar estilos distintos.
2. Selecionar um elemento e deixar grade/guias visíveis.
3. Exportar PNG.
4. Validar dimensões/bounds e presença de todo conteúdo.
5. Confirmar ausência de grade, seleção, handles, toolbar e painel.
6. Renomear para “Payments Flow” e exportar ADL/ADLS.
7. Testar nome vazio e erro de rasterização.

**Expected**: fidelidade da revisão atual; `payments-flow.adl`, `payments-flow.adls`, `payments-flow.png`; fallback `diagram`; erro recuperável quando aplicável.

## Scenario 11 — Themes, panel and responsive layout

1. Em desktop, redimensionar painel aos limites e recolher/reabrir.
2. Alternar sistema/claro/escuro e simular mudança do sistema.
3. Recarregar e verificar preferências.
4. Reduzir viewport até o modo overlay.
5. Abrir IA, ADL e ADLS no drawer e fechar por Escape.
6. Emulação touch: pan e pinch-to-zoom.

**Expected**: canvas mantém viewport; largura desktop não é alterada pelo drawer; tema e contraste consistentes.

## Scenario 12 — Accessibility

1. Navegar sem mouse por top bar, tabs, canvas, toolbar, menus e dialog.
2. Confirmar foco visível e ordem lógica.
3. Verificar nomes/estados acessíveis dos toggles e entidades.
4. Validar anúncios de geração, erro, save, undo/redo e exportação.
5. Verificar que seleção e erro usam mais que cor.
6. Auditar contraste WCAG AA em temas claro/escuro.

**Expected**: ações essenciais completas por teclado e árvore acessível coerente.

## Performance reference scenario

1. Carregar fixture com 200 elementos e 400 conexões.
2. Medir restore, pan, seleção, drag, resize, route commit e troca de tema.
3. Executar 50 operações mistas e percorrer undo/redo.
4. Exportar a cena completa.

**Expected**: restore ≤ 2 s; 95% do feedback local inicia ≤ 100 ms; nenhum estado divergente; exportação conclui sem omitir conteúdo.

## Artifact map

- Estado e comandos: [contracts/workspace-state.md](./contracts/workspace-state.md)
- Persistência/exportação: [contracts/persistence-export.md](./contracts/persistence-export.md)
- Assistência/UI: [contracts/assistance-ui.md](./contracts/assistance-ui.md)
- Entidades e transições: [data-model.md](./data-model.md)
- Decisões e alternativas: [research.md](./research.md)
