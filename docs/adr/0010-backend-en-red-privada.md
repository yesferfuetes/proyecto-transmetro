# 0010. El navegador solo habla con Next.js; backend en red privada

Fecha: 2026-10-06 · Estado: aceptado · Vigencia: hasta 2026-10-24

## Contexto

El estándar de frontend obtiene los datos en el servidor y resuelve las mutaciones con acciones de servidor. Con eso, el navegador no necesita llamar al backend.

## Decisión

El navegador solo se comunica con el servidor de Next.js. Next.js llama a NestJS por la red privada de Railway. El backend no tiene dominio público ni CORS. Swagger está disponible fuera de producción y el pipeline publica `openapi.json` como artefacto.

## Consecuencias

- Menor superficie de ataque: el backend no es alcanzable desde internet.
- Toda llamada pasa por la capa `data/` o `actions/` de un módulo del frontend, con tiempo de espera y validación con Zod.
- El backend escucha en IPv4 e IPv6, porque la red privada de Railway puede resolver por IPv6.

## Norma afectada

DES-STD-002 §6 y §14. Decisión de diseño
