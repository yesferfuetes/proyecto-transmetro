# 0009. Núcleo técnico compartido y llaves foráneas entre módulos

Fecha: 2026-10-06 · Estado: aceptado · Vigencia: hasta 2026-10-24

## Contexto

El monolito necesita piezas transversales una sola vez: configuración, conexión a la base, error de negocio base, filtro de excepciones, verificación de salud. Además, algunas tablas tienen llaves foráneas hacia tablas que pertenecen a otro módulo (por ejemplo, `bus.linea_id`).

## Decisión

- `backend/src/shared/` contiene solo piezas técnicas sin negocio. No tiene entidades, repositorios ni servicios de negocio; un módulo de negocio puede importarlo, y él no importa ningún módulo.
- Una llave foránea hacia otro módulo se mapea como columna de identificador y se declara con `@ForeignKey('NombreDeEntidad')`, por nombre y sin importar la clase ajena. La base mantiene la integridad; el código no se acopla.
- No se crea la carpeta `transports`: no hay transportes entre servicios.

## Consecuencias

- Las reglas de fronteras de ESLint permiten `módulo → shared` y prohíben `módulo → otro módulo`.
- El chequeo de deriva entre entidades y esquema no reporta diferencias, incluidas esas llaves.

## Norma afectada

DES-STD-004 §5 (estructura) y §12 (acoplamiento). Decisión de diseño
