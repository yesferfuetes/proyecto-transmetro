import { join } from 'node:path';
import { Client } from 'pg';
import { DataSource } from 'typeorm';
import { validarEntorno } from '../../src/shared/config/entorno';
import { opcionesDeBaseDeDatos } from '../../src/shared/database/opciones';

export interface BaseTemporal {
  fuente: DataSource;
  abrirOtraConexion(): Promise<DataSource>;
  eliminar(): Promise<void>;
}

/**
 * Crea una base vacía con nombre único en el servidor de DATABASE_URL y una fuente de datos con
 * las entidades y migraciones del proyecto. Al terminar, `eliminar` la borra.
 */
export async function crearBaseTemporal(): Promise<BaseTemporal> {
  const urlServidor = new URL(validarEntorno(process.env).DATABASE_URL);
  const nombre = `transmetro_prueba_${process.pid}_${Date.now()}`;
  const urlAdministracion = new URL(urlServidor);
  urlAdministracion.pathname = '/postgres';

  await ejecutarEnAdministracion(urlAdministracion, `CREATE DATABASE ${nombre}`);

  const urlBase = new URL(urlServidor);
  urlBase.pathname = `/${nombre}`;
  const crearFuente = (): DataSource =>
    new DataSource({
      ...opcionesDeBaseDeDatos(urlBase.toString()),
      entities: [join(__dirname, '..', '..', 'src', '**', '*.entity.ts')],
      migrations: [join(__dirname, '..', '..', 'src', 'migrations', '*.ts')],
      logging: false,
    });
  const fuente = await crearFuente().initialize();

  return {
    fuente,
    abrirOtraConexion: (): Promise<DataSource> => crearFuente().initialize(),
    eliminar: async (): Promise<void> => {
      await fuente.destroy();
      await ejecutarEnAdministracion(urlAdministracion, `DROP DATABASE ${nombre} WITH (FORCE)`);
    },
  };
}

async function ejecutarEnAdministracion(url: URL, sentencia: string): Promise<void> {
  const cliente = new Client({ connectionString: url.toString() });
  await cliente.connect();
  try {
    await cliente.query(sentencia);
  } finally {
    await cliente.end();
  }
}

export async function contar(fuente: DataSource, consulta: string): Promise<number> {
  const filas: { total: string }[] = await fuente.query(consulta);
  return Number(filas[0]?.total ?? 0);
}
