# Contract: Assistente de geração de diagramas

## Input

- Descrição textual do autor.
- Fonte ADL atual.
- Revisão atual.
- Consentimento para o conteúdo divulgado.
- Adaptador substituível que segue `ProviderAdapter`.

## Prepare

- Rejeitar descrição vazia.
- Montar conteúdo divulgado determinístico e visível.
- Registrar a revisão base.
- Não chamar adaptador nesta etapa.

## Generate

- Exigir consentimento correspondente à solicitação.
- Tratar saída do adaptador como `unknown`.
- Exigir correlação de `requestId`.
- Validar fonte ADL pela cadeia normal.
- Preservar documento atual em qualquer falha.

## Preview

- Exibir resumo.
- Exibir fonte atual e proposta.
- Não executar `onApply`.
- Bloquear preview quando a revisão mudou.

## Apply

- Exigir ação explícita do autor.
- Revalidar fonte e revisão.
- Entregar a fonte completa uma única vez ao binding do editor.
- Limpar a proposta depois da aplicação.

## Discard

- Remover solicitação e proposta do estado do assistente.
- Não alterar fonte, modelo, stylesheet, seleção ou geometria.

## Local provider

- Não acessa rede, storage ou APIs do navegador.
- Gera IDs únicos e sintaxe ADL 1.0.
- Reconhece conceitos básicos de arquitetura e usa fallback válido.
- Declara visualmente que é uma demonstração local, não um modelo remoto.

## Accessibility

- Formulário, consentimento, progresso, erro e ações possuem nomes acessíveis.
- Mudanças de estado relevantes são anunciadas.
- Aplicar e descartar são utilizáveis por teclado.
