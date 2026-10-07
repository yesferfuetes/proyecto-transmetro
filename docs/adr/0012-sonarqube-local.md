# 0012. SonarQube en instancia local con runner propio

Fecha: 2026-10-06 · Estado: aceptado · Vigencia: hasta 2026-10-24

## Contexto

El estándar exige SonarQube con Quality Gate aprobado y que no se integre código que no lo pase. No hay instancia institucional y el repositorio es privado, por lo que no aplica el plan gratuito de SonarQube Cloud.

## Decisión

- Se usa SonarQube Community Build en un contenedor local, con el proyecto `transmetro` y el Quality Gate `Transmetro`: cero problemas de severidad alta o bloqueante (bugs, vulnerabilidades y code smells), hotspots revisados al 100 %, duplicación de hasta 5 % y cobertura de código nuevo de al menos 70 %.
- El trabajo `sonar` del pipeline corre en un runner propio de GitHub Actions instalado en la máquina donde vive esa instancia, y espera el resultado del Quality Gate.
- Railway despliega `main` solo si el pipeline completo pasa: un Quality Gate fallido impide el despliegue.

## Consecuencias

- Al hacer push, esa máquina debe estar encendida, con Docker y el contenedor de SonarQube en marcha; si no, el pipeline y el despliegue esperan.
- La edición Community analiza una sola rama, sin análisis de pull requests.
- Si la cuenta de GitHub no permite protección de rama en repositorios privados, lo que se bloquea es el despliegue, no el push.

## Norma afectada

DES-STD-004 §9
