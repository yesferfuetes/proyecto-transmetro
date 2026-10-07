import 'reflect-metadata';
import { join } from 'node:path';
import { DataSource } from 'typeorm';
import { validarEntorno } from '../config/entorno';
import { opcionesDeBaseDeDatos } from './opciones';

/** Fuente de datos para la CLI de TypeORM (migraciones y chequeo de deriva) y las semillas. */
const entorno = validarEntorno(process.env);

export default new DataSource({
  ...opcionesDeBaseDeDatos(entorno.DATABASE_URL),
  entities: [join(__dirname, '..', '..', '**', '*.entity.js')],
  migrations: [join(__dirname, '..', '..', 'migrations', '*.js')],
});
