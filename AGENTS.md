# ADL — instruções para agentes

## Documentação obrigatória

- Antes de planejar ou implementar alterações, leia e aplique os documentos relevantes em `agent_docs/`:
  - `agent_docs/architecture.md` para limites, dependências e responsabilidades arquiteturais.
  - `agent_docs/conventions.md` para convenções de código, nomenclatura e testes.
  - `agent_docs/workflow.md` para o fluxo de implementação e validação.
- Em caso de conflito, este `AGENTS.md` prevalece sobre os documentos em `agent_docs/`.
- Mantenha esses documentos atualizados quando uma decisão alterar a arquitetura, as convenções ou o fluxo do projeto.

## Ambiente

- Execute instalação, desenvolvimento, lint, typecheck, testes e build no serviço Docker `workspace`.
- Comando preferencial: `docker compose exec workspace bash -lc "<comando>"`.
- Não instale Node.js, pnpm nem dependências diretamente no Windows.
- O código é o único diretório compartilhado com o host. Dependências, store e caches ficam em volumes Linux.
- Não crie backend, banco de dados ou serviços cloud sem decisão explícita.

## Arquitetura

- Preserve a separação entre linguagem, parser, AST, modelo semântico, compilador, layout e renderizadores.
- Não coloque regras de negócio em componentes React.
- Mantenha coordenadas manuais fora do texto `.adl`.

## Validação

- Antes de concluir alterações, execute os scripts existentes de `lint`, `typecheck`, `test` e `build`.
- Execute E2E quando houver mudanças visuais ou de interação.
- Não invente scripts ausentes no `package.json`; registre a ausência e proponha a menor alteração necessária.
