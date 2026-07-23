# Quickstart Validation: Provedor local Ollama

## Preparar o ambiente

Instale o Ollama pelo instalador oficial e execute:

```powershell
ollama pull qwen3:4b
```

Se o navegador bloquear a origem do editor, encerre o Ollama, configure a
variável de usuário `OLLAMA_ORIGINS` como `http://localhost:5173` e reinicie o
aplicativo Ollama.

## Testes focados

```powershell
docker compose exec workspace bash -lc "pnpm --filter @adl/web-editor test -- ollama"
```

## Jornada manual

1. Abra o editor em `http://localhost:5173`.
2. Confirme “Ollama local” e `qwen3:4b` no painel.
3. Prepare e autorize uma descrição livre.
4. Gere a proposta e confirme que o painel identifica IA local.
5. Revise e aplique.
6. Encerre o Ollama, recarregue e confirme diagnóstico mais fallback demo.

## Validação global

```powershell
docker compose exec workspace bash -lc "pnpm lint && pnpm typecheck && pnpm test && pnpm build"
docker compose run --rm e2e
```

## Resultado em 2026-07-23

- `lint`, `typecheck`, testes unitários e `build`: passaram.
- E2E do assistente: 4 de 4 cenários passaram.
- E2E global: 42 de 43 cenários passaram.
- Falha global restante: timeout já existente em
  `tests/e2e/text-toolbar.spec.ts:18`, ao reabrir “Cor do texto”; não pertence
  ao fluxo Ollama.
- O cliente Ollama foi validado com HTTP injetado. O runtime não está instalado
  nesta máquina, portanto uma geração real depende da preparação descrita acima.
