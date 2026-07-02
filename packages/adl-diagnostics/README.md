# `@adl/diagnostics`

Validação unificada e local da ADL. O pacote converte falhas do parser e do modelo
semântico em um contrato comum, localizado e consumível pelo editor ou por outras
ferramentas, sem depender de React ou APIs do navegador.

## Uso

```ts
import { validateSource } from "@adl/diagnostics";

const result = validateSource(source);
if (!result.canProceed) {
  for (const diagnostic of result.diagnostics) {
    console.error(diagnostic.code, diagnostic.message, diagnostic.range);
  }
}
```

Cada diagnóstico contém código estável, severidade, mensagem acionável, range principal e
localizações relacionadas. `hasErrors` e `canProceed` são derivados da severidade; o
contrato aceita `error` e `warning`, embora o catálogo inicial contenha apenas regras
bloqueantes definidas pelas specs anteriores.

## Comportamento

- Erros sintáticos e semânticos usam o mesmo formato.
- A validação sintática bloqueia a fase semântica quando não existe AST confiável.
- Identificadores duplicados apontam também a primeira declaração.
- Referências inválidas causadas somente por uma identidade duplicada são suprimidas como
  cascata; problemas independentes continuam sendo relatados.
- Diagnósticos são ordenados por posição e código de forma determinística.
- Conteúdo fornecido pelo usuário é escapado antes de entrar em mensagens.
- Resultados são congelados profundamente e não há rede, telemetria ou correção automática.
