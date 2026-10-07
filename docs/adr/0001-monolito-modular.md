# 0001. Monolito modular con una sola base de datos

Fecha: 2026-10-06 · Estado: aceptado · Vigencia: hasta 2026-10-24

## Contexto

El estándar de backend define microservicios con base de datos propia y despliegue independiente. El sistema tiene siete contextos de negocio pequeños, un solo equipo y un plazo de semanas; varios contextos comparten datos de referencia (estaciones, líneas, buses).

## Decisión

Se construye un monolito modular en NestJS: un módulo por contexto de negocio (usuarios, red, accesos, flota, pilotos, alertas, reportes) y una sola base PostgreSQL. Cada módulo conserva la estructura CQRS del estándar. Un módulo no importa entidades, repositorios ni servicios de otro; cuando necesita un dato ajeno lo pide por un adaptador en `infrastructure/adapters`. Se aplican los criterios de aceptación para monolito del propio estándar.

## Consecuencias

- Un solo despliegue y una sola base: menos infraestructura y sin consistencia eventual entre servicios.
- Las fronteras entre módulos se verifican con ESLint (`eslint-plugin-boundaries`), no por la red.
- Las llaves foráneas entre tablas de distintos módulos existen en la base (ver ADR 0009).
- Si un módulo necesitara escalar por separado, su frontera ya está trazada para extraerlo.

## Norma afectada

DES-STD-004 §3.1 (microservicios con base propia) y §12 (criterios de aceptación)
