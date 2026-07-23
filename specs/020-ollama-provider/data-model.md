# Data Model: Provedor local Ollama

## OllamaConfig

- `endpoint`: URL HTTP loopback sem caminho final.
- `model`: nome não vazio.
- `timeoutMs`: inteiro positivo entre 1 segundo e 10 minutos.

## OllamaStatus

- `checking`
- `available`: modelo solicitado encontrado.
- `model-missing`: runtime respondeu, mas modelo não foi listado.
- `unavailable`: endpoint não respondeu ou bloqueou acesso.

## OllamaStructuredProposal

- `source`: fonte ADL completa.
- `summary`: resumo curto.

## ProviderMode

- `ollama`: geração real local.
- `demo`: geração determinística.

Alterar modo ou configuração descarta solicitação/proposta preparada para evitar consentimento obsoleto.
