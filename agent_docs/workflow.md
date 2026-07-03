# Fluxo de implementação

## 1. Compreensão

- Leia `AGENTS.md` e os documentos relevantes em `agent_docs/`.
- Inspecione a especificação, os arquivos afetados, contratos existentes e testes próximos.
- Confirme os scripts disponíveis no `package.json`; não presuma comandos inexistentes.
- Identifique a camada responsável pela mudança antes de editar código.

## 2. Planejamento

- Defina o comportamento esperado e os critérios verificáveis de conclusão.
- Mapeie impactos no pipeline: sintaxe, AST, semântica, compilação, layout, renderização e interface.
- Prefira a menor mudança coerente com a arquitetura.
- Registre ou peça uma decisão quando o trabalho exigir backend, banco, cloud, nova dependência relevante ou mudança arquitetural.

## 3. Implementação

- Execute comandos de desenvolvimento no serviço Docker `workspace`.
- Preserve alterações existentes do usuário e evite modificar arquivos fora do escopo.
- Siga TDD para comportamentos novos e correções de defeitos:
  1. **Red:** escreva primeiro um teste que expresse o comportamento esperado e confirme que ele falha pela razão correta.
  2. **Green:** implemente a menor alteração suficiente para fazer o teste passar.
  3. **Refactor:** melhore o código e os testes sem alterar o comportamento, mantendo a suíte verde.
- Não escreva a implementação antes de observar o teste relevante falhar, salvo quando o trabalho não tiver comportamento executável, como alterações exclusivamente documentais.
- Implemente primeiro os contratos e a lógica da camada responsável, depois adapte consumidores, repetindo o ciclo red–green–refactor em incrementos pequenos.
- Para mudanças visuais, preserve acessibilidade, estados de interação e comportamento responsivo aplicável.

## 4. Validação

Execute os scripts existentes no serviço `workspace` antes de concluir:

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

- Execute `pnpm test:e2e` quando houver mudanças visuais ou de interação.
- Para E2E de download e persistência, inicialize um contexto limpo e valide o artefato ou registro observável, não apenas o clique.
- Para touch e responsividade, execute os casos com viewport e contexto de dispositivo explícitos.
- Comece por testes focados durante o desenvolvimento, mas conclua com as verificações globais exigidas.
- Se um script estiver ausente ou falhar por causa preexistente, registre isso claramente; não invente um substituto silencioso.

## 5. Entrega

- Revise o diff para remover alterações acidentais, código morto e inconsistências.
- Informe objetivamente o que mudou e quais validações foram executadas.
- Liste falhas, riscos ou trabalho restante sem ocultá-los.
- Atualize a documentação quando a mudança alterar contratos, arquitetura, convenções ou comandos do projeto.
