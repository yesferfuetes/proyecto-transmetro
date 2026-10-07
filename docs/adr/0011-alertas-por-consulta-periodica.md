# 0011. Alertas por consulta periódica

Fecha: 2026-10-06 · Estado: aceptado · Vigencia: hasta 2026-10-24

## Contexto

Las alertas de capacidad deben llegar al operador en no más de 10 segundos desde el evento. El diseño original las enviaba por WebSocket directo desde el backend, que ya no es accesible desde el navegador (ADR 0010).

## Decisión

La pantalla de alertas consulta cada 5 segundos con TanStack Query, mediante una ruta de datos del servidor de Next.js. Es el mecanismo que el estándar reserva para datos de actualización frecuente.

## Consecuencias

- Cumple el límite de 10 segundos con margen.
- Sin conexiones persistentes que mantener.
- Genera una consulta cada 5 segundos por operador conectado; con el número de estaciones del sistema es una carga baja.

## Norma afectada

DES-STD-002 §6.1. Decisión de diseño
