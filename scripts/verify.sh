#!/usr/bin/env bash
# Cerca.md: "Nada entra a main sin verify.sh." Mismo archivo en la máquina y en CI.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "→ Tipos (tsc --noEmit)"
npm run --silent typecheck

echo "→ Formato (prettier --check)"
npm run --silent format:check

echo "→ Linter (eslint)"
npm run --silent lint

echo "→ Tests (vitest run)"
npm run --silent test

echo "✔ verify.sh: todo en verde"
