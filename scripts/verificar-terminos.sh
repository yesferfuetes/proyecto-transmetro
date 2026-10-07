#!/usr/bin/env bash
# Falla si algún archivo versionado menciona términos del proceso interno de documentación.
# Este archivo contiene el patrón que busca, por eso se excluye a sí mismo.
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

patron='specs?|sdd|constituci[oó]n|claude|RF-[0-9]+|RNF?-[0-9]+|CA-[0-9]+'

hallazgos="$(
  git ls-files -z -- \
    ':!package-lock.json' \
    ':!*/package-lock.json' \
    ':!scripts/verificar-terminos.sh' |
    xargs -0 grep -nwiIE "$patron" || true
)"

if [[ -n "$hallazgos" ]]; then
  echo "Se encontraron términos no permitidos en archivos versionados:"
  echo "$hallazgos"
  exit 1
fi

echo "Verificación de términos: sin hallazgos."
