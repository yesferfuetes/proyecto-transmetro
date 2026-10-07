# 0007. Sin carga de archivos

Fecha: 2026-10-06 · Estado: aceptado · Vigencia: hasta 2026-10-24

## Contexto

El estándar regula la carga de archivos a almacenamiento de objetos. Ningún caso de uso del sistema carga archivos.

## Decisión

No se implementa carga ni descarga de archivos y no se usa almacenamiento de objetos. Ningún archivo se guarda en el sistema de archivos del contenedor.

## Consecuencias

- Si un caso de uso lo requiere, se aplica el §6.5 completo y se registra el almacenamiento elegido.

## Norma afectada

DES-STD-002 §6.5
