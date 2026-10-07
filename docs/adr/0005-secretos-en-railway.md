# 0005. Secretos en las variables de Railway

Fecha: 2026-10-06 · Estado: aceptado · Vigencia: hasta 2026-10-24

## Contexto

El estándar exige guardar los secretos en el gestor institucional, que no está disponible.

## Decisión

Los secretos (cadena de conexión, clave de firma de tokens) se guardan como variables de cada servicio en Railway, con referencias entre servicios cuando aplica. Ninguno lleva prefijo público ni se escribe en el repositorio; los `.env.example` solo listan nombres.

## Consecuencias

- Railway cifra las variables y solo las expone al servicio que las declara.
- La rotación es manual desde el panel de Railway.

## Norma afectada

DES-STD-002 §14.1 (gestor de secretos institucional)
