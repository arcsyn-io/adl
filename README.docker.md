# Ambiente Docker de desenvolvimento do ADL

Toda a toolchain roda em containers Linux. Somente o código-fonte é compartilhado com o Windows; `node_modules`, store do pnpm e cache do Turborepo permanecem em volumes Docker.

## Pré-requisitos

- Windows com Docker Desktop e containers Linux habilitados.
- Docker Compose v2 (`docker compose`).
- Repositório com `package.json`, `pnpm-workspace.yaml` e lockfile do pnpm.

Não instale Node.js, pnpm ou dependências no Windows.

## Primeira execução

```powershell
.\scripts\adl.ps1 build
.\scripts\adl.ps1 up
.\scripts\adl.ps1 logs
```

A aplicação fica disponível em <http://localhost:5173>. O serviço instala dependências e inicia o package `@adl/web-editor`, configurável por `WEB_EDITOR_PACKAGE`.

## Uso diário

```powershell
.\scripts\adl.ps1 up
.\scripts\adl.ps1 dev
.\scripts\adl.ps1 exec pnpm turbo build
.\scripts\adl.ps1 down
```

No Linux, use `./scripts/adl.sh <comando>` ou os alvos equivalentes do `Makefile`.

## Shell e testes

```powershell
.\scripts\adl.ps1 shell
.\scripts\adl.ps1 lint
.\scripts\adl.ps1 typecheck
.\scripts\adl.ps1 test-unit
.\scripts\adl.ps1 test-e2e
```

O E2E usa `BASE_URL=http://workspace:5173`. Defina `PLAYWRIGHT_IMAGE` com a tag oficial que corresponda exatamente à versão do `@playwright/test` presente no lockfile. A imagem contém os browsers; eles não são baixados novamente.

## Codex App no Windows

Abra esta pasta como workspace. O Codex edita arquivos no host, mas deve executar comandos assim:

```bash
docker compose exec workspace bash -lc "pnpm typecheck"
```

As opções de polling permitem que Vite detecte alterações no bind mount do Windows.

## Volumes e limpeza

O bind mount `.:/workspace` é o único compartilhamento com o host. Os volumes nomeados `node_modules`, `pnpm_store`, `turbo_cache` e `gh_config` mantêm dependências, caches e autenticação do GitHub dentro do ambiente Linux.

Para autenticar o GitHub CLI sem instalar Git ou `gh` no Windows:

```powershell
.\scripts\adl.ps1 shell
gh auth login
gh auth status
```

Para apagar dependências e caches Linux:

```powershell
.\scripts\adl.ps1 clean
```

Esse comando remove os volumes do projeto; a próxima subida reinstala tudo.

## Estrutura esperada

```text
/
├── apps/ ou packages/       # editor e demais workspaces
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── turbo.json
├── compose.yaml
├── docker/Dockerfile.dev
└── scripts/
```

## Serviços futuros

O MVP é local-first e persiste no IndexedDB, portanto não precisa de backend, PostgreSQL, Redis ou cloud. Eles só fazem sentido após uma decisão explícita por colaboração multiusuário, sincronização entre dispositivos, autenticação, processamento servidor ou armazenamento centralizado.

## Estado inicial deste repositório

No momento da criação desta configuração, não existiam `package.json`, `pnpm-workspace.yaml`, lockfile, packages nem scripts. Por isso, o nome padrão continua `@adl/web-editor` e a tag Playwright é apenas um padrão substituível. Assim que o monorepo for adicionado, alinhe `WEB_EDITOR_PACKAGE` e `PLAYWRIGHT_IMAGE` aos nomes e versões reais; não renomeie packages nem invente scripts.
