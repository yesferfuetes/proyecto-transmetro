# 0013. Columnas de fecha y hora con zona horaria

Fecha: 2026-10-06 · Estado: aceptado · Vigencia: hasta 2026-10-24

## Contexto

El modelo de datos original usaba `TIMESTAMP` sin zona. Los servidores de Railway corren en UTC, de modo que `now()` guardaría la hora UTC sin indicarlo, y la interfaz no podría distinguirla de la hora local.

## Decisión

Todas las columnas de fecha y hora usan `TIMESTAMPTZ`. La base guarda el instante; la interfaz lo muestra en la zona `America/Guatemala`.

## Consecuencias

- Las comparaciones por rango de fechas de los reportes son correctas sin importar la zona del servidor.
- Es un cambio de tipo, no de estructura: no altera tablas ni relaciones.

## Norma afectada

Ninguna. Decisión de diseño
