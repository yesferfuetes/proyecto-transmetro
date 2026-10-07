# 0003. Despliegue en Railway en lugar de Cloud Run

Fecha: 2026-10-06 · Estado: aceptado · Vigencia: hasta 2026-10-24

## Contexto

El estándar de frontend despliega en Cloud Run. El proyecto no dispone de cuenta institucional en Google Cloud; Railway se eligió como plataforma en la fase de diseño.

## Decisión

PostgreSQL, backend y frontend se despliegan como tres servicios de Railway en un solo entorno de producción, desde la rama `main`. Cada servicio se construye desde su `Dockerfile`; el frontend usa la misma salida standalone que exige el estándar. La configuración vive en `railway.json` de cada carpeta.

## Consecuencias

- El contenedor es el mismo que correría en Cloud Run: migrar no exige cambiar la construcción.
- Railway espera a que el pipeline de GitHub pase antes de desplegar.
- La red privada de Railway permite que el backend no tenga dominio público (ADR 0010).

## Norma afectada

DES-STD-002 §2 (contenedor sobre Cloud Run)
