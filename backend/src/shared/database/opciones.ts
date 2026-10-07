import type { DataSourceOptions } from 'typeorm';

/**
 * Opciones comunes de la conexión, para la aplicación y para la CLI de migraciones.
 * La tabla de control de migraciones vive en `public`, que siempre existe; cada entidad declara
 * el esquema `transmetro`, que crea la migración inicial. Se fija `public` de forma explícita
 * porque el `search_path` por defecto empieza por el esquema con el nombre del usuario: si el
 * usuario se llamara `transmetro`, TypeORM buscaría su tabla de control en el esquema equivocado.
 */
export function opcionesDeBaseDeDatos(url: string): DataSourceOptions {
  return {
    type: 'postgres',
    url,
    schema: 'public',
    synchronize: false,
    migrationsRun: false,
    migrationsTransactionMode: 'each',
  };
}
