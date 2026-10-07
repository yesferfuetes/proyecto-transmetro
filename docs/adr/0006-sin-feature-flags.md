# 0006. Sin servicio de feature flags

Fecha: 2026-10-06 · Estado: aceptado · Vigencia: hasta 2026-10-24

## Contexto

El estándar prevé un servicio remoto de feature flags para despliegues graduales y kill-switch.

## Decisión

No se usan feature flags: no hay despliegues graduales, segmentos de usuarios ni funcionalidades que deban activarse sin desplegar. No se crea `config/feature-flags.ts`.

## Consecuencias

- Menos código y ninguna dependencia externa.
- Si surge la necesidad, se aplica el §9 del estándar completo.

## Norma afectada

DES-STD-002 §2 y §9
