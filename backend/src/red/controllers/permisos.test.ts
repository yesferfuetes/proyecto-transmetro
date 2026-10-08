import { RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { METADATO_ROLES } from '../../shared/auth/decoradores';
import { EstacionesController } from './estaciones.controller';
import { LineasController } from './lineas.controller';
import { MunicipalidadesController } from './municipalidades.controller';

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

describe('permisos de la red', () => {
  it('las escrituras de líneas y recorridos exigen supervisor; las lecturas solo sesión', () => {
    expect(rutas(LineasController)).toEqual(
      expect.arrayContaining([
        { metodo: 'GET', ruta: '/', roles: undefined },
        { metodo: 'GET', ruta: ':id', roles: undefined },
        { metodo: 'POST', ruta: '/', roles: ['SUPERVISOR_MUNICIPAL'] },
        { metodo: 'PATCH', ruta: ':id', roles: ['SUPERVISOR_MUNICIPAL'] },
        { metodo: 'PUT', ruta: ':id/estado', roles: ['SUPERVISOR_MUNICIPAL'] },
        { metodo: 'PUT', ruta: ':id/recorrido', roles: ['SUPERVISOR_MUNICIPAL'] },
      ]),
    );
    expect(rutas(LineasController)).toHaveLength(6);
  });

  it('las escrituras de estaciones exigen supervisor; las lecturas solo sesión', () => {
    expect(rutas(EstacionesController)).toEqual(
      expect.arrayContaining([
        { metodo: 'GET', ruta: '/', roles: undefined },
        { metodo: 'GET', ruta: 'opciones', roles: undefined },
        { metodo: 'GET', ruta: ':id', roles: undefined },
        { metodo: 'POST', ruta: '/', roles: ['SUPERVISOR_MUNICIPAL'] },
        { metodo: 'PATCH', ruta: ':id', roles: ['SUPERVISOR_MUNICIPAL'] },
      ]),
    );
    expect(rutas(EstacionesController)).toHaveLength(5);
  });

  it('las escrituras de municipalidades exigen administrador; las lecturas solo sesión', () => {
    expect(rutas(MunicipalidadesController)).toEqual(
      expect.arrayContaining([
        { metodo: 'GET', ruta: '/', roles: undefined },
        { metodo: 'GET', ruta: ':id', roles: undefined },
        { metodo: 'POST', ruta: '/', roles: ['ADMINISTRADOR'] },
        { metodo: 'PATCH', ruta: ':id', roles: ['ADMINISTRADOR'] },
      ]),
    );
    expect(rutas(MunicipalidadesController)).toHaveLength(4);
  });

  it('declara "opciones" antes que ":id" para que no se lea como un id', () => {
    const orden = rutas(EstacionesController).map((ruta) => ruta.ruta);
    expect(orden.indexOf('opciones')).toBeLessThan(orden.indexOf(':id'));
  });
});
