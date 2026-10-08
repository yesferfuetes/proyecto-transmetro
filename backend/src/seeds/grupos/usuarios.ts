import type { EntityManager } from 'typeorm';
import { Estacion } from '../../red/entities/estacion.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { cifrarContrasena } from '../../shared/seguridad/cifrador-de-contrasenas';
import { LINEAS } from '../datos/red';
import { DOMINIO_DE_LA_DEMO, LINEAS_CON_OPERADOR, USUARIOS_SIN_ESTACION } from '../datos/usuarios';
import { Resumen, sincronizar, sumarResumenes } from '../sincronizar';

type FilaUsuario = Pick<Usuario, 'nombre' | 'email' | 'rol' | 'estacionId'>;

/**
 * Un administrador, un supervisor y un operador por cada primera estación de las líneas elegidas.
 * Un usuario que ya existe conserva su contraseña: el cifrado cambia en cada ejecución y la
 * siembra debe poder repetirse sin cambios.
 */
export async function sembrarUsuarios(gestor: EntityManager, contrasena: string): Promise<Resumen> {
  const filas = [
    ...USUARIOS_SIN_ESTACION.map((u) => ({ ...u, estacionId: null })),
    ...(await operadores(gestor)),
  ];
  const repositorio = gestor.getRepository(Usuario);
  const existentes = new Set(
    (await repositorio.find({ select: { email: true } })).map((u) => u.email),
  );

  const nuevas = filas.filter((fila) => !existentes.has(fila.email));
  for (const fila of nuevas) {
    await repositorio.insert({ ...fila, passwordHash: await cifrarContrasena(contrasena) });
  }
  const insertados: Resumen = { insertados: nuevas.length, actualizados: 0, sinCambios: 0 };
  const previas = filas.filter((fila) => existentes.has(fila.email));
  return sumarResumenes(insertados, await sincronizar(gestor, Usuario, previas, ['email']));
}

async function operadores(gestor: EntityManager): Promise<FilaUsuario[]> {
  const primeras = new Set(
    LINEAS.filter((linea) => LINEAS_CON_OPERADOR.includes(linea.codigo)).map(
      (linea) => linea.recorrido[0],
    ),
  );
  const estaciones = await gestor.getRepository(Estacion).find({ order: { codigo: 'ASC' } });
  return estaciones
    .filter((estacion) => primeras.has(estacion.nombre))
    .map((estacion) => ({
      nombre: `Operador de ${estacion.nombre}`,
      email: `operador.${estacion.codigo.toLowerCase()}@${DOMINIO_DE_LA_DEMO}`,
      rol: 'OPERADOR_ESTACION',
      estacionId: estacion.id,
    }));
}
