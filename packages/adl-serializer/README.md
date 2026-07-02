# `@adl/serializer`

Serializa `DiagramModel` em ADL 1.0 canônico. `serializeModel` valida a versão alvo, a
estrutura e as referências antes de produzir qualquer texto. A política fixa ordem por ID,
campos, dois espaços, LF, newline final e escapes JSON. A saída é aceita pelo parser e é
idempotente após o primeiro ciclo. Proveniência e qualquer estado visual não são emitidos.
