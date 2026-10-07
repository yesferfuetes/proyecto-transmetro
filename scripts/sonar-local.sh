#!/usr/bin/env bash
# Genera la cobertura de ambos proyectos y analiza el repositorio con la instancia local de
# SonarQube. Espera el resultado del Quality Gate y falla si no es PASSED.
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

archivo_token="${SONAR_TOKEN_FILE:-$HOME/.sonar/transmetro-analysis-token}"
servidor="${SONAR_HOST_URL:-http://host.docker.internal:9000}"

if [[ ! -s "$archivo_token" ]]; then
  echo "No existe el token de análisis en $archivo_token"
  exit 1
fi

(cd backend && npm run test:cov)
(cd frontend && npm run test:cov)

docker run --rm \
  -e SONAR_HOST_URL="$servidor" \
  -e SONAR_TOKEN="$(<"$archivo_token")" \
  -v "$PWD:/usr/src" \
  sonarsource/sonar-scanner-cli \
  -Dsonar.qualitygate.wait=true \
  -Dsonar.qualitygate.timeout=300
