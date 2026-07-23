# Research: Provedor local Ollama

## Decision: API de chat sem streaming

**Decision**: Usar `POST /api/chat` com `stream: false`.

**Rationale**: A API oficial retorna uma única mensagem e simplifica timeout, cancelamento e validação.

**Alternatives considered**: Streaming NDJSON foi adiado porque não agrega valor ao preview atômico.

## Decision: Saída estruturada

**Decision**: Passar JSON Schema no campo `format`, repetir o schema no prompt e usar temperatura zero.

**Rationale**: A documentação oficial recomenda schema compartilhado com o prompt e temperatura baixa para respostas confiáveis.

**Alternatives considered**: Extrair blocos Markdown foi rejeitado por ser frágil.

## Decision: Modelo padrão

**Decision**: Usar `qwen3:4b`.

**Rationale**: A biblioteca oficial lista variante de aproximadamente 2,5 GB, multilíngue e com bom seguimento de instruções; é mais acessível que modelos de código de 19 GB ou mais.

**Alternatives considered**: `qwen3-coder:30b` demanda cerca de 19 GB; modelos menores podem ser selecionados manualmente.

## Decision: Browser direto para loopback

**Decision**: Chamar `http://127.0.0.1:11434` diretamente do navegador.

**Rationale**: Evita backend e mantém o conteúdo local ao computador do usuário.

**Alternatives considered**: Proxy Vite funcionaria apenas em desenvolvimento; serviço intermediário violaria o escopo.

## Decision: Disponibilidade por modelos instalados

**Decision**: Consultar `GET /api/tags`, cujo envelope oficial lista `name` e `model`.

**Rationale**: Diferencia runtime indisponível de modelo não instalado antes da geração.

## Decision: CORS documentado

**Decision**: Orientar `OLLAMA_ORIGINS=http://localhost:5173` quando necessário.

**Rationale**: A documentação oficial exige `OLLAMA_ORIGINS` para origens adicionais.
