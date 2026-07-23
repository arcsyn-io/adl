# Quickstart Validation: Assistente de geração de diagramas

## Prerequisites

Inicie o serviço obrigatório:

```powershell
docker compose up -d workspace
```

## Focused tests

```powershell
docker compose exec workspace bash -lc "pnpm --filter @adl/web-editor test -- assistant-flow local-provider"
```

Esperado: preparação, consentimento, resposta inválida, revisão obsoleta e geração local passam.

## Manual flow

```powershell
.\scripts\adl.ps1 up
```

1. Abra `http://localhost:5173`.
2. Na aba IA, descreva “API recebe pagamentos, publica em fila, worker grava no banco”.
3. Confira o conteúdo divulgado e marque o consentimento.
4. Gere a proposta.
5. Confirme que o canvas e o ADL ainda não mudaram.
6. Revise fonte atual, fonte proposta e resumo.
7. Aplique a proposta e confirme atualização do canvas.
8. Repita e descarte; confirme que a fonte não muda.
9. Gere uma proposta, altere o ADL em outra aba e tente aplicar; confirme bloqueio por revisão obsoleta.

## E2E

```powershell
docker compose exec workspace bash -lc "pnpm exec playwright test tests/e2e/ai-diagram-assistant.spec.ts"
```

## Global validation

```powershell
docker compose exec workspace bash -lc "pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e"
```

## Validation record

Validado em 2026-07-23:

- `pnpm lint`: passou em 15 pacotes.
- `pnpm typecheck`: passou em 15 pacotes.
- `pnpm test`: passou; o web editor executou 46 testes.
- `pnpm build`: passou; permanece o aviso preexistente de chunk Vite acima de 500 kB.
- E2E focado do assistente: 3/3 cenários passaram.
- E2E global: 41/42 cenários passaram. O cenário preexistente
  `text-toolbar.spec.ts:18` excedeu 30 segundos ao tentar reabrir “Cor do
  texto” depois de clicar no canvas; a repetição isolada apresentou a mesma
  falha. Os três cenários do assistente permaneceram verdes.

O `workspace` não contém bibliotecas nativas necessárias ao Chromium. Por isso,
os E2E foram executados no serviço `e2e` fornecido pelo projeto, com a aplicação
mantida no serviço `workspace`.
