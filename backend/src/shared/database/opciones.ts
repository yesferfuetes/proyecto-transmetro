import type { DataSourceOptions } from 'typeorm';

/**
 * Opciones comunes de la conexión, para la aplicación y para la CLI de migraciones.
 * Sin esquema global: la tabla de control de migraciones queda en `public`, y cada entidad
 * declara el esquema `transmetro`, que crea la migración inicial.
 */
export function opcionesDeBaseDeDatos(url: string): DataSourceOptions {
  return {
    type: 'postgres',
    url,
    synchronize: false,
    migrationsRun: false,
    migrationsTransactionMode: 'each',
  };
}
