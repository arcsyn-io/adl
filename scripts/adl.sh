#!/usr/bin/env bash
set -euo pipefail

command_name="${1:-up}"
if (($#)); then shift; fi

workspace_exec() {
  docker compose exec workspace bash -lc "$*"
}

case "$command_name" in
  build) docker compose build workspace ;;
  up) docker compose up -d workspace ;;
  down) docker compose down ;;
  shell) docker compose exec workspace bash ;;
  install) workspace_exec pnpm install ;;
  dev) docker compose up workspace ;;
  test|test-unit) workspace_exec pnpm test ;;
  test-e2e) docker compose --profile test run --rm e2e ;;
  lint) workspace_exec pnpm lint ;;
  typecheck) workspace_exec pnpm typecheck ;;
  logs) docker compose logs -f workspace ;;
  clean) docker compose down --volumes --remove-orphans ;;
  exec)
    if (($# == 0)); then
      echo "Uso: ./scripts/adl.sh exec <comando>" >&2
      exit 2
    fi
    workspace_exec "$@"
    ;;
  *)
    echo "Comando desconhecido: $command_name" >&2
    exit 2
    ;;
esac
