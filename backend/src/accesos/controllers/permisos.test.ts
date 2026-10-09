import { RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { METADATO_ROLES } from '../../shared/auth/decoradores';
import { AccesosController } from './accesos.controller';
import { GuardiasController } from './guardias.controller';

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

describe('permisos de accesos', () => {
  it('las escrituras de accesos y asignaciones exigen supervisor; las lecturas solo sesión', () => {
    expect(rutas(AccesosController)).toEqual(
      expect.arrayContaining([
        { metodo: 'GET', ruta: '/', roles: undefined },
        { metodo: 'GET', ruta: 'opciones/estaciones', roles: undefined },
        { metodo: 'GET', ruta: 'lineas/:lineaId', roles: undefined },
        { metodo: 'GET', ruta: ':id', roles: undefined },
        { metodo: 'POST', ruta: '/', roles: SUPERVISOR },
        { metodo: 'PATCH', ruta: ':id', roles: SUPERVISOR },
        { metodo: 'POST', ruta: ':id/asignaciones', roles: SUPERVISOR },
        { metodo: 'DELETE', ruta: ':id/asignaciones', roles: SUPERVISOR },
      ]),
    );
    expect(rutas(AccesosController)).toHaveLength(8);
  });

  it('las escrituras de guardias exigen supervisor; las lecturas solo sesión', () => {
    expect(rutas(GuardiasController)).toEqual(
      expect.arrayContaining([
        { metodo: 'GET', ruta: '/', roles: undefined },
        { metodo: 'GET', ruta: 'opciones', roles: undefined },
        { metodo: 'GET', ruta: ':id', roles: undefined },
        { metodo: 'POST', ruta: '/', roles: SUPERVISOR },
        { metodo: 'PATCH', ruta: ':id', roles: SUPERVISOR },
      ]),
    );
    expect(rutas(GuardiasController)).toHaveLength(5);
  });

  it('declara las rutas fijas antes que ":id" para que no se lean como un id', () => {
    const accesos = rutas(AccesosController).map((ruta) => ruta.ruta);
    expect(accesos.indexOf('opciones/estaciones')).toBeLessThan(accesos.indexOf(':id'));
    expect(accesos.indexOf('lineas/:lineaId')).toBeLessThan(accesos.indexOf(':id'));
    const guardias = rutas(GuardiasController).map((ruta) => ruta.ruta);
    expect(guardias.indexOf('opciones')).toBeLessThan(guardias.indexOf(':id'));
  });
});
