# @adl/layout

Calcula geometria automática determinística sem alterar o modelo semântico ou o texto ADL.

```ts
const result = await calculateLayout(model, { direction: "RIGHT", spacing: 60 });
```

Falhas retornam códigos estáveis e podem carregar o último layout utilizável em `previous`.
