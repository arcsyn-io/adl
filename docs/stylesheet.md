# ADL Stylesheet 1.0

Stylesheets keep presentation separate from the semantic ADL model. An external
file is referenced before the document:

```adl
stylesheet "./theme.adls"
adl version "1.0" diagram { }
```

An optional `stylesheet { ... }` block may follow the diagram. Embedded rules
override external rules at equal specificity. Precedence is: renderer default,
`*`, `element *`/`relation *`, semantic type, exact ID. Later declarations at
the same origin and specificity win.

Selectors are `*`, `element *`, `relation *`, `element type "service"`,
`relation type "async"`, `element id api`, and `relation id calls`.

Element properties: `shape`, `width`, `height`, `fill`, `border-paint`,
`border-width`, `border-radius`, `orientation`, `rotation`, `x`, and `y`.
Coordinates must occur together and only on `element id`. Relation properties
are `line-paint` and `line-width`. Both categories accept `text-paint`,
`font-size`, `font-family`, `font-weight`, `font-style`, `text-decoration`,
`text-align`, and `vertical-align`.

Paints are `#RRGGBB`, `#RRGGBBAA`, or
`linear-gradient(90deg, #FFFFFF 0%, #000000FF 100%)`. Dimensions use `px`;
rotations use `deg`. Supported shapes are `rectangle`, `ellipse`, `cylinder`,
`user`, and `parallelogram`.

Invalid syntax, scope, values, or loading produce located style diagnostics and
do not mutate or invalidate an otherwise valid semantic model. A valid selector
without matches produces a warning.
