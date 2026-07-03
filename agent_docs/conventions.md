# Convenções de desenvolvimento

## Princípios gerais

- Prefira código simples, explícito e tipado a abstrações prematuras.
- Preserve os padrões existentes do repositório antes de introduzir uma nova convenção.
- Faça alterações pequenas e relacionadas ao objetivo solicitado.
- Não mantenha código morto, caminhos alternativos sem uso ou comentários que apenas repetem o código.

## TypeScript

- Mantenha tipagem estrita e evite `any`; use `unknown` com refinamento quando a entrada não for confiável.
- Use uniões discriminadas para estados e resultados com variantes conhecidas.
- Separe tipos de domínio dos tipos de bibliotecas e da interface.
- Exporte somente o que constitui contrato público do módulo.
- Trate entradas externas com validação explícita; use Zod nas fronteiras em que validação em runtime seja necessária.
- Não use coerções ou asserções de tipo para ocultar incompatibilidades reais.

## React e estado

- Componentes React cuidam de apresentação, composição e eventos de interface.
- Regras de negócio, transformações da linguagem e cálculos de layout ficam em módulos testáveis fora dos componentes.
- Mantenha estado mínimo; valores calculáveis devem ser derivados.
- Use Zustand apenas para estado compartilhado que realmente ultrapasse limites de componentes.
- Efeitos devem sincronizar com sistemas externos, não calcular estado derivado.
- Hooks personalizados devem representar um comportamento coeso, não apenas mover código de lugar.

## Nomenclatura e organização

- Use nomes que expressem o conceito do domínio e evite abreviações ambíguas.
- Mantenha arquivos e módulos focados em uma responsabilidade.
- Coloque testes próximos da unidade testada quando esse for o padrão do pacote; mantenha E2E em `tests/e2e`.
- Evite arquivos genéricos como `utils.ts` quando existir um nome de domínio mais preciso.
- Respeite aliases, extensão de arquivos e estilo de exportação já adotados no módulo alterado.

## Erros e diagnósticos

- Erros esperados de entrada devem virar diagnósticos estruturados, não exceções genéricas.
- Diagnósticos devem ser determinísticos e, quando aplicável, indicar intervalo de origem no texto.
- Não descarte erros silenciosamente.
- Mensagens voltadas ao usuário devem explicar o problema e, quando possível, a correção esperada.

## Testes

- Controllers e cálculos puros devem ser testados em Vitest antes da integração React.
- Downloads, atalhos globais, touch, drawer responsivo, persistência e exportação são cobertos em Playwright com storage isolado por contexto.

- Teste comportamento observável, contratos e casos limítrofes; evite acoplamento a detalhes internos.
- Alterações no parser, compilador ou modelo exigem testes positivos e negativos relevantes.
- Correções de defeitos devem incluir teste de regressão quando viável.
- Use Vitest para unidades e integrações locais e Playwright para fluxos visuais ou de interação.
- Não substitua integrações simples por mocks extensos; simule somente fronteiras necessárias.
