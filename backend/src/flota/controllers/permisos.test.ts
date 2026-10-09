import { RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { METADATO_ROLES } from '../../shared/auth/decoradores';
import { BusesController } from './buses.controller';
import { FlotaPorLineaController } from './flota-por-linea.controller';
import { OpcionesController } from './opciones.controller';
import { ParqueosController } from './parqueos.controller';

type Controlador = abstract new (...argumentos: never[]) => object;

interface Ruta {
  metodo: string;
  ruta: string;
  roles: unknown;
}

function rutas(controlador: Controlador): Ruta[] {
  const prototipo = controlador.prototype as Record<string, unknown>;
  return Object.getOwnPropertyNames(prototipo)
    .filter((nombre) => nombre !== 'constructor')
    .map((nombre) => {
      const manejador = prototipo[nombre] as object;
      const metodo = Reflect.getMetadata(METHOD_METADATA, manejador) as RequestMethod;
      return {
        metodo: RequestMethod[metodo],
        ruta: Reflect.getMetadata(PATH_METADATA, manejador) as string,
        roles: Reflect.getMetadata(METADATO_ROLES, manejador) as unknown,
      };
    });
}

const SUPERVISOR = ['SUPERVISOR_MUNICIPAL'];

describe('permisos de la flota', () => {
  it('las escrituras de buses exigen supervisor; las lecturas solo sesión', () => {
    expect(rutas(BusesController)).toEqual([
      { metodo: 'GET', ruta: '/', roles: undefined },
      { metodo: 'GET', ruta: ':id', roles: undefined },
      { metodo: 'POST', ruta: '/', roles: SUPERVISOR },
      { metodo: 'PATCH', ruta: ':id', roles: SUPERVISOR },
      { metodo: 'PUT', ruta: ':id/linea', roles: SUPERVISOR },
      { metodo: 'PUT', ruta: ':id/parqueo', roles: SUPERVISOR },
      { metodo: 'PUT', ruta: ':id/estado', roles: SUPERVISOR },
    ]);
  });

  it('las escrituras de parqueos exigen supervisor; las lecturas solo sesión', () => {
    expect(rutas(ParqueosController)).toEqual([
      { metodo: 'GET', ruta: '/', roles: undefined },
      { metodo: 'GET', ruta: ':id', roles: undefined },
      { metodo: 'POST', ruta: '/', roles: SUPERVISOR },
      { metodo: 'PATCH', ruta: ':id', roles: SUPERVISOR },
      { metodo: 'DELETE', ruta: ':id', roles: SUPERVISOR },
    ]);
  });

  it('la flota por línea y las opciones son solo lectura con sesión', () => {
    const lecturas = [...rutas(FlotaPorLineaController), ...rutas(OpcionesController)];

    expect(lecturas).toHaveLength(4);
    expect(lecturas.every((ruta) => ruta.metodo === 'GET' && ruta.roles === undefined)).toBe(true);
  });
});
