import { RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { METADATO_ROLES } from '../../shared/auth/decoradores';
import { BitacoraController } from './bitacora.controller';
import { ConsultasController } from './consultas.controller';

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

const AUTORIZADOS = ['SUPERVISOR_MUNICIPAL', 'ADMINISTRADOR'];

describe('permisos de reportes', () => {
  it('generar y exportar exigen supervisor o administrador', () => {
    expect(rutas(ConsultasController)).toEqual([
      { metodo: 'POST', ruta: '/', roles: AUTORIZADOS },
      { metodo: 'GET', ruta: ':id/estaciones', roles: AUTORIZADOS },
      { metodo: 'GET', ruta: ':id/lineas', roles: AUTORIZADOS },
      { metodo: 'GET', ruta: ':id/buses', roles: AUTORIZADOS },
      { metodo: 'GET', ruta: ':id/exportacion', roles: AUTORIZADOS },
    ]);
  });

  it('la bitácora y las opciones exigen supervisor o administrador', () => {
    expect(rutas(BitacoraController)).toEqual([
      { metodo: 'GET', ruta: 'bitacora', roles: AUTORIZADOS },
      { metodo: 'GET', ruta: 'opciones', roles: AUTORIZADOS },
    ]);
  });

  it('ningún endpoint admite al operador de estación', () => {
    const todas = [...rutas(ConsultasController), ...rutas(BitacoraController)];

    expect(todas.length).toBeGreaterThan(0);
    for (const { roles } of todas) {
      expect(roles).not.toContain('OPERADOR_ESTACION');
    }
  });

  it('no hay acciones para editar ni eliminar constancias', () => {
    const metodos = [...rutas(ConsultasController), ...rutas(BitacoraController)].map(
      (ruta) => ruta.metodo,
    );

    expect(metodos).not.toContain('PUT');
    expect(metodos).not.toContain('PATCH');
    expect(metodos).not.toContain('DELETE');
  });
});
