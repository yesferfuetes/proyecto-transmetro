#!/usr/bin/env bash
# Configuración de los servicios backend y frontend en Railway. Es la fuente de verdad de esa
# configuración: Railway ya no lee railway.json. Puede ejecutarse varias veces sin efectos dobles.
#
#   bash scripts/railway-configurar.sh backend|frontend
#
# 1. Fija construcción, despliegue, salud y reinicio del servicio.
# 2. Si el servicio aún no tiene repositorio, lo conecta a la rama main (dispara un despliegue).
# 3. Activa la espera del pipeline: Railway no despliega un commit cuyo pipeline no pasó.
# Requiere la CLI de Railway con sesión iniciada.
# Los $ dentro de comillas simples son variables de GraphQL, no de la terminal.
# shellcheck disable=SC2016
set -euo pipefail

SERVICIO="${1:?Uso: railway-configurar.sh backend|frontend}"
PROYECTO=9eef1ed9-2614-4576-9dfd-cac4f272f93f
ENTORNO=2c1fc999-8ca8-4044-b0b3-1f50c9ce7c36
REPO=yesferfuetes/proyecto-transmetro
RAMA=main

case "$SERVICIO" in
  backend)
    ID_SERVICIO=5a16594a-1e48-4db6-867f-324b4dedd67a
    CONFIGURACION='{
      "rootDirectory": "/backend",
      "builder": "DOCKERFILE",
      "dockerfilePath": "Dockerfile",
      "watchPatterns": ["/backend/**"],
      "preDeployCommand": ["npm run migration:run"],
      "healthcheckPath": "/health",
      "healthcheckTimeout": 60,
      "restartPolicyType": "ON_FAILURE",
      "restartPolicyMaxRetries": 3
    }'
    ;;
  frontend)
    ID_SERVICIO=c116fae9-d6df-4b26-8588-1a839928c179
    CONFIGURACION='{
      "rootDirectory": "/frontend",
      "builder": "DOCKERFILE",
      "dockerfilePath": "Dockerfile",
      "watchPatterns": ["/frontend/**"],
      "healthcheckPath": "/",
      "healthcheckTimeout": 60,
      "restartPolicyType": "ON_FAILURE",
      "restartPolicyMaxRetries": 3
    }'
    ;;
  *)
    echo "Servicio desconocido: $SERVICIO"
    exit 1
    ;;
esac

cd "$(git rev-parse --show-toplevel)"

consultar() {
  railway api --compact "$1" --variables "$2"
}

echo "1/3 Configuración de $SERVICIO"
consultar \
  'mutation($s: String!, $e: String!, $i: ServiceInstanceUpdateInput!) { serviceInstanceUpdate(serviceId: $s, environmentId: $e, input: $i) }' \
  "{\"s\":\"$ID_SERVICIO\",\"e\":\"$ENTORNO\",\"i\":$CONFIGURACION}"

disparador() {
  consultar \
    'query($p: String!, $e: String!, $s: String!) { deploymentTriggers(projectId: $p, environmentId: $e, serviceId: $s) { edges { node { id } } } }' \
    "{\"p\":\"$PROYECTO\",\"e\":\"$ENTORNO\",\"s\":\"$ID_SERVICIO\"}" |
    python3 -c "import sys, json; e = json.load(sys.stdin)['data']['deploymentTriggers']['edges']; print(e[0]['node']['id'] if e else '')"
}

echo "2/3 Repositorio $REPO, rama $RAMA"
ID_DISPARADOR="$(disparador)"
if [[ -z "$ID_DISPARADOR" ]]; then
  railway service source connect --repo "$REPO" --branch "$RAMA" --service "$SERVICIO"
  ID_DISPARADOR="$(disparador)"
else
  echo "Ya estaba conectado."
fi

echo "3/3 Esperar al pipeline antes de desplegar"
consultar \
  'mutation($id: String!, $i: DeploymentTriggerUpdateInput!) { deploymentTriggerUpdate(id: $id, input: $i) { repository branch checkSuites } }' \
  "{\"id\":\"$ID_DISPARADOR\",\"i\":{\"checkSuites\":true}}"

echo "Listo: $SERVICIO configurado."
