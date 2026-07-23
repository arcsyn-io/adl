# Data Model: Assistente de geração de diagramas

## AssistantDraft

- `prompt`: descrição ainda não enviada.
- `disclosedContent`: conteúdo exato exibido para consentimento.
- `baseRevision`: revisão do documento no momento da preparação.
- `consented`: autorização específica do autor.

### Validation

- `prompt` deve conter texto não vazio após trim.
- Consentimento corresponde exatamente ao conteúdo divulgado.

## AssistanceRequest

- `id`: identidade única da tentativa.
- `intent`: `create-diagram` ou `revise-diagram`.
- `baseRevision`: revisão usada como contexto.
- `disclosedContent`: descrição e, quando necessário, fonte atual.

## Proposal

- `requestId`: correlação com a solicitação.
- `baseRevision`: revisão sobre a qual foi gerada.
- `source`: documento ADL completo candidato.
- `summary`: descrição humana da proposta.

### Validation

- Deve corresponder à solicitação.
- `source` deve passar por diagnósticos sintáticos e semânticos.
- `baseRevision` deve corresponder à revisão atual para preview e aplicação.

## ProposalPreview

- `before`: fonte atual.
- `after`: fonte proposta.
- `summary`: resumo apresentado ao autor.

## AssistantState

Estados:

- `draft`: descrição editável, sem solicitação ativa.
- `ready`: conteúdo divulgado montado, aguardando consentimento.
- `generating`: solicitação consentida em andamento.
- `proposal`: preview válido disponível.
- `error`: falha recuperável com mensagem e código.
- `applied`: proposta confirmada e entregue ao editor.

Transições:

```text
draft -> ready -> generating -> proposal -> applied
  ^        |          |            |
  |        v          v            v
  +----- draft <---- error <----- draft
```

Uma mudança de revisão entre `generating`/`proposal` e aplicação produz erro obsoleto e não altera a fonte.
