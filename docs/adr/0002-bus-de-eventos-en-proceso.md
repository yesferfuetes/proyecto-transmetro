# 0002. Eventos de dominio por el bus en proceso

Fecha: 2026-10-06 · Estado: aceptado · Vigencia: hasta 2026-10-24

## Contexto

El estándar prevé un message broker para la comunicación asíncrona entre servicios. Con un monolito (ADR 0001) no hay otro proceso al cual publicarle.

## Decisión

Los eventos de dominio se publican en el `EventBus` en proceso de `@nestjs/cqrs` y los consumen los `event-listeners` de cada módulo.

## Consecuencias

- Sin infraestructura adicional.
- Los eventos no sobreviven a un reinicio del proceso: lo que deba persistir se guarda en la base dentro del command que lo origina.
- La forma de publicar y escuchar es la misma que tendría con un broker, lo que facilita migrar si se separan servicios.

## Norma afectada

DES-STD-004 §2 (mensajería por message broker)
