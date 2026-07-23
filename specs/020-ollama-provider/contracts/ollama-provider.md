# Contract: Ollama Provider

## Defaults

- Endpoint: `http://127.0.0.1:11434`
- Model: `qwen3:4b`
- Timeout: 120000 ms

## Status

`GET {endpoint}/api/tags`

- Validar HTTP e JSON.
- Considerar equivalentes o nome exato e o nome com tag `:latest`.
- Retornar estado discriminado, sem exceção para indisponibilidade esperada.

## Chat

`POST {endpoint}/api/chat`

- `model`: configuração atual.
- `messages`: instrução de sistema e conteúdo consentido.
- `stream`: false.
- `think`: false.
- `format`: schema `{ source: string, summary: string }`.
- `options.temperature`: 0.

## Response

- Validar envelope HTTP `{ message: { content } }`.
- Interpretar `content` como JSON.
- Validar fonte e resumo como strings não vazias.
- Correlacionar `requestId` e `baseRevision` localmente.
- Nunca aplicar ou corrigir silenciosamente a fonte recebida.

## Errors

- Falha de rede/CORS: explicar que Ollama não está acessível.
- HTTP 404/modelo ausente: informar `ollama pull <model>`.
- Timeout: informar o limite atingido.
- JSON inválido: resposta fora do contrato.

## Prompt

- Incluir sintaxe ADL 1.0 suportada e um exemplo pequeno.
- Proibir Markdown, coordenadas e stylesheet.
- Exigir IDs únicos e relações resolvidas.
- Incluir o conteúdo consentido sem contexto oculto adicional.
